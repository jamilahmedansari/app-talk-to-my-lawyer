"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database";

export default function AdminAccess() {
  const [secretKey, setSecretKey] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mode, setMode] = useState<"signup" | "promote">("signup");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Verify secret key with backend
      const response = await fetch("/api/admin/verify-secret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey }),
      });

      const { valid } = await response.json();

      if (!valid) {
        setError("Invalid admin secret key");
        setLoading(false);
        return;
      }

      if (mode === "signup") {
        // Sign up new admin user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        if (authData.user) {
          const userId = authData.user.id;

          const profilePayload: Database["public"]["Tables"]["profiles"]["Update"] = {
            full_name: fullName,
          };
          const { error: profileError } = await (supabase as any)
            .from("profiles")
            .update(profilePayload)
            .eq("id", userId);

          if (profileError) {
            setError("Failed to update profile: " + profileError.message);
            setLoading(false);
            return;
          }

          const rolePayload: Database["public"]["Tables"]["user_roles"]["Insert"] = {
            user_id: userId,
            role: "admin",
          };
          const { error: roleError } = await (supabase as any)
            .from("user_roles")
            .upsert(rolePayload, { onConflict: "user_id" });

          if (roleError) {
            setError("Failed to set admin role: " + roleError.message);
            setLoading(false);
            return;
          }

          router.push("/admin");
        }
      } else {
        // Promote existing user to admin
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }

        if (authData.user) {
          const userId = authData.user.id;

          const rolePayload: Database["public"]["Tables"]["user_roles"]["Insert"] = {
            user_id: userId,
            role: "admin",
          };
          const { error: roleError } = await (supabase as any)
            .from("user_roles")
            .upsert(rolePayload, { onConflict: "user_id" });

          if (roleError) {
            setError("Failed to set admin role: " + roleError.message);
            setLoading(false);
            return;
          }

          router.push("/admin");
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        <div className="rounded-lg border bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Admin Access</h1>
            <p className="text-sm text-slate-600 mt-1">
              This area is restricted to administrators only
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="mb-6 flex gap-2 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded px-4 py-2 text-sm font-medium transition-colors ${
                mode === "signup"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              New Admin
            </button>
            <button
              type="button"
              onClick={() => setMode("promote")}
              className={`flex-1 rounded px-4 py-2 text-sm font-medium transition-colors ${
                mode === "promote"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Promote Existing
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Secret Key */}
            <div>
              <label htmlFor="secretKey" className="block text-sm font-medium text-slate-700 mb-1">
                Admin Secret Key *
              </label>
              <input
                id="secretKey"
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter admin secret key"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="admin@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password *
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Minimum 6 characters"
              />
            </div>

            {/* Full Name (only for signup) */}
            {mode === "signup" && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Processing..." : mode === "signup" ? "Create Admin Account" : "Promote to Admin"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/auth" className="text-sm text-blue-600 hover:text-blue-700">
              ← Back to regular login
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
