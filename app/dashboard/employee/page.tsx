import { requireEmployee, getUserProfile } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EmployeeDashboardClient } from "./client";

export default async function EmployeeDashboard() {
  await requireEmployee();
  const profile = await getUserProfile();
  const supabase = await getServerSupabase();

  // Fetch employee coupon
  const { data: couponData } = await supabase
    .from("employee_coupons")
    .select("code, usage_count, discount_percent")
    .eq("employee_id", profile!.id)
    .eq("is_active", true)
    .single();

  // Fetch total earnings (commissions)
  const { data: commissionsData } = await supabase
    .from("commissions")
    .select("commission_amount")
    .eq("employee_id", profile!.id);

  const totalRevenue = commissionsData?.reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;
  const totalPoints = couponData?.usage_count || 0;

  return (
    <>
      <DashboardHeader
        userName={profile?.full_name}
        userEmail={profile?.email}
      />
      <main className="mx-auto max-w-6xl p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Employee Dashboard</h1>
          <p className="text-slate-600 mt-2">
            Welcome, {profile?.full_name || profile?.email}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Coupon Code Card */}
          <EmployeeDashboardClient
            couponCode={couponData?.code || "Loading..."}
            discountPercent={couponData?.discount_percent || 20}
            points={totalPoints}
            revenue={totalRevenue}
          />
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            How It Works
          </h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>
              <strong>Share Your Coupon:</strong> Give your unique coupon code to
              subscribers for a {couponData?.discount_percent || 20}% discount
            </li>
            <li>
              <strong>Earn Points:</strong> Get 1 point for each successful signup
              using your coupon
            </li>
            <li>
              <strong>Earn Revenue:</strong> Receive 5% commission on each paid
              subscription using your coupon
            </li>
          </ul>
        </div>
      </main>
    </>
  );
}
