import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, couponCode, userId, userEmail, gmbName } = body;

        const key_secret = process.env.RAZORPAY_KEY_SECRET!;

        const hmac = crypto.createHmac("sha256", key_secret);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest("hex");

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json(
                { mssg: "payment verification failed", success: false },
                { status: 400 }
            );
        }

        // Only consume a coupon use once payment has actually succeeded —
        // an abandoned/failed checkout never burns a use.
        if (couponCode && typeof couponCode === "string") {
            try {
                await getSupabaseAdminClient().rpc("redeem_coupon", { coupon_code: couponCode.trim() });
            } catch (e) {
                console.error("Coupon redeem-on-payment error:", e);
            }
        }

        // Record the payment for the admin revenue dashboard — fetch the order back
        // from Razorpay rather than trusting a client-supplied amount.
        try {
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID!,
                key_secret,
            });
            const order = await razorpay.orders.fetch(razorpay_order_id);
            const amountPaise = typeof order.amount === "string" ? parseInt(order.amount, 10) : order.amount;

            await getSupabaseAdminClient().from("payments").insert({
                user_id: userId || null,
                user_email: userEmail || null,
                gmb_name: gmbName || null,
                amount: Math.round(amountPaise / 100),
                currency: order.currency || "INR",
                coupon_code: couponCode || null,
                razorpay_order_id,
                razorpay_payment_id,
            });
        } catch (e) {
            console.error("Payment record error:", e);
        }

        return NextResponse.json({ mssg: "payment success", success: true }, { status: 200 });
    } catch (err: any) {
        console.log(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
