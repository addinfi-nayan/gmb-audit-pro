import { createClient } from "@supabase/supabase-js";

// No generated Database types exist for this project, so we type the client
// as `any` — otherwise supabase-js infers `never` for insert/update payloads.
let client: ReturnType<typeof createClient<any>> | undefined;

/**
 * Service-role Supabase client — bypasses Row Level Security entirely.
 * SERVER-SIDE ONLY. Never import this from a "use client" component or
 * anywhere its result could reach the browser bundle.
 */
export function getSupabaseAdminClient() {
    if (client) return client;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    }

    client = createClient<any>(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
    return client;
}
