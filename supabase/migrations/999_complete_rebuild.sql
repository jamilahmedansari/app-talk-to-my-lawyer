-- Complete database rebuild migration
-- This replaces all three migrations with a working version

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  earnings NUMERIC(10,2) DEFAULT 0,
  referrals INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create letters table  
CREATE TABLE IF NOT EXISTS public.letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  recipient_name TEXT,
  recipient_address TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  price NUMERIC(10,2),
  coupon_code TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ENUM types
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('user', 'employee', 'admin');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'letter_status') THEN
    CREATE TYPE letter_status AS ENUM ('draft', 'generating', 'completed', 'failed');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'commission_status') THEN
    CREATE TYPE commission_status AS ENUM ('pending', 'paid', 'cancelled');
  END IF;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user'::user_role,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create employee_coupons table
CREATE TABLE IF NOT EXISTS public.employee_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create commissions table
CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  commission_amount NUMERIC(10,2) NOT NULL,
  status commission_status DEFAULT 'pending'::commission_status,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create all indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
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
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_coupon_code ON public.subscriptions(coupon_code);

-- Create helper functions
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER 
LANGUAGE PLPGSQL 
SECURITY DEFINER
AS $$
BEGIN 
  NEW.updated_at = NOW(); 
  RETURN NEW; 
END $$;

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

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE PLPGSQL 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name',''))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::user_role)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END $$;

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
  IF NEW.coupon_code IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT employee_id, discount_percent
  INTO v_emp, v_disc
  FROM public.employee_coupons
  WHERE code = NEW.coupon_code AND is_active = TRUE
  LIMIT 1;

  IF v_emp IS NULL THEN
    RETURN NEW;
  END IF;

  v_comm := ROUND(COALESCE(NEW.price, 0) * 0.05, 2);

  INSERT INTO public.commissions (employee_id, subscription_id, commission_amount, status)
  VALUES (v_emp, NEW.id, v_comm, 'pending'::commission_status);

  UPDATE public.profiles
  SET 
    earnings = COALESCE(earnings, 0) + v_comm,
    referrals = COALESCE(referrals, 0) + 1
  WHERE id = v_emp;

  UPDATE public.employee_coupons
  SET usage_count = COALESCE(usage_count, 0) + 1
  WHERE code = NEW.coupon_code;

  RETURN NEW;
END $$;

-- Create triggers
DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS tr_letters_updated_at ON public.letters;
CREATE TRIGGER tr_letters_updated_at BEFORE UPDATE ON public.letters
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS tr_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER tr_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS tr_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER tr_user_roles_updated_at BEFORE UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS tr_employee_coupons_updated_at ON public.employee_coupons;
CREATE TRIGGER tr_employee_coupons_updated_at BEFORE UPDATE ON public.employee_coupons
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS tr_commissions_updated_at ON public.commissions;
CREATE TRIGGER tr_commissions_updated_at BEFORE UPDATE ON public.commissions
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS tr_handle_new_user ON auth.users;
CREATE TRIGGER tr_handle_new_user AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS tr_handle_subscription_insert ON public.subscriptions;
CREATE TRIGGER tr_handle_subscription_insert AFTER INSERT ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.handle_subscription_insert();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

DROP POLICY IF EXISTS p_profiles_admin_delete ON public.profiles;
CREATE POLICY p_profiles_admin_delete ON public.profiles
FOR DELETE USING (is_admin());

DROP POLICY IF EXISTS p_letters_owner_all ON public.letters;
CREATE POLICY p_letters_owner_all ON public.letters
FOR ALL USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS p_subs_owner_all ON public.subscriptions;
CREATE POLICY p_subs_owner_all ON public.subscriptions
FOR ALL USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

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

DROP POLICY IF EXISTS p_comm_emp_select ON public.commissions;
CREATE POLICY p_comm_emp_select ON public.commissions
FOR SELECT USING (employee_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS p_comm_admin_write ON public.commissions;
CREATE POLICY p_comm_admin_write ON public.commissions
FOR ALL USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS p_roles_self_read ON public.user_roles;
CREATE POLICY p_roles_self_read ON public.user_roles
FOR SELECT USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS p_roles_admin_write ON public.user_roles;
CREATE POLICY p_roles_admin_write ON public.user_roles
FOR ALL USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS p_audit_admin_read ON public.audit_logs;
CREATE POLICY p_audit_admin_read ON public.audit_logs
FOR SELECT USING (is_admin());

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.employee_coupons TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
