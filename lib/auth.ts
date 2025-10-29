// Auth Utilities
import { getServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { UserRole, Profile } from "@/lib/types/database";

/**
 * Requires authentication. Redirects to /auth if not authenticated.
 * Returns the authenticated user or redirects.
 */
export async function requireAuth() {
  const supabase = await getServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth");
  }

  return user;
}

/**
 * Gets the user's profile.
 * Returns null if not authenticated or profile doesn't exist.
 */
export async function getUserProfile(): Promise<Profile | null> {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

/**
 * Gets the user's role from user_roles table.
 * Returns null if not authenticated or no role found.
 */
export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  return roleData?.role || null;
}

/**
 * Checks if the current user is an admin.
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "admin";
}

/**
 * Checks if the current user is an employee or admin.
 */
export async function isEmployee(): Promise<boolean> {
  const role = await getUserRole();
  return role === "employee" || role === "admin";
}

/**
 * Requires admin role. Redirects to /dashboard if not admin.
 */
export async function requireAdmin() {
  const user = await requireAuth();
  const role = await getUserRole();

  if (role !== "admin") {
    redirect("/dashboard");
  }

  return { user, role };
}

/**
 * Requires employee or admin role. Redirects to /dashboard if not authorized.
 */
export async function requireEmployee() {
  const user = await requireAuth();
  const role = await getUserRole();

  if (role !== "employee" && role !== "admin") {
    redirect("/dashboard");
  }

  return { user, role };
}

/**
 * Gets the authenticated user without redirecting.
 * Returns null if not authenticated.
 */
export async function getOptionalAuth() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
