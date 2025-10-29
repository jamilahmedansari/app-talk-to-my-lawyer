"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/types/database";

// Create the Supabase client for client-side usage with proper environment variable handling
export const supabase = createClientComponentClient<Database>();
