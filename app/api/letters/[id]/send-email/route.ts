import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import nodemailer from "nodemailer";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: letterId } = params;
    const body = await request.json();
    const { attorney_email, attorney_name } = body;

    if (!attorney_email) {
      return NextResponse.json(
        { error: "Attorney email is required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(attorney_email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
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

    // Check if user owns this letter
    if (letter.user_id !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to send this letter" },
        { status: 403 }
      );
    }

    // Check if letter is completed
    if (letter.status !== "completed") {
      return NextResponse.json(
        { error: "Only completed letters can be sent" },
        { status: 400 }
      );
    }

    // Get user profile for sender info
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    // Configure Brevo SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // Use TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Generate PDF URL (this will be accessible via the PDF route)
    const pdfUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/api/letters/${letterId}/pdf`;

    // Prepare email content
    const senderName = profile?.full_name || profile?.email || "Talk To My Lawyer User";
    const recipientName = attorney_name || "Attorney";

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: attorney_email,
      replyTo: profile?.email || process.env.SMTP_FROM_EMAIL,
      subject: `Legal Letter: ${letter.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .letter-info {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #667eea;
            }
            .button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #6b7280;
              font-size: 12px;
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-top: none;
              border-radius: 0 0 8px 8px;
            }
            .info-row {
              margin: 10px 0;
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-label {
              font-weight: bold;
              color: #4b5563;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0;">📄 Legal Letter</h1>
            <p style="margin: 10px 0 0 0;">From Talk To My Lawyer</p>
          </div>
          
          <div class="content">
            <p>Dear ${recipientName},</p>
            
            <p>You have received a legal letter generated through Talk To My Lawyer platform.</p>
            
            <div class="letter-info">
              <h2 style="margin-top: 0; color: #667eea;">${letter.title}</h2>
              
              <div class="info-row">
                <span class="info-label">From:</span> ${senderName}
              </div>
              
              ${letter.recipient_name ? `
                <div class="info-row">
                  <span class="info-label">To:</span> ${letter.recipient_name}
                </div>
              ` : ''}
              
              ${letter.recipient_address ? `
                <div class="info-row">
                  <span class="info-label">Address:</span> ${letter.recipient_address}
                </div>
              ` : ''}
              
              <div class="info-row">
                <span class="info-label">Date Created:</span> ${new Date(letter.created_at).toLocaleDateString()}
              </div>
            </div>
            
            <p><strong>Letter Preview:</strong></p>
            <div style="background: white; padding: 20px; border-radius: 8px; max-height: 300px; overflow-y: auto; border: 1px solid #e5e7eb;">
              <pre style="white-space: pre-wrap; font-family: 'Times New Roman', serif; font-size: 14px; margin: 0;">${letter.content.substring(0, 1000)}${letter.content.length > 1000 ? '...' : ''}</pre>
            </div>
            
            <center>
              <a href="${pdfUrl}" class="button">Download Full Letter (PDF)</a>
            </center>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              <strong>Note:</strong> This letter was generated using AI technology. Please review the content carefully and consult with legal counsel if necessary.
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0 0 10px 0;">
              <strong>Talk To My Lawyer</strong><br>
              Professional Legal Letter Generation Service
            </p>
            <p style="margin: 0; color: #9ca3af;">
              This email was sent to ${attorney_email} because a letter was addressed to you through our platform.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
Dear ${recipientName},

You have received a legal letter generated through Talk To My Lawyer platform.

Letter Title: ${letter.title}
From: ${senderName}
${letter.recipient_name ? `To: ${letter.recipient_name}` : ''}
${letter.recipient_address ? `Address: ${letter.recipient_address}` : ''}
Date Created: ${new Date(letter.created_at).toLocaleDateString()}

Letter Content:
${letter.content}

Download PDF: ${pdfUrl}

Note: This letter was generated using AI technology. Please review the content carefully and consult with legal counsel if necessary.

---
Talk To My Lawyer
Professional Legal Letter Generation Service
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Update letter record with email info
    const { error: updateError } = await supabase
      .from("letters")
      .update({
        attorney_email,
        sent_at: new Date().toISOString(),
      })
      .eq("id", letterId);

    if (updateError) {
      console.error("Error updating letter record:", updateError);
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      sent_to: attorney_email,
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
