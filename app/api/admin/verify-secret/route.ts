import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { secretKey } = await request.json();

    // Verify against environment variable
    const validSecret = process.env.ADMIN_SIGNUP_SECRET;

    if (!validSecret) {
      return NextResponse.json(
        { valid: false, error: "Admin secret not configured" },
        { status: 500 }
      );
    }

    const isValid = secretKey === validSecret;

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    return NextResponse.json(
      { valid: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
