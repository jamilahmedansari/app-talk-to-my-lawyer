import { NextResponse } from "next/server";
import {
  rateLimit,
  constantTimeEqual,
  getClientIdentifier,
} from "@/lib/rate-limit";
import {
  logAuditEvent,
  logRateLimitExceeded,
  logInvalidInput,
  getClientInfo,
} from "@/lib/audit-log";

export async function POST(request: Request) {
  try {
    // Apply rate limiting: 5 attempts per 15 minutes
    const identifier = getClientIdentifier(request);
    const rateLimitResult = rateLimit(`admin-verify:${identifier}`, {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
    });

    if (!rateLimitResult.success) {
      // Log rate limit violation
      await logRateLimitExceeded(request, "/api/admin/verify-secret");

      const resetDate = new Date(rateLimitResult.reset);
      return NextResponse.json(
        {
          valid: false,
          error: "Too many attempts. Please try again later.",
          resetAt: resetDate.toISOString(),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
            ),
          },
        }
      );
    }

    const { secretKey } = await request.json();

    // Validate input
    if (!secretKey || typeof secretKey !== "string" || secretKey.length > 100) {
      // Log invalid input attempt
      await logInvalidInput(
        request,
        "secretKey",
        !secretKey
          ? "missing"
          : typeof secretKey !== "string"
          ? "invalid type"
          : "too long"
      );

      return NextResponse.json(
        { valid: false, error: "Invalid request" },
        { status: 400 }
      );
    }

    // Verify against environment variable
    const validSecret = process.env.ADMIN_SIGNUP_SECRET;

    if (!validSecret) {
      return NextResponse.json(
        { valid: false, error: "Admin secret not configured" },
        { status: 500 }
      );
    }

    // Use constant-time comparison to prevent timing attacks
    const isValid = constantTimeEqual(secretKey, validSecret);

    // Log verification attempt
    const { ipAddress, userAgent } = getClientInfo(request);
    await logAuditEvent({
      eventType: "admin_secret_verified",
      action: isValid
        ? "Admin secret verified successfully"
        : "Failed admin secret verification attempt",
      ipAddress,
      userAgent,
      metadata: {
        success: isValid,
      },
    });

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    return NextResponse.json(
      { valid: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
