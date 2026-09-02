import { getSupabaseServerClient } from "@/lib/supabase/server";

function getAdminEmails(): string[] {
    return (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
}

/**
 * Returns the current user if their email is on the ADMIN_EMAILS allowlist,
 * otherwise null. Use in every /api/admin/* route before touching the
 * service-role client.
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
    if (error || !user || !email || !getAdminEmails().includes(email)) {
        return null;
    }
    return user;
}
