import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({} as any));
        const couponCode = typeof body?.couponCode === "string" ? body.couponCode.trim() : "";

        const baseAmount = parseInt(process.env.RAZORPAY_PRICE_AMOUNT || "499");
        let amount = baseAmount;
        let appliedCoupon: string | null = null;

        // Discount is computed here, server-side, from the coupon's real
        // stored fields — never trust a client-provided discount amount.
        if (couponCode) {
            const admin = getSupabaseAdminClient();
            const { data } = await admin
                .from("coupons")
                .select("code, active, discount_percent, max_uses, used_count, expires_at")
                .ilike("code", couponCode)
                .maybeSingle();

            const notExpired = !data?.expires_at || new Date(data.expires_at) > new Date();
            const hasUsesLeft = data ? (data.max_uses == null || data.used_count < data.max_uses) : false;

            if (data && data.active && notExpired && hasUsesLeft) {
                amount = Math.max(1, Math.round(baseAmount * (1 - data.discount_percent / 100)));
                appliedCoupon = data.code;
            }
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        const payment_capture = 1;
        const currency = "INR";
        const options = {
            amount: (amount * 100).toString(),
            currency,
            receipt: Math.random().toString(36).substring(7),
            payment_capture,
            notes: appliedCoupon ? { coupon: appliedCoupon } : undefined,
        };

        const order = await razorpay.orders.create(options);
        return NextResponse.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
            key_id: process.env.RAZORPAY_KEY_ID,
            appliedCoupon,
        });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
