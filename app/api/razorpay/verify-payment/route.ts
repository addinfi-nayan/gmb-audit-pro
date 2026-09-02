import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, couponCode } = body;

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

        return NextResponse.json({ mssg: "payment success", success: true }, { status: 200 });
    } catch (err: any) {
        console.log(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
