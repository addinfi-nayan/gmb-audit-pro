"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "./supabase/client";

export interface ShimSession {
    user: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

type Status = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
    session: ShimSession | null;
    status: Status;
}

const AuthContext = createContext<AuthContextValue>({ session: null, status: "loading" });

function toShimSession(user: User | null | undefined): ShimSession | null {
    if (!user) return null;
    const meta = user.user_metadata || {};
    return {
        user: {
            id: user.id,
            name: meta.full_name || meta.name || null,
            email: user.email || null,
            image: meta.avatar_url || meta.picture || null,
        },
    };
}

/** Supabase-backed replacement for next-auth's SessionProvider — same session shape, same hook name. */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<ShimSession | null>(null);
    const [status, setStatus] = useState<Status>("loading");

    useEffect(() => {
        const supabase = getSupabaseClient();

        supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
            setSession(toShimSession(data.session?.user));
            setStatus(data.session?.user ? "authenticated" : "unauthenticated");
        });

        const { data: listener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, newSession: Session | null) => {
            setSession(toShimSession(newSession?.user));
            setStatus(newSession?.user ? "authenticated" : "unauthenticated");
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    return <AuthContext.Provider value={{ session, status }}>{children}</AuthContext.Provider>;
}

/** Drop-in replacement for next-auth/react's useSession() — same { data, status } shape. */
export function useSession() {
    const { session, status } = useContext(AuthContext);
    return { data: session, status };
}

/**
 * True only for signed-in users on the server's ADMIN_EMAILS allowlist —
 * checked via a server round trip, never by inspecting anything client-side,
 * so the allowlist itself is never exposed to the browser.
 */
export function useIsAdmin() {
    const { data: session } = useSession();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (!session?.user?.id) {
            setIsAdmin(false);
            return;
        }
        let cancelled = false;
        fetch("/api/admin/check")
            .then((r) => r.json())
            .then((d) => { if (!cancelled) setIsAdmin(!!d.isAdmin); })
            .catch(() => { if (!cancelled) setIsAdmin(false); });
        return () => { cancelled = true; };
    }, [session?.user?.id]);

    return isAdmin;
}

export async function signOut() {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    if (typeof window !== "undefined") window.location.href = "/";
}

export async function signInWithGoogle() {
    const supabase = getSupabaseClient();
    const redirectTo = `${window.location.origin}/auth/callback`;
    await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
    });
}
