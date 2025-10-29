"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Database, Subscription, UserRoleRow } from "@/lib/types/database";

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    canceled: 0,
    totalRevenue: 0,
  });

  const loadSubscriptions = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      // Check if admin
      const { data: roleDataRaw } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      const roleData = roleDataRaw as Pick<UserRoleRow, "role"> | null;

      if (roleData?.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      // Load all subscriptions
      const { data: subsDataRaw } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      const subsData = (subsDataRaw as Subscription[] | null) ?? [];

      setSubscriptions(subsData);

      // Calculate stats
      const active = subsData.filter((s) => s.status === "active").length;
      const canceled = subsData.filter((s) => s.status === "canceled").length;
      const revenue = subsData.reduce((sum, s) => sum + (Number(s.price) || 0), 0);

      setStats({
        total: subsData?.length || 0,
        active,
        canceled,
        totalRevenue: revenue,
      });
    } catch (error) {
      console.error("Error loading subscriptions:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadSubscriptions();
  }, [loadSubscriptions]);

  const cancelSubscription = async (subId: string) => {
    if (!confirm("Are you sure you want to cancel this subscription?")) {
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("id", subId);

      if (error) throw error;

      alert("Subscription canceled successfully");
      await loadSubscriptions();
    } catch (error: any) {
      console.error("Error canceling subscription:", error);
      alert(error.message || "Failed to cancel subscription");
    }
  };

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
            <h1 className="text-3xl font-bold">Subscription Management</h1>
            <p className="text-gray-600 mt-1">View and manage all subscriptions</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/admin")}>
            Back to Dashboard
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="text-sm font-medium text-blue-700">Total Subscriptions</div>
            <div className="text-3xl font-bold text-blue-900 mt-2">{stats.total}</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="text-sm font-medium text-green-700">Active</div>
            <div className="text-3xl font-bold text-green-900 mt-2">{stats.active}</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
            <div className="text-sm font-medium text-red-700">Canceled</div>
            <div className="text-3xl font-bold text-red-900 mt-2">{stats.canceled}</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <div className="text-sm font-medium text-purple-700">Total Revenue</div>
            <div className="text-3xl font-bold text-purple-900 mt-2">
              ${stats.totalRevenue.toFixed(2)}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">All Subscriptions</h2>

          <div className="space-y-3">
            {subscriptions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No subscriptions yet</p>
            ) : (
              subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold uppercase text-lg">{sub.plan}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        User ID: {sub.user_id.substring(0, 8)}...
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <span className="text-gray-700 font-medium">
                          Price: ${Number(sub.price || 0).toFixed(2)}
                        </span>
                        {sub.discount && sub.discount > 0 && (
                          <span className="text-green-600">
                            {sub.discount}% discount
                          </span>
                        )}
                        {sub.coupon_code && (
                          <span className="text-blue-600 font-mono">
                            {sub.coupon_code}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Created: {new Date(sub.created_at).toLocaleString()}
                      </p>
                      {sub.expires_at && (
                        <p className="text-xs text-gray-500">
                          Expires: {new Date(sub.expires_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          sub.status === "active"
                            ? "bg-green-100 text-green-800"
                            : sub.status === "canceled"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {sub.status}
                      </span>
                      {sub.status === "active" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => cancelSubscription(sub.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
