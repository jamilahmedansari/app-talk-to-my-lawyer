# 🚀 Complete Database Deployment Guide

Since you deleted everything in Supabase, follow these steps to rebuild your entire database:

## Step 1: Open Supabase SQL Editor

Go to: **https://supabase.com/dashboard/project/liepvjfiezgjrchbdwnb/sql/new**

## Step 2: Execute the Complete Deployment SQL

Copy the **ENTIRE** contents of this file and paste into the SQL Editor:

📁 **`supabase/DEPLOY_ALL.sql`**

Then click the **"Run"** button (or press `Ctrl/Cmd + Enter`)

This will create:

- ✅ 7 tables (profiles, letters, subscriptions, user_roles, employee_coupons, commissions, audit_logs)
- ✅ 6 functions (is_admin, is_employee, check_subscription_limits, touch_updated_at, handle_new_user, handle_subscription_insert)
- ✅ 8 triggers (updated_at triggers + signup handler + commission handler)
- ✅ All RLS policies for security
- ✅ All indexes for performance
- ✅ All ENUM types (user_role, letter_status, commission_status)

## Step 3: Verify Deployment

After running the SQL, execute this verification query in a new SQL editor tab:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'letters', 'subscriptions', 'user_roles', 'employee_coupons', 'commissions', 'audit_logs')
ORDER BY table_name;

-- Check all functions exist
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('check_subscription_limits', 'is_admin', 'is_employee', 'handle_new_user', 'handle_subscription_insert', 'touch_updated_at')
ORDER BY routine_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true
ORDER BY tablename;

-- Check triggers exist
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

**Expected results:**

- 7 tables listed
- 6 functions listed
- 7 tables with RLS enabled
- 8 triggers listed

## Step 4: Start Your Application

```bash
npm install
npm run dev
```

Open: **http://localhost:3000**

## Step 5: Create Your First Admin User

1. **Sign up** at: http://localhost:3000/auth

   - Use your email and password
   - You'll be automatically redirected to /dashboard

2. **Get your User ID** from Supabase SQL Editor:

   ```sql
   SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;
   ```

3. **Make yourself admin**:

   ```sql
   UPDATE user_roles SET role = 'admin' WHERE user_id = 'YOUR-USER-ID-HERE';
   ```

   _(Replace YOUR-USER-ID-HERE with the actual UUID from step 2)_

4. **Refresh your browser** - You should now see the Admin dashboard option

## Step 6: Test All Features

### As Admin:

- ✅ Go to http://localhost:3000/admin
- ✅ View all users, subscriptions, and commissions
- ✅ Change user roles (make someone an employee)

### As Employee (after promoting a user):

- ✅ Go to http://localhost:3000/dashboard/employee
- ✅ Create coupon codes with discounts
- ✅ View commission earnings

### As Subscriber (after purchasing):

- ✅ Go to http://localhost:3000/dashboard/subscriber/generate
- ✅ Generate AI letters (respects quota: 1, 4, or 8 per month)
- ✅ Download letters as PDF

## 🔐 Security Notes

Your environment variables are properly configured in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://liepvjfiezgjrchbdwnb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (already configured)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (already configured)
JWT_SECRET=Q3e+MfRQ... (already configured)
GEMINI_API_KEY=AIzaSyC... (already configured)
```

## 🐛 Troubleshooting

### If tables don't exist:

- Make sure you ran the **entire** DEPLOY_ALL.sql file
- Check for errors in the SQL editor output

### If functions are missing:

- Re-run the DEPLOY_ALL.sql file (it uses CREATE OR REPLACE, so it's safe)

### If RLS blocks everything:

- Make sure you created a user and assigned them a role in user_roles table
- Check that triggers are working (they auto-create profiles and roles on signup)

### If triggers aren't firing:

- Verify auth.users table exists (it's a Supabase built-in table)
- Check trigger exists: `SELECT * FROM information_schema.triggers WHERE trigger_name = 'tr_handle_new_user';`

## 📊 Database Schema Overview

```
auth.users (Supabase built-in)
    ↓ (trigger: tr_handle_new_user)
profiles ←→ user_roles (1:1)
    ↓
    ├─→ letters (1:many)
    ├─→ subscriptions (1:many)
    │       ↓ (trigger: tr_handle_subscription_insert)
    │       └─→ commissions (via coupon_code)
    └─→ employee_coupons (1:many, if employee/admin)
            ↓
            └─→ used in subscriptions
```

## ✅ Success Criteria

You'll know everything is working when:

- ✅ You can sign up and see your profile
- ✅ New users automatically get 'user' role
- ✅ Admins can access /admin dashboard
- ✅ Employees can create coupons
- ✅ Subscriptions with coupons auto-create commissions
- ✅ Letter generation respects quota limits
- ✅ RLS policies block unauthorized access

---

**Need help?** Check the browser console (F12) and Supabase logs for any errors.
