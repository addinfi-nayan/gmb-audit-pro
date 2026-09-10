import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Grants or revokes admin access by email — the person must already have an
 * account (unlike premium, there's no "pre-approve before signup" allowlist here;
 * admin access is rare enough that requiring a sign-in first is the simpler,
 * safer default).
 */
export async function POST(req: Request) {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { email, isAdmin } = await req.json();
    if (!email || typeof email !== "string" || typeof isAdmin !== "boolean") {
        return NextResponse.json({ error: "email and isAdmin are required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const supabase = getSupabaseAdminClient();

    const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .ilike("email", normalizedEmail)
        .maybeSingle();

    if (!existing) {
        return NextResponse.json(
            { error: "No account exists for this email yet — they need to sign in at least once first." },
            { status: 404 }
        );
    }

    if (!isAdmin && (existing as any).id === admin.id) {
        return NextResponse.json({ error: "You can't revoke your own admin access." }, { status: 400 });
    }

    const { error: updateError } = await supabase
        .from("profiles")
        .update({ is_admin: isAdmin })
        .eq("id", (existing as any).id);

    if (updateError) {
        console.error("admin toggle error:", updateError);
        return NextResponse.json({ error: "Failed to update admin status" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
