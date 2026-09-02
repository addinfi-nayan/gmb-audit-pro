import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
        .from("leads")
        .select("id, business, email, phone, coupon, created_at")
        .order("created_at", { ascending: false })
        .limit(500);

    if (error) {
        console.error("admin/leads error:", error);
        return NextResponse.json({ error: "Failed to load leads" }, { status: 500 });
    }

    return NextResponse.json({ leads: data });
}
