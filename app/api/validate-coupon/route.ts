import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Public, read-only: checks a coupon's validity (active, not expired, uses
 * remaining) without consuming a use. Redemption happens separately, at the
 * point the coupon is actually committed — see /api/redeem-coupon and
 * /api/razorpay/verify-payment.
 */
export async function POST(req: Request) {
    try {
        const { code } = await req.json();
        if (!code || typeof code !== "string") {
            return NextResponse.json({ valid: false }, { status: 400 });
        }

        const admin = getSupabaseAdminClient();
        const { data, error } = await admin
            .from("coupons")
            .select("code, active, discount_percent, max_uses, used_count, expires_at")
            .ilike("code", code.trim())
            .maybeSingle();

        if (error || !data) {
            return NextResponse.json({ valid: false });
        }

        const notExpired = !data.expires_at || new Date(data.expires_at) > new Date();
        const hasUsesLeft = data.max_uses == null || data.used_count < data.max_uses;

        if (!data.active || !notExpired || !hasUsesLeft) {
            return NextResponse.json({ valid: false });
        }

        return NextResponse.json({
            valid: true,
            code: data.code,
            discountPercent: data.discount_percent ?? 100,
        });
    } catch (error) {
        console.error("validate-coupon error:", error);
        return NextResponse.json({ valid: false }, { status: 500 });
    }
}
