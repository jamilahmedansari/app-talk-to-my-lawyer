-- Update handle_new_user function to respect role from signup metadata
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

  -- Insert role from metadata, default to 'user' if not provided
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'::user_role))
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END $$;

COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates profile and assigns role from signup metadata (defaults to user)';
