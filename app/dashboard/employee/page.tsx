import { requireEmployee, getUserProfile } from "@/lib/auth";
import Link from "next/link";

export default async function EmployeeDashboard() {
  await requireEmployee();
  const profile = await getUserProfile();

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Employee Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome, {profile?.full_name || profile?.email} ({profile?.role})</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* All Letters Card */}
        <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="font-semibold text-lg">All Letters</div>
          </div>
          <p className="text-sm text-slate-600 mb-4">View and manage all user letters</p>
          <Link
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            href="/dashboard/employee/letters"
          >
            View Letters →
          </Link>
        </div>

        {/* Users Card */}
        <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="font-semibold text-lg">Users</div>
          </div>
          <p className="text-sm text-slate-600 mb-4">View all registered users</p>
          <Link
            className="text-sm text-green-600 hover:text-green-700 font-medium"
            href="/dashboard/employee/users"
          >
            View Users →
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
          <p className="text-sm text-slate-600 mb-4">View all user subscriptions</p>
          <Link
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            href="/dashboard/employee/subscriptions"
          >
            View Subscriptions →
          </Link>
        </div>

        {/* Support Tickets Card */}
        <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="font-semibold text-lg">Support</div>
          </div>
          <p className="text-sm text-slate-600 mb-4">Manage support tickets</p>
          <Link
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            href="/dashboard/employee/support"
          >
            View Tickets →
          </Link>
        </div>

        {/* Reports Card */}
        <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="font-semibold text-lg">Reports</div>
          </div>
          <p className="text-sm text-slate-600 mb-4">View analytics and reports</p>
          <Link
            className="text-sm text-red-600 hover:text-red-700 font-medium"
            href="/dashboard/employee/reports"
          >
            View Reports →
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-slate-600">Total Users</p>
            <p className="text-2xl font-bold mt-1">—</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-slate-600">Active Subscriptions</p>
            <p className="text-2xl font-bold mt-1">—</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-slate-600">Letters This Month</p>
            <p className="text-2xl font-bold mt-1">—</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-slate-600">Open Tickets</p>
            <p className="text-2xl font-bold mt-1">—</p>
          </div>
        </div>
      </section>
    </main>
  );
}
