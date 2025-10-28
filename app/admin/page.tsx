import { requireAdmin, getUserProfile } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminDashboard() {
  await requireAdmin();
  const profile = await getUserProfile();
  const supabase = await getServerSupabase();

  // Fetch comprehensive admin statistics
  const [usersResult, activeSubscriptionsResult, totalLettersResult, couponsResult] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase.from("letters").select("id", { count: "exact", head: true }),
    supabase.from("employee_coupons").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);

  const totalUsers = usersResult.count || 0;
  const activeSubscribers = activeSubscriptionsResult.count || 0;
  const totalLetters = totalLettersResult.count || 0;
  const activeCoupons = couponsResult.count || 0;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Welcome, {profile?.full_name || profile?.email} (Administrator)
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Users Management Card */}
        <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="font-semibold text-lg">Users</div>
          </div>
          <p className="text-sm text-slate-600 mb-4">Manage all users and roles</p>
          <Link
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            href="/admin/users"
          >
            Manage Users →
          </Link>
        </div>

        {/* Letters Management Card */}
        <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="font-semibold text-lg">All Letters</div>
          </div>
          <p className="text-sm text-slate-600 mb-4">View and manage all letters</p>
          <Link
            className="text-sm text-green-600 hover:text-green-700 font-medium"
            href="/admin/letters"
          >
            View Letters →
          </Link>
        </div>

        {/* Subscriptions Card */}
        <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div className="font-semibold text-lg">Subscriptions</div>
          </div>
          <p className="text-sm text-slate-600 mb-4">Manage all subscriptions</p>
          <Link
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            href="/admin/subscriptions"
          >
            Manage Subscriptions →
          </Link>
        </div>

        {/* Coupons Card */}
        <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div className="font-semibold text-lg">Coupons</div>
          </div>
          <p className="text-sm text-slate-600 mb-4">Create and manage coupons</p>
          <Link
            className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
            href="/admin/coupons"
          >
            Manage Coupons →
          </Link>
        </div>

        {/* Affiliate Transactions Card */}
        <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="font-semibold text-lg">Affiliates</div>
          </div>
          <p className="text-sm text-slate-600 mb-4">View affiliate transactions</p>
          <Link
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            href="/admin/affiliates"
          >
            View Transactions →
          </Link>
        </div>

        {/* System Settings Card */}
        <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="font-semibold text-lg">Settings</div>
          </div>
          <p className="text-sm text-slate-600 mb-4">Configure system settings</p>
          <Link
            className="text-sm text-red-600 hover:text-red-700 font-medium"
            href="/admin/settings"
          >
            View Settings →
          </Link>
        </div>
      </div>

      {/* System Overview */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">System Overview</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-slate-600">Total Users</p>
            <p className="text-2xl font-bold mt-1">{totalUsers}</p>
            <p className="text-xs text-slate-500 mt-1">All registered users</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-slate-600">Active Subscribers</p>
            <p className="text-2xl font-bold mt-1">{activeSubscribers}</p>
            <p className="text-xs text-slate-500 mt-1">Paying customers</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-slate-600">Total Letters</p>
            <p className="text-2xl font-bold mt-1">{totalLetters}</p>
            <p className="text-xs text-slate-500 mt-1">Generated letters</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-slate-600">Active Coupons</p>
            <p className="text-2xl font-bold mt-1">{activeCoupons}</p>
            <p className="text-xs text-slate-500 mt-1">Available codes</p>
          </div>
        </div>
      </section>
    </main>
  );
}
