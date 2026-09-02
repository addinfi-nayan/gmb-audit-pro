import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
        .from("coupons")
        .select("code, active, note, discount_percent, max_uses, used_count, expires_at, created_at")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("admin/coupons GET error:", error);
        return NextResponse.json({ error: "Failed to load coupons" }, { status: 500 });
    }

    return NextResponse.json({ coupons: data });
}

export async function POST(req: Request) {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { code, note, discountPercent, maxUses, expiresAt } = await req.json();
    if (!code || typeof code !== "string") {
        return NextResponse.json({ error: "code is required" }, { status: 400 });
    }
    if (discountPercent != null && (discountPercent <= 0 || discountPercent > 100)) {
        return NextResponse.json({ error: "discountPercent must be between 1 and 100" }, { status: 400 });
    }
    if (maxUses != null && maxUses <= 0) {
        return NextResponse.json({ error: "maxUses must be a positive number" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("coupons").insert({
        code: code.trim().toLowerCase(),
        note: note || null,
        discount_percent: discountPercent ?? 100,
        max_uses: maxUses ?? null,
        expires_at: expiresAt || null,
    });

    if (error) {
        console.error("admin/coupons POST error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
