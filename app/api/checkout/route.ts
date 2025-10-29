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
    const plans: Record<string, { price: number; name: string; letters: number; monthly_allocation: number; is_recurring: boolean }> = {
      "one-time": { 
        price: 199.00, 
        name: "One-Time Letter", 
        letters: 1, 
        monthly_allocation: 1,
        is_recurring: false 
      },
      "annual-basic": { 
        price: 2388.00, 
        name: "Annual Basic", 
        letters: 48, 
        monthly_allocation: 4,
        is_recurring: true 
      },
      "annual-premium": { 
        price: 7200.00, 
        name: "Annual Premium", 
        letters: 96, 
        monthly_allocation: 8,
        is_recurring: true 
      },
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
    const nextRefillDate = new Date();
    
    if (plans[plan].is_recurring) {
      // Annual plans expire in 1 year, refill monthly
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      nextRefillDate.setMonth(nextRefillDate.getMonth() + 1);
    } else {
      // One-time plan expires in 30 days, no refill
      expiresAt.setDate(expiresAt.getDate() + 30);
    }

    // Generate mock payment ID
    const paymentId = `DEMO-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan,
        tier: plan,
        price: plans[plan].price,
        discount,
        coupon_code: coupon_code?.toUpperCase() || null,
        employee_id: employeeId,
        status: "active",
        letters_remaining: plans[plan].letters,
        monthly_allocation: plans[plan].monthly_allocation,
        next_refill_date: plans[plan].is_recurring ? nextRefillDate.toISOString() : null,
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

    // Create purchase record
    const { error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        user_id: user.id,
        subscription_id: subscription.id,
        tier: plan,
        amount: price,
        payment_id: paymentId,
      });

    if (purchaseError) {
      console.error("Error creating purchase record:", purchaseError);
      // Continue anyway, subscription is created
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
      paymentId,
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

