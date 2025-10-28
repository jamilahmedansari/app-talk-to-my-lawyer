# ✅ Supabase Configuration Complete

Your environment has been configured with the following credentials:

## 🔐 Credentials Set

- **Supabase URL**: `https://liepvjfiezgjrchbdwnb.supabase.co`
- **Anon Key**: ✅ Configured
- **Service Role Key**: ✅ Configured  
- **Gemini API Key**: ✅ Configured

## 📋 Next Steps

### 1. Apply Database Migration

Run the migration to set up all tables, policies, and triggers:

```bash
# Make sure you're in the project directory
cd /workspaces/app

# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
npx supabase link --project-ref liepvjfiezgjrchbdwnb

# Apply the migration
npx supabase db push
```

**OR** manually run the SQL in Supabase Dashboard:
1. Go to https://supabase.com/dashboard/project/liepvjfiezgjrchbdwnb/sql/new
2. Copy and paste contents of `supabase/migrations/003_enhanced_schema.sql`
3. Click "Run"

### 2. Start Development Server

```bash
npm run dev
```

### 3. Test the Application

#### Create Your First Admin User
1. Visit http://localhost:3000/auth
2. Sign up with your email
3. Go to Supabase Dashboard > SQL Editor
4. Run:
```sql
-- Get your user ID first
SELECT id, email FROM auth.users;

-- Make yourself an admin
UPDATE user_roles SET role = 'admin' WHERE user_id = 'YOUR-USER-ID-HERE';
```

#### Test Each Dashboard

**Subscriber** (`/dashboard/subscriber`)
- View quota
- Generate letter at `/dashboard/subscriber/generate`
- Download PDF

**Employee** (`/dashboard/employee`)
- Create coupon codes
- Track commissions
- View referral stats

**Admin** (`/dashboard/admin`)
- Manage users and roles
- View subscriptions
- Mark commissions as paid

### 4. Verify Database Setup

Check if tables exist:
```sql
-- In Supabase SQL Editor
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'user_roles', 'employee_coupons', 'commissions', 'letters', 'subscriptions');
```

### 5. Test API Endpoints

**Check quota:**
```bash
curl http://localhost:3000/api/letters/quota \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Validate coupon:**
```bash
curl http://localhost:3000/api/validate-coupon?code=TEST10
```

## 🔧 Configuration Files Updated

- ✅ `.env.local` - Supabase credentials configured
- ✅ `lib/supabase/client.ts` - Uses env variables
- ✅ `lib/supabase/server.ts` - Uses env variables

## 🎯 Quick Test Checklist

- [ ] Migration applied successfully
- [ ] Dev server starts without errors
- [ ] Can sign up new user
- [ ] User gets default 'user' role in `user_roles` table
- [ ] Can promote to admin via SQL
- [ ] Admin dashboard loads
- [ ] Employee can create coupons
- [ ] Letter generation works with quota check
- [ ] Subscription with coupon creates commission

## 📚 Documentation

- `IMPLEMENTATION.md` - Complete technical docs
- `QUICKSTART.md` - Quick start guide
- `DEPLOYMENT.md` - Deployment instructions

## 🆘 Troubleshooting

### If you see "relation does not exist" errors:
Run the migration: `npx supabase db push`

### If authentication fails:
1. Check `.env.local` is loaded (restart dev server)
2. Verify URL and keys are correct
3. Check Supabase project is active

### If RLS blocks access:
Check if user has role in `user_roles` table:
```sql
SELECT * FROM user_roles WHERE user_id = auth.uid();
```

## 🚀 You're Ready!

Your application is fully configured and ready to use. Start the dev server and begin testing:

```bash
npm run dev
```

Then visit: http://localhost:3000
