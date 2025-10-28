-- ====================================
-- DEPLOY FUNCTIONS SQL
-- Run this in Supabase SQL Editor
-- ====================================

-- 1) HELPER FUNCTIONS FOR ROLE CHECKING
-- ====================================

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
    WHERE user_id = auth.uid() AND role::text = 'employee'
  );
$$;

COMMENT ON FUNCTION public.is_employee IS 'Check if current user has employee role';

-- 2) QUOTA CHECK FUNCTION
-- ====================================

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

-- 3) UPDATED_AT TRIGGER FUNCTION
-- ====================================

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

-- 4) NEW USER SIGNUP HANDLER
-- ====================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE PLPGSQL 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name',''))
  ON CONFLICT (id) DO NOTHING;

  -- Insert default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END $$;

COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates profile and assigns default user role on signup';

-- 5) SUBSCRIPTION COMMISSION HANDLER
-- ====================================

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

COMMENT ON FUNCTION public.handle_subscription_insert IS 'Automatically creates commission, updates earnings, and increments coupon usage when subscription is created with coupon';

-- 6) GRANT PERMISSIONS
-- ====================================

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_employee() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_subscription_limits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.touch_updated_at() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_subscription_insert() TO authenticated;

-- ====================================
-- DEPLOYMENT COMPLETE
-- ====================================

SELECT 'Functions deployed successfully!' AS status;
