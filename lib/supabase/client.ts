"use client";
import { createBrowserClient } from "@supabase/ssr";
import { getRequiredEnv } from "@/lib/env-validation";

// Validate and get required environment variables
const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
