import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { generateLetterPDF } from "@/lib/pdf";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the letter
    const { data: letter, error: fetchError } = await supabase
      .from("letters")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !letter) {
      return NextResponse.json({ error: "Letter not found" }, { status: 404 });
    }

    // Check if user owns the letter (RLS should handle this, but double-check)
    if (letter.user_id !== user.id) {
      // Check if user is admin/employee
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleData?.role !== "admin" && roleData?.role !== "employee") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Generate PDF
    const pdfBuffer = await generateLetterPDF(letter);

    // Return PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="letter-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

