import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { checkLetterQuota } from "@/lib/rls-helpers";

export async function GET(request: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quota = await checkLetterQuota(user.id);

    return NextResponse.json(quota);
  } catch (error) {
    console.error("Error checking quota:", error);
    return NextResponse.json(
      { error: "Failed to check quota" },
      { status: 500 }
    );
  }
}
