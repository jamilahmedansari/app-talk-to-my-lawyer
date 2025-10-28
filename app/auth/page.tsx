"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <main className="max-w-md mx-auto p-6">
      <div className="mb-4 flex gap-2">
        <Button
          variant={mode === "signin" ? "default" : "outline"}
          onClick={() => setMode("signin")}
        >
          Sign In
        </Button>
        <Button
          variant={mode === "signup" ? "default" : "outline"}
          onClick={() => setMode("signup")}
        >
          Sign Up
        </Button>
      </div>
      <div className="space-y-3">
        <Input placeholder="Email" />
        <Input type="password" placeholder="Password" />
        {mode === "signup" && <Input placeholder="Full name" />}
        <Button className="w-full">
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </Button>
      </div>
    </main>
  );
}
