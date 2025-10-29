"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import type {
  Database,
  Profile,
  Subscription,
  Commission,
  UserRoleRow,
} from "@/lib/types/database";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<(Profile & { role?: string })[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    pendingCommissions: 0,
  });

  const loadData = useCallback(async () => {
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

      // Load all users with their roles
      const { data: usersDataRaw } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      const usersData = (usersDataRaw as Profile[] | null) ?? [];

      // Get roles for each user
      const usersWithRoles = await Promise.all(
        usersData.map(async (user) => {
          const { data: userRoleRaw } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .single();
          const userRole = userRoleRaw as Pick<UserRoleRow, "role"> | null;
          return { ...user, role: userRole?.role };
        })
      );
      setUsers(usersWithRoles);

      // Load subscriptions
      const { data: subsDataRaw } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });
      const subsData = (subsDataRaw as Subscription[] | null) ?? [];
      setSubscriptions(subsData);

      // Load commissions
      const { data: commissionsDataRaw } = await supabase
        .from("commissions")
        .select("*")
        .order("created_at", { ascending: false });
      const commissionsData = (commissionsDataRaw as Commission[] | null) ?? [];
      setCommissions(commissionsData);

      // Calculate stats
      const activeSubsCount = subsData.filter((s) => s.status === "active").length;
      const totalRevenue = subsData.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
      const pendingComm = commissionsData
        .filter((c) => c.status === "pending")
        .reduce((sum, c) => sum + Number(c.commission_amount), 0);

      setStats({
        totalUsers: usersData.length,
        activeSubscriptions: activeSubsCount,
        totalRevenue,
        pendingCommissions: pendingComm,
      });
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await (supabase as any)
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;

      alert("Role updated successfully");
      await loadData();
    } catch (error: any) {
      console.error("Error updating role:", error);
      alert(error.message || "Failed to update role");
    }
  };

  const payCommission = async (commissionId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("commissions")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", commissionId);

      if (error) throw error;

      alert("Commission marked as paid");
      await loadData();
    } catch (error: any) {
      console.error("Error paying commission:", error);
      alert(error.message || "Failed to pay commission");
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
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">System overview and management</p>
          </div>
          <Button variant="outline" onClick={() => supabase.auth.signOut()}>
            Sign Out
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="text-sm font-medium text-blue-700">Total Users</div>
            <div className="text-3xl font-bold text-blue-900 mt-2">{stats.totalUsers}</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="text-sm font-medium text-green-700">Active Subscriptions</div>
            <div className="text-3xl font-bold text-green-900 mt-2">
              {stats.activeSubscriptions}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="text-sm font-medium text-purple-700">Total Revenue</div>
            <div className="text-3xl font-bold text-purple-900 mt-2">
              ${stats.totalRevenue.toFixed(2)}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <div className="text-sm font-medium text-yellow-700">Pending Commissions</div>
            <div className="text-3xl font-bold text-yellow-900 mt-2">
              ${stats.pendingCommissions.toFixed(2)}
            </div>
          </Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">User Management</h2>
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{user.full_name || "No name"}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.role === "admin" ? "bg-red-100 text-red-800" :
                            user.role === "employee" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {user.role || "user"}
                          </span>
                          <span className="text-gray-500">
                            Referrals: {user.referrals}
                          </span>
                          <span className="text-gray-500">
                            Earnings: ${Number(user.earnings || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <select
                          className="text-sm border rounded px-2 py-1"
                          value={user.role || "user"}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                        >
                          <option value="user">User</option>
                          <option value="employee">Employee</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Subscription Management</h2>
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
                        <div>
                          <h3 className="font-semibold uppercase">{sub.plan}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Price: ${Number(sub.price || 0).toFixed(2)}
                            {sub.discount ? ` (${sub.discount}% off)` : ""}
                          </p>
                          {sub.coupon_code && (
                            <p className="text-xs text-blue-600 mt-1">
                              Coupon: {sub.coupon_code}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Created: {new Date(sub.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          sub.status === "active" ? "bg-green-100 text-green-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="commissions">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Commission Management</h2>
              <div className="space-y-3">
                {commissions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No commissions yet</p>
                ) : (
                  commissions.map((commission) => (
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
                            Employee ID: {commission.employee_id.substring(0, 8)}...
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Created: {new Date(commission.created_at).toLocaleDateString()}
                          </p>
                          {commission.paid_at && (
                            <p className="text-xs text-green-600 mt-1">
                              Paid: {new Date(commission.paid_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            commission.status === "paid" ? "bg-green-100 text-green-800" :
                            commission.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {commission.status}
                          </span>
                          {commission.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => payCommission(commission.id)}
                            >
                              Mark as Paid
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
