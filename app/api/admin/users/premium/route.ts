import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Grants or revokes permanent premium access by email.
 * - If the person has already signed in, their profile row is updated directly.
 * - If not, the email is stored in premium_allowlist so the signup trigger
 *   marks them premium the moment they first sign in.
 */
export async function POST(req: Request) {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { email, isPremium } = await req.json();
    if (!email || typeof email !== "string" || typeof isPremium !== "boolean") {
        return NextResponse.json({ error: "email and isPremium are required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const supabase = getSupabaseAdminClient();

    if (isPremium) {
        const { error: allowlistError } = await supabase
            .from("premium_allowlist")
            .upsert({ email: normalizedEmail });
        if (allowlistError) {
            console.error("premium_allowlist upsert error:", allowlistError);
            return NextResponse.json({ error: "Failed to update allowlist" }, { status: 500 });
        }
    } else {
        await supabase.from("premium_allowlist").delete().eq("email", normalizedEmail);
    }

    // If this person already has an account, flip their profile immediately too.
    const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .ilike("email", normalizedEmail)
        .maybeSingle();

    if (existing) {
        await supabase
            .from("profiles")
            .update({
                is_premium: isPremium,
                premium_granted_at: isPremium ? new Date().toISOString() : null,
            })
            .eq("id", (existing as any).id);
    }

    return NextResponse.json({
        success: true,
        appliedImmediately: !!existing,
        note: existing
            ? undefined
            : "No account exists for this email yet — it will become premium automatically the moment they sign in.",
    });
}
