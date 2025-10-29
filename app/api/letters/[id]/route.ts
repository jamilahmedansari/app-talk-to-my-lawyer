import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { canAccessLetter } from "@/lib/rls-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: letterId } = await params;

    // Check if user can access this letter
    const hasAccess = await canAccessLetter(user.id, letterId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have permission to view this letter" },
        { status: 403 }
      );
    }

    // Fetch the letter
    const { data: letter, error: letterError } = await supabase
      .from("letters")
      .select("*")
      .eq("id", letterId)
      .single();

    if (letterError || !letter) {
      return NextResponse.json(
        { error: "Letter not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      letter,
    });
  } catch (error) {
    console.error("Error fetching letter:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
