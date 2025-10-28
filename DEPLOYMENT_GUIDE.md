# 🚀 Database Deployment Guide

## Quick Start - 3 Steps Only!

Since you deleted everything in your Supabase database, follow these simple steps:

---

## Step 1: Open Supabase SQL Editor

Click this link:
👉 **https://supabase.com/dashboard/project/liepvjfiezgjrchbdwnb/sql/new**

---

## Step 2: Copy and Paste SQL

1. Open the file: **`supabase/DEPLOY_ALL.sql`** in VS Code
2. Press `Ctrl+A` (Select All) then `Ctrl+C` (Copy)
3. Go back to Supabase SQL Editor
4. Paste (`Ctrl+V`) into the editor
5. Click the **"RUN"** button (or press `Ctrl+Enter`)

---

## Step 3: Verify Success

You should see at the bottom:

```
✅ Database deployed successfully! All tables, functions, triggers, and RLS policies are in place.
```

---

## What Gets Deployed?

This single SQL file contains **EVERYTHING**:

### ✅ Tables (7 total)

- `profiles` - User profiles with earnings/referrals
- `letters` - Generated legal letters
- `subscriptions` - User subscriptions (single, annual4, annual8)
- `user_roles` - Role management (user, employee, admin)
- `employee_coupons` - Coupon codes with discount tracking
- `commissions` - 5% commission tracking
- `audit_logs` - System audit trail

### ✅ Functions (6 total)

- `is_admin()` - Check if user is admin
- `is_employee()` - Check if user is employee
- `check_subscription_limits()` - Enforce letter quotas
- `touch_updated_at()` - Auto-update timestamps
- `handle_new_user()` - Auto-create profile on signup
- `handle_subscription_insert()` - Auto-create commissions

### ✅ Triggers (8 total)

- Auto-update timestamps on all tables
- Auto-create profile + default role on signup
- Auto-create commission when subscription uses coupon

### ✅ RLS Policies

- Complete row-level security on all tables
- Role-based access control (users see their own data, employees see more, admins see everything)

### ✅ Enums

- `user_role`: user, employee, admin
- `letter_status`: draft, generating, completed, failed
- `commission_status`: pending, paid, cancelled

---

## Next Steps After Deployment

### 1. Start the Application

```bash
npm run dev
```

### 2. Create Your Account

- Visit: http://localhost:3000/auth
- Sign up with your email
- Profile will be automatically created!

### 3. Make Yourself Admin

After signing up, run this in Supabase SQL Editor:

```sql
-- Get your user ID
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- Copy the ID and replace YOUR-USER-ID below:
UPDATE user_roles SET role = 'admin' WHERE user_id = 'YOUR-USER-ID';
```

### 4. Test the Features

**As Admin:**

- Dashboard: http://localhost:3000/admin
- Manage users, subscriptions, commissions
- Promote users to employee role

**As Employee:**

- Dashboard: http://localhost:3000/dashboard/employee
- Create coupon codes
- View commission earnings

**As Subscriber:**

- Dashboard: http://localhost:3000/dashboard/subscriber/generate
- Generate letters (quota enforced)
- Purchase subscriptions

---

## Verification Queries

Run these in Supabase SQL Editor to verify everything deployed correctly:

```sql
-- Check all tables exist (should return 7)
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'letters', 'subscriptions', 'user_roles', 'employee_coupons', 'commissions', 'audit_logs');

-- Check all functions exist (should return 6)
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('check_subscription_limits', 'is_admin', 'is_employee', 'handle_new_user', 'handle_subscription_insert', 'touch_updated_at');

-- Check RLS is enabled (should return 7)
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true;
```

---

## Troubleshooting

### Issue: "relation already exists"

**Solution:** The table already exists. Safe to ignore if rerunning.

### Issue: "function already exists"

**Solution:** Using `CREATE OR REPLACE`, safe to ignore.

### Issue: Can't see tables in app

**Solution:**

1. Check `.env.local` has correct credentials
2. Restart dev server: `npm run dev`
3. Clear browser cache

### Issue: RLS blocking access

**Solution:** Make sure you're logged in and have correct role assigned

---

## 🎉 That's It!

Your database is now fully configured with:

- ✅ Complete schema
- ✅ All security policies
- ✅ Automated triggers
- ✅ Role-based access control
- ✅ Commission tracking system

Ready to build your Talk-To-My-Lawyer application! 🚀
