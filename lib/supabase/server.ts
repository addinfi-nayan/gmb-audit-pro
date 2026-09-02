import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Server-side Supabase client for Route Handlers / Server Components — reads the session from cookies. */
export async function getSupabaseServerClient() {
    const cookieStore = await cookies();

    return createServerClient<any>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Called from a Server Component with no request/response to write to —
                        // safe to ignore since middleware.ts refreshes the session cookie already.
                    }
                },
            },
        }
    );
}
