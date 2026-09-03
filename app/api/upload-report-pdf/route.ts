import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/** Uploads a generated report PDF to public storage and returns its URL — used to link the PDF from an email instead of attaching it. */
export async function POST(req: Request) {
    try {
        const { pdfBase64, reportId } = await req.json();
        if (!pdfBase64 || typeof pdfBase64 !== "string") {
            return NextResponse.json({ error: "pdfBase64 is required" }, { status: 400 });
        }

        const path = `${reportId || crypto.randomUUID()}.pdf`;
        const buffer = Buffer.from(pdfBase64, "base64");

        const supabase = getSupabaseAdminClient();
        const { error } = await supabase.storage
            .from("report-pdfs")
            .upload(path, buffer, { contentType: "application/pdf", upsert: true });

        if (error) {
            console.error("upload-report-pdf error:", error);
            return NextResponse.json({ error: "Failed to upload PDF" }, { status: 500 });
        }

        const { data } = supabase.storage.from("report-pdfs").getPublicUrl(path);
        return NextResponse.json({ url: data.publicUrl });
    } catch (error) {
        console.error("upload-report-pdf error:", error);
        return NextResponse.json({ error: "Failed to upload PDF" }, { status: 500 });
    }
}
