import { requireAuth, getUserProfile } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function SubscriptionManagementPage() {
  await requireAuth();
  const profile = await getUserProfile();
  const supabase = await getServerSupabase();

  // Fetch active subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", profile!.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Fetch purchase history
  const { data: purchases } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", profile!.id)
    .order("created_at", { ascending: false });

  // Fetch refill history if subscription exists
  let refillHistory: any[] = [];
  if (subscription) {
    const { data: refills } = await supabase
      .from("refill_history")
      .select("*")
      .eq("subscription_id", subscription.id)
      .order("refilled_at", { ascending: false })
      .limit(10);
    refillHistory = refills || [];
  }

  const tierNames: Record<string, string> = {
    "one-time": "One-Time Letter",
    "annual-basic": "Annual Basic",
    "annual-premium": "Annual Premium",
  };

  const tierDescriptions: Record<string, string> = {
    "one-time": "Single letter with 30-day validity",
    "annual-basic": "4 letters per month, refills monthly",
    "annual-premium": "8 letters per month, refills monthly",
  };

  return (
    <>
      <DashboardHeader
        userName={profile?.full_name}
        userEmail={profile?.email}
      />
      <main className="mx-auto max-w-6xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Subscription Management</h1>
            <p className="text-slate-600 mt-2">
              Manage your subscription and view usage history
            </p>
          </div>
          <Link href="/pricing">
            <Button variant="outline">View All Plans</Button>
          </Link>
        </div>

        {subscription ? (
          <>
            {/* Current Subscription Card */}
            <Card className="p-8 mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-slate-900">
                      {tierNames[subscription.tier] || subscription.tier}
                    </h2>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-slate-600">
                    {tierDescriptions[subscription.tier] || ""}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-900">
                    ${Number(subscription.price || 0).toFixed(2)}
                  </div>
                  {subscription.discount && subscription.discount > 0 && (
                    <div className="text-sm text-green-600 font-medium mt-1">
                      {subscription.discount}% discount applied
                    </div>
                  )}
                </div>
              </div>

              {/* Letter Quota */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="text-sm text-slate-600 mb-1">Letters Remaining</div>
                  <div className="text-3xl font-bold text-blue-900">
                    {subscription.letters_remaining || 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Available to use now
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="text-sm text-slate-600 mb-1">Monthly Allocation</div>
                  <div className="text-3xl font-bold text-slate-900">
                    {subscription.monthly_allocation || 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Letters per month
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="text-sm text-slate-600 mb-1">
                    {subscription.next_refill_date ? "Next Refill" : "Expires"}
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {subscription.next_refill_date
                      ? new Date(subscription.next_refill_date).toLocaleDateString()
                      : new Date(subscription.expires_at).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {subscription.next_refill_date ? "Quota resets" : "Subscription ends"}
                  </div>
                </div>
              </div>

              {/* Subscription Details */}
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-slate-600">Started</div>
                    <div className="font-medium text-slate-900">
                      {new Date(subscription.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-600">Expires</div>
                    <div className="font-medium text-slate-900">
                      {new Date(subscription.expires_at).toLocaleDateString()}
                    </div>
                  </div>
                  {subscription.coupon_code && (
                    <div>
                      <div className="text-slate-600">Coupon Used</div>
                      <div className="font-medium text-blue-600 font-mono">
                        {subscription.coupon_code}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-slate-600">Plan Type</div>
                    <div className="font-medium text-slate-900">
                      {subscription.tier.includes("annual") ? "Annual" : "One-Time"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <Link href="/dashboard/subscriber/generate" className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Generate Letter
                  </Button>
                </Link>
                <Link href="/pricing" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Upgrade Plan
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Refill History */}
            {refillHistory.length > 0 && (
              <Card className="p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">Refill History</h3>
                <div className="space-y-3">
                  {refillHistory.map((refill) => (
                    <div
                      key={refill.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            +{refill.letters_refilled} letters added
                          </div>
                          <div className="text-sm text-slate-600">
                            {new Date(refill.refilled_at).toLocaleDateString()} at{" "}
                            {new Date(refill.refilled_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Purchase History */}
            {purchases && purchases.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Purchase History</h3>
                <div className="space-y-3">
                  {purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">
                          {tierNames[purchase.tier] || purchase.tier}
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                          Payment ID: {purchase.payment_id}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {new Date(purchase.created_at).toLocaleDateString()} at{" "}
                          {new Date(purchase.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-slate-900">
                          ${Number(purchase.amount).toFixed(2)}
                        </div>
                        <div className="text-xs text-green-600 font-medium mt-1">
                          Completed
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        ) : (
          /* No Subscription State */
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">
              No Active Subscription
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              You don&apos;t have an active subscription yet. Choose a plan to start generating
              professional legal letters.
            </p>
            <Link href="/pricing">
              <Button className="bg-blue-600 hover:bg-blue-700 px-8">
                View Pricing Plans
              </Button>
            </Link>
          </Card>
        )}
      </main>
    </>
  );
}
