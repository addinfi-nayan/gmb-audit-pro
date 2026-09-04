import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Issues a signed upload slot for the browser to upload a PDF DIRECTLY to Supabase
 * Storage — the PDF bytes never pass through this function's request body. A
 * full-report screenshot PDF can easily exceed Vercel's ~4.5MB serverless request
 * body cap, which silently failed uploads when the bytes were sent as base64 here.
 */
export async function POST(req: Request) {
    try {
        const { reportId } = await req.json().catch(() => ({}) as any);
        const path = `${reportId || crypto.randomUUID()}.pdf`;

        const supabase = getSupabaseAdminClient();
        const { data, error } = await supabase.storage
            .from("report-pdfs")
            .createSignedUploadUrl(path, { upsert: true });

        if (error || !data) {
            console.error("upload-report-pdf signed-url error:", error);
            return NextResponse.json({ error: "Failed to create upload URL" }, { status: 500 });
        }

        return NextResponse.json({ path: data.path, token: data.token });
    } catch (error) {
        console.error("upload-report-pdf error:", error);
        return NextResponse.json({ error: "Failed to create upload URL" }, { status: 500 });
    }
}
