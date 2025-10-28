import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan, coupon_code } = body;

    if (!plan) {
      return NextResponse.json({ error: "Plan is required" }, { status: 400 });
    }

    // Define plan prices
    const plans: Record<string, { price: number; name: string }> = {
      single: { price: 29.99, name: "Single Letter" },
      annual4: { price: 99.99, name: "4 Letters/Year" },
      annual8: { price: 179.99, name: "8 Letters/Year" },
    };

    if (!plans[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    let price = plans[plan].price;
    let discount = 0;
    let employeeId: string | null = null;

    // Validate coupon if provided
    if (coupon_code) {
      const { data: coupon, error: couponError } = await supabase
        .from("employee_coupons")
        .select("*")
        .eq("code", coupon_code.toUpperCase())
        .eq("is_active", true)
        .single();

      if (couponError || !coupon) {
        return NextResponse.json(
          { error: "Invalid coupon code" },
          { status: 400 }
        );
      }

      // Check max usage
      if (coupon.max_usage && coupon.usage_count >= coupon.max_usage) {
        return NextResponse.json(
          { error: "Coupon has reached its usage limit" },
          { status: 400 }
        );
      }

      discount = coupon.discount_percent;
      employeeId = coupon.employee_id;
      price = price * (1 - discount / 100);
    }

    // Create subscription record
    // Note: In production, integrate with Stripe here
    const expiresAt = new Date();
    if (plan === "single") {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan,
        price: plans[plan].price,
        discount,
        coupon_code: coupon_code?.toUpperCase() || null,
        employee_id: employeeId,
        status: "active",
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (subError) {
      console.error("Error creating subscription:", subError);
      return NextResponse.json(
        { error: "Failed to create subscription" },
        { status: 500 }
      );
    }

    // Update profile subscription status
    await supabase
      .from("profiles")
      .update({
        subscription_tier: plan,
        subscription_status: "active",
        subscription_expires_at: expiresAt.toISOString(),
      })
      .eq("id", user.id);

    return NextResponse.json({
      success: true,
      subscription,
      finalPrice: price,
      message: "Subscription created successfully",
    });
  } catch (error) {
    console.error("Error processing checkout:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

