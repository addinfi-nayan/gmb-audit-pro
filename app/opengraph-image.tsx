import { ImageResponse } from "next/og";

export const alt = "WhatMyRank — GMB Audit Tool for Google Business Profiles";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
    return new ImageResponse(
        (
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg, #f0f5fa 0%, #ffffff 60%, #dde8f4 100%)", fontFamily: "sans-serif" }}>
                <div style={{ display: "flex", alignItems: "baseline", fontSize: 40, fontWeight: 700, color: "#0f172a" }}>
                    What<span style={{ color: "#3666a3" }}>My</span>Rank
                    <span style={{ marginLeft: 16, fontSize: 22, fontWeight: 500, color: "#64748b" }}>by Addinfi</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#3666a3", letterSpacing: 2, textTransform: "uppercase" }}>GMB Audit Tool</div>
                    <div style={{ fontSize: 68, fontWeight: 800, color: "#0f172a", lineHeight: 1.1, marginTop: 12, maxWidth: 980 }}>
                        Find out why competitors outrank you on Google Maps
                    </div>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                    {["Audit score /100", "Competitor matrix", "4-week action plan", "₹99 per report"].map((t) => (
                        <div key={t} style={{ display: "flex", padding: "12px 22px", borderRadius: 999, background: t.startsWith("₹") ? "#3666a3" : "#ffffff", color: t.startsWith("₹") ? "#ffffff" : "#164a8c", border: "2px solid #bfd3ea", fontSize: 24, fontWeight: 600 }}>{t}</div>
                    ))}
                </div>
            </div>
        ),
        size,
    );
}
