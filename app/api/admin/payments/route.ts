import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
        .from("payments")
        .select("id, user_email, gmb_name, amount, currency, coupon_code, created_at")
        .order("created_at", { ascending: false })
        .limit(2000);

    if (error) {
        console.error("admin/payments error:", error);
        return NextResponse.json({ error: "Failed to load payments" }, { status: 500 });
    }

    return NextResponse.json({ payments: data });
}
