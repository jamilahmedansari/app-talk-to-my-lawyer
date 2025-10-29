-- ====================================
-- COMPLETE DATABASE DEPLOYMENT
-- Run this entire file in Supabase SQL Editor
-- https://supabase.com/dashboard/project/liepvjfiezgjrchbdwnb/sql/new
-- ====================================

-- ====================================
-- PART 1: INITIAL SCHEMA (Migration 001)
-- ====================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums up-front
DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS letter_status;
DROP TYPE IF EXISTS sub_status;
DROP TYPE IF EXISTS commission_status;

CREATE TYPE user_role AS ENUM ('user', 'employee', 'admin');
CREATE TYPE letter_status AS ENUM ('draft', 'generating', 'completed', 'failed');
CREATE TYPE sub_status AS ENUM ('active', 'canceled', 'expired');
CREATE TYPE commission_status AS ENUM ('pending', 'paid', 'cancelled');

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  earnings NUMERIC(10,2) DEFAULT 0,
  referrals INTEGER DEFAULT 0,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status sub_status DEFAULT 'active'::sub_status,
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create letters table
CREATE TABLE IF NOT EXISTS public.letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  recipient_name TEXT,
  recipient_address TEXT,
  status letter_status DEFAULT 'draft'::letter_status,
  attorney_email TEXT,
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  status sub_status DEFAULT 'active'::sub_status,
  price NUMERIC(10,2),
  discount NUMERIC(5,2) DEFAULT 0,
  coupon_code TEXT,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  tier TEXT,
  letters_remaining INTEGER DEFAULT 0,
  monthly_allocation INTEGER DEFAULT 0,
  next_refill_date TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- PART 2: AUDIT LOGS (Migration 002)
-- ====================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- ====================================
-- PART 3: ENHANCED SCHEMA (Migration 003)
-- ====================================

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user'::user_role,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create employee_coupons table
CREATE TABLE IF NOT EXISTS public.employee_coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  usage_count INTEGER DEFAULT 0,
  max_usage INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create commissions table
CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  commission_amount NUMERIC(10,2) NOT NULL,
  status commission_status DEFAULT 'pending'::commission_status,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create purchases table for tracking mock checkouts
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  tier TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create refill_history table for tracking letter refills
CREATE TABLE IF NOT EXISTS public.refill_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  letters_refilled INTEGER NOT NULL,
  refilled_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_employee_coupons_employee_id ON public.employee_coupons(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_coupons_code ON public.employee_coupons(code);
CREATE INDEX IF NOT EXISTS idx_employee_coupons_is_active ON public.employee_coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_commissions_employee_id ON public.commissions(employee_id);
CREATE INDEX IF NOT EXISTS idx_commissions_subscription_id ON public.commissions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.commissions(status);
CREATE INDEX IF NOT EXISTS idx_letters_user_id ON public.letters(user_id);
CREATE INDEX IF NOT EXISTS idx_letters_status ON public.letters(status);
CREATE INDEX IF NOT EXISTS idx_letters_created_at ON public.letters(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_letters_attorney_email ON public.letters(attorney_email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_coupon_code ON public.subscriptions(coupon_code);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_refill_date ON public.subscriptions(next_refill_date);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_subscription_id ON public.purchases(subscription_id);
CREATE INDEX IF NOT EXISTS idx_refill_history_subscription_id ON public.refill_history(subscription_id);

-- ====================================
-- PART 4: HELPER FUNCTIONS
-- ====================================

-- Role checking functions
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN
LANGUAGE SQL STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role::text = 'admin'
  );
$$;

COMMENT ON FUNCTION public.is_admin IS 'Check if current user has admin role';

CREATE OR REPLACE FUNCTION public.is_employee() 
RETURNS BOOLEAN
LANGUAGE SQL STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role::text IN ('employee', 'admin')
  );
$$;

COMMENT ON FUNCTION public.is_employee IS 'Check if current user has employee or admin role';

-- Quota check function
CREATE OR REPLACE FUNCTION public.check_subscription_limits(p_user UUID)
RETURNS BOOLEAN 
LANGUAGE SQL 
STABLE
SECURITY DEFINER
SET search_path = public
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

COMMENT ON FUNCTION public.check_subscription_limits IS 'Validates if user can generate more letters this month based on their subscription plan';

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER 
LANGUAGE PLPGSQL 
SECURITY DEFINER
AS $$
BEGIN 
  NEW.updated_at = NOW(); 
  RETURN NEW; 
END $$;

COMMENT ON FUNCTION public.touch_updated_at IS 'Automatically updates updated_at timestamp on record modification';

-- New user signup handler
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role user_role;
  v_coupon_code TEXT;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name',''))
  ON CONFLICT (id) DO NOTHING;

  -- Insert role from metadata, default to 'user' if not provided
  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'::user_role);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id) DO NOTHING;

  -- If employee, auto-generate coupon code
  IF v_role = 'employee' THEN
    -- Generate unique coupon code (e.g., EMP-ABCD1234)
    v_coupon_code := 'EMP-' || UPPER(SUBSTRING(MD5(NEW.id::TEXT || NOW()::TEXT) FROM 1 FOR 8));

    INSERT INTO public.employee_coupons (employee_id, code, discount_percent, is_active)
    VALUES (NEW.id, v_coupon_code, 20, TRUE);
  END IF;

  RETURN NEW;
END $$;

COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates profile and assigns default user role on signup';

-- Subscription commission handler
CREATE OR REPLACE FUNCTION public.handle_subscription_insert()
RETURNS TRIGGER 
LANGUAGE PLPGSQL 
SECURITY DEFINER
SET search_path = public
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
  VALUES (v_emp, NEW.id, v_comm, 'pending'::commission_status);

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

COMMENT ON FUNCTION public.handle_subscription_insert IS 'Automatically creates commission, updates earnings, and increments coupon usage when subscription is created with coupon';

-- Process subscription refills (for cron job)
CREATE OR REPLACE FUNCTION public.process_subscription_refills()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  refill_count INTEGER := 0;
  sub_record RECORD;
BEGIN
  -- Find subscriptions that need refilling
  FOR sub_record IN
    SELECT id, user_id, tier, monthly_allocation, next_refill_date
    FROM public.subscriptions
    WHERE status = 'active'
    AND tier IN ('annual-basic', 'annual-premium')
    AND next_refill_date <= NOW()
  LOOP
    -- Refill the letters
    UPDATE public.subscriptions
    SET letters_remaining = monthly_allocation,
        next_refill_date = next_refill_date + INTERVAL '1 month'
    WHERE id = sub_record.id;

    -- Log the refill
    INSERT INTO public.refill_history (subscription_id, letters_refilled)
    VALUES (sub_record.id, sub_record.monthly_allocation);

    refill_count := refill_count + 1;
  END LOOP;

  RETURN refill_count;
END;
$$;

COMMENT ON FUNCTION public.process_subscription_refills IS 'Processes monthly letter refills for active annual subscriptions';

-- Decrement letter quota when letter is completed
CREATE OR REPLACE FUNCTION public.decrement_letter_quota()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only decrement when letter status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.subscriptions
    SET letters_remaining = GREATEST(letters_remaining - 1, 0)
    WHERE id = (
      SELECT id FROM public.subscriptions
      WHERE user_id = NEW.user_id
      AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    );
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.decrement_letter_quota IS 'Automatically decrements letters_remaining when a letter is completed';

-- ====================================
-- PART 5: TRIGGERS
-- ====================================

-- Drop existing triggers
DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS tr_letters_updated_at ON public.letters;
DROP TRIGGER IF EXISTS tr_subscriptions_updated_at ON public.subscriptions;
DROP TRIGGER IF EXISTS tr_user_roles_updated_at ON public.user_roles;
DROP TRIGGER IF EXISTS tr_employee_coupons_updated_at ON public.employee_coupons;
DROP TRIGGER IF EXISTS tr_commissions_updated_at ON public.commissions;
DROP TRIGGER IF EXISTS tr_handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS tr_handle_subscription_insert ON public.subscriptions;

-- Create updated_at triggers
CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER tr_letters_updated_at
  BEFORE UPDATE ON public.letters
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER tr_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER tr_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER tr_employee_coupons_updated_at
  BEFORE UPDATE ON public.employee_coupons
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER tr_commissions_updated_at
  BEFORE UPDATE ON public.commissions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Create signup trigger
CREATE TRIGGER tr_handle_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create subscription commission trigger
CREATE TRIGGER tr_handle_subscription_insert
  AFTER INSERT ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_subscription_insert();

-- Trigger for automatic quota decrement
DROP TRIGGER IF EXISTS tr_decrement_letter_quota ON public.letters;
CREATE TRIGGER tr_decrement_letter_quota
  AFTER INSERT OR UPDATE ON public.letters
  FOR EACH ROW EXECUTE FUNCTION public.decrement_letter_quota();

-- ====================================
-- PART 6: ROW LEVEL SECURITY (RLS)
-- ====================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refill_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS p_profiles_self_read ON public.profiles;
DROP POLICY IF EXISTS p_profiles_self_update ON public.profiles;
DROP POLICY IF EXISTS p_profiles_admin_insert ON public.profiles;
DROP POLICY IF EXISTS p_profiles_admin_delete ON public.profiles;
DROP POLICY IF EXISTS p_letters_owner_all ON public.letters;
DROP POLICY IF EXISTS p_subs_owner_all ON public.subscriptions;
DROP POLICY IF EXISTS p_coupons_public_read ON public.employee_coupons;
DROP POLICY IF EXISTS p_coupons_owner_select ON public.employee_coupons;
DROP POLICY IF EXISTS p_coupons_admin_insert ON public.employee_coupons;
DROP POLICY IF EXISTS p_coupons_admin_update ON public.employee_coupons;
DROP POLICY IF EXISTS p_coupons_admin_delete ON public.employee_coupons;
DROP POLICY IF EXISTS p_comm_emp_select ON public.commissions;
DROP POLICY IF EXISTS p_comm_admin_write ON public.commissions;
DROP POLICY IF EXISTS p_roles_self_read ON public.user_roles;
DROP POLICY IF EXISTS p_roles_admin_write ON public.user_roles;
DROP POLICY IF EXISTS p_audit_admin_read ON public.audit_logs;

-- PROFILES POLICIES
CREATE POLICY p_profiles_self_read ON public.profiles
FOR SELECT USING (id = auth.uid() OR is_admin());

CREATE POLICY p_profiles_self_update ON public.profiles
FOR UPDATE USING (id = auth.uid() OR is_admin())
WITH CHECK (id = auth.uid() OR is_admin());

CREATE POLICY p_profiles_admin_insert ON public.profiles
FOR INSERT WITH CHECK (is_admin());

CREATE POLICY p_profiles_admin_delete ON public.profiles
FOR DELETE USING (is_admin());

-- LETTERS POLICIES
CREATE POLICY p_letters_owner_all ON public.letters
FOR ALL USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

-- SUBSCRIPTIONS POLICIES
CREATE POLICY p_subs_owner_all ON public.subscriptions
FOR ALL USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

-- EMPLOYEE_COUPONS POLICIES
CREATE POLICY p_coupons_public_read ON public.employee_coupons
FOR SELECT USING (is_active = TRUE);

CREATE POLICY p_coupons_owner_select ON public.employee_coupons
FOR SELECT USING (employee_id = auth.uid() OR is_employee() OR is_admin());

CREATE POLICY p_coupons_admin_insert ON public.employee_coupons
FOR INSERT WITH CHECK (is_employee() OR is_admin());

CREATE POLICY p_coupons_admin_update ON public.employee_coupons
FOR UPDATE USING (employee_id = auth.uid() OR is_admin());

CREATE POLICY p_coupons_admin_delete ON public.employee_coupons
FOR DELETE USING (is_admin());

-- COMMISSIONS POLICIES
CREATE POLICY p_comm_emp_select ON public.commissions
FOR SELECT USING (employee_id = auth.uid() OR is_admin());

CREATE POLICY p_comm_admin_write ON public.commissions
FOR ALL USING (is_admin())
WITH CHECK (is_admin());

-- USER_ROLES POLICIES
CREATE POLICY p_roles_self_read ON public.user_roles
FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY p_roles_admin_write ON public.user_roles
FOR ALL USING (is_admin())
WITH CHECK (is_admin());

-- AUDIT_LOGS POLICIES
CREATE POLICY p_audit_admin_read ON public.audit_logs
FOR SELECT USING (is_admin());

-- PURCHASES POLICIES
CREATE POLICY p_purchases_select_own ON public.purchases
  FOR SELECT USING (auth.uid() = user_id OR is_admin() OR is_employee());

CREATE POLICY p_purchases_insert ON public.purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- REFILL_HISTORY POLICIES
CREATE POLICY p_refill_history_select ON public.refill_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE id = refill_history.subscription_id
      AND (user_id = auth.uid() OR is_admin() OR is_employee())
    )
  );

-- ====================================
-- PART 7: GRANT PERMISSIONS
-- ====================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Allow anon to read active coupons for public validation
GRANT SELECT ON public.employee_coupons TO anon;

-- Grant function execution permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_employee() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_subscription_limits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.touch_updated_at() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_subscription_insert() TO authenticated;

-- ====================================
-- DEPLOYMENT COMPLETE
-- ====================================

SELECT 'Database deployed successfully! All tables, functions, triggers, and RLS policies are in place.' AS status;
