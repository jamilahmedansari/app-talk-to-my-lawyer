"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Database,
  EmployeeCoupon,
  Commission,
  Profile,
} from "@/lib/types/database";

export default function EmployeeDashboardClient() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [coupons, setCoupons] = useState<EmployeeCoupon[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  // New coupon form
  const [newCouponCode, setNewCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(10);
  const [maxUsage, setMaxUsage] = useState<number | undefined>(undefined);

  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      // Load profile
      const { data: profileDataRaw } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      const profileData = profileDataRaw as Profile | null;
      setProfile(profileData);

      // Load employee's coupons
      const { data: couponsDataRaw } = await supabase
        .from("employee_coupons")
        .select("*")
        .eq("employee_id", user.id)
        .order("created_at", { ascending: false });
      const couponsData = (couponsDataRaw as EmployeeCoupon[] | null) ?? [];
      setCoupons(couponsData);

      // Load employee's commissions
      const { data: commissionsDataRaw } = await supabase
        .from("commissions")
        .select("*")
        .eq("employee_id", user.id)
        .order("created_at", { ascending: false });
      const commissionsData = (commissionsDataRaw as Commission[] | null) ?? [];
      setCommissions(commissionsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const payload: Database["public"]["Tables"]["employee_coupons"]["Insert"] = {
        employee_id: user.id,
        code: newCouponCode.toUpperCase(),
        discount_percent: discountPercent,
        max_usage: maxUsage,
        is_active: true,
      };

      const { data, error } = await (supabase as any)
        .from("employee_coupons")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      alert("Coupon created successfully!");
      setNewCouponCode("");
      setDiscountPercent(10);
      setMaxUsage(undefined);
      await loadData();
    } catch (error: any) {
      console.error("Error creating coupon:", error);
      alert(error.message || "Failed to create coupon");
    } finally {
      setCreating(false);
    }
  };

  const toggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from("employee_coupons")
        .update({ is_active: !currentStatus })
        .eq("id", couponId);

      if (error) throw error;

      await loadData();
    } catch (error: any) {
      console.error("Error toggling coupon:", error);
      alert(error.message || "Failed to update coupon");
    }
  };

  const totalEarnings = commissions
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + Number(c.commission_amount), 0);

  const pendingEarnings = commissions
    .filter((c) => c.status === "pending")
    .reduce((sum, c) => sum + Number(c.commission_amount), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Employee Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage coupons and track commissions</p>
          </div>
          <Button variant="outline" onClick={() => supabase.auth.signOut()}>
            Sign Out
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="text-sm font-medium text-green-700">Total Earnings</div>
            <div className="text-3xl font-bold text-green-900 mt-2">
              ${totalEarnings.toFixed(2)}
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <div className="text-sm font-medium text-yellow-700">Pending</div>
            <div className="text-3xl font-bold text-yellow-900 mt-2">
              ${pendingEarnings.toFixed(2)}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="text-sm font-medium text-blue-700">Total Referrals</div>
            <div className="text-3xl font-bold text-blue-900 mt-2">
              {profile?.referrals || 0}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="text-sm font-medium text-purple-700">Active Coupons</div>
            <div className="text-3xl font-bold text-purple-900 mt-2">
              {coupons.filter((c) => c.is_active).length}
            </div>
          </Card>
        </div>

        <Tabs defaultValue="coupons" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="coupons">My Coupons</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
          </TabsList>

          <TabsContent value="coupons">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Create Coupon Form */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Create New Coupon</h2>
                <form onSubmit={handleCreateCoupon} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Coupon Code</label>
                    <Input
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value)}
                      placeholder="SUMMER2025"
                      required
                      className="uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Discount (%) - Default: 10%
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Max Uses (optional)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={maxUsage || ""}
                      onChange={(e) => setMaxUsage(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Unlimited"
                    />
                  </div>

                  <Button type="submit" disabled={creating} className="w-full">
                    {creating ? "Creating..." : "Create Coupon"}
                  </Button>
                </form>
              </Card>

              {/* Coupons List */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-semibold">Your Coupons</h2>
                {coupons.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-gray-500">No coupons yet. Create your first one!</p>
                  </Card>
                ) : (
                  coupons.map((coupon) => (
                    <Card key={coupon.id} className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-bold font-mono">{coupon.code}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              coupon.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {coupon.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="mt-3 space-y-1 text-sm text-gray-600">
                            <p>💰 Discount: {coupon.discount_percent}%</p>
                            <p>📊 Used: {coupon.usage_count} {coupon.max_usage ? `/ ${coupon.max_usage}` : ''} times</p>
                            <p>📅 Created: {new Date(coupon.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={coupon.is_active ? "outline" : "default"}
                          onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                        >
                          {coupon.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="commissions">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Commission History</h2>
              {commissions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No commissions yet. Share your coupon codes to start earning!
                </p>
              ) : (
                <div className="space-y-3">
                  {commissions.map((commission) => (
                    <div
                      key={commission.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-lg">
                            ${Number(commission.commission_amount).toFixed(2)}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(commission.created_at).toLocaleDateString()}
                          </p>
                          {commission.paid_at && (
                            <p className="text-xs text-green-600 mt-1">
                              Paid on {new Date(commission.paid_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          commission.status === 'paid' ? 'bg-green-100 text-green-800' :
                          commission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {commission.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
