import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * List every saved report (business, owning user's email, score, date, whether
 * a downloadable PDF is cached). Full report/PDF payloads are fetched
 * separately per-row via ?id= to keep this list light.
 */
export async function GET(req: Request) {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const supabase = getSupabaseAdminClient();

    // Single-report fetch (includes the cached PDF image, if any) — used by the download button.
    if (id) {
        const { data, error } = await supabase
            .from("reports")
            .select("id, user_id, gmb_name, report_data, pdf_image_data, created_at")
            .eq("id", id)
            .maybeSingle();

        if (error || !data) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", data.user_id)
            .maybeSingle();

        return NextResponse.json({
            id: data.id,
            gmbName: data.gmb_name,
            userEmail: profile?.email || null,
            auditScore: (data.report_data as any)?.audit_score ?? null,
            createdAt: data.created_at,
            pdfImageData: data.pdf_image_data,
        });
    }

    // List — no report_data/pdf_image_data payload, just metadata.
    const { data: reports, error } = await supabase
        .from("reports")
        .select("id, user_id, gmb_name, report_data, pdf_image_data, created_at")
        .order("created_at", { ascending: false })
        .limit(500);

    if (error) {
        console.error("admin/reports GET error:", error);
        return NextResponse.json({ error: "Failed to load reports" }, { status: 500 });
    }

    const userIds = [...new Set((reports || []).map((r: any) => r.user_id))];
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);

    const emailById = new Map((profiles || []).map((p: any) => [p.id, p.email]));

    const list = (reports || []).map((r: any) => ({
        id: r.id,
        gmbName: r.gmb_name,
        userEmail: emailById.get(r.user_id) || null,
        auditScore: r.report_data?.audit_score ?? null,
        createdAt: r.created_at,
        hasPdf: !!r.pdf_image_data,
    }));

    return NextResponse.json({ reports: list });
}
