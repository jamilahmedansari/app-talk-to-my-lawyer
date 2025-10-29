-- Update handle_new_user to auto-generate coupon for employees
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

COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates profile, assigns role, and generates coupon code for employees';
