import { getSupabaseClient } from "@/lib/supabase/client";

export interface SavedReport {
    id: string;
    gmbName: string;
    createdAt: string; // ISO timestamp
    reportData: any;
    myBusiness: any;
    pdfImageData?: string; // base64 PNG cached when user downloads PDF from Step 3
}

interface ReportRow {
    id: string;
    gmb_name: string;
    created_at: string;
    report_data: any;
    my_business: any;
    pdf_image_data: string | null;
}

function fromRow(row: ReportRow): SavedReport {
    return {
        id: row.id,
        gmbName: row.gmb_name,
        createdAt: row.created_at,
        reportData: row.report_data,
        myBusiness: row.my_business,
        pdfImageData: row.pdf_image_data ?? undefined,
    };
}

/** Saves a report under the signed-in user (Supabase auth user id). Returns the new report's id, or "" on failure. */
export async function saveReport(userId: string, reportData: any, myBusiness: any): Promise<string> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from("reports")
        .insert({
            user_id: userId,
            gmb_name: myBusiness?.title || myBusiness?.name || "Unknown Business",
            report_data: reportData,
            my_business: myBusiness,
        })
        .select("id")
        .single();

    if (error) {
        console.error("saveReport error:", error.message);
        return "";
    }
    return data.id as string;
}

/** Call this after PDF is generated to cache the canvas image for re-download */
export async function updateReportPdfData(userId: string, reportId: string, pdfImageData: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
        .from("reports")
        .update({ pdf_image_data: pdfImageData })
        .eq("id", reportId)
        .eq("user_id", userId);

    if (error) {
        console.warn("updateReportPdfData error:", error.message);
    }
}

/** Latest 10 reports for the signed-in user, most recent first. */
export async function getReports(userId: string): Promise<SavedReport[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from("reports")
        .select("id, gmb_name, created_at, report_data, my_business, pdf_image_data")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

    if (error) {
        console.error("getReports error:", error.message);
        return [];
    }
    return (data as ReportRow[]).map(fromRow);
}

export async function clearReports(userId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("reports").delete().eq("user_id", userId);
    if (error) {
        console.warn("clearReports error:", error.message);
    }
}
