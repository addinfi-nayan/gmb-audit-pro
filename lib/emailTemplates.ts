// Shared HTML email templates matching the app's dark blue/cyan "WhatMyRank" theme.

function escapeHtml(value: unknown): string {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

const BRAND_HEADER_STYLE = `background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%); color: #ffffff; padding: 32px 24px; text-align: center; border-radius: 16px 16px 0 0;`;

function shell(opts: { preheader: string; bodyHtml: string; footerNote?: string }): string {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
    body { font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background: #f1f5f9; }
    .wrap { max-width: 600px; margin: 0 auto; padding: 24px 16px; }
    .card { background: #0B1120; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
    .header { ${BRAND_HEADER_STYLE} }
    .logo { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
    .logo .accent { color: #a5f3fc; }
    .subtitle { font-size: 13px; opacity: 0.9; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.08em; }
    .content { padding: 28px 24px; color: #e5e7eb; }
    .content h1 { color: #ffffff; font-size: 20px; margin: 0 0 12px; }
    .content p { color: #cbd5e1; font-size: 14px; }
    .score-badge { display: inline-block; background: rgba(8,145,178,0.15); border: 1px solid rgba(34,211,238,0.4); color: #22d3ee; font-weight: 800; font-size: 28px; padding: 10px 22px; border-radius: 999px; margin: 8px 0 16px; }
    .panel { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-left: 3px solid #0891b2; border-radius: 10px; padding: 16px 18px; margin: 16px 0; }
    .panel h3 { margin: 0 0 10px; color: #67e8f9; font-size: 13px; text-transform: uppercase; letter-spacing: 0.06em; }
    .panel ul { margin: 0; padding-left: 18px; }
    .panel li { color: #d1d5db; font-size: 13px; padding: 4px 0; }
    .cta { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%); color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 999px; margin-top: 8px; }
    .footer { text-align: center; padding: 20px 24px 28px; color: #6b7280; font-size: 12px; }
    .footer a { color: #22d3ee; text-decoration: none; }
</style>
</head>
<body>
    <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(opts.preheader)}</span>
    <div class="wrap">
        <div class="card">
            <div class="header">
                <div class="logo">What<span class="accent">My</span>Rank</div>
                <div class="subtitle">GMB Performance Audit</div>
            </div>
            <div class="content">
                ${opts.bodyHtml}
            </div>
        </div>
        <div class="footer">
            ${opts.footerNote || ""}
            <p>© ${new Date().getFullYear()} WhatMyRank. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
}

/** Sent automatically right after the AI audit finishes — a themed summary, no attachment. */
export function buildReportReadySummaryEmail(opts: {
    userEmail: string;
    myBusiness: any;
    report: any;
    siteUrl?: string;
}): { subject: string; html: string } {
    const businessName = escapeHtml(opts.myBusiness?.title || opts.myBusiness?.name || "Your Business");
    const score = opts.report?.audit_score;
    const summary = escapeHtml(opts.report?.executive_summary || "");
    const weaknesses: string[] = Array.isArray(opts.report?.weaknesses) ? opts.report.weaknesses.slice(0, 5) : [];
    const wins: string[] = Array.isArray(opts.report?.competitor_strengths) ? opts.report.competitor_strengths.slice(0, 5) : [];
    const ctaUrl = opts.siteUrl || "#";

    const bodyHtml = `
        <h1>Your GMB Audit for ${businessName} is ready 🎉</h1>
        ${typeof score === "number" ? `<div class="score-badge">${score}/100</div>` : ""}
        ${summary ? `<p>${summary}</p>` : ""}

        ${weaknesses.length ? `
        <div class="panel">
            <h3>Top Priorities</h3>
            <ul>${weaknesses.map((w) => `<li>${escapeHtml(w)}</li>`).join("")}</ul>
        </div>` : ""}

        ${wins.length ? `
        <div class="panel">
            <h3>Where You Stand vs Competitors</h3>
            <ul>${wins.map((w) => `<li>${escapeHtml(w)}</li>`).join("")}</ul>
        </div>` : ""}

        <p style="margin-top:20px;">Your full report — including the 4-week action plan and downloadable PDF — is waiting in the app.</p>
        <div style="text-align:center; margin: 24px 0 8px;">
            <a class="cta" href="${ctaUrl}">Open Full Report</a>
        </div>
    `;

    return {
        subject: `📊 Your GMB Audit for ${opts.myBusiness?.title || opts.myBusiness?.name || "Your Business"} is Ready`,
        html: shell({ preheader: `Your GMB audit score: ${score ?? "—"}/100`, bodyHtml }),
    };
}

/** Sent when the user downloads the PDF — links to the hosted file instead of attaching it. */
export function buildReportPdfEmail(opts: {
    userEmail: string;
    filename: string;
    downloadUrl: string;
}): { subject: string; html: string } {
    const bodyHtml = `
        <h1>📄 Your GMB Audit Report is Ready</h1>
        <p>Your full PDF report is ready to download below.</p>
        <div style="text-align:center; margin: 22px 0 8px;">
            <a class="cta" href="${opts.downloadUrl}">Download PDF</a>
        </div>
    `;

    return {
        subject: `📊 Your GMB Audit Report - ${opts.filename}`,
        html: shell({ preheader: "Your PDF audit report is ready to download.", bodyHtml }),
    };
}
