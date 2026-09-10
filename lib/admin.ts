import { getSupabaseServerClient } from "@/lib/supabase/server";

function getAdminEmails(): string[] {
    return (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
}

/**
 * Returns the current user if they're an admin, otherwise null. Use in every
 * /api/admin/* route before touching the service-role client.
 *
 * Two independent ways in: the ADMIN_EMAILS env var (a permanent bootstrap
 * allowlist — always works, requires a deploy to change) OR profiles.is_admin
 * (grantable from the admin panel itself, no deploy needed).
 *
 * Uses getUser() rather than getSession() — getSession() trusts whatever
 * claims are in the cookie without re-checking them against Supabase's auth
 * server, which isn't strong enough for a check that unlocks the service-role
 * client. getUser() re-verifies with Supabase on every call.
 */
export async function requireAdmin() {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    const email = user?.email?.toLowerCase();
    if (error || !user || !email) return null;

    if (getAdminEmails().includes(email)) return user;

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

    return (profile as any)?.is_admin ? user : null;
}
