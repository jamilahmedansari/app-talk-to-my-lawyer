# 📋 Quick Start - Rebuild Database

## 1️⃣ Deploy Database (5 minutes)

Open: **https://supabase.com/dashboard/project/liepvjfiezgjrchbdwnb/sql/new**

Copy & paste the entire contents of: **`supabase/DEPLOY_ALL.sql`**

Click **Run** ▶️

---

## 2️⃣ Start App

```bash
npm run dev
```

Open: **http://localhost:3000**

---

## 3️⃣ Create Admin User

1. Sign up at: **http://localhost:3000/auth**

2. Get your user ID from Supabase SQL:

```sql
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;
```

3. Make yourself admin:

```sql
UPDATE user_roles SET role = 'admin' WHERE user_id = 'YOUR-USER-ID';
```

4. Refresh browser - Access **http://localhost:3000/admin**

---

## ✅ Done!

Your complete Talk-To-My-Lawyer app is ready with:

- 👤 User authentication
- 📝 AI letter generation (with quota limits)
- 💰 Employee coupons & commission tracking
- 👑 Admin dashboard
- 🔒 Full RLS security

See **DEPLOYMENT_INSTRUCTIONS.md** for detailed guide.
