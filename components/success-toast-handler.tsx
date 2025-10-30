"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export function SuccessToastHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const success = searchParams.get("success");

    if (success === "true") {
      toast.success("Subscription activated successfully! Welcome to Talk To My Lawyer.");

      // Remove the success param from URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete("success");
      const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
      router.replace(newUrl);
    }
  }, [searchParams, router]);

  return null;
}
