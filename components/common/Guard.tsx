"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function Guard({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setOk(!!data.user));
  }, []);

  if (ok === null) return <div className="p-6">Loading…</div>;
  if (!ok) {
    if (typeof window !== "undefined") window.location.href = "/auth";
    return null;
  }
  return <>{children}</>;
}
