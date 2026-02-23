export interface SavedReport {
    id: string;
    gmbName: string;
    createdAt: string; // ISO timestamp
    reportData: any;
    myBusiness: any;
    pdfImageData?: string; // base64 PNG cached when user downloads PDF from Step 3
}

const STORAGE_KEY_PREFIX = "gmb_reports_";

function getKey(userEmail: string) {
    return STORAGE_KEY_PREFIX + userEmail;
}

export function saveReport(userEmail: string, reportData: any, myBusiness: any): string {
    if (typeof window === "undefined") return "";
    const existing = getReports(userEmail);
    const id = Date.now().toString();
    const newEntry: SavedReport = {
        id,
        gmbName: myBusiness?.title || myBusiness?.name || "Unknown Business",
        createdAt: new Date().toISOString(),
        reportData,
        myBusiness,
    };
    // Limit to latest 10 reports
    const updated = [newEntry, ...existing].slice(0, 10);
    try {
        localStorage.setItem(getKey(userEmail), JSON.stringify(updated));
    } catch {
        console.warn("Could not save report to localStorage.");
    }
    return id;
}

/** Call this after PDF is generated to cache the canvas image for re-download */
export function updateReportPdfData(userEmail: string, reportId: string, pdfImageData: string): void {
    if (typeof window === "undefined") return;
    try {
        const existing = getReports(userEmail);
        const updated = existing.map((r) =>
            r.id === reportId ? { ...r, pdfImageData } : r
        );
        localStorage.setItem(getKey(userEmail), JSON.stringify(updated));
    } catch {
        console.warn("Could not cache PDF image data — localStorage may be full.");
    }
}

export function getReports(userEmail: string): SavedReport[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(getKey(userEmail));
        if (!raw) return [];
        return JSON.parse(raw) as SavedReport[];
    } catch {
        return [];
    }
}

export function clearReports(userEmail: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(getKey(userEmail));
}
