# Role Selection During Signup - Deployment Instructions

## Changes Made

1. **Frontend**: Added role selection dropdown to the signup form at [app/auth/page.tsx](app/auth/page.tsx)
   - Users can now choose between "Client" (user role) or "Employee" (employee role)
   - The selected role is passed through signup metadata

2. **Backend**: Updated the `handle_new_user()` database function in [supabase/DEPLOY_ALL.sql](supabase/DEPLOY_ALL.sql)
   - The function now reads the role from user metadata
   - Falls back to 'user' role if no role is specified

## Deployment Steps

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://dpvrovxcxwspgbbvysil.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the following SQL:

```sql
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
```

5. Click **Run** to execute the query
6. You should see "Success. No rows returned"

### Option 2: Using psql Command Line

If you have your database password, you can run:

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.dpvrovxcxwspgbbvysil.supabase.co:5432/postgres" -f /tmp/update_handle_new_user.sql
```

## Testing

After deployment, test the signup flow:

1. Navigate to `/auth` on your application
2. Click "Sign Up"
3. You should see a dropdown with two options:
   - "Client (seeking legal services)" - creates a user with 'user' role
   - "Employee (providing legal services)" - creates a user with 'employee' role
4. Complete the signup and verify the role is correctly assigned

## Verification

To verify the function was updated successfully:

1. Sign up a new test user as "Employee"
2. After email confirmation, check the `user_roles` table
3. The user should have `role = 'employee'`

## Rollback

If you need to rollback to the previous version:

```sql
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

  -- Insert default role (hardcoded to 'user')
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::user_role)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END $$;
```
