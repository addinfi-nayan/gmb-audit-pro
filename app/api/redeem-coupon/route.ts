import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Atomically consumes one use of a coupon (via the redeem_coupon Postgres
 * function — see supabase/migrations/0001_coupon_limits.sql). Used for the
 * 100%-off path, right before skipping payment entirely. Partial-discount
 * coupons are instead redeemed in /api/razorpay/verify-payment, after the
 * payment actually succeeds — so an abandoned checkout never burns a use.
 */
export async function POST(req: Request) {
    try {
        const { code } = await req.json();
        if (!code || typeof code !== "string") {
            return NextResponse.json({ redeemed: false }, { status: 400 });
        }

        const admin = getSupabaseAdminClient();
        const { data, error } = await admin.rpc("redeem_coupon", { coupon_code: code.trim() });

        if (error) {
            console.error("redeem-coupon error:", error);
            return NextResponse.json({ redeemed: false }, { status: 500 });
        }

        const row = Array.isArray(data) ? data[0] : data;
        if (!row?.redeemed) {
            return NextResponse.json({ redeemed: false });
        }

        return NextResponse.json({ redeemed: true, discountPercent: row.discount_percent });
    } catch (error) {
        console.error("redeem-coupon error:", error);
        return NextResponse.json({ redeemed: false }, { status: 500 });
    }
}
