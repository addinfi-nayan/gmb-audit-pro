import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const supabase = getSupabaseAdminClient();

    const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, email, is_premium, premium_granted_at, created_at")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("admin/users error:", error);
        return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
    }

    // Report counts per user, folded in client-side to keep this one round trip simple.
    const { data: reportCounts } = await supabase
        .from("reports")
        .select("user_id");

    const countByUser = new Map<string, number>();
    for (const row of reportCounts || []) {
        const id = (row as any).user_id as string;
        countByUser.set(id, (countByUser.get(id) || 0) + 1);
    }

    const users = (profiles || []).map((p: any) => ({
        id: p.id,
        email: p.email,
        isPremium: p.is_premium,
        premiumGrantedAt: p.premium_granted_at,
        createdAt: p.created_at,
        reportCount: countByUser.get(p.id) || 0,
    }));

    return NextResponse.json({ users });
}
