# ✅ Supabase CLI Setup Complete

## Migration Status
All migrations (001, 002, 003) are now marked as **applied** in your Supabase project.

## 🚨 Important: Apply Migration 003 SQL

Since your database already has some schema from the original setup, you need to manually run migration 003 to add the new enhancements:

### Option 1: Supabase SQL Editor (Recommended)

1. **Open SQL Editor**: https://supabase.com/dashboard/project/liepvjfiezgjrchbdwnb/sql/new

2. **Copy the migration SQL**:
   ```bash
   cat supabase/migrations/003_enhanced_schema.sql
   ```

3. **Paste into SQL Editor and click "Run"**

### Option 2: Run the helper script

```bash
./apply-migration.sh
```

This will display the SQL - copy it and paste into Supabase SQL Editor.

## 📋 What Migration 003 Adds

- ✅ `user_roles` table - Separate role management
- ✅ `employee_coupons` table - Coupon system
- ✅ `commissions` table - Commission tracking
- ✅ Enhanced `profiles` table - Add subscription fields
- ✅ Enhanced `subscriptions` table - Add coupon tracking
- ✅ Enhanced `letters` table - Add completed_at field
- ✅ RLS Policies - Security for all tables
- ✅ Triggers - Auto signup, commission tracking
- ✅ Functions - `check_subscription_limits()`, `is_admin()`, `is_employee()`

## 🧪 Verify Setup

After running the migration, test with:

```sql
-- Check if new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_roles', 'employee_coupons', 'commissions');

-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('check_subscription_limits', 'is_admin', 'is_employee');
```

## 🚀 Next: Start Development

Once migration is applied:

```bash
npm run dev
```

Then create your admin user:
1. Sign up at http://localhost:3000/auth
2. Get your user ID from Supabase
3. Run: `UPDATE user_roles SET role = 'admin' WHERE user_id = 'YOUR-ID';`

## 📝 Summary

✅ Supabase CLI linked to project `liepvjfiezgjrchbdwnb`
✅ Migration history synced (001, 002, 003 marked as applied)
⚠️  **Next**: Run migration 003 SQL in Supabase dashboard
✅ Environment variables configured in `.env.local`
✅ Ready to start development server

---

Need help? Check `IMPLEMENTATION.md` for full documentation.
