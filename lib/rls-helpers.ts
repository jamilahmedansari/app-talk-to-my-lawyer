// RLS (Row Level Security) Helpers
// Helper functions to check user permissions and subscription limits

import { getServerSupabase } from "./supabase/server";
import type { UserRole } from "./types/database";

/**
 * Check if a user can access a specific letter
 * Rules:
 * - Users can access their own letters
 * - Employees and admins can access all letters
 */
export async function canAccessLetter(userId: string, letterId: string): Promise<boolean> {
  try {
    const supabase = await getServerSupabase();

    // Get user's role from user_roles table
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    // Employees and admins can access all letters
    if (roleData?.role === "employee" || roleData?.role === "admin") {
      return true;
    }

    // Check if the letter belongs to the user
    const { data: letter } = await supabase
      .from("letters")
      .select("user_id")
      .eq("id", letterId)
      .single();

    return letter?.user_id === userId;
  } catch (error) {
    console.error("Error checking letter access:", error);
    return false;
  }
}

/**
 * Check if a user can modify a specific subscription
 * Rules:
 * - Users can modify their own subscriptions
 * - Employees and admins can modify all subscriptions
 */
export async function canModifySubscription(userId: string, subscriptionId: string): Promise<boolean> {
  try {
    const supabase = await getServerSupabase();

    // Get user's role from user_roles table
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    // Employees and admins can modify all subscriptions
    if (roleData?.role === "employee" || roleData?.role === "admin") {
      return true;
    }

    // Check if the subscription belongs to the user
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("id", subscriptionId)
      .single();

    return subscription?.user_id === userId;
  } catch (error) {
    console.error("Error checking subscription modification access:", error);
    return false;
  }
}

/**
 * Check subscription quota for letter generation
 * Returns: { canGenerate: boolean, remaining: number, total: number }
 */
export async function checkLetterQuota(userId: string): Promise<{
  canGenerate: boolean;
  remaining: number;
  total: number;
}> {
  try {
    const supabase = await getServerSupabase();

    // Call the database function
    const { data, error } = await supabase.rpc('check_subscription_limits', {
      p_user: userId
    });

    if (error) {
      console.error("Error checking quota:", error);
      return { canGenerate: false, remaining: 0, total: 0 };
    }

    // Get active subscription details
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Determine max letters based on plan
    let maxLetters = 0;
    if (subscription?.plan === 'single') maxLetters = 1;
    else if (subscription?.plan === 'annual4') maxLetters = 4;
    else if (subscription?.plan === 'annual8') maxLetters = 8;

    // Get current month's letter count
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("letters")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfMonth.toISOString());

    const used = count || 0;
    const remaining = Math.max(0, maxLetters - used);

    return {
      canGenerate: data === true,
      remaining,
      total: maxLetters
    };
  } catch (error) {
    console.error("Error checking letter quota:", error);
    return { canGenerate: false, remaining: 0, total: 0 };
  }
}
