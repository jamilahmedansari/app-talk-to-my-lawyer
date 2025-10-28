import { requireAuth, getUserProfile } from "@/lib/auth";
import Link from "next/link";

export default async function SubscriberDashboard() {
  await requireAuth();
  const profile = await getUserProfile();

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Subscriber Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome back, {profile?.full_name || profile?.email}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Generate Letter Card */}
        <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="font-semibold text-lg">Generate Letter</div>
          </div>
          <p className="text-sm text-slate-600 mb-4">Create a new legal letter with our generator</p>
          <Link
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            href="/dashboard/subscriber/generate"
          >
            Start Creating →
          </Link>
        </div>

        {/* My Letters Card */}
        <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="font-semibold text-lg">My Letters</div>
          </div>
          <p className="text-sm text-slate-600 mb-4">View and manage your letter history</p>
          <Link
            className="text-sm text-green-600 hover:text-green-700 font-medium"
            href="/dashboard/subscriber/letters"
          >
            View Letters →
          </Link>
        </div>

        {/* Subscription Card */}
        <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div className="font-semibold text-lg">Subscription</div>
          </div>
          <p className="text-sm text-slate-600 mb-4">Manage your subscription plan</p>
          <Link
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            href="/dashboard/subscriber/subscription"
          >
            Manage Plan →
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="border rounded-lg p-6">
          <p className="text-sm text-slate-600">No recent activity yet. Create your first letter to get started!</p>
        </div>
      </section>
    </main>
  );
}
