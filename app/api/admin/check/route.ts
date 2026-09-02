import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

/** Lightweight check used only to decide whether to render the Admin Panel link — never returns the allowlist itself. */
export async function GET() {
    const admin = await requireAdmin();
    return NextResponse.json({ isAdmin: !!admin });
}
