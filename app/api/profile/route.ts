import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/** Returns whether the signed-in user has premium (free-forever) access. */
export async function GET() {
    const supabase = await getSupabaseServerClient();
    // getUser() re-verifies the session against Supabase's auth server —
    // needed here since a valid result unlocks the service-role fallback below.
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ isPremium: false }, { status: 200 });
    }

    const { data, error } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", user.id)
        .maybeSingle();

    if (!error && data) {
        return NextResponse.json({ isPremium: !!data.is_premium });
    }

    // Fallback: the signup trigger normally creates this row, but if it's
    // somehow missing, create it now via the service role (bypasses RLS on insert).
    try {
        const admin = getSupabaseAdminClient();
        const { data: allowlisted } = await admin
            .from("premium_allowlist")
            .select("email")
            .eq("email", user.email || "")
            .maybeSingle();

        const isPremium = !!allowlisted;
        await admin.from("profiles").upsert({
            id: user.id,
            email: user.email,
            is_premium: isPremium,
            premium_granted_at: isPremium ? new Date().toISOString() : null,
        });

        return NextResponse.json({ isPremium });
    } catch (e) {
        console.error("profile fallback error:", e);
        return NextResponse.json({ isPremium: false });
    }
}
