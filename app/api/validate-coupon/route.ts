import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");

    // Validate input: required, max length, and format
    if (!code) {
      return NextResponse.json(
        { valid: false, error: "Coupon code is required" },
        { status: 400 }
      );
    }

    if (code.length > 50) {
      return NextResponse.json(
        { valid: false, error: "Coupon code is too long" },
        { status: 400 }
      );
    }

    // Only allow alphanumeric characters, hyphens, and underscores
    if (!/^[A-Za-z0-9_-]+$/.test(code)) {
      return NextResponse.json(
        { valid: false, error: "Invalid coupon code format" },
        { status: 400 }
      );
    }

    const supabase = await getServerSupabase();

    // Fetch the coupon from employee_coupons table
    const { data: coupon, error } = await supabase
      .from("employee_coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (error || !coupon) {
      return NextResponse.json(
        { valid: false, error: "Invalid coupon code" },
        { status: 404 }
      );
    }

    // Check if coupon is active
    if (!coupon.is_active) {
      return NextResponse.json(
        { valid: false, error: "This coupon is no longer active" },
        { status: 400 }
      );
    }

    // Check if coupon has reached max uses
    if (coupon.max_usage && coupon.usage_count >= coupon.max_usage) {
      return NextResponse.json(
        { valid: false, error: "This coupon has reached its usage limit" },
        { status: 400 }
      );
    }

    // Coupon is valid
    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discount_percent: coupon.discount_percent,
      },
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { valid: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
