import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { checkLetterQuota } from "@/lib/rls-helpers";
import { generateLetterWithAI } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check quota
    const quota = await checkLetterQuota(user.id);
    if (!quota.canGenerate) {
      return NextResponse.json(
        { error: "Monthly letter limit reached. Please upgrade your subscription." },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, content, recipient_name, recipient_address } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Create letter record with "generating" status
    const { data: letter, error: insertError } = await supabase
      .from("letters")
      .insert({
        user_id: user.id,
        title,
        content,
        recipient_name: recipient_name || null,
        recipient_address: recipient_address || null,
        status: "generating",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating letter:", insertError);
      return NextResponse.json(
        { error: "Failed to create letter" },
        { status: 500 }
      );
    }

    // Generate letter using Gemini AI
    let generatedContent: string;
    try {
      generatedContent = await generateLetterWithAI({
        title,
        content,
        recipientName: recipient_name,
        recipientAddress: recipient_address,
      });
    } catch (aiError) {
      console.error("AI generation error:", aiError);
      // Update letter status to failed
      await supabase
        .from("letters")
        .update({ status: "failed" })
        .eq("id", letter.id);

      return NextResponse.json(
        { error: "Failed to generate letter content" },
        { status: 500 }
      );
    }

    // Update letter status to completed
    const { error: updateError } = await supabase
      .from("letters")
      .update({
        status: "completed",
        content: generatedContent,
        completed_at: new Date().toISOString(),
      })
      .eq("id", letter.id);

    if (updateError) {
      console.error("Error updating letter:", updateError);
    }

    return NextResponse.json({
      success: true,
      letterId: letter.id,
      message: "Letter generated successfully",
    });
  } catch (error) {
    console.error("Error generating letter:", error);
    return NextResponse.json(
      { error: "Failed to generate letter" },
      { status: 500 }
    );
  }
}
