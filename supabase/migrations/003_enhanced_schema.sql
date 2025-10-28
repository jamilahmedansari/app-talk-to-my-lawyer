-- Talk-To-My-Lawyer - Enhanced Schema Migration
-- Aligns with existing tables and adds required features

-- ====================================
-- 1) CREATE HELPER ENUMS & FUNCTIONS
-- ====================================

-- Create updated enums (skip if already exist)
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('user','employee','admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.letter_status AS ENUM ('generating','completed','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.sub_status AS ENUM ('active','canceled','expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.commission_status AS ENUM ('pending','paid','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Role helper functions
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN
LANGUAGE SQL STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role::text = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_employee() 
RETURNS BOOLEAN
LANGUAGE SQL STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role::text = 'employee'
  );
$$;

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER 
LANGUAGE PLPGSQL AS $$
BEGIN 
  NEW.updated_at = NOW(); 
  RETURN NEW; 
END $$;

-- ====================================
-- 2) CREATE USER_ROLES TABLE
-- ====================================

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- ====================================
-- 3) ADD COLUMNS TO EXISTING TABLES
-- ====================================

-- profiles: add subscription and earnings fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status sub_status DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS referrals INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS earnings NUMERIC(10,2) DEFAULT 0.00;

-- letters: add new status fields
ALTER TABLE public.letters
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- subscriptions: add plan details and coupon tracking
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS discount NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coupon_code TEXT,
  ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- ====================================
-- 4) RENAME COUPONS → EMPLOYEE_COUPONS
-- ====================================

-- Create employee_coupons if not exists
CREATE TABLE IF NOT EXISTS public.employee_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  discount_percent INT DEFAULT 10 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  usage_count INT DEFAULT 0,
  max_usage INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code_active ON public.employee_coupons(code, is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_employee ON public.employee_coupons(employee_id);

-- Migrate data from old coupons table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'coupons') THEN
    INSERT INTO public.employee_coupons (id, code, discount_percent, usage_count, max_usage, is_active, created_at, employee_id)
    SELECT 
      id, 
      code, 
      discount_percent, 
      used_count as usage_count, 
      max_uses as max_usage, 
      active as is_active, 
      created_at,
      NULL as employee_id -- Update manually later
    FROM public.coupons
    ON CONFLICT (code) DO NOTHING;
  END IF;
END $$;

-- ====================================
-- 5) RENAME AFFILIATE_TRANSACTIONS → COMMISSIONS
-- ====================================

CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  status commission_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_commissions_emp_status ON public.commissions(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_commissions_subscription ON public.commissions(subscription_id);

-- Migrate data from affiliate_transactions if exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'affiliate_transactions') THEN
    INSERT INTO public.commissions (id, employee_id, commission_amount, status, created_at, paid_at)
    SELECT 
      id, 
      affiliate_user_id as employee_id, 
      commission_amount, 
      status::commission_status, 
      created_at, 
      paid_at
    FROM public.affiliate_transactions
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- ====================================
-- 6) CREATE UPDATED_AT TRIGGERS
-- ====================================

DROP TRIGGER IF EXISTS trg_profiles_touch ON public.profiles;
CREATE TRIGGER trg_profiles_touch BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_subscriptions_touch ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_touch BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_employee_coupons_touch ON public.employee_coupons;
CREATE TRIGGER trg_employee_coupons_touch BEFORE UPDATE ON public.employee_coupons
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ====================================
-- 7) ENABLE ROW LEVEL SECURITY
-- ====================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ====================================
-- 8) CREATE RLS POLICIES
-- ====================================

-- PROFILES: self read/update; admin full
DROP POLICY IF EXISTS p_profiles_self_read ON public.profiles;
CREATE POLICY p_profiles_self_read ON public.profiles
FOR SELECT USING (id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS p_profiles_self_update ON public.profiles;
CREATE POLICY p_profiles_self_update ON public.profiles
FOR UPDATE USING (id = auth.uid() OR is_admin())
WITH CHECK (id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS p_profiles_admin_insert ON public.profiles;
CREATE POLICY p_profiles_admin_insert ON public.profiles
FOR INSERT WITH CHECK (is_admin());

-- LETTERS: owner CRUD; admin full
DROP POLICY IF EXISTS p_letters_owner_all ON public.letters;
CREATE POLICY p_letters_owner_all ON public.letters
FOR ALL USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

-- SUBSCRIPTIONS: owner CRUD; admin full
DROP POLICY IF EXISTS p_subs_owner_all ON public.subscriptions;
CREATE POLICY p_subs_owner_all ON public.subscriptions
FOR ALL USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

-- EMPLOYEE_COUPONS: public read active; owner/employee read own; admin write
DROP POLICY IF EXISTS p_coupons_public_read ON public.employee_coupons;
CREATE POLICY p_coupons_public_read ON public.employee_coupons
FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS p_coupons_owner_select ON public.employee_coupons;
CREATE POLICY p_coupons_owner_select ON public.employee_coupons
FOR SELECT USING (employee_id = auth.uid() OR is_employee() OR is_admin());

DROP POLICY IF EXISTS p_coupons_admin_insert ON public.employee_coupons;
CREATE POLICY p_coupons_admin_insert ON public.employee_coupons
FOR INSERT WITH CHECK (is_employee() OR is_admin());

DROP POLICY IF EXISTS p_coupons_admin_update ON public.employee_coupons;
CREATE POLICY p_coupons_admin_update ON public.employee_coupons
FOR UPDATE USING (employee_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS p_coupons_admin_delete ON public.employee_coupons;
CREATE POLICY p_coupons_admin_delete ON public.employee_coupons
FOR DELETE USING (is_admin());

-- COMMISSIONS: employee sees own; admin all
DROP POLICY IF EXISTS p_comm_emp_select ON public.commissions;
CREATE POLICY p_comm_emp_select ON public.commissions
FOR SELECT USING (employee_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS p_comm_admin_write ON public.commissions;
CREATE POLICY p_comm_admin_write ON public.commissions
FOR ALL USING (is_admin())
WITH CHECK (is_admin());

-- USER_ROLES: user sees own role, admin full
DROP POLICY IF EXISTS p_roles_self_read ON public.user_roles;
CREATE POLICY p_roles_self_read ON public.user_roles
FOR SELECT USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS p_roles_admin_write ON public.user_roles;
CREATE POLICY p_roles_admin_write ON public.user_roles
FOR ALL USING (is_admin())
WITH CHECK (is_admin());

-- ====================================
-- 9) SIGNUP TRIGGER (profile + role)
-- ====================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE PLPGSQL 
SECURITY DEFINER 
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name',''))
  ON CONFLICT (id) DO NOTHING;

  -- Insert default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::public.user_role)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users 
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ====================================
-- 10) SUBSCRIPTION TRIGGER (commission + coupon)
-- ====================================

CREATE OR REPLACE FUNCTION public.handle_subscription_insert()
RETURNS TRIGGER 
LANGUAGE PLPGSQL 
SECURITY DEFINER 
AS $$
DECLARE
  v_emp UUID;
  v_disc INT;
  v_comm NUMERIC(10,2);
BEGIN
  -- Check if coupon code exists
  IF NEW.coupon_code IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get employee and discount
  SELECT employee_id, discount_percent
  INTO v_emp, v_disc
  FROM public.employee_coupons
  WHERE code = NEW.coupon_code AND is_active = TRUE
  LIMIT 1;

  IF v_emp IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calculate 5% commission
  v_comm := ROUND(COALESCE(NEW.price, 0) * 0.05, 2);

  -- Insert commission record
  INSERT INTO public.commissions (employee_id, subscription_id, commission_amount, status)
  VALUES (v_emp, NEW.id, v_comm, 'pending');

  -- Update employee earnings and referrals
  UPDATE public.profiles
  SET 
    earnings = COALESCE(earnings, 0) + v_comm,
    referrals = COALESCE(referrals, 0) + 1
  WHERE id = v_emp;

  -- Increment coupon usage
  UPDATE public.employee_coupons
  SET usage_count = COALESCE(usage_count, 0) + 1
  WHERE code = NEW.coupon_code;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_subscriptions_after_insert ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_after_insert
AFTER INSERT ON public.subscriptions
FOR EACH ROW 
EXECUTE FUNCTION public.handle_subscription_insert();

-- ====================================
-- 11) QUOTA CHECK FUNCTION
-- ====================================

CREATE OR REPLACE FUNCTION public.check_subscription_limits(p_user UUID)
RETURNS BOOLEAN 
LANGUAGE SQL 
STABLE
SECURITY DEFINER
AS $$
WITH active AS (
  SELECT plan, status, expires_at
  FROM public.subscriptions
  WHERE user_id = p_user AND status = 'active'
  ORDER BY created_at DESC 
  LIMIT 1
), 
quota AS (
  SELECT CASE
    WHEN plan = 'single' THEN 1
    WHEN plan = 'annual4' THEN 4
    WHEN plan = 'annual8' THEN 8
    ELSE 0 
  END AS max_per_month
  FROM active
),
letter_count AS (
  SELECT COUNT(*) AS count
  FROM public.letters
  WHERE user_id = p_user 
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
)
SELECT COALESCE((
  SELECT q.max_per_month > lc.count
  FROM quota q, letter_count lc
), FALSE);
$$;

-- ====================================
-- 12) PERFORMANCE INDEXES
-- ====================================

CREATE INDEX IF NOT EXISTS idx_letters_user_status ON public.letters(user_id, status);
CREATE INDEX IF NOT EXISTS idx_subs_user_status_emp ON public.subscriptions(user_id, status, employee_id);
CREATE INDEX IF NOT EXISTS idx_letters_created_month ON public.letters(user_id, (DATE_TRUNC('month', created_at)));

-- ====================================
-- 13) GRANT PERMISSIONS
-- ====================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Allow anon to read active coupons for public validation
GRANT SELECT ON public.employee_coupons TO anon;

COMMENT ON TABLE public.user_roles IS 'Stores user role assignments for RBAC';
COMMENT ON TABLE public.employee_coupons IS 'Employee-generated coupon codes for referrals';
COMMENT ON TABLE public.commissions IS 'Commission tracking for employee referrals';
COMMENT ON FUNCTION public.check_subscription_limits IS 'Validates if user can generate more letters this month';
