// RLS (Row Level Security) Helpers
// Helper functions to check user permissions for accessing resources

import { getServerSupabase } from "./supabase/server";

/**
 * Check if a user can access a specific letter
 * Rules:
 * - Users can access their own letters
 * - Employees and admins can access all letters
 */
export async function canAccessLetter(userId: string, letterId: string): Promise<boolean> {
  try {
    const supabase = await getServerSupabase();

    // Get user's role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    // Employees and admins can access all letters
    if (profile?.role === "employee" || profile?.role === "admin") {
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

    // Get user's role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    // Employees and admins can modify all subscriptions
    if (profile?.role === "employee" || profile?.role === "admin") {
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
