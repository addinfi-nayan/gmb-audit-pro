import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Partial update — pass any subset of: active, note, discountPercent, maxUses,
 * expiresAt (ISO string or null to clear it). Lets the admin panel edit every
 * coupon field, not just toggle active/inactive.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ code: string }> }) {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { code } = await params;
    const body = await req.json();
    const { active, note, discountPercent, maxUses, expiresAt } = body;

    if (discountPercent != null && (discountPercent <= 0 || discountPercent > 100)) {
        return NextResponse.json({ error: "discountPercent must be between 1 and 100" }, { status: 400 });
    }
    if (maxUses != null && maxUses <= 0) {
        return NextResponse.json({ error: "maxUses must be a positive number" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (typeof active === "boolean") updates.active = active;
    if (typeof note === "string") updates.note = note || null;
    if (discountPercent !== undefined) updates.discount_percent = discountPercent;
    if (maxUses !== undefined) updates.max_uses = maxUses;
    if (expiresAt !== undefined) updates.expires_at = expiresAt || null;

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
        .from("coupons")
        .update(updates)
        .eq("code", decodeURIComponent(code));

    if (error) {
        console.error("admin/coupons PATCH error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ code: string }> }) {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { code } = await params;
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
        .from("coupons")
        .delete()
        .eq("code", decodeURIComponent(code));

    if (error) {
        console.error("admin/coupons DELETE error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
