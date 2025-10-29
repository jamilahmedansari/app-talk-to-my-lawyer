"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import type { UserRoleRow } from "@/lib/types/database";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          setMessage("Account created! Check your email to confirm your account.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Get user role from user_roles table
          const { data: roleDataRaw } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", data.user.id)
            .single();

          // Redirect based on role
          const roleData = roleDataRaw as Pick<UserRoleRow, "role"> | null;

          if (roleData?.role === "admin") {
            router.push("/admin");
          } else if (roleData?.role === "employee") {
            router.push("/dashboard/employee");
          } else {
            router.push("/dashboard");
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </h1>
        <p className="text-slate-600">
          {mode === "signin"
            ? "Welcome back! Sign in to your account."
            : "Create an account to get started."}
        </p>
      </div>

      <div className="mb-4 flex gap-2">
        <Button
          variant={mode === "signin" ? "default" : "outline"}
          onClick={() => {
            setMode("signin");
            setError(null);
            setMessage(null);
          }}
          disabled={loading}
        >
          Sign In
        </Button>
        <Button
          variant={mode === "signup" ? "default" : "outline"}
          onClick={() => {
            setMode("signup");
            setError(null);
            setMessage(null);
          }}
          disabled={loading}
        >
          Sign Up
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          minLength={6}
        />
        {mode === "signup" && (
          <Input
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={loading}
          />
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? "Loading..."
            : mode === "signin"
              ? "Sign In"
              : "Sign Up"}
        </Button>
      </form>
    </main>
  );
}
