        "use client";
import { useSession, signOut, useIsAdmin } from "@/lib/auth";
import { usePathname } from "next/navigation";
import { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import axios from "axios";
import type html2canvas from "html2canvas";
import type jsPDF from "jspdf";
import Link from "next/link";
import Head from "next/head";
import NextImage from "next/image";
import { saveReport, getReports, updateReportPdfData, type SavedReport } from "./utils/reportStore";
import { buildReportReadySummaryEmail, buildReportPdfEmail } from "@/lib/emailTemplates";
import { getSupabaseClient } from "@/lib/supabase/client";
import SignInModal from "../components/SignInModal";
import CookieConsent from "../components/CookieConsent";
import Navbar, { scrollToSection } from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";
import { Hero, IndustryStrip, StatsBand, InsideReport, MetricsAndSteps, Offer, Audience, AuditGuide, FinalCta } from "../components/LandingSections";
import { AUDIT_PRICE, FAQS, SEO_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

// Structured data for the landing page: who publishes the tool, what it is and costs, and the FAQ shown on the page.
const LANDING_JSON_LD = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Organization",
            "@id": "https://addinfi.com/#organization",
            name: "Addinfi Digitech Pvt. Ltd.",
            alternateName: "Addinfi",
            url: "https://addinfi.com",
            email: "info@addinfi.com",
        },
        {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            url: SITE_URL,
            name: SITE_NAME,
            inLanguage: "en-IN",
            publisher: { "@id": "https://addinfi.com/#organization" },
        },
        {
            "@type": "WebApplication",
            "@id": `${SITE_URL}/#app`,
            name: "WhatMyRank GMB Audit Tool",
            url: SITE_URL,
            description: SEO_DESCRIPTION,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            publisher: { "@id": "https://addinfi.com/#organization" },
            offers: { "@type": "Offer", price: String(AUDIT_PRICE), priceCurrency: "INR", availability: "https://schema.org/InStock", url: SITE_URL },
            featureList: [
                "Google Business Profile audit score out of 100",
                "Competitor comparison with up to 2 local competitors",
                "14 local ranking signals per profile",
                "Gap analysis across Reputation, Engagement, Relevance and Accessibility",
                "4-week action plan",
                "PDF report sent by email",
            ],
        },
        {
            "@type": "FAQPage",
            "@id": `${SITE_URL}/#faq`,
            mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        },
    ],
};

// html2canvas/jsPDF are only needed when a PDF is actually generated (a specific user
// action), not on initial page load — load their code on demand instead of bundling
// ~600KB into every visitor's first load.
let _html2canvas: typeof html2canvas | null = null;
let _jsPDF: typeof jsPDF | null = null;
const loadPdfLibs = async () => {
    if (!_html2canvas) _html2canvas = (await import("html2canvas")).default;
    if (!_jsPDF) _jsPDF = (await import("jspdf")).default;
    return { html2canvas: _html2canvas, jsPDF: _jsPDF };
};

// Mobile-friendly PDF detection
const isIOS = () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    return (
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        /iPad|iPhone|iPod/.test(navigator.platform) ||
        (navigator.userAgent.includes("Mac") && "ontouchend" in document)
    );
};

const isAndroid = () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    return /Android/i.test(navigator.userAgent);
};

// Single unified download function for all platforms including iOS 13+.
// Uses <a download> anchor click — saves to Files app on iOS, triggers download on desktop.
// No new tab, no navigation away from the report page.
const downloadPdf = (pdf: jsPDF, filename: string) => {
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = pdfUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 30000);
};

// Download confirmation dialog function
const showDownloadDialog = (pdf: jsPDF, filename: string, userEmail?: string) => {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(15, 23, 42, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;
    
    // Create dialog box
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 32px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
        animation: slideIn 0.3s ease-out;
    `;
    
    dialog.innerHTML = `
        <style>
            @keyframes slideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(-20px); opacity: 0; }
            }
        </style>
        
        <div style="text-align: center; color: #0f172a;">
            <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
            <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 12px; color: #0f172a;">
                Your GMB Audit Report is Ready!
            </h3>
            <p style="color: #475569; margin-bottom: 24px; line-height: 1.5;">
                Would you like to ${isIOS() ? 'view or save' : 'download'} the PDF report now?
                ${userEmail ? '<br><small style="color: #059669;">✓ Report also sent to your email</small>' : ''}
            </p>
            
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button id="download-yes" style="
                    background: #3666a3;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 14px;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    ${isIOS() ? '📄 View PDF' : '📥 Download PDF'}
                </button>
                
                <button id="download-no" style="
                    background: #ffffff;
                    color: #334155;
                    border: 1px solid #cbd5e1;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 14px;
                " onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#ffffff'">
                    Maybe Later
                </button>
            </div>
        </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Handle button clicks
    const yesBtn = dialog.querySelector('#download-yes');
    const noBtn = dialog.querySelector('#download-no');
    
    yesBtn?.addEventListener('click', () => {
        downloadPdf(pdf, filename);
        showThemeAlert('📥 PDF downloaded successfully!');
        closeDialog();
    });
    
    noBtn?.addEventListener('click', () => {
        showThemeAlert('📊 Report ready! Download anytime from the button.');
        closeDialog();
    });
    
    // Close dialog function
    const closeDialog = () => {
        dialog.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 300);
    };
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeDialog();
        }
    });
    
    // Close on Escape key
    const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            closeDialog();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
};

// "Report ready" dialog — shown immediately when report loads.
// PDF is only generated when the user confirms, ensuring the page is fully rendered.
const showReportReadyDialog = (onDownload: () => void, userEmail?: string) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(15, 23, 42, 0.45); display: flex; align-items: center;
        justify-content: center; z-index: 10000; backdrop-filter: blur(5px);
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: #ffffff;
        border: 1px solid #e2e8f0; border-radius: 16px;
        padding: 32px; max-width: 400px; width: 90%;
        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12); animation: slideIn 0.3s ease-out;
    `;

    const isMobile = isIOS() || isAndroid();

    if (isMobile) {
        // iOS & Android: just confirm report created, no download option
        dialog.innerHTML = `
            <style>
                @keyframes slideIn { from { transform:translateY(-20px);opacity:0; } to { transform:translateY(0);opacity:1; } }
                @keyframes slideOut { from { transform:translateY(0);opacity:1; } to { transform:translateY(-20px);opacity:0; } }
            </style>
            <div style="text-align: center; color: #0f172a;">
                <div style="font-size:48px;margin-bottom:16px;">✅</div>
                <h3 style="font-size:20px;font-weight:bold;margin-bottom:12px;color: #0f172a;">
                    Report Created!
                </h3>
                <p style="color: #475569;margin-bottom:24px;line-height:1.5;">
                    Your GMB Audit Report has been generated successfully.
                    ${userEmail ? '<br><small style="color: #059669;">✓ Report also sent to your email</small>' : ''}
                </p>
                <button id="rrd-ok" style="
                    background:#3666a3;
                    color:white;border:none;padding:12px 40px;border-radius:8px;
                    font-weight:600;cursor:pointer;font-size:14px;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    OK
                </button>
            </div>
        `;
    } else {
        // Desktop: prompt to download
        dialog.innerHTML = `
            <style>
                @keyframes slideIn { from { transform:translateY(-20px);opacity:0; } to { transform:translateY(0);opacity:1; } }
                @keyframes slideOut { from { transform:translateY(0);opacity:1; } to { transform:translateY(-20px);opacity:0; } }
            </style>
            <div style="text-align: center; color: #0f172a;">
                <div style="font-size:48px;margin-bottom:16px;">📊</div>
                <h3 style="font-size:20px;font-weight:bold;margin-bottom:12px;color: #0f172a;">
                    Your GMB Audit Report is Ready!
                </h3>
                <p style="color: #475569;margin-bottom:24px;line-height:1.5;">
                    Would you like to download the PDF report now?
                    ${userEmail ? '<br><small style="color: #059669;">✓ Report also sent to your email</small>' : ''}
                </p>
                <div style="display:flex;gap:12px;justify-content:center;">
                    <button id="rrd-yes" style="
                        background:#3666a3;
                        color:white;border:none;padding:12px 24px;border-radius:8px;
                        font-weight:600;cursor:pointer;font-size:14px;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        📥 Download PDF
                    </button>
                    <button id="rrd-no" style="
                        background:#ffffff;color: #334155;
                        border:1px solid #cbd5e1;padding:12px 24px;
                        border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;
                    " onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#ffffff'">
                        Maybe Later
                    </button>
                </div>
            </div>
        `;
    }

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    const closeDialog = () => {
        dialog.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => { if (document.body.contains(overlay)) document.body.removeChild(overlay); }, 300);
    };

    if (isMobile) {
        dialog.querySelector('#rrd-ok')?.addEventListener('click', closeDialog);
    } else {
        dialog.querySelector('#rrd-yes')?.addEventListener('click', () => {
            closeDialog();
            onDownload(); // PDF is generated HERE — report is fully rendered by now
        });

        dialog.querySelector('#rrd-no')?.addEventListener('click', () => {
            showThemeAlert('📊 Report ready! Download anytime from the button.');
            closeDialog();
        });

        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeDialog(); });

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { closeDialog(); document.removeEventListener('keydown', handleEscape); }
        };
        document.addEventListener('keydown', handleEscape);
    }
};

// Theme-based alert function
const showThemeAlert = (message: string) => {
    // Create theme-styled alert
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ffffff;
        color: #0f172a;
        padding: 16px 24px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        border-left: 4px solid #3666a3;
        box-shadow: 0 10px 25px rgba(15, 23, 42, 0.12);
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        font-weight: 500;
        z-index: 9999;
        backdrop-filter: blur(10px);
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
    `;
    alertDiv.innerHTML = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Show alert
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        alertDiv.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(alertDiv);
            document.head.removeChild(style);
        }, 300);
    }, 3000);
};

// Uploads a PDF blob straight to Supabase Storage from the browser via a signed
// upload URL — the bytes never pass through our own serverless functions, so a
// large full-report PDF can't hit Vercel's ~4.5MB request-body cap.
const uploadPdfAndGetUrl = async (blob: Blob, reportId?: string): Promise<string | null> => {
    try {
        const initRes = await fetch('/api/upload-report-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportId }),
        });
        const initData = await initRes.json();
        if (!initRes.ok || !initData.path || !initData.token) {
            console.error('Failed to get signed upload URL:', initData.error);
            return null;
        }

        const supabase = getSupabaseClient();
        const { error: uploadError } = await supabase.storage
            .from('report-pdfs')
            .uploadToSignedUrl(initData.path, initData.token, blob, { contentType: 'application/pdf' });
        if (uploadError) {
            console.error('Failed to upload PDF to storage:', uploadError.message);
            return null;
        }

        const { data } = supabase.storage.from('report-pdfs').getPublicUrl(initData.path);
        return data.publicUrl;
    } catch (error) {
        console.error('Error uploading PDF:', error);
        return null;
    }
};

// Function to send PDF via email — links to the hosted file (used for the manual
// re-download-and-email action, distinct from the automatic report-ready email below).
const sendPDFViaEmail = async (pdfBlob: Blob, filename: string, userEmail: string, reportId?: string) => {
    try {
        const url = await uploadPdfAndGetUrl(pdfBlob, reportId);
        if (!url) return;

        const { subject, html } = buildReportPdfEmail({ userEmail, filename, downloadUrl: url });

        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: userEmail, subject, body: html }),
        });

        if (response.ok) {
            console.log('PDF link emailed to:', userEmail);
        } else {
            console.error('Failed to send PDF email:', response.statusText);
        }
    } catch (error) {
        console.error('Error sending PDF via email:', error);
    }
};

// Sent automatically right after the report renders — generates the PDF client-side, uploads
// it, and emails ONE themed message with a direct "Download PDF" button (no separate email).
const sendReportReadyEmailWithPdf = async (
    element: HTMLElement,
    report: any,
    myBusiness: any,
    userEmail: string,
    reportId?: string
): Promise<string | null> => {
    try {
        const { html2canvas, jsPDF } = await loadPdfLibs();
        window.scrollTo(0, 0);
        await new Promise((resolve) => setTimeout(resolve, 500));

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            scrollY: 0,
            windowWidth: 1440,
            width: 1440,
            backgroundColor: "#ffffff",
            onclone: (clonedDoc) => {
                const clonedElement = clonedDoc.getElementById('report-content');
                if (clonedElement) {
                    clonedElement.style.width = '1440px';
                    clonedElement.style.padding = '40px';
                    clonedElement.style.fontFamily = 'Arial, sans-serif';

                    const allElements = clonedElement.getElementsByTagName('*');
                    for (let i = 0; i < allElements.length; i++) {
                        const el = allElements[i] as HTMLElement;
                        el.style.fontFamily = 'Arial, sans-serif';
                        el.style.backdropFilter = 'none';
                        (el.style as any).webkitBackdropFilter = 'none';
                        el.style.boxShadow = 'none';
                        el.style.animation = 'none';
                        el.style.transition = 'none';
                        el.style.wordBreak = 'break-word';
                        el.style.overflowWrap = 'break-word';
                        el.style.whiteSpace = 'normal';
                        el.style.overflow = 'visible';
                        el.classList.remove('truncate', 'line-clamp-1', 'line-clamp-2', 'line-clamp-3');
                        if (el.style.textOverflow === 'ellipsis') {
                            el.style.textOverflow = 'unset';
                        }
                        if (el.style.filter?.includes('blur') || el.classList.contains('blur-sm') || el.classList.contains('blur-[2px]') || el.classList.contains('blur-[4px]')) {
                            el.style.filter = 'none';
                        }
                        const computedStyle = window.getComputedStyle(el);
                        if (computedStyle.display === 'grid') {
                            el.style.gridAutoRows = 'auto';
                        }
                    }
                }
            },
        });

        // JPEG, not PNG — this dark, gradient-heavy report compresses ~10-20x smaller as
        // JPEG, which is what keeps a long report's PDF under Storage's/email's size caps.
        const imgData = canvas.toDataURL('image/jpeg', 0.85);
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pdf = new jsPDF('p', 'mm', [imgWidth, imgHeight]);
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        const pdfBlob = pdf.output('blob');
        const filename = `${myBusiness?.title || 'GMB'}_Audit_Report.pdf`;

        // Upload directly to Storage (bypasses our own function's request-body cap —
        // this PDF can easily be several MB for a long report) then attach it server-side.
        const pdfUrl = await uploadPdfAndGetUrl(pdfBlob, reportId);
        if (!pdfUrl) {
            console.error('Report-ready email: PDF upload failed, aborting email send.');
            return imgData;
        }

        const siteUrl = typeof window !== "undefined" ? window.location.origin : undefined;
        const { subject, html } = buildReportReadySummaryEmail({ userEmail, myBusiness, report, siteUrl, attachmentIncluded: true });

        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: userEmail,
                subject,
                body: html,
                attachFromUrl: pdfUrl,
                attachmentFilename: filename,
            }),
        });

        if (!response.ok) {
            console.error('Failed to send report-ready email:', response.statusText, await response.text().catch(() => ""));
        }

        return imgData;
    } catch (error) {
        console.error('Error generating/sending report-ready PDF email:', error);
        return null;
    }
};

// ... rest of the code remains the same ...

const FAQItem = ({ q, a }: { q: string, a: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-200 transition">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
            >
                <h3 className="text-base font-bold text-slate-800 pr-8">{q}</h3>
                <svg className={`w-5 h-5 text-blue-600 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div className={`px-4 text-slate-600 text-sm leading-relaxed transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 pb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                {a}
            </div>
        </div>
    );
};

const LandingPage = ({ onStart, onReports }: { onStart: () => void; onReports?: () => void }) => {

    // --- FAST SCROLL ENGINE ---
    useEffect(() => {
        const handleScroll = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a');
            if (anchor && anchor.hash && anchor.hash.startsWith('#')) {
                e.preventDefault();
                const element = document.querySelector(anchor.hash);
                if (element) {
                    const y = element.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }
        };
        document.addEventListener('click', handleScroll);
        return () => document.removeEventListener('click', handleScroll);
    }, []);

    // --- LIVE STATS COUNTER (Fixed Hydration Error) ---
    const [profileCount, setProfileCount] = useState(100);
    const [issueCount, setIssueCount] = useState(1145);
    const { data: session } = useSession();

    useEffect(() => {
        // 1. Initial wait, then add small "Daily Batch"
        const initialBatchTimer = setTimeout(() => {
            const randomIncrease = Math.floor(Math.random() * 3) + 2; // +2 to +4
            // Cap at small increment per session (max +8 total)
            setProfileCount(prev => Math.min(prev + randomIncrease, 100 + 8));
            setIssueCount(prev => prev + (randomIncrease * 4));
        }, 3500);

        // 2. Slow "Live" drip
        const liveDripInterval = setInterval(() => {
            // Cap at +8 max increment total
            setProfileCount(prev => {
                if (prev >= 100 + 8) return prev;
                return prev + 1;
            });
            setIssueCount(prev => prev + Math.floor(Math.random() * 3));
        }, 15000);

        return () => {
            clearTimeout(initialBatchTimer);
            clearInterval(liveDripInterval);
        };
    }, []);

    // Arriving from another page via /#section — scroll once the landing content exists.
    useEffect(() => {
        if (window.location.hash) scrollToSection(window.location.hash.slice(1));
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-800 overflow-x-clip relative flex flex-col">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LANDING_JSON_LD) }} />
            <Navbar onStart={onStart} onReports={onReports} />

            <main className="relative z-10 flex-1">
                <Hero onStart={onStart} signedIn={!!session} />
                <IndustryStrip />
                <StatsBand profileCount={profileCount} issueCount={issueCount} />
                <InsideReport />
                <MetricsAndSteps metrics={METRIC_DEFINITIONS.filter((m) => m.label !== "Listing Age")} />
                <Offer onStart={onStart} signedIn={!!session} />
                <Audience />
                <AuditGuide onStart={onStart} signedIn={!!session} />

                <section id="faq" className="py-16 md:py-28 border-t border-slate-200 bg-white">
                    <div className="max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16">
                        <div className="lg:sticky lg:top-28 lg:self-start">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold tracking-wide uppercase mb-5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> FAQ
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">GMB audit <span className="text-blue-600">FAQs</span></h2>
                            <p className="mt-5 text-slate-600 text-base md:text-lg">Everything you need to know before running your first Google Business Profile audit.</p>
                            <a href="mailto:info@addinfi.com" className="mt-8 flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl hover:border-blue-200 transition group max-w-sm">
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <div className="text-left">
                                    <div className="text-xs font-semibold text-slate-500">Still have questions?</div>
                                    <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition">info@addinfi.com</div>
                                </div>
                            </a>
                        </div>
                        <div className="space-y-3">
                            {FAQS.map((item) => (
                                <FAQItem key={item.q} q={item.q} a={item.a} />
                            ))}
                        </div>
                    </div>
                </section>

                <div className="pt-16 md:pt-24 bg-white">
                    <FinalCta onStart={onStart} signedIn={!!session} />
                </div>
            </main>

            <SiteFooter />
        </div>
    );
};


// ==========================================
//  PART 2: THE DASHBOARD (Logged In)
// ==========================================

// --- STATIC DEFINITIONS (GLOSSARY) ---
const METRIC_DEFINITIONS = [
    { label: "Review Velocity", desc: "The frequency at which you acquire new reviews compared to competitors." },
    { label: "Review Response", desc: "The average time it takes for the business to reply to a new customer review." },
    { label: "Review Growth", desc: "The net increase in total review count over the last 30 days." },
    { label: "Rating Trend", desc: "The directional movement (Rising, Stable, Dropping) of your average star rating." },
    { label: "Sentiment", desc: "The overall positive or negative tone detected in customer review text (0-100%)." },
    { label: "Keyword Sentiment", desc: "The specific sentiment score attached to high-value keywords like 'Service' or 'Price'." },
    { label: "NPS Score (AI)", desc: "Net Promoter Score (0-100) estimated by AI, indicating customer loyalty." },
    { label: "Post Frequency", desc: "How often the business posts Updates, Offers, or Events to their profile." },
    { label: "Products/Services", desc: "Checks if the business uses the visual Product/Service catalog features to display offerings." },
    { label: "Engagement Rate", desc: "Estimated level of customer interaction (clicks, views) with your posts." },
    { label: "Total Photos", desc: "The total volume of images uploaded by the owner and customers combined." },
    { label: "Listing Age", desc: "The estimated number of years the business profile has been active on Google." },
    { label: "Profile Strength", desc: "An overall health score (0-100) based on profile completeness and optimization." },
    { label: "Suspension Risk", desc: "The likelihood of Google suspending the profile due to policy violations." },
    { label: "Audit Gap", desc: "The percentage difference in overall performance metrics between you and the market leader." }
];

// --- LOADING MESSAGES ---
const LOADING_MESSAGES = [
    "Grinding the data beans...",
    "Preheating the audit ovens...",
    "Mixing local keywords & seasoning...",
    "Letting competitor insights simmer...",
    "Brewing your growth strategy...",
    "Adding the final garnish...",
    "Calibrating mobile display settings...",
    "Optimizing for iOS Safari and Chrome...",
    "Applying responsive design fixes...",
    "Testing scroll behavior on mobile devices...",
    "Fine-tuning touch interactions...",
    "Validating viewport compatibility...",
    "Cross-checking mobile rendering...",
    "Polishing the final details...",
    "Serving up your report hot & fresh!"
];

// --- ICONS ---
const SearchIcon = () => (<svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>);
const MapPinIcon = () => (<svg className="w-5 h-5 text-slate-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>);
const StarIcon = () => (<svg className="w-3 h-3 text-amber-600 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>);
const ErrorIcon = () => (<svg className="w-12 h-12 text-red-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>);
const LockIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>);
const ChartIcon = () => (<svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"></path></svg>);
const TrophyIcon = () => (<svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>);
const BookIcon = () => (<svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>);
const WarningIcon = () => (<svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>);

// --- HOOK: DEBOUNCE ---
function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

/** jsPDF needs the format name to match the actual encoding of a data URL. */
const pdfImageFormat = (dataUrl: string): "JPEG" | "PNG" => (dataUrl.startsWith("data:image/jpeg") ? "JPEG" : "PNG");

const parseNumber = (value: string | number | undefined) => {
    if (typeof value === "number") return value;
    if (!value) return 0;
    const match = String(value).match(/[\d.]+/);
    return match ? Number(match[0]) : 0;
};

const velocityScore = (value: string | undefined) => {
    if (!value) return 0;
    const normalized = value.toLowerCase();
    if (normalized.includes("daily")) return 100;
    if (normalized.includes("weekly")) return 70;
    if (normalized.includes("monthly")) return 40;
    return 20;
};

const frequencyScore = (value: string | undefined) => {
    if (!value) return 0;
    const normalized = value.toLowerCase();
    if (normalized.includes("daily")) return 100;
    if (normalized.includes("weekly")) return 70;
    if (normalized.includes("monthly")) return 40;
    if (normalized.includes("rare")) return 20;
    return 30;
};

const responseScore = (value: string | undefined) => {
    const hours = parseNumber(value);
    if (!hours) return 0;
    return Math.max(10, 120 - hours);
};

const daysSince = (dateString: string | undefined) => {
    if (!dateString) return 0;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 0;
    const diffTime = Math.abs(new Date().getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const COMPARISON_METRICS = [
    {
        key: "rating",
        label: "Reputation Score",
        getValue: (entry: any) => parseNumber(entry?.rating),
        display: (entry: any) => (entry?.rating ? `${entry.rating}★` : "N/A"),
        max: 5,
    },
    {
        key: "reviews",
        label: "Review Volume",
        getValue: (entry: any) => parseNumber(entry?.reviews),
        display: (entry: any) => entry?.reviews || "N/A",
    },
    {
        key: "review_velocity",
        label: "Review Velocity",
        getValue: (entry: any) => velocityScore(entry?.review_velocity),
        display: (entry: any) => entry?.review_velocity || "N/A",
    },
    {
        key: "review_response",
        label: "Response Speed",
        getValue: (entry: any) => responseScore(entry?.review_response),
        display: (entry: any) => entry?.review_response || "N/A",
    },
    {
        key: "post_frequency",
        label: "Content Engine",
        getValue: (entry: any) => frequencyScore(entry?.post_frequency),
        display: (entry: any) => entry?.post_frequency || "N/A",
    },
    {
        key: "products_services",
        label: "Products",
        getValue: (entry: any) => (entry?.products_services?.includes("Missing") ? 0 : 1),
        display: (entry: any) => entry?.products_services || "N/A",
        max: 1,
    },
];

// --- HELPER: Build Comparison Entities for Charts ---
const buildComparisonEntities = (report: any, userBusinessName?: string) => {
    const comparisonCompetitors = report?.matrix?.competitors?.slice(0, 2) ?? [];
    return [
        {
            key: "me",
            label: userBusinessName || report?.matrix?.me?.title || report?.matrix?.me?.name || report?.matrix?.me?.business_name || "Your Business",
            data: report?.matrix?.me,
            textClass: "text-blue-600",
            barClass: "bg-cyan-500",
        },
        ...comparisonCompetitors.map((competitor: any, index: number) => ({
            key: `competitor-${index}`,
            label: competitor?.title || competitor?.name || competitor?.business_name || `Competitor ${index + 1}`,
            data: competitor,
            textClass: index === 0 ? "text-violet-600" : "text-indigo-600",
            barClass: index === 0 ? "bg-purple-500" : "bg-indigo-500",
        })),
    ];
};

// --- MAIN PAGE COMPONENT ---
export default function Page() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    // Always start on "landing" so the server-rendered HTML (what search engines index) contains
    // the full landing page; a returning visitor's saved view is restored before first paint.
    const [view, setView] = useState<"landing" | "dashboard" | "reports">("landing");
    const [viewRestored, setViewRestored] = useState(false);
    useLayoutEffect(() => {
        const saved = sessionStorage.getItem('gmb_view');
        if (saved === 'dashboard' || saved === 'reports') setView(saved);
        setViewRestored(true);
    }, []);
    const [showSignInModal, setShowSignInModal] = useState(false);

    // Other pages send visitors to "/?signin=1" from their Sign In button.
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("signin") === "1") {
            setShowSignInModal(true);
            window.history.replaceState(null, "", window.location.pathname + window.location.hash);
        }
    }, []);

    // Persist view to sessionStorage whenever it changes
    useEffect(() => {
        if (viewRestored) {
            if (view === 'dashboard' || view === 'reports') {
                sessionStorage.setItem('gmb_view', view);
            } else {
                sessionStorage.removeItem('gmb_view');
            }
        }
    }, [view, viewRestored]);

    const [pendingDownload, setPendingDownload] = useState<SavedReport | null>(null);
    const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null); // gmbName after success

    // 1. Fix "Invalid Hook Call": Ensure no hooks are outside this function
    if (status === "loading" && view !== "landing") return <div className="min-h-screen bg-slate-50" />;

    const handleStartAction = () => {
        if (!session) {
            setShowSignInModal(true);
        } else {
            setView("dashboard");
        }
    };

    // Helper: navigate to landing and clear all session persistence
    const goToLanding = () => {
        sessionStorage.removeItem('gmb_view');
        sessionStorage.removeItem('gmb_step');
        sessionStorage.removeItem('gmb_report');
        sessionStorage.removeItem('gmb_myBusiness');
        sessionStorage.removeItem('gmb_loading');
        setView('landing');
    };

    return (
        <>
            <Head>
                <link rel="stylesheet" href="/ios-fixes.css" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            </Head>
            {/* --- PDF GENERATION LOADER OVERLAY --- */}
            {pendingDownload && (
                <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
                    <div className="bg-white/95 border border-blue-300 backdrop-blur-xl rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4 min-w-[280px]">
                        {/* Spinning ring */}
                        <div className="relative w-10 h-10 shrink-0">
                            <div className="absolute inset-0 rounded-full border-2 border-blue-200" />
                            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <div className="text-slate-900 font-bold text-sm tracking-wide">Generating PDF</div>
                            <div className="text-blue-600 text-[11px] font-mono mt-0.5 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                This may take a moment...
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- PDF SUCCESS TOAST --- */}
            {downloadSuccess && !pendingDownload && (
                <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
                    <div className="bg-white/95 border border-emerald-300 backdrop-blur-xl rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4 min-w-[280px]">
                        {/* Checkmark */}
                        <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-slate-900 font-bold text-sm tracking-wide">PDF Downloaded!</div>
                            <div className="text-emerald-600 text-[11px] font-mono mt-0.5 truncate max-w-[180px]">{downloadSuccess}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MAIN CONTENT --- */}
            {view === "reports" && session ? (
                <>
                    <ReportsPage
                        session={session}
                        onHome={goToLanding}
                        onGetAudit={handleStartAction}
                        onTriggerDownload={(saved) => setPendingDownload(saved)}
                        externalDownloadingId={pendingDownload?.id ?? null}
                    />
                    {/* Silent background DashboardLogic for exact-match PDF — no redirect */}
                    {pendingDownload && (
                        <div style={{ position: "fixed", top: 0, left: "-19999px", width: "1440px", pointerEvents: "none", zIndex: -1 }}>
                            <DashboardLogic
                                onHome={() => { }}
                                onReports={() => { }}
                                preloadedData={{
                                    report: pendingDownload.reportData,
                                    myBusiness: pendingDownload.myBusiness,
                                    reportId: pendingDownload.id,
                                    gmbName: pendingDownload.gmbName,
                                }}
                                onDownloadComplete={() => {
                                    const name = pendingDownload?.gmbName ?? "Report";
                                    setPendingDownload(null);
                                    setDownloadSuccess(name);
                                    setTimeout(() => setDownloadSuccess(null), 4000);
                                }}
                            />
                        </div>
                    )}
                </>
            ) : view === "dashboard" && session ? (
                <DashboardLogic
                    onHome={goToLanding}
                    onReports={() => setView("reports")}
                />
            ) : (
                <LandingPage onStart={handleStartAction} onReports={session ? () => setView("reports") : undefined} />
            )}

            {/* Sign In Modal */}
            <SignInModal
                isOpen={showSignInModal}
                onClose={() => setShowSignInModal(false)}
                onSuccess={() => setView("dashboard")}
            />

            {/* Cookie Consent Banner */}
            <CookieConsent />
        </>
    );
}

// ==========================================
//  REPORTS PAGE
// ==========================================

function ReportsPage({ session, onHome, onGetAudit, onTriggerDownload, externalDownloadingId }: {
    session: any;
    onHome: () => void;
    onGetAudit: () => void;
    onTriggerDownload: (saved: SavedReport) => void;
    externalDownloadingId?: string | null;
}) {
    const [reports, setReports] = useState<SavedReport[]>([]);
    const [downloading, setDownloading] = useState<string | null>(null);
    const reportRef = useRef<HTMLDivElement>(null);
    const [activeReport, setActiveReport] = useState<SavedReport | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const filteredReports = reports.filter((r) => r.gmbName?.toLowerCase().includes(searchQuery.trim().toLowerCase()));

    useEffect(() => {
        if (session?.user?.id) {
            getReports(session.user.id).then(setReports);
        }
    }, [session]);

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) +
            " at " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    };

    const handleDownload = async (saved: SavedReport) => {
        const userEmail = session?.user?.email || undefined;

        showReportReadyDialog(async () => {
            setDownloading(saved.id);
            try {
                // --- FAST PATH: Use the exact cached PDF image from when user first downloaded ---
                if (saved.pdfImageData) {
                    const { jsPDF } = await loadPdfLibs();
                    const imgData = saved.pdfImageData;
                    const img = new Image();
                    img.src = imgData;
                    await new Promise((res) => { img.onload = res; });
                    const imgWidth = 210;
                    const imgHeight = (img.naturalHeight * imgWidth) / img.naturalWidth;
                    const pdf = new jsPDF("p", "mm", [imgWidth, imgHeight]);
                    pdf.addImage(imgData, pdfImageFormat(imgData), 0, 0, imgWidth, imgHeight);

                    const filename = `${saved.gmbName}_Audit_Report.pdf`;
                    const pdfBlob = pdf.output('blob');

                    // Email delivery
                    if (userEmail) sendPDFViaEmail(pdfBlob, filename, userEmail, saved.id);
                    downloadPdf(pdf, filename);

                    showThemeAlert('📥 PDF downloaded successfully!');
                    setDownloading(null);
                    return;
                }

                // --- FALLBACK: Render DashboardLogic invisibly in background for exact-match PDF ---
                onTriggerDownload(saved);
                setDownloading(null); // spinner kept alive via externalDownloadingId (pendingDownload)
            } catch (e) {
                console.error("PDF error", e);
                setDownloading(null);
                setActiveReport(null);
            }
        }, userEmail);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Grid Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            <Navbar
                onHome={onHome}
                onStart={onGetAudit}
                onReports={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                ctaLabel="Get Audit"
            />

            {/* Content */}
            <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 pt-32 pb-20">
                {/* Header */}
                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-[10px] md:text-xs font-mono mb-6 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-sm"></span>
                        AUDIT HISTORY
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-slate-900">My <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-600 to-cyan-600">Reports</span></h1>
                    <p className="text-slate-600 mt-3 text-sm md:text-base">All your past GMB audit reports, ready to download.</p>
                </div>

                {/* Search */}
                {reports.length > 0 && (
                    <div className="relative mb-6">
                        <svg className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" /></svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search reports by business name..."
                            className="w-full bg-white border border-slate-200 focus:border-blue-300 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition"
                                aria-label="Clear search"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                )}

                {/* No Reports Empty State */}
                {reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-6 shadow-sm">
                            <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">No Reports Created Yet</h2>
                        <p className="text-slate-500 text-sm max-w-sm mb-8 leading-relaxed">
                            Once you generate a GMB audit report, it will appear here. Your reports are saved automatically.
                        </p>
                        <button
                            onClick={onGetAudit}
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold text-sm tracking-widest uppercase transition shadow-sm hover:shadow-sm transform hover:scale-105"
                        >
                            Get Your First Audit →
                        </button>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-slate-600 text-sm">No reports match "<span className="text-slate-900 font-semibold">{searchQuery}</span>"</p>
                        <button onClick={() => setSearchQuery("")} className="mt-4 text-blue-600 text-xs font-bold hover:underline">Clear search</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredReports.map((saved, i) => (
                            <div
                                key={saved.id}
                                className="group bg-white border border-slate-200 hover:border-blue-200 rounded-2xl p-5 md:p-6 transition-all duration-300 flex flex-col md:flex-row md:items-center gap-4 md:gap-6"
                            >
                                {/* Report Number */}
                                <div className="hidden md:flex w-10 h-10 shrink-0 rounded-xl bg-blue-50 border border-blue-200 items-center justify-center">
                                    <span className="text-blue-600 font-bold text-sm font-mono">#{i + 1}</span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                            <span className="w-1 h-1 rounded-full bg-green-400"></span>
                                            COMPLETED
                                        </span>
                                    </div>
                                    <h3 className="text-slate-900 font-bold text-lg truncate group-hover:text-blue-800 transition">{saved.gmbName}</h3>
                                    <p className="text-slate-500 text-xs font-mono mt-0.5">
                                        <svg className="w-3 h-3 inline mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        {formatDate(saved.createdAt)}
                                    </p>
                                </div>

                                {/* Download */}
                                <button
                                    onClick={() => handleDownload(saved)}
                                    disabled={downloading === saved.id || externalDownloadingId === saved.id}
                                    className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-green-900 disabled:text-green-600 text-white rounded-xl font-bold text-xs transition group-hover:shadow-sm"
                                >
                                    {(downloading === saved.id || externalDownloadingId === saved.id) ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            Download PDF
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Hidden off-screen render area for PDF generation (fallback) */}
            <div style={{ position: "fixed", top: 0, left: "-9999px", width: "794px", height: 0, overflow: "hidden", pointerEvents: "none" }}>
                {activeReport && (() => {
                    const report = activeReport.reportData;
                    const pdfEntities = buildComparisonEntities(report, activeReport.myBusiness?.title || activeReport.gmbName);
                    return (
                        <div
                            ref={reportRef}
                            id="report-content-redownload"
                            style={{
                                width: "794px",
                                background: "#ffffff",
                                color: "#0f172a",
                                fontFamily: "Arial, sans-serif",
                                padding: "40px",
                                boxSizing: "border-box",
                            }}
                        >
                            {/* === HEADER === */}
                            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid #e2e8f0" }}>
                                {/* Score badge */}
                                <div style={{ flexShrink: 0, width: "90px", height: "90px", borderRadius: "20px", background: "#3666a3", border: "1px solid #164a8c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                    <div style={{ fontSize: "36px", fontWeight: "900", color: "#ffffff", lineHeight: 1 }}>{report?.audit_score ?? "—"}</div>
                                    <div style={{ fontSize: "10px", color: "#dde8f4", fontWeight: "bold", letterSpacing: "2px", marginTop: "3px" }}>/ 100</div>
                                </div>
                                {/* Title block */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: "9px", color: "#3666a3", fontWeight: "bold", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "6px" }}>WhatMyRank — Google Business Profile Audit</div>
                                    <div style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a", wordBreak: "break-word" }}>{activeReport.gmbName}</div>
                                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Generated: {formatDate(activeReport.createdAt)}</div>
                                </div>
                            </div>

                            {/* === COMPETITOR TABLE === */}
                            {report?.matrix && (() => {
                                const me = report.matrix.me;
                                const comps = report.matrix.competitors || [];
                                const rows = [
                                    { label: activeReport.gmbName, data: me, isMe: true },
                                    ...comps.slice(0, 2).map((c: any) => ({ label: c.title || c.name || c.business_name || "Competitor", data: c, isMe: false }))
                                ];
                                const thS: React.CSSProperties = { padding: "10px 14px", color: "#475569", fontWeight: "bold", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "2px solid #e2e8f0", background: "#f8fafc", textAlign: "center" as const };
                                return (
                                    <div style={{ marginBottom: "36px" }}>
                                        <div style={{ fontSize: "10px", color: "#3666a3", fontWeight: "bold", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "14px" }}>Competitor Comparison</div>
                                        <table style={{ width: "714px", borderCollapse: "collapse", tableLayout: "fixed" }}>
                                            <colgroup>
                                                <col style={{ width: "264px" }} />
                                                <col style={{ width: "90px" }} />
                                                <col style={{ width: "90px" }} />
                                                <col style={{ width: "90px" }} />
                                                <col style={{ width: "90px" }} />
                                                <col style={{ width: "90px" }} />
                                            </colgroup>
                                            <thead>
                                                <tr>
                                                    <th style={{ ...thS, textAlign: "left" }}>Business</th>
                                                    <th style={thS}>Score</th>
                                                    <th style={thS}>Rating</th>
                                                    <th style={thS}>Reviews</th>
                                                    <th style={thS}>Gap</th>
                                                    <th style={thS}>Photos</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rows.map((r, i) => (
                                                    <tr key={i} style={{ background: r.isMe ? "#f0f5fa" : (i % 2 === 0 ? "#f8fafc" : "#ffffff"), borderBottom: "1px solid #e2e8f0" }}>
                                                        <td style={{ padding: "12px 14px", fontSize: "12px", color: r.isMe ? "#164a8c" : "#1e293b", fontWeight: r.isMe ? "bold" : "normal", wordBreak: "break-word" }}>
                                                            {r.isMe && <span style={{ background: "#3666a3", color: "#ffffff", fontSize: "8px", fontWeight: "bold", padding: "2px 6px", borderRadius: "4px", marginRight: "7px" }}>YOU</span>}
                                                            {r.label}
                                                        </td>
                                                        <td style={{ padding: "12px 14px", fontSize: "12px", color: "#7c3aed", fontWeight: "bold", textAlign: "center" }}>{r.data?.audit_score ?? "—"}</td>
                                                        <td style={{ padding: "12px 14px", fontSize: "12px", color: "#d97706", fontWeight: "bold", textAlign: "center" }}>{r.data?.rating ?? "—"} ⭐</td>
                                                        <td style={{ padding: "12px 14px", fontSize: "12px", color: "#1e293b", textAlign: "center" }}>{r.data?.reviews ?? r.data?.total_reviews ?? "—"}</td>
                                                        <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: "bold", textAlign: "center", color: String(r.data?.audit_gap ?? "").includes("-") ? "#dc2626" : "#059669" }}>{r.data?.audit_gap ?? "—"}</td>
                                                        <td style={{ padding: "12px 14px", fontSize: "12px", color: "#1e293b", textAlign: "center" }}>{r.data?.photos ?? "—"}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })()}

                            {/* === MATRIX DETAILS === */}
                            {report?.matrix && (() => {
                                const allEntities = pdfEntities;
                                if (!allEntities?.length) return null;
                                const metrics = COMPARISON_METRICS;
                                return (
                                    <div style={{ marginBottom: "36px" }}>
                                        <div style={{ fontSize: "10px", color: "#3666a3", fontWeight: "bold", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "14px" }}>Profile Metrics Breakdown</div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                            {metrics.slice(0, 8).map((metric: any) => (
                                                <div key={metric.key} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px 16px" }}>
                                                    <div style={{ fontSize: "11px", color: "#475569", fontWeight: "bold", marginBottom: "10px" }}>{metric.label}</div>
                                                    <div style={{ display: "flex", gap: "12px" }}>
                                                        {allEntities.map((entity: any) => (
                                                            <div key={entity.key} style={{ flex: 1 }}>
                                                                <div style={{ fontSize: "10px", color: entity.key === "me" ? "#164a8c" : "#6d28d9", marginBottom: "4px", fontWeight: "bold" }}>{entity.label}</div>
                                                                <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                                                                    <div style={{ height: "100%", width: `${Math.min(100, (metric.getValue(entity.data) / (metric.max || 5)) * 100)}%`, background: entity.key === "me" ? "#3666a3" : "#8b5cf6", borderRadius: "3px" }} />
                                                                </div>
                                                                <div style={{ fontSize: "10px", color: "#334155", marginTop: "3px" }}>{metric.display(entity.data)}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* === ACTION PLAN === */}
                            {report?.action_plan?.length > 0 && (
                                <div style={{ marginBottom: "36px" }}>
                                    <div style={{ fontSize: "10px", color: "#3666a3", fontWeight: "bold", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "14px" }}>Action Plan</div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                        {report.action_plan.map((item: any, i: number) => (
                                            <div key={i} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 16px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#dde8f4", border: "1px solid #bfd3ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#3666a3", fontWeight: "bold", flexShrink: 0 }}>{i + 1}</div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: "13px", color: "#0f172a", fontWeight: "bold", marginBottom: item.description ? "5px" : 0 }}>{item.title || item.action || String(item)}</div>
                                                    {item.description && <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.6" }}>{item.description}</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* === FOOTER === */}
                            <div style={{ paddingTop: "20px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ fontSize: "10px", color: "#64748b" }}>Powered by Addinfi · WhatMyRank GMB Audit Pro</div>
                                <div style={{ fontSize: "10px", color: "#64748b" }}>Confidential · {new Date().getFullYear()}</div>
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}


interface DashboardProps {
    onHome: () => void;
    onReports: () => void;
    preloadedData?: {
        report: any;
        myBusiness: any;
        reportId: string;
        gmbName: string;
    };
    onDownloadComplete?: () => void;
}

// --- RAZORPAY LOADER ---
const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

// --- DASHBOARD COMPONENT ---

// --- HELPER: Normalize Data from Different APIs (Serper vs Google Places) ---
// --- HELPER: Normalize Data from Different APIs (Serper vs Google Places) ---
const normalizePlaceData = (place: any) => {
    // 1. Title Extraction
    // In Places API (New), `displayName.text` is the best title.
    // `name` is the Resource Name (e.g., "places/ChIJ..."), NOT the display name.
    // `place.title` is from old APIs or Serper.
    const title = place.displayName?.text || (place.name && !place.name.startsWith('places/') ? place.name : place.title) || place.name;

    // 2. Address Extraction
    const address = place.formattedAddress || place.formatted_address || place.vicinity || place.address;

    // 3. Metrics Extraction
    const rating = place.rating || 0;
    const reviews = place.userRatingCount ?? place.user_ratings_total ?? place.reviews ?? place.ratingCount ?? 0;

    // 4. ID Extraction (CRITICAL FIX)
    // Google Places API (New) returns `id` (string) and `name` (resource name, e.g., "places/ChIJ...").
    // We prefer `id`, then `place_id` (old API), then `cid`.
    // If all missing, we fall back to `name` if it starts with "places/".
    let place_id = place.id || place.place_id || place.cid;

    if (!place_id && place.name && place.name.startsWith('places/')) {
        place_id = place.name.split('/')[1]; // Extract ID from "places/..."
    }

    // FALLBACK: If still no ID, generate one from title + address (LAST RESORT)
    if (!place_id && title) {
        place_id = `gen_${title.replace(/\s+/g, '_')}_${(address || '').substring(0, 5)}`;
        console.warn("Generating fallback ID for:", title, place_id);
    }

    // Return normalized object if we have at least a title
    if (title) {
        return {
            ...place,
            title,
            address,
            rating,
            reviews,
            place_id,
            cid: place_id
        };
    }
    return place;
};

function DashboardLogic({ onHome, onReports, preloadedData, onDownloadComplete }: DashboardProps) {
    const { data: session } = useSession();
    const reportRef = useRef<HTMLDivElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- RESTORE FROM SESSION STORAGE (handles page refresh) ---
    const getRestoredStep = () => {
        if (preloadedData) return 3;
        if (typeof window !== 'undefined') {
            // If the page was refreshed while loading was running, the API call is lost.
            // Clear the stale step so we go back to the input form (step 1).
            if (sessionStorage.getItem('gmb_loading') === 'true') {
                sessionStorage.removeItem('gmb_step');
                sessionStorage.removeItem('gmb_loading');
                return 1;
            }
            const s = sessionStorage.getItem('gmb_step');
            if (s === '2' || s === '3') return parseInt(s);
        }
        return 1;
    };
    const getRestoredReport = () => {
        if (preloadedData) return preloadedData.report;
        if (typeof window !== 'undefined') {
            try {
                const r = sessionStorage.getItem('gmb_report');
                return r ? JSON.parse(r) : null;
            } catch { return null; }
        }
        return null;
    };
    const getRestoredMyBusiness = () => {
        if (preloadedData) return preloadedData.myBusiness;
        if (typeof window !== 'undefined') {
            try {
                const b = sessionStorage.getItem('gmb_myBusiness');
                return b ? JSON.parse(b) : null;
            } catch { return null; }
        }
        return null;
    };
    const getRestoredLoading = () => {
        // Never restore loading=true (API call is lost on refresh), always start fresh
        return false;
    };

    // STATE
    const [step, setStep] = useState(getRestoredStep);
    const [myQuery, setMyQuery] = useState("");
    const [compQuery, setCompQuery] = useState("");
    const debouncedMyQuery = useDebounce(myQuery, 400);
    const debouncedCompQuery = useDebounce(compQuery, 400);

    const [mySuggestions, setMySuggestions] = useState<any[]>([]);
    const [compSuggestions, setCompSuggestions] = useState<any[]>([]);

    const [myBusiness, setMyBusiness] = useState<any>(getRestoredMyBusiness);
    const [competitors, setCompetitors] = useState<any[]>([]);

    const [loading, setLoading] = useState(getRestoredLoading);
    const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

    const [downloading, setDownloading] = useState(false);
    const [report, setReport] = useState<any>(getRestoredReport);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [savedReportId, setSavedReportId] = useState<string | null>(preloadedData?.reportId ?? null);

    // Flag so auto-download useEffect knows not to cache this (already saved)
    const isPreloaded = useRef<boolean>(!!preloadedData);
    // Prevents the report-ready dialog from re-showing on back-navigation or re-renders
    const reportDialogShown = useRef(false);
    const autoPdfEmailSent = useRef(false);

    // --- PERSIST STATE TO SESSION STORAGE ---
    useEffect(() => {
        if (typeof window !== 'undefined' && !preloadedData) {
            sessionStorage.setItem('gmb_step', String(step));
        }
    }, [step]);

    useEffect(() => {
        if (typeof window !== 'undefined' && !preloadedData) {
            if (report) {
                try { sessionStorage.setItem('gmb_report', JSON.stringify(report)); } catch { }
            } else {
                sessionStorage.removeItem('gmb_report');
            }
        }
    }, [report]);

    useEffect(() => {
        if (typeof window !== 'undefined' && !preloadedData) {
            if (myBusiness) {
                try { sessionStorage.setItem('gmb_myBusiness', JSON.stringify(myBusiness)); } catch { }
            } else {
                sessionStorage.removeItem('gmb_myBusiness');
            }
        }
    }, [myBusiness]);

    useEffect(() => {
        if (typeof window !== 'undefined' && !preloadedData) {
            sessionStorage.setItem('gmb_loading', loading ? 'true' : 'false');
        }
    }, [loading]);

    // PAYMENT / COUPON STATE
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    // isUnlocked: true if preloaded (from My Reports), OR if restoring a completed report (step=3 + report exists)
    const [isUnlocked, setIsUnlocked] = useState(() => {
        if (!!preloadedData) return true;
        if (typeof window !== 'undefined') {
            return sessionStorage.getItem('gmb_step') === '3' && !!sessionStorage.getItem('gmb_report');
        }
        return false;
    });
    const [couponError, setCouponError] = useState("");
    const [reportReady, setReportReady] = useState(false);
    const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

    // --- NEW: LEAD CAPTURE STATE ---
    const [showLeadModal, setShowLeadModal] = useState(false);
    const [leadData, setLeadData] = useState({ email: "", phone: "" });
    const [leadCouponCode, setLeadCouponCode] = useState("");
    const [leadCouponError, setLeadCouponError] = useState("");
    const [leadCouponApplied, setLeadCouponApplied] = useState(false);
    const [leadCouponDiscount, setLeadCouponDiscount] = useState<number | null>(null);

    // --- PREMIUM (admin-granted, permanent, free) STATE ---
    const [isPremiumUser, setIsPremiumUser] = useState(false);
    useEffect(() => {
        if (!session?.user?.id) { setIsPremiumUser(false); return; }
        fetch('/api/profile')
            .then((r) => r.json())
            .then((d) => setIsPremiumUser(!!d.isPremium))
            .catch(() => setIsPremiumUser(false));
    }, [session?.user?.id]);

    const comparisonEntities = useMemo(() =>
        buildComparisonEntities(report, myBusiness?.title),
        [report, myBusiness]);

    const comparisonMetrics = useMemo(() =>
        COMPARISON_METRICS,
        []);

    // --- LOADER EFFECT: cycles messages purely for visual feedback — never gates the reveal ---
    useEffect(() => {
        if (!loading) { setLoadingMsgIndex(0); return; }
        const interval = setInterval(() => {
            // Keeps incrementing for as long as it takes; text/progress below wrap it safely.
            setLoadingMsgIndex((prev) => prev + 1);
        }, 6000);
        return () => clearInterval(interval);
    }, [loading]);

    // --- TRANSITION EFFECT: reveal the report the instant it's actually ready ---
    useEffect(() => {
        if (reportReady) {
            finalize();
            setReportReady(false);
        }
    }, [reportReady]);

    // --- GATEKEEPER LOGIC ---
    const handleRestrictedAction = () => {
        // Premium users skip the lead/payment modal entirely — straight to the report.
        if (isPremiumUser) {
            if (report) {
                setIsUnlocked(true);
            } else {
                setIsUnlocked(true);
                performAnalysis();
            }
            return;
        }
        // Always show the lead confirmation modal to trigger payment
        setShowLeadModal(true);
    };

    // --- UPDATED RESET HANDLER ---
    const handleReset = () => {
        // 0. Clear session storage persistence
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('gmb_step');
            sessionStorage.removeItem('gmb_report');
            sessionStorage.removeItem('gmb_myBusiness');
            sessionStorage.removeItem('gmb_loading');
        }
        // 1. Reset UI Step
        setStep(1);
        setReport(null);
        // 2. Clear Search & Report Data
        setMyBusiness(null);
        setCompetitors([]);
        setReport(null);
        setErrorMsg(null);
        setMyQuery("");
        setCompQuery("");
        setMySuggestions([]);
        setCompSuggestions([]);
        setReportReady(false);

        // 3. Clear User & Gate Data (This wipes the email/phone)
        setLeadData({ email: "", phone: "" });
        setIsUnlocked(false);

        // 4. Reset coupon state
        setLeadCouponCode("");
        setLeadCouponError("");
        setLeadCouponApplied(false);

        // 5. Close any open modals just in case
        setShowLeadModal(false);
        setShowPaymentModal(false);
    };

    const executiveSummaryPoints = report?.executive_summary
        ? (() => {
            const byLine = report.executive_summary
                .split(/\n+/)
                .map((line: string) => line.trim())
                .filter(Boolean);

            if (byLine.length > 1) {
                return byLine;
            }

            return report.executive_summary
                .split(/(?<=[.!?])\s+(?=[A-Z])/)
                .map((line: string) => line.trim())
                .filter(Boolean);
        })()
        : [];



    // The audit call is slow and occasionally hits Vercel's function-duration cap (504) —
    // a transient failure, not a real error. Keep the loading screen up and retry silently
    // several times before ever surfacing a hard failure — never for a 4xx (bad input).
    const MAX_ANALYZE_ATTEMPTS = 4;
    const analyzeWithRetry = async (payload: any, attempt = 1): Promise<any> => {
        try {
            return await axios.post("/api/analyze-gmb", payload);
        } catch (e: any) {
            const status = e?.response?.status;
            const isRetryable = !status || status >= 500;
            if (isRetryable && attempt < MAX_ANALYZE_ATTEMPTS) {
                console.warn(`Analysis attempt ${attempt} failed, retrying (${attempt + 1}/${MAX_ANALYZE_ATTEMPTS})...`, e.message);
                return analyzeWithRetry(payload, attempt + 1);
            }
            throw e;
        }
    };

    const performAnalysis = async () => {
        setLoading(true);
        setErrorMsg(null);
        setReport(null);

        // 1. Smart Keyword Logic
        const finalKeyword = compQuery.trim() ? compQuery : (myBusiness?.title || "Digital Marketing Agency");
        console.log("Starting Analysis with Keyword:", finalKeyword);

        try {
            // 2. Direct Connection to the local AI analysis route
            const res = await analyzeWithRetry({
                keyword: finalKeyword,
                myBusiness: myBusiness,
                competitors: competitors,
            });

            // --- NEW: THE CLEANING LOGIC ---
            let rawData = res.data;
            let finalReport = null;

            // Scenario A: It came back as an Array (defensive — Claude occasionally wraps content)
            if (Array.isArray(rawData) && rawData[0]?.text) {
                rawData = rawData[0].text;
            }

            // Scenario B: It is a String (possibly with ```json markdown)
            if (typeof rawData === "string") {
                // Remove Markdown code blocks (```json and ```)
                const cleanString = rawData.replace(/```json/g, "").replace(/```/g, "").trim();
                try {
                    finalReport = JSON.parse(cleanString);
                } catch (e) {
                    console.error("JSON Parse Error:", e);
                    throw new Error("AI returned messy text instead of JSON.");
                }
            } else {
                // Scenario C: It is already a perfect Object
                finalReport = rawData;
            }

            // 3. Final Validation
            if (finalReport && (finalReport.audit_score || finalReport.matrix)) {
                setReport(finalReport);
                // Save to localStorage for My Reports
                if (session?.user?.id) {
                    const newId = await saveReport(session.user.id, finalReport, myBusiness);
                    setSavedReportId(newId);
                }
                setIsUnlocked(true); // Payment is done, so unlock immediately

                setReportReady(true);
            } else {
                console.error("Invalid AI Structure:", finalReport);
                throw new Error("The AI report is missing key data (audit_score).");
            }

        } catch (e: any) {
            console.error("Analysis Error:", e);
            setErrorMsg(e.message || "Connection Failed.");
            setLoading(false);
        }
    };

    // --- COUPON APPLY HANDLER (in Lead Modal) ---
    const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
    const handleLeadCouponApply = async () => {
        setIsCheckingCoupon(true);
        try {
            const { data } = await axios.post("/api/validate-coupon", { code: leadCouponCode.trim() });
            if (data.valid) {
                setLeadCouponApplied(true);
                setLeadCouponDiscount(data.discountPercent ?? 100);
                setLeadCouponError("");
            } else {
                setLeadCouponError("Invalid, expired, or fully-used coupon code.");
                setLeadCouponApplied(false);
                setLeadCouponDiscount(null);
            }
        } catch {
            setLeadCouponError("Couldn't verify coupon. Please try again.");
            setLeadCouponApplied(false);
            setLeadCouponDiscount(null);
        } finally {
            setIsCheckingCoupon(false);
        }
    };

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            email: leadData.email,
            phone: leadData.phone,
            business: myBusiness?.title || "Unknown Business",
            coupon: leadCouponApplied ? leadCouponCode.trim() : "",
            date: new Date().toLocaleString()
        };

        const activeCouponCode = leadCouponApplied ? leadCouponCode.trim() : "";

        try {
            // 1. Save Lead (Background)
            axios.post("/api/save-lead", payload).catch(err => console.error("Lead Error:", err));

            // 2. COUPON PATH — 100% off skips payment entirely
            if (leadCouponApplied && leadCouponDiscount === 100) {
                const { data: redeemData } = await axios.post("/api/redeem-coupon", { code: activeCouponCode });
                if (!redeemData.redeemed) {
                    setLeadCouponApplied(false);
                    setLeadCouponDiscount(null);
                    setLeadCouponError("This coupon just ran out — please try another code or continue with payment.");
                    setIsSubmitting(false);
                    return;
                }
                setShowLeadModal(false);
                setIsUnlocked(true);
                setLeadCouponCode("");
                setLeadCouponApplied(false);
                setLeadCouponDiscount(null);
                setIsSubmitting(false);
                performAnalysis();
                return;
            }

            // 3. PAYMENT PATH — full price, or a partial-discount coupon. Load Razorpay SDK
            const isLoaded = await loadRazorpay();
            if (!isLoaded) {
                alert("Razorpay SDK failed to load. Please check your internet connection.");
                setIsSubmitting(false);
                return;
            }

            // 4. Create Order (discount, if any, is computed and validated server-side)
            const { data: orderData } = await axios.post("/api/razorpay/create-order", {
                couponCode: activeCouponCode || undefined,
            });

            if (!orderData || !orderData.id) {
                alert("Failed to create payment order. Please try again.");
                setIsSubmitting(false);
                return;
            }

            // 5. Open Razorpay
            const options = {
                key: orderData.key_id,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "WhatMyRank",
                description: `Unlock Full Audit for ${myBusiness?.title}`,
                order_id: orderData.id,
                handler: async function (response: any) {
                    try {
                        const result = await axios.post("/api/razorpay/verify-payment", {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            couponCode: orderData.appliedCoupon || undefined,
                            userId: session?.user?.id || undefined,
                            userEmail: leadData?.email || session?.user?.email || undefined,
                            gmbName: myBusiness?.title || undefined,
                        });

                        if (result.data.success) {
                            setShowLeadModal(false);
                            setIsPaymentSuccess(true);
                            setLeadCouponCode("");
                            setLeadCouponApplied(false);
                            setLeadCouponDiscount(null);
                            // Show success modal for 2 seconds, then start analysis
                            setTimeout(() => {
                                setIsPaymentSuccess(false);
                                performAnalysis();
                            }, 2000);
                        } else {
                            alert("Payment Verification Failed. Please contact support.");
                        }
                    } catch (err) {
                        console.error("Verification Error:", err);
                        alert("Payment Verification Failed.");
                    }
                },
                prefill: {
                    name: "User",
                    email: leadData.email,
                },
                theme: {
                    color: "#0891b2",
                },
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();
            setIsSubmitting(false);

        } catch (err) {
            console.error("Payment Error:", err);
            alert("Something went wrong initializing payment.");
            setIsSubmitting(false);
        }
    };
    // --- SEARCH EFFECTS ---
    // --- SEARCH EFFECTS (UPDATED FOR SERPER.DEV) ---
    // --- SEARCH EFFECTS (UPDATED FOR SERPER.DEV) ---
    useEffect(() => {
        if (debouncedMyQuery.length < 3) return setMySuggestions([]);
        if (myBusiness) return;
        const fetchMyBiz = async () => {
            try {
                const res = await axios.post("/api/search-places", { keyword: debouncedMyQuery });
                let rawData: any[] = [];

                // 1. Normalize the response structure
                if (res.data.places) rawData = res.data.places;
                else if (res.data.local_results) rawData = res.data.local_results;
                else if (Array.isArray(res.data)) rawData = res.data;
                // Google Places Standard (Old) often uses 'results'
                else if (res.data.results) rawData = res.data.results;

                // 2. Normalize individual items
                // Assuming normalizePlaceData is defined elsewhere and takes an item, returns a formatted item
                const formatted = rawData.map((item) => {
                    console.log("normalizePlaceData input:", item);
                    const output = normalizePlaceData(item);
                    console.log("normalizePlaceData output:", output);
                    return output;
                });
                setMySuggestions(formatted);
            } catch (e) { console.error(e); }
        };
        fetchMyBiz();
    }, [debouncedMyQuery]);

    useEffect(() => {
        if (debouncedCompQuery.length < 3) return setCompSuggestions([]);
        const fetchComp = async () => {
            try {
                const res = await axios.post("/api/search-places", { keyword: debouncedCompQuery });
                let rawData: any[] = [];

                // 1. Normalize the response structure
                if (res.data.places) rawData = res.data.places;
                else if (res.data.local_results) rawData = res.data.local_results;
                else if (Array.isArray(res.data)) rawData = res.data;
                else if (res.data.results) rawData = res.data.results;

                // 2. Normalize individual items
                // Assuming normalizePlaceData is defined elsewhere and takes an item, returns a formatted item
                const formatted = rawData.map((item) => {
                    console.log("normalizePlaceData input:", item);
                    const output = normalizePlaceData(item);
                    console.log("normalizePlaceData output:", output);
                    return output;
                });
                setCompSuggestions(formatted);
            } catch (e) { console.error(e); }
        };
        fetchComp();
    }, [debouncedCompQuery]);

    // Analyse



    const finalize = () => { setTimeout(() => { setStep(3); setLoading(false); }, 500); };

    // --- COUPON HANDLER ---
    const handleUnlock = () => {
        if (couponCode.toLowerCase() === "first20") {
            setIsUnlocked(true);
            setShowPaymentModal(false);
            setTimeout(() => { generatePDF(); }, 500);
        } else {
            setCouponError("Invalid coupon code or limit reached.");
        }
    };

    const initiateDownload = () => {
        if (isUnlocked) {
            if (isIOS()) {
                // iOS does not support PDF download — inform the user
                showThemeAlert('⚠️ Download Report (Supported in Android & Desktop Only)');
            } else if (isAndroid()) {
                // Android: skip dialog, start downloading directly
                generatePDF();
            } else {
                // Desktop: show download confirmation dialog
                const userEmail = leadData?.email || session?.user?.email || undefined;
                showReportReadyDialog(() => generatePDF(), userEmail);
            }
        } else {
            handleRestrictedAction(); // <--- WAS: setShowPaymentModal(true)
        }
    };

    // --- PDF GENERATION ---
    // --- AUTO DOWNLOAD ON REPORT READY ---
    useEffect(() => {
        if (step === 3 && report && !errorMsg) {
            // Guard: only show the dialog once per report load.
            // Without this, pressing Back after iOS blob-URL navigation re-triggers the effect.
            if (reportDialogShown.current) return;
            reportDialogShown.current = true;

            // Background (My Reports) instance — auto-download without showing the dialog.
            // generatePDF() handles iOS via the fallback tap-to-open overlay.
            if (isPreloaded.current) {
                generatePDF(); // auto-download via anchor, no dialog
                return;
            }

            const userEmail = leadData?.email || session?.user?.email || undefined;

            // Auto-generate the PDF and email it (with the summary, in one message) right
            // away — independent of whether the user interacts with the dialog below.
            if (userEmail && reportRef.current && !autoPdfEmailSent.current) {
                autoPdfEmailSent.current = true;
                sendReportReadyEmailWithPdf(reportRef.current, report, myBusiness, userEmail, savedReportId || undefined)
                    .then((imgData) => {
                        if (imgData && session?.user?.id && savedReportId) {
                            updateReportPdfData(session.user.id, savedReportId, imgData).catch(() => {});
                        }
                    });
            }

            showReportReadyDialog(() => generatePDF(), userEmail);
        }
    }, [step, report, errorMsg]);

    // --- PDF LOADER POPUP (uncloseable until done) ---
    const showPDFLoader = () => {
        const overlay = document.createElement('div');
        overlay.id = 'pdf-loader-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(15,23,42,0.35); display: flex; align-items: center;
            justify-content: center; z-index: 99999; backdrop-filter: blur(4px);
        `;
        overlay.innerHTML = `
            <style>
                @keyframes pdf-spin { to { transform: rotate(360deg); } }
                @keyframes pdf-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
            </style>
            <div style="
                background: #ffffff;
                border: 1px solid #e2e8f0; border-radius: 16px;
                padding: 28px 36px; text-align: center; min-width: 220px;
                box-shadow: 0 20px 40px rgba(15,23,42,0.35);
            ">
                <div style="
                    width: 44px; height: 44px; border: 3px solid #dde8f4;
                    border-top-color: #3666a3; border-radius: 50%;
                    animation: pdf-spin 0.8s linear infinite; margin: 0 auto 16px;
                "></div>
                <div style="color:#0f172a;font-weight:600;font-size:15px;margin-bottom:6px;">
                    Generating PDF...
                </div>
                <div style="color:#64748b;font-size:12px;animation:pdf-pulse 1.5s ease-in-out infinite;">
                    Please wait, do not close this page
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    };

    const hidePDFLoader = () => {
        const overlay = document.getElementById('pdf-loader-overlay');
        if (overlay) document.body.removeChild(overlay);
    };

    // --- UPDATED PDF GENERATION (Desktop Layout Fix) ---
    const generatePDF = async () => {
        if (!reportRef.current) return;
        setDownloading(true);
        showPDFLoader();

        // 1. Force scroll to top to capture everything
        window.scrollTo(0, 0);
        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
            const { html2canvas, jsPDF } = await loadPdfLibs();
            const element = reportRef.current;

            // 2. Capture with forced Desktop Width (1440px)
            const canvas = await html2canvas(element, {
                scale: 2, // High resolution
                useCORS: true,
                allowTaint: true,
                scrollY: 0,
                windowWidth: 1440, // <--- FORCES DESKTOP LAYOUT
                width: 1440,       // <--- ENSURES CONTAINER IS WIDE
                backgroundColor: "#ffffff", // Match your background color
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.getElementById('report-content');
                    if (clonedElement) {
                        clonedElement.style.width = '1440px';
                        clonedElement.style.padding = '40px';
                        clonedElement.style.fontFamily = 'Arial, sans-serif';

                        const allElements = clonedElement.getElementsByTagName('*');
                        for (let i = 0; i < allElements.length; i++) {
                            const el = allElements[i] as HTMLElement;
                            el.style.fontFamily = 'Arial, sans-serif';
                            el.style.backdropFilter = 'none';
                            (el.style as any).webkitBackdropFilter = 'none';
                            el.style.boxShadow = 'none';
                            el.style.animation = 'none';
                            el.style.transition = 'none';

                            // Fix text overflow — force word wrapping on all elements
                            el.style.wordBreak = 'break-word';
                            el.style.overflowWrap = 'break-word';
                            el.style.whiteSpace = 'normal';
                            el.style.overflow = 'visible';

                            // Remove truncation classes that clip text in PDF
                            el.classList.remove('truncate', 'line-clamp-1', 'line-clamp-2', 'line-clamp-3');
                            if (el.style.textOverflow === 'ellipsis') {
                                el.style.textOverflow = 'unset';
                            }

                            // Remove blur effects that render as black boxes
                            if (el.style.filter?.includes('blur') || el.classList.contains('blur-sm') || el.classList.contains('blur-[2px]') || el.classList.contains('blur-[4px]')) {
                                el.style.filter = 'none';
                            }

                            // Fix grid containers — ensure they expand properly
                            const computedStyle = window.getComputedStyle(el);
                            if (computedStyle.display === 'grid') {
                                el.style.gridAutoRows = 'auto';
                            }
                        }
                    }
                }
            });

            // 3. Calculate PDF dimensions (Dynamic Height to fit content)
            // JPEG, not PNG — this dark, gradient-heavy report compresses ~10-20x smaller
            // as JPEG, which is what keeps a long report's PDF under Storage's/email's caps.
            const imgData = canvas.toDataURL('image/jpeg', 0.85);
            const imgWidth = 210; // A4 Width in mm
            const pageHeight = 295; // A4 Height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // 4. Generate PDF (Standard A4 Format)
            // If content is very long, this creates a long scrolling PDF (User friendly)
            const pdf = new jsPDF('p', 'mm', [imgWidth, imgHeight]);

            pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
            const filename = `${myBusiness?.title || 'GMB'}_Audit_Report.pdf`;
            const userEmail = leadData?.email || session?.user?.email || undefined;
            const pdfBlob = pdf.output('blob');
            if (userEmail) {
                sendPDFViaEmail(pdfBlob, filename, userEmail, savedReportId || undefined);
            }

            downloadPdf(pdf, filename);

            hidePDFLoader();
            showThemeAlert('📥 PDF downloaded successfully!');

            // 5. Cache the image so My Reports can re-download the exact same PDF instantly
            if (session?.user?.id && savedReportId) {
                try {
                    await updateReportPdfData(session.user.id, savedReportId, imgData);
                } catch {
                    // non-critical — silently ignore
                }
            }

            // 6. If this was a pre-loaded download (triggered from My Reports), navigate back
            if (isPreloaded.current && onDownloadComplete) {
                onDownloadComplete();
            }

        } catch (err) {
            hidePDFLoader();
            console.error("PDF Error", err);
            alert("Failed to generate PDF.");
        }
        setDownloading(false);
    };

    const toggleCompetitor = (place: any) => {
        console.log('toggleCompetitor called with:', place);
        const uniqueId = place.place_id || place.cid;
        console.log('uniqueId:', uniqueId);
        if (!uniqueId) return;

        const isSelected = competitors.find(c => (c.place_id || c.cid) === uniqueId);
        console.log('isSelected:', isSelected);

        if (isSelected) {
            setCompetitors(competitors.filter(c => (c.place_id || c.cid) !== uniqueId));
        } else {
            if (competitors.length >= 2) return alert("Max 2 competitors allowed.");

            setCompetitors([...competitors, place]);

            // --- NEW: Clear search box and suggestions ---
            setCompQuery("");
            setCompSuggestions([]);
        }
    };

    // --- HELPER COMPONENT FOR PAYWALL BLUR ---
    const PaywallBlur = ({ children, isLocked }: { children: React.ReactNode, isLocked: boolean }) => {
        if (!isLocked) return <>{children}</>;
        return (

            <div className="relative group cursor-pointer" onClick={handleRestrictedAction}>
                <div className="blur-sm select-none opacity-50 pointer-events-none grayscale">{children}</div>
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="bg-slate-900/40 p-3 rounded-full border border-blue-300 text-cyan-400 group-hover:text-white group-hover:scale-110 transition-all shadow-sm">
                        <LockIcon />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`bg-slate-50 font-sans text-slate-900 flex flex-col justify-between ${step === 1 ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
            <div className="mx-auto w-full max-w-[95rem] bg-slate-50 shadow-none flex-grow relative flex flex-col">

                <Navbar
                    onHome={onHome}
                    onReports={onReports}
                    showCta={false}
                    actions={<>
                        {step === 3 && !errorMsg && (
                            <button
                                onClick={initiateDownload}
                                disabled={downloading}
                                data-html2canvas-ignore="true"
                                className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-emerald-700 transition flex items-center gap-2"
                            >
                                {downloading ? "Generating..." : "Download PDF"}
                            </button>
                        )}
                        {step > 1 && (
                            <button onClick={handleReset} className="text-sm text-slate-600 hover:text-red-600 font-medium transition">
                                Reset
                            </button>
                        )}
                    </>}
                    mobileActions={(step === 3 && !errorMsg) || step > 1 ? <>
                        {step === 3 && !errorMsg && (
                            <button
                                onClick={initiateDownload}
                                disabled={downloading}
                                className="w-full bg-emerald-600 text-white px-4 py-3 rounded-lg font-semibold text-sm hover:bg-emerald-700 transition"
                            >
                                {downloading ? "Generating..." : "Download PDF"}
                            </button>
                        )}
                        {step > 1 && (
                            <button onClick={handleReset} className="w-full py-3 rounded-lg border border-slate-200 text-sm text-slate-700 hover:text-red-600 font-medium transition">
                                Reset Audit
                            </button>
                        )}
                    </> : undefined}
                />

                {/* STEP 1: FIND ME */}
                {step === 1 && (
                    <div className="flex-grow flex flex-col items-center justify-center pt-24 pb-12 px-4 animate-[fadeIn_0.5s_ease-out]">
                        <h2 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Find Your Business</h2>
                        <p className="text-slate-600 text-lg mb-10">Search for your GMB profile to start the audit.</p>
                        <div className="relative w-full max-w-2xl">
                            <div className="relative flex items-center">
                                <div className="absolute left-4 text-slate-600"><SearchIcon /></div>
                                <input className="w-full bg-white border border-slate-200 pl-12 pr-12 py-5 rounded-xl text-xl text-slate-900 placeholder-slate-400 shadow-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition" placeholder="Type business name..." value={myQuery} onChange={e => { setMyQuery(e.target.value); setMyBusiness(null); }} />
                                {myQuery && (
                                    <button
                                        onClick={() => { setMyQuery(""); setMySuggestions([]); setMyBusiness(null); }}
                                        className="absolute right-4 text-slate-600 hover:text-slate-900 transition-colors p-1 hover:bg-slate-100 rounded-full"
                                        aria-label="Clear search"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}
                            </div>
                            {mySuggestions.length > 0 && !myBusiness && (
                                <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-xl shadow-2xl mt-2 z-50 max-h-80 overflow-y-auto text-left">
                                    {mySuggestions.map((place, i) => (
                                        <div key={place.place_id || place.cid || i} className="p-4 hover:bg-blue-50 cursor-pointer border-b border-slate-200 last:border-0 flex justify-between items-start group transition-colors" onClick={() => { setMyBusiness(place); setStep(2); setMyQuery(place.title); setMySuggestions([]); }}>
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1 bg-slate-50 p-2 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600 text-slate-600 transition"><MapPinIcon /></div>
                                                <div>
                                                    <div className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">{place.title}</div>
                                                    <div className="text-sm text-slate-500">{place.address}</div>({place.reviews || place.user_ratings_total || place.ratingCount || 0} reviews)
                                                    <div className="flex items-center gap-2 mt-1"><span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-xs font-bold border border-amber-200"><StarIcon /> {place.rating || "N/A"}</span><span className="text-xs text-slate-500 font-medium">(</span></div>
                                                </div>
                                            </div>
                                            <span className="text-xs bg-blue-50 border border-blue-200 px-2 py-1 rounded group-hover:bg-blue-100 text-blue-600 font-bold mt-2">SELECT</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 2: COMPETITORS */}
                {step === 2 && !errorMsg && (
                    <div className="flex-grow pt-24 md:pt-32 px-4 md:px-10 pb-10 space-y-8 max-w-4xl mx-auto animate-[fadeIn_0.5s_ease-out]">
                        {/* TARGET CARD */}
                        <div className="bg-white border border-blue-200 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-4 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[50px] -z-10"></div>
                            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white p-4 rounded-xl shadow-lg shadow-slate-200 font-bold text-2xl w-14 h-14 flex items-center justify-center">{myBusiness?.title.charAt(0)}</div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Auditing Target</div>
                                <div className="font-bold text-2xl text-slate-900 tracking-tight">{myBusiness?.title}</div>
                                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                                    <span className="flex items-center gap-1 text-sm font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md"><StarIcon /> {myBusiness?.rating || "N/A"}</span>
                                    <span className="text-sm text-slate-500 font-medium tracking-tight">({myBusiness?.reviews || myBusiness?.user_ratings_total || myBusiness?.ratingCount || 0} reviews)</span>
                                </div>
                            </div>
                            <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition">Change</button>
                        </div>


                        <div className="flex flex-col md:flex-row justify-between items-center mt-12 mb-6 gap-4">
                            <h2 className="text-2xl font-bold text-slate-900 text-center md:text-left">Step 2: Add Competitors <span className="text-sm font-normal text-slate-500 ml-2 block md:inline">(Max 2)</span></h2>
                        </div>

                        <div className="relative z-50">
                            <div className="relative flex items-center">
                                <input
                                    className="w-full bg-white border border-slate-200 p-4 pr-12 rounded-xl text-lg text-slate-900 placeholder-slate-400 focus:border-cyan-500 outline-none transition"

                                    // --- NEW: Dynamic Placeholder ---
                                    placeholder={competitors.length === 1 ? "You can add one more GMB profile..." : "Search for a competitor..."}

                                    value={compQuery}
                                    onChange={e => setCompQuery(e.target.value)}
                                />
                                {compQuery && (
                                    <button
                                        onClick={() => { setCompQuery(""); setCompSuggestions([]); }}
                                        className="absolute right-4 text-slate-600 hover:text-slate-900 transition-colors p-1 hover:bg-slate-100 rounded-full"
                                        aria-label="Clear search"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}
                            </div>
                            {compSuggestions.length > 0 && (
                                <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-xl shadow-2xl mt-2 max-h-60 overflow-y-auto z-50">
                                    {compSuggestions.map((place, i) => {
                                        // FIX: Define the ID once, handling both formats
                                        const uniqueId = place.place_id || place.cid;
                                        const isAdded = competitors.find(c => (c.place_id || c.cid) === uniqueId);

                                        return (
                                            <div
                                                key={uniqueId || i}
                                                onClick={() => toggleCompetitor(place)}
                                                className={`p-4 cursor-pointer border-b border-slate-200 flex justify-between items-center transition-colors ${isAdded ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                                            >
                                                <div className="font-medium text-slate-800 truncate pr-4">{place.title}</div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 whitespace-nowrap">
                                                    <span className="flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                                        <StarIcon /> {place.rating || "N/A"}
                                                    </span>
                                                </div>
                                                <span className={`ml-auto font-bold text-xs px-3 py-1 rounded whitespace-nowrap border ${isAdded ? 'bg-slate-100 border-slate-300 text-slate-600' : 'bg-emerald-50 border-emerald-300 text-emerald-600 hover:bg-emerald-100'}`}>
                                                    {isAdded ? "ADDED ✓" : "+ ADD"}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                            {competitors.map((place) => (
                                <div key={place.place_id || place.cid} className="p-4 border border-emerald-300 bg-emerald-50 rounded-xl flex justify-between items-center shadow-sm backdrop-blur-sm">
                                    <div className="font-bold text-emerald-600 truncate pr-2">{place.title}</div>
                                    <button onClick={() => toggleCompetitor(place)} className="text-red-600 hover:bg-red-100 p-2 rounded text-sm font-bold flex-shrink-0 transition">✕</button>
                                </div>
                            ))}
                        </div>


                        {competitors.length > 0 && (
                            <div className="flex justify-center pt-4">
                                <button onClick={() => setShowLeadModal(true)} disabled={loading} className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:scale-105 transition disabled:opacity-50 disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-3 text-sm">
                                    {loading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-slate-300 border-t-white rounded-full animate-spin"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <span>Get Audit At ₹99</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                    </div>
                )}

                {/* --- ERROR DISPLAY --- */}
                {errorMsg && (
                    <div className="flex-grow flex flex-col items-center justify-center min-h-[500px] p-8 text-center">
                        <ErrorIcon />
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Report Cannot Be Analyzed</h2>
                        <div className="bg-red-50 border border-red-200 p-6 rounded-xl max-w-2xl w-full">
                            <p className="text-red-600 font-medium mb-2">Reason for failure:</p>
                            <p className="text-slate-700 font-mono text-sm break-words">{errorMsg}</p>
                        </div>
                        <div className="mt-8 flex gap-4">
                            <button onClick={() => setErrorMsg(null)} className="px-6 py-3 bg-slate-100 text-slate-900 rounded-lg font-bold hover:bg-slate-200 transition">Try Again</button>
                            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">Restart</button>
                        </div>
                    </div>
                )}

                {/* STEP 3: REPORT */}
                {step === 3 && report && !errorMsg && (
                    // WRAPPER REF FOR PDF CAPTURE (UPDATED STYLES FOR PDF MODE)
                    <div ref={reportRef} id="report-content" className="bg-slate-50 pt-16 md:pt-32 px-4 md:px-12 pb-40 min-h-screen text-slate-900" style={{
                        width: '100%',
                        maxWidth: '100vw',
                        overflowX: 'hidden',
                        '@supports (-webkit-touch-callout: none)': {
                            WebkitOverflowScrolling: 'touch',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            height: 'auto',
                            minHeight: '100vh',
                            width: '100vw'
                        }
                    } as React.CSSProperties}>

                        <div className="bg-white border border-slate-200 py-12 px-8 md:px-16 rounded-xl shadow-2xl mb-12 relative overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-50 to-transparent"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-16">

                                {/* LEFT — GMB Logo */}
                                <div className="flex flex-col items-center gap-4 md:min-w-[220px] shrink-0">
                                    <div className="w-40 h-40 relative flex items-center justify-center">
                                        <img
                                            src="/gmb.png"
                                            alt="GMB Logo"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-black text-slate-900 tracking-tight">WhatMyRank</div>
                                        <div className="text-xs font-bold text-blue-600 tracking-[0.15em] uppercase">Google Business Profile Audit</div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="hidden md:block w-px h-48 bg-gradient-to-b from-transparent via-slate-200 to-transparent"></div>

                                {/* RIGHT — Score + Rating Bar */}
                                <div className="flex-1 flex flex-col items-center text-center">
                                    <div className="text-sm font-bold tracking-[0.3em] text-blue-600 uppercase mb-4">Overall Performance</div>
                                    <div className="flex items-baseline gap-2">
                                        <div className="text-8xl md:text-9xl font-black tracking-tighter text-slate-900">{report.audit_score}<span className="text-4xl md:text-5xl text-slate-500">/100</span></div>
                                        <span className="text-xs font-medium text-slate-600 opacity-90 -mt-2">- Powered by Addinfi</span>
                                    </div>

                                    {/* Rating Scale Bar */}
                                    <div className="mt-8 w-full max-w-xl px-4">
                                        <div className="relative">
                                            {/* Score Position Indicator */}
                                            <div className="absolute -top-5 transition-all duration-500" style={{ left: `${Math.min(Math.max(report.audit_score || 0, 0), 100)}%`, transform: 'translateX(-50%)' }}>
                                                <div className="flex flex-col items-center">
                                                    <svg className="w-3 h-3 text-slate-900 drop-shadow-lg" fill="currentColor" viewBox="0 0 12 12"><path d="M6 9L1 3h10L6 9z" /></svg>
                                                </div>
                                            </div>
                                            {/* Gradient Bar */}
                                            <div className="flex h-2.5 rounded-full overflow-hidden border border-slate-200">
                                                <div className="w-1/4 bg-gradient-to-r from-red-600 to-red-400"></div>
                                                <div className="w-1/4 bg-gradient-to-r from-orange-500 to-amber-400"></div>
                                                <div className="w-1/4 bg-gradient-to-r from-yellow-400 to-lime-400"></div>
                                                <div className="w-1/4 bg-gradient-to-r from-emerald-400 to-green-500"></div>
                                            </div>
                                            {/* Labels */}
                                            <div className="flex mt-2.5">
                                                <div className="w-1/4 text-center">
                                                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Poor</span>
                                                    <span className="block text-[8px] text-slate-900 font-mono mt-0.5">0 – 25</span>
                                                </div>
                                                <div className="w-1/4 text-center">
                                                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Average</span>
                                                    <span className="block text-[8px] text-slate-900 font-mono mt-0.5">26 – 50</span>
                                                </div>
                                                <div className="w-1/4 text-center">
                                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Good</span>
                                                    <span className="block text-[8px] text-slate-900 font-mono mt-0.5">51 – 75</span>
                                                </div>
                                                <div className="w-1/4 text-center">
                                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Excellent</span>
                                                    <span className="block text-[8px] text-slate-900 font-mono mt-0.5">76 – 100</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="max-w-[95rem] mx-auto space-y-20">

                            {/* ========================================================== */}
                            {/* KEY METRICS & COMPETITIVE COMPARISON                      */}
                            {/* ========================================================== */}
                            <div className="space-y-6 font-sans text-slate-700">

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">

                                    {/* LEFT COLUMN: THE REACTOR & INTELLIGENCE (4 Cols) */}
                                    {/* LEFT COLUMN: REACTOR & INTELLIGENCE */}
                                    <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-6">

                                        {/* 1. PERFORMANCE SCORE */}
                                        <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 flex flex-col items-center text-center">
                                            <h3 className="text-slate-500 font-bold tracking-[0.2em] text-[10px] uppercase mb-6">Performance Score</h3>
                                            <div className="relative w-32 h-32 lg:w-36 lg:h-36 mb-6">
                                                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                                    <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                                                    <circle
                                                        cx="60" cy="60" r="52" fill="none" stroke="#22d3ee" strokeWidth="8" strokeLinecap="round"
                                                        strokeDasharray={2 * Math.PI * 52}
                                                        strokeDashoffset={2 * Math.PI * 52 * (1 - Math.min(Math.max(report.audit_score || 0, 0), 100) / 100)}
                                                        className="transition-all duration-1000"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">{report.audit_score}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 w-full">
                                                <div className="flex justify-between items-center text-xs px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200"><span className="text-slate-500 uppercase font-bold text-[10px] tracking-wide">Audit Gap</span><span className={`font-mono font-bold ${report.matrix?.me?.audit_gap?.includes("-") ? "text-red-600" : "text-emerald-600"}`}>{report.matrix?.me?.audit_gap || "N/A"}</span></div>
                                                <div className="flex justify-between items-center text-xs px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200"><span className="text-slate-500 uppercase font-bold text-[10px] tracking-wide">Market Position</span><span className={`font-bold text-[10px] uppercase ${report.matrix?.me?.audit_gap?.includes("-") ? "text-red-600" : "text-emerald-600"}`}>{report.matrix?.me?.audit_gap?.includes("-") ? "Behind Leader" : "Market Leader"}</span></div>
                                            </div>
                                        </div>

                                        {/* 2. TRUST MATRIX (LOCKED) */}
                                        <div className="relative">
                                            {!isUnlocked && (
                                                <div onClick={() => setShowLeadModal(true)} className="absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-md bg-white/80 rounded-2xl lg:rounded-3xl border border-slate-200 cursor-pointer group">
                                                    <div className="bg-white p-2 lg:p-3 rounded-full border border-blue-200 mb-2 group-hover:scale-110 transition-transform"><LockIcon /></div>
                                                    <span className="text-[8px] lg:text-[10px] text-blue-600 font-bold uppercase tracking-widest text-center px-2">Trust Matrix Locked</span>
                                                </div>
                                            )}
                                            <div className={`bg-white border border-slate-200 rounded-2xl lg:rounded-3xl p-4 lg:p-6 relative overflow-hidden flex-1 min-h-[180px] lg:min-h-[200px] ${!isUnlocked ? 'blur-sm opacity-50 grayscale select-none' : ''}`}>
                                                <h3 className="text-slate-500 font-bold tracking-[0.2em] text-[8px] lg:text-[10px] uppercase mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Trust Matrix</h3>
                                                <div className="space-y-3 lg:space-y-4">
                                                    <div>
                                                        <div className="flex justify-between text-[8px] lg:text-[10px] uppercase mb-1"><span className="text-slate-900 font-bold">Positive Sentiment</span><span className="text-emerald-600">{report.matrix?.me?.sentiment?.match(/\d+/)?.[0] || 0}%</span></div>
                                                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex"><div className="bg-emerald-500 h-full" style={{ width: `${report.matrix?.me?.sentiment?.match(/\d+/)?.[0] || 0}%` }}></div><div className="w-1 h-full bg-white relative z-10" style={{ left: `-${100 - (parseInt(report.matrix?.competitors?.[0]?.sentiment?.match(/\d+/)?.[0]) || 50)}%` }}></div></div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 lg:gap-3">
                                                        <div className="bg-slate-50 rounded-xl p-2 lg:p-3 border border-slate-200"><span className="text-slate-600 text-[8px] lg:text-[9px] uppercase font-bold block mb-1">NPS Score</span><div className="flex items-center gap-1 lg:gap-2"><span className="text-slate-900 font-bold font-mono text-sm lg:text-lg">{report.matrix?.me?.nps}</span><span className="text-[8px] lg:text-[9px] text-slate-500">vs {report.matrix?.competitors?.[0]?.nps}</span></div></div>
                                                        <div className="bg-slate-50 rounded-xl p-2 lg:p-3 border border-slate-200"><span className="text-slate-600 text-[8px] lg:text-[9px] uppercase font-bold block mb-1">Keyword Heat</span><div className="flex items-center gap-1 lg:gap-2"><span className="text-blue-600 font-bold font-mono text-sm lg:text-lg">{report.matrix?.me?.keyword_sentiment || "8.5"}</span><span className="text-[8px] lg:text-[9px] text-slate-500">/ 10</span></div></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* RIGHT: COMPETITIVE COMPARISON — VS scoreboard */}
                                    <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-full">
                                        <div className="px-6 py-5 border-b border-slate-200">
                                            <h3 className="text-slate-900 font-bold text-sm">Competitive Comparison</h3>
                                            <p className="text-xs text-slate-500 mt-0.5">Head-to-head, round by round</p>
                                        </div>

                                        {(() => {
                                            const glowMap: Record<string, string> = {
                                                'bg-cyan-500': 'ring-blue-300 shadow-slate-200 bg-blue-50',
                                                'bg-purple-500': 'ring-violet-300 shadow-slate-200 bg-violet-50',
                                                'bg-indigo-500': 'ring-indigo-300 shadow-slate-200 bg-indigo-50',
                                            };
                                            const gridStyle = { gridTemplateColumns: `repeat(${comparisonEntities.length}, minmax(0,1fr))` };
                                            const scoreOf = (entityKey: string) => comparisonMetrics.filter((m) => {
                                                if (!isUnlocked && (m.key === "post_frequency" || m.key === "products_services")) return false;
                                                const values = comparisonEntities.map((e) => m.getValue(e.data));
                                                const best = Math.max(...values);
                                                const entity = comparisonEntities.find((e) => e.key === entityKey)!;
                                                return best > 0 && m.getValue(entity.data) === best;
                                            }).length;

                                            return (
                                                <>
                                                    {/* Match score */}
                                                    <div className="px-6 py-6 border-b border-slate-200 grid gap-3" style={gridStyle}>
                                                        {comparisonEntities.map((entity) => (
                                                            <div key={entity.key} className="text-center">
                                                                <div className={`text-4xl lg:text-5xl font-black font-mono ${entity.textClass}`}>{scoreOf(entity.key)}</div>
                                                                <div className="flex items-center justify-center gap-1.5 mt-1.5">
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${entity.barClass}`}></span>
                                                                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold truncate max-w-[7rem]">{entity.label}</span>
                                                                </div>
                                                                <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">metrics won</div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Rounds */}
                                                    <div className="flex-1 p-4 lg:p-6 space-y-3 overflow-y-auto custom-scrollbar">
                                                        {comparisonMetrics.map((metric) => {
                                                            const isLockedMetric = !isUnlocked && (metric.key === "post_frequency" || metric.key === "products_services");
                                                            const values = comparisonEntities.map((e) => metric.getValue(e.data));
                                                            const best = Math.max(...values);
                                                            return (
                                                                <div key={metric.key} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                                                                    <div className="text-center mb-3">
                                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">{metric.label}</span>
                                                                    </div>
                                                                    <div className="grid gap-3" style={gridStyle}>
                                                                        {comparisonEntities.map((entity, i) => {
                                                                            const isWinner = !isLockedMetric && best > 0 && values[i] === best;
                                                                            return (
                                                                                <div
                                                                                    key={entity.key}
                                                                                    onClick={isLockedMetric ? handleRestrictedAction : undefined}
                                                                                    className={`relative rounded-xl py-3 px-2 text-center border transition-all ${isLockedMetric ? 'border-slate-200 bg-slate-50 cursor-pointer' : isWinner ? `border-transparent ring-1 ${glowMap[entity.barClass] || 'ring-slate-300 bg-slate-50'} shadow-lg` : 'border-slate-200 bg-slate-50'}`}
                                                                                >
                                                                                    {isWinner && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs">👑</span>}
                                                                                    {isLockedMetric ? (
                                                                                        <div className="flex items-center justify-center gap-1.5 text-slate-500">
                                                                                            <LockIcon />
                                                                                            <span className="text-xs blur-[3px] select-none">••••</span>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <span className={`font-mono font-bold text-sm lg:text-base ${isWinner ? 'text-slate-900' : 'text-slate-600'}`}>{metric.display(entity.data)}</span>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {!isUnlocked && (
                                                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                                                            <span className="text-xs text-slate-600">Content Engine & Products rounds are locked</span>
                                                            <button onClick={handleRestrictedAction} className="text-xs font-bold text-blue-600 hover:underline shrink-0">Unlock @ ₹99</button>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>

                                </div>
                            </div>

                            {/* EXECUTIVE SUMMARY */}
                            {report.executive_summary && (
                                <div className="max-w-5xl mx-auto">
                                    {/* CRITICAL WARNING: NO RECENT REVIEWS */}
                                    {(() => {
                                        const lastReviewDate = report.latest_review_date || report.matrix?.me?.latest_review_date || report.matrix?.me?.last_review_date;
                                        const days = daysSince(lastReviewDate);

                                        if (days > 28) {
                                            return (
                                                <div className="mb-8 bg-red-50 border border-red-300 rounded-xl p-6 flex items-start gap-4">
                                                    <div className="p-3 bg-red-100 rounded-lg shrink-0 border border-red-200">
                                                        <WarningIcon />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-red-600 font-bold text-lg mb-1 uppercase tracking-wider flex items-center gap-2">
                                                            Critical Attention Needed
                                                        </h3>
                                                        <p className="text-slate-700 text-sm leading-relaxed">
                                                            No new reviews detected for <span className="text-slate-900 font-bold">{days} days</span>.
                                                            Your profile is becoming dormant, which negatively impacts local ranking velocity.
                                                        </p>
                                                        <div className="mt-3 inline-block bg-red-100 px-3 py-1 rounded border border-red-200">
                                                            <span className="text-xs font-bold text-red-700 uppercase tracking-wide">Recommended Action: Initiate SMS review campaign immediately</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}

                                    <div className="bg-white p-8 rounded-2xl border border-slate-200">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="bg-blue-50 text-blue-600 p-2 rounded-lg border border-blue-200"><SearchIcon /></span>
                                            <h3 className="font-bold text-slate-900 text-lg">Executive Summary</h3>
                                        </div>
                                        <ul className="list-disc pl-6 space-y-3 text-slate-700 leading-7 text-base">
                                            {executiveSummaryPoints.map((point: string, index: number) => (
                                                <li key={index}>{point}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* STRATEGIC CARDS (GAPS & WINS) - MATCHING SCREENSHOT DESIGN */}
                            <div className="grid lg:grid-cols-2 gap-8 mt-12">

                                {/* 1. PROFILE GAPS CARD (Red/Alert Theme) */}
                                <div className="bg-white rounded-2xl border border-red-200 overflow-hidden flex flex-col">
                                    {/* Header */}
                                    <div className="p-6 border-b border-red-200 bg-red-50 flex items-center gap-4">
                                        <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-red-600 shadow-sm">
                                            <ErrorIcon />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 tracking-wide uppercase">Your Profile Gaps</h3>
                                    </div>

                                    {/* List Content */}
                                    <div className="p-6 relative flex-grow">
                                        <ul className="space-y-5">
                                            {/* Top 3 Gaps (Always Visible) */}
                                            {report.weaknesses?.slice(0, 3).map((item: string, i: number) => (
                                                <li key={i} className="flex items-start gap-4 group">
                                                    <span className="flex-shrink-0 mt-1 w-5 h-5 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-200 text-xs font-bold group-hover:bg-red-500 group-hover:text-white transition-colors">✕</span>
                                                    <span className="text-slate-700 text-sm leading-relaxed font-medium group-hover:text-slate-900 transition-colors">{item}</span>
                                                </li>
                                            )) || <p className="text-slate-500 italic px-2">No critical gaps detected.</p>}

                                            {/* Locked Gaps (Blurred) */}
                                            {!isUnlocked && report.weaknesses?.length > 3 && (
                                                <div className="relative mt-2 pt-4 border-t border-dashed border-slate-200 cursor-pointer group/lock" onClick={handleRestrictedAction}>
                                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/95 z-10 flex flex-col items-center justify-center text-center -mx-6 -mb-6 pb-4">
                                                        <div className="bg-white p-3 rounded-full border border-red-200 text-red-600 shadow-sm group-hover/lock:scale-110 transition-transform mb-2">
                                                            <LockIcon />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest border-b border-red-200 pb-0.5">Unlock {report.weaknesses.length - 3} More Gaps</span>
                                                    </div>
                                                    {/* Visual Fake Content */}
                                                    <div className="space-y-4 opacity-30 blur-[2px] pointer-events-none select-none grayscale">
                                                        <li className="flex items-start gap-4"><span className="w-5 h-5 rounded-full bg-red-100"></span><span className="h-4 bg-slate-100 rounded w-3/4"></span></li>
                                                        <li className="flex items-start gap-4"><span className="w-5 h-5 rounded-full bg-red-100"></span><span className="h-4 bg-slate-100 rounded w-2/3"></span></li>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Unlocked Remaining Gaps */}
                                            {isUnlocked && report.weaknesses?.slice(3).map((item: string, i: number) => (
                                                <li key={i + 3} className="flex items-start gap-4 group animate-[fadeIn_0.5s_ease-out]">
                                                    <span className="flex-shrink-0 mt-1 w-5 h-5 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-200 text-xs font-bold group-hover:bg-red-500 group-hover:text-white transition-colors">✕</span>
                                                    <span className="text-slate-700 text-sm leading-relaxed font-medium group-hover:text-slate-900 transition-colors">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* 2. PROFILE WINS CARD (Green/Success Theme) */}
                                <div className="bg-white rounded-2xl border border-emerald-200 overflow-hidden flex flex-col">
                                    {/* Header */}
                                    <div className="p-6 border-b border-emerald-200 bg-emerald-50 flex items-center gap-4">
                                        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-600 shadow-sm">
                                            <TrophyIcon />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 tracking-wide uppercase">Profile Wins</h3>
                                    </div>

                                    {/* List Content */}
                                    <div className="p-6 relative flex-grow">
                                        <ul className="space-y-5">
                                            {/* Top 3 Wins (Always Visible) */}
                                            {report.competitor_strengths?.slice(0, 3).map((item: string, i: number) => (
                                                <li key={i} className="flex items-start gap-4 group">
                                                    <span className="flex-shrink-0 mt-1 w-5 h-5 rounded-full bg-emerald-50 text-green-500 flex items-center justify-center border border-emerald-200 text-xs font-bold group-hover:bg-green-500 group-hover:text-white transition-colors">✓</span>
                                                    <span className="text-slate-700 text-sm leading-relaxed font-medium group-hover:text-slate-900 transition-colors">{item}</span>
                                                </li>
                                            )) || <p className="text-slate-500 italic px-2">Analyzing competitive advantages...</p>}

                                            {/* Locked Wins (Blurred) */}
                                            {!isUnlocked && report.competitor_strengths?.length > 3 && (
                                                <div className="relative mt-2 pt-4 border-t border-dashed border-slate-200 cursor-pointer group/lock" onClick={handleRestrictedAction}>
                                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/95 z-10 flex flex-col items-center justify-center text-center -mx-6 -mb-6 pb-4">
                                                        <div className="bg-white p-3 rounded-full border border-emerald-200 text-emerald-600 shadow-sm group-hover/lock:scale-110 transition-transform mb-2">
                                                            <LockIcon />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest border-b border-emerald-200 pb-0.5">Unlock All Wins</span>
                                                    </div>
                                                    {/* Visual Fake Content */}
                                                    <div className="space-y-4 opacity-30 blur-[2px] pointer-events-none select-none grayscale">
                                                        <li className="flex items-start gap-4"><span className="w-5 h-5 rounded-full bg-emerald-100"></span><span className="h-4 bg-slate-100 rounded w-3/4"></span></li>
                                                        <li className="flex items-start gap-4"><span className="w-5 h-5 rounded-full bg-emerald-100"></span><span className="h-4 bg-slate-100 rounded w-2/3"></span></li>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Unlocked Remaining Wins */}
                                            {isUnlocked && report.competitor_strengths?.slice(3).map((item: string, i: number) => (
                                                <li key={i + 3} className="flex items-start gap-4 group animate-[fadeIn_0.5s_ease-out]">
                                                    <span className="flex-shrink-0 mt-1 w-5 h-5 rounded-full bg-emerald-50 text-green-500 flex items-center justify-center border border-emerald-200 text-xs font-bold group-hover:bg-green-500 group-hover:text-white transition-colors">✓</span>
                                                    <span className="text-slate-700 text-sm leading-relaxed font-medium group-hover:text-slate-900 transition-colors">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* GAP ANALYSIS - REDESIGNED "PROTOCOL STACK" */}
                            {report.gap_analysis && (
                                <div className="space-y-8 mt-12">

                                    {/* Section Header */}
                                    <div className="text-center mb-8">
                                        <h3 className="text-xl font-bold text-slate-900">How to Close the Gap</h3>
                                        <p className="text-sm text-slate-500 mt-1">Fixes grouped by area, safest first</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

                                        {/* 1. REPUTATION MODULE */}
                                        <div className="bg-white rounded-2xl border border-blue-200 overflow-hidden relative group hover:shadow-sm transition-all duration-500">
                                            {/* Header */}
                                            <div className="h-1 bg-gradient-to-r from-blue-600 to-cyan-400"></div>
                                            <div className="p-5 border-b border-slate-200 bg-blue-50 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded bg-blue-50 text-blue-600 border border-blue-200">
                                                        <StarIcon />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 text-sm tracking-wide">Reputation</h3>
                                                        <p className="text-[10px] text-blue-600 font-mono uppercase">Priority: High</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content List */}
                                            <div className="p-5 space-y-6 relative">
                                                {/* Connecting Line */}
                                                <div className="absolute left-[29px] top-8 bottom-8 w-px bg-gradient-to-b from-blue-50 to-transparent"></div>

                                                {/* STEP 1 (Always Visible) */}
                                                <div className="relative flex gap-4">
                                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-blue-500 text-blue-600 flex items-center justify-center z-10 shadow-sm group-hover:scale-110 transition-transform">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-blue-600 text-xs font-bold uppercase mb-1">Immediate Action</h4>
                                                        <p className="text-slate-600 text-sm leading-relaxed">{report.gap_analysis.reputation?.[0]}</p>
                                                    </div>
                                                </div>

                                                {/* LOCKED / UNLOCKED STEPS */}
                                                {isUnlocked ? (
                                                    report.gap_analysis.reputation?.slice(1).map((fix: string, i: number) => (
                                                        <div key={i} className="relative flex gap-4 animate-[fadeIn_0.5s_ease-out]">
                                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-blue-300 text-blue-600 flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-blue-600 text-xs font-bold uppercase mb-1">Follow-up Protocol</h4>
                                                                <p className="text-slate-600 text-sm leading-relaxed">{fix}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    // LOCKED STATE
                                                    <div className="relative mt-4 pt-4 border-t border-dashed border-slate-200 cursor-pointer group/lock" onClick={handleRestrictedAction}>
                                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/90 z-0"></div>
                                                        <div className="relative z-10 flex flex-col items-center justify-center py-6 text-center space-y-3">
                                                            <div className="w-10 h-10 rounded-full bg-slate-900/40 border border-blue-200 flex items-center justify-center text-blue-400 shadow-sm group-hover/lock:scale-110 transition-transform">
                                                                <LockIcon />
                                                            </div>
                                                            <div className="text-xs font-medium text-slate-500 group-hover/lock:text-blue-400 transition-colors">
                                                                2 Advanced Strategies Hidden <br />
                                                                <span className="font-bold underline decoration-blue-500/50 underline-offset-2">Tap to Unlock</span>
                                                            </div>
                                                        </div>
                                                        {/* Fake Blurred Text for Effect */}
                                                        <div className="absolute inset-0 blur-[4px] opacity-30 select-none pointer-events-none grayscale pt-6 pl-10">
                                                            <p className="text-sm text-slate-500">Implement automated SMS review generation...</p>
                                                            <p className="text-sm text-slate-500 mt-2">Filter negative feedback via gateway...</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 2. ENGAGEMENT MODULE */}
                                        <div className="bg-white rounded-2xl border border-violet-200 overflow-hidden relative group hover:shadow-sm transition-all duration-500">
                                            <div className="h-1 bg-gradient-to-r from-purple-600 to-pink-400"></div>
                                            <div className="p-5 border-b border-slate-200 bg-violet-50 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded bg-violet-50 text-violet-600 border border-violet-200">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 text-sm tracking-wide">Engagement</h3>
                                                        <p className="text-[10px] text-violet-600 font-mono uppercase">Priority: Medium</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-6 relative">
                                                <div className="absolute left-[29px] top-8 bottom-8 w-px bg-gradient-to-b from-violet-50 to-transparent"></div>

                                                {/* STEP 1 */}
                                                <div className="relative flex gap-4">
                                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-purple-500 text-violet-600 flex items-center justify-center z-10 shadow-sm group-hover:scale-110 transition-transform">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-violet-600 text-xs font-bold uppercase mb-1">Content Fix</h4>
                                                        <p className="text-slate-600 text-sm leading-relaxed">{report.gap_analysis.engagement?.[0]}</p>
                                                    </div>
                                                </div>

                                                {/* LOCKED / UNLOCKED */}
                                                {isUnlocked ? (
                                                    report.gap_analysis.engagement?.slice(1).map((fix: string, i: number) => (
                                                        <div key={i} className="relative flex gap-4 animate-[fadeIn_0.5s_ease-out]">
                                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-violet-300 text-violet-600 flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h7l-1.5-4.5L20 13H13l1.5 4.5L3 10z" /></svg>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-violet-600 text-xs font-bold uppercase mb-1">Interaction Boost</h4>
                                                                <p className="text-slate-600 text-sm leading-relaxed">{fix}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="relative mt-4 pt-4 border-t border-dashed border-slate-200 cursor-pointer group/lock" onClick={handleRestrictedAction}>
                                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/90 z-0"></div>
                                                        <div className="relative z-10 flex flex-col items-center justify-center py-6 text-center space-y-3">
                                                            <div className="w-10 h-10 rounded-full bg-slate-900/40 border border-violet-200 flex items-center justify-center text-purple-400 shadow-sm group-hover/lock:scale-110 transition-transform">
                                                                <LockIcon />
                                                            </div>
                                                            <div className="text-xs font-medium text-slate-500 group-hover/lock:text-purple-400 transition-colors">
                                                                2 Content Scripts Hidden <br />
                                                                <span className="font-bold underline decoration-purple-500/50 underline-offset-2">Tap to Unlock</span>
                                                            </div>
                                                        </div>
                                                        <div className="absolute inset-0 blur-[4px] opacity-30 select-none pointer-events-none grayscale pt-6 pl-10">
                                                            <p className="text-sm text-slate-500">Post 3x weekly using high-contrast visuals...</p>
                                                            <p className="text-sm text-slate-500 mt-2">Respond to Q&A within 2 hours...</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 3. RELEVANCE MODULE */}
                                        <div className="bg-white rounded-2xl border border-emerald-200 overflow-hidden relative group hover:shadow-sm transition-all duration-500">
                                            <div className="h-1 bg-gradient-to-r from-green-600 to-emerald-400"></div>
                                            <div className="p-5 border-b border-slate-200 bg-emerald-50 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                        <MapPinIcon />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 text-sm tracking-wide">Relevance</h3>
                                                        <p className="text-[10px] text-emerald-600 font-mono uppercase">Priority: Critical</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-6 relative">
                                                <div className="absolute left-[29px] top-8 bottom-8 w-px bg-gradient-to-b from-emerald-50 to-transparent"></div>

                                                {/* STEP 1 */}
                                                <div className="relative flex gap-4">
                                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-green-500 text-emerald-600 flex items-center justify-center z-10 shadow-sm group-hover:scale-110 transition-transform">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3zm0 0v6m-6 0h12" /></svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-emerald-600 text-xs font-bold uppercase mb-1">Keyword Injection</h4>
                                                        <p className="text-slate-600 text-sm leading-relaxed">{report.gap_analysis.relevance?.[0]}</p>
                                                    </div>
                                                </div>

                                                {/* LOCKED / UNLOCKED */}
                                                {isUnlocked ? (
                                                    report.gap_analysis.relevance?.slice(1).map((fix: string, i: number) => (
                                                        <div key={i} className="relative flex gap-4 animate-[fadeIn_0.5s_ease-out]">
                                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-emerald-300 text-emerald-600 flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12l5 5L20 7" /></svg>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-emerald-600 text-xs font-bold uppercase mb-1">Authority Signal</h4>
                                                                <p className="text-slate-600 text-sm leading-relaxed">{fix}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="relative mt-4 pt-4 border-t border-dashed border-slate-200 cursor-pointer group/lock" onClick={handleRestrictedAction}>
                                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/90 z-0"></div>
                                                        <div className="relative z-10 flex flex-col items-center justify-center py-6 text-center space-y-3">
                                                            <div className="w-10 h-10 rounded-full bg-slate-900/40 border border-emerald-200 flex items-center justify-center text-green-400 shadow-sm group-hover/lock:scale-110 transition-transform">
                                                                <LockIcon />
                                                            </div>
                                                            <div className="text-xs font-medium text-slate-500 group-hover/lock:text-green-400 transition-colors">
                                                                2 Geo-Grid Fixes Hidden <br />
                                                                <span className="font-bold underline decoration-green-500/50 underline-offset-2">Tap to Unlock</span>
                                                            </div>
                                                        </div>
                                                        <div className="absolute inset-0 blur-[4px] opacity-30 select-none pointer-events-none grayscale pt-6 pl-10">
                                                            <p className="text-sm text-slate-500">Update secondary categories to match buyer intent...</p>
                                                            <p className="text-sm text-slate-500 mt-2">Embed geo-coordinates in photo metadata...</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 4. ACCESSIBILITY MODULE */}
                                        {report.gap_analysis.accessibility && report.gap_analysis.accessibility.length > 0 && (
                                            <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden relative group hover:shadow-sm transition-all duration-500">
                                                <div className="h-1 bg-gradient-to-r from-amber-600 to-yellow-400"></div>
                                                <div className="p-5 border-b border-slate-200 bg-amber-50 flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded bg-amber-50 text-amber-600 border border-amber-200">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 3a4 4 0 110 8 4 4 0 010-8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-slate-900 text-sm tracking-wide">Accessibility</h3>
                                                            <p className="text-[10px] text-amber-600 font-mono uppercase">Priority: Medium</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-5 space-y-6 relative">
                                                    <div className="absolute left-[29px] top-8 bottom-8 w-px bg-gradient-to-b from-amber-50 to-transparent"></div>

                                                    {/* STEP 1 */}
                                                    <div className="relative flex gap-4">
                                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-amber-500 text-amber-600 flex items-center justify-center z-10 shadow-sm group-hover:scale-110 transition-transform">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-amber-600 text-xs font-bold uppercase mb-1">First Fix</h4>
                                                            <p className="text-slate-600 text-sm leading-relaxed">{report.gap_analysis.accessibility[0]}</p>
                                                        </div>
                                                    </div>

                                                    {/* LOCKED / UNLOCKED */}
                                                    {isUnlocked ? (
                                                        report.gap_analysis.accessibility.slice(1).map((fix: string, i: number) => (
                                                            <div key={i} className="relative flex gap-4 animate-[fadeIn_0.5s_ease-out]">
                                                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-amber-300 text-amber-600 flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12l5 5L20 7" /></svg>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-amber-600 text-xs font-bold uppercase mb-1">Follow-up Fix</h4>
                                                                    <p className="text-slate-600 text-sm leading-relaxed">{fix}</p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="relative mt-4 pt-4 border-t border-dashed border-slate-200 cursor-pointer group/lock" onClick={handleRestrictedAction}>
                                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/90 z-0"></div>
                                                            <div className="relative z-10 flex flex-col items-center justify-center py-6 text-center space-y-3">
                                                                <div className="w-10 h-10 rounded-full bg-slate-900/40 border border-amber-200 flex items-center justify-center text-amber-400 shadow-sm group-hover/lock:scale-110 transition-transform">
                                                                    <LockIcon />
                                                                </div>
                                                                <div className="text-xs font-medium text-slate-500 group-hover/lock:text-amber-400 transition-colors">
                                                                    More Fixes Hidden <br />
                                                                    <span className="font-bold underline decoration-amber-500/50 underline-offset-2">Tap to Unlock</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            )}
                            {/* 4-WEEK ACTION PLAN */}
                            {report.four_week_plan && (
                                <div className="mt-16 space-y-8">
                                    <div className="flex items-center justify-between px-2">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 tracking-wide">Your 4-Week Action Plan</h3>
                                            <p className="text-sm text-slate-500 mt-1">Step-by-step, safest changes first</p>
                                        </div>
                                        <div className="hidden md:flex items-center px-4 py-2 rounded-full bg-slate-50 border border-slate-200">
                                            <span className="text-xs font-mono text-slate-600">~30 days total</span>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {report.four_week_plan.map((week: any, i: number) => {
                                            const isWeekLocked = !isUnlocked && i > 0;
                                            const isPartial = !isUnlocked && i === 0;
                                            const tasks = isPartial ? week.tasks?.slice(0, Math.ceil((week.tasks?.length || 0) / 2)) : week.tasks;

                                            return (
                                                <div key={i} className={`relative bg-white rounded-2xl border overflow-hidden ${isWeekLocked ? 'border-slate-200 opacity-60' : 'border-slate-200'}`}>
                                                    <div className="p-6 border-b border-slate-200">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-blue-200 bg-blue-50 text-blue-600">
                                                                Week {i + 1}
                                                            </span>
                                                            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                {week.time_est}
                                                            </span>
                                                        </div>
                                                        <h4 className="text-lg font-bold text-slate-900 mb-1">{week.week}</h4>
                                                        <p className="text-xs text-slate-600 uppercase tracking-wide">{week.focus}</p>
                                                    </div>

                                                    <div className="relative p-6 min-h-[180px]">
                                                        {isWeekLocked ? (
                                                            <div className="h-full flex flex-col items-center justify-center text-center cursor-pointer py-6" onClick={handleRestrictedAction}>
                                                                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-3 text-slate-500"><LockIcon /></div>
                                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Locked</span>
                                                            </div>
                                                        ) : (
                                                            <ul className="space-y-3">
                                                                {tasks?.map((task: string, k: number) => (
                                                                    <li key={k} className="flex items-start gap-3">
                                                                        <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                                                                        <span className="text-sm text-slate-700 leading-snug">{task}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                        {isPartial && (
                                                            <div className="absolute inset-x-0 bottom-0 pt-16 pb-6 bg-gradient-to-t from-white via-white/95 to-transparent flex items-end justify-center cursor-pointer" onClick={handleRestrictedAction}>
                                                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-300 text-cyan-400 text-xs font-bold uppercase tracking-wider hover:bg-cyan-600 hover:text-white transition-all">
                                                                    <LockIcon /><span>Unlock Full Plan</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            {/* GLOSSARY & DISCLAIMER */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                    <div className="flex items-center gap-3">
                                        <span className="bg-slate-50 text-slate-600 p-2 rounded-lg border border-slate-200"><BookIcon /></span>
                                        <h3 className="font-bold text-slate-900 text-xl uppercase tracking-wide">Metric Definitions</h3>
                                    </div>
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                </div>

                                {/* Definitions Grid */}
                                <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6 text-sm">
                                        {METRIC_DEFINITIONS.map((def, i) => (
                                            <div key={i} className="flex flex-col">
                                                <span className="font-bold text-slate-800 mb-1">{def.label}</span>
                                                <span className="text-slate-500 leading-snug">{def.desc}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* LEGAL DISCLAIMER */}
                                <div className="mt-8 p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
                                    <p className="text-[10px] text-slate-500 leading-relaxed max-w-4xl mx-auto">
                                        <span className="font-bold text-slate-600 uppercase">Disclaimer:</span> All analysis, insights, and recommendations provided in this report are generated by artificial intelligence. These suggestions are for informational purposes only. Implementation of any strategies is at the sole discretion and risk of the user. We are not liable for any negative outcomes, including but not limited to profile suspension, blacklisting, ranking drops, or loss of data that may occur from applying these recommendations.
                                    </p>
                                    <div className="flex items-center justify-center gap-6 mt-4">
                                        <Link href="/terms-and-conditions" className="text-[10px] text-slate-500 hover:text-blue-600 transition uppercase tracking-wider font-bold">Terms & Conditions</Link>
                                        <span className="text-slate-400">|</span>
                                        <Link href="/privacy-policy" className="text-[10px] text-slate-500 hover:text-blue-600 transition uppercase tracking-wider font-bold">Privacy Policy</Link>
                                        <span className="text-slate-400">|</span>
                                        <Link href="/refund-policy" className="text-[10px] text-slate-500 hover:text-blue-600 transition uppercase tracking-wider font-bold">Refund Policy</Link>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* --- GOURMET BREW LOADER --- */}
                {loading && (
                    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 backdrop-blur-xl transition-all duration-300 overflow-hidden">

                        {/* Background Atmosphere */}
                        <div className="absolute inset-0 bg-radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.1) 0%, transparent 70%) pointer-events-none"></div>

                        {/* The Brewing Setup */}
                        <div className="relative">

                            {/* 1. Floating "Data Spices" (Falling particles) */}
                            <div className="absolute -top-12 left-0 w-full h-full z-0">
                                <div className="absolute top-0 left-1/4 w-1 h-1 bg-slate-200 rounded-full animate-[fall_3s_linear_infinite]"></div>
                                <div className="absolute top-[-10px] left-1/2 w-1.5 h-1.5 bg-amber-200 rounded-full animate-[fall_4s_linear_infinite_1s]"></div>
                                <div className="absolute top-[-5px] left-3/4 w-1 h-1 bg-slate-200 rounded-full animate-[fall_2.5s_linear_infinite_0.5s]"></div>
                            </div>

                            {/* 2. The Cup */}
                            <div className="relative w-36 h-44 z-10">
                                {/* Handle */}
                                <div className="absolute top-8 -right-5 w-14 h-20 border-[6px] border-slate-200 rounded-r-3xl pointer-events-none shadow-lg"></div>

                                {/* Glass Body */}
                                <div className="w-full h-full border-[3px] border-slate-300 border-t-0 rounded-b-[3rem] relative overflow-hidden bg-slate-50 backdrop-blur-md shadow-sm">

                                    {/* The Liquid (Coffee/Amber Gradient) — fills at the pace of the real wait, not a fixed timer */}
                                    <div
                                        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#451a03] via-[#92400e] to-[#f59e0b] opacity-95 transition-all duration-[3000ms] ease-in-out flex flex-col justify-start overflow-visible"
                                        style={{ height: reportReady ? '100%' : `${Math.min(85, (loadingMsgIndex + 1) * 5)}%` }}
                                    >
                                        {/* Froth / Foam Layer */}
                                        <div className="w-full h-3 bg-[#fcd34d] absolute top-0 blur-[1px] opacity-80 animate-[wave_2s_linear_infinite]"></div>

                                        {/* Wavy Surface */}
                                        <div className="w-[200%] h-6 bg-slate-100 absolute -top-3 animate-[wave_2.5s_linear_infinite] rounded-[50%]"></div>

                                        {/* Vigorously Boiling Bubbles */}
                                        <div className="absolute bottom-0 left-1/4 w-2 h-2 bg-slate-200 rounded-full animate-[bubble_1.5s_ease-in_infinite]"></div>
                                        <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-slate-200 rounded-full animate-[bubble_2s_ease-in_infinite_0.2s]"></div>
                                        <div className="absolute bottom-0 left-3/4 w-2 h-2 bg-slate-200 rounded-full animate-[bubble_1.8s_ease-in_infinite_0.5s]"></div>
                                        <div className="absolute bottom-4 left-1/3 w-1 h-1 bg-amber-200 rounded-full animate-[bubble_2.2s_ease-in_infinite_1s]"></div>
                                    </div>
                                </div>

                                {/* Reflection/Shine on Glass */}
                                <div className="absolute top-4 left-3 w-2 h-32 bg-gradient-to-b from-white/20 to-transparent rounded-full blur-[1px]"></div>
                            </div>

                            {/* 3. Heating Element Glow (Bottom) */}
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-orange-200 blur-xl rounded-full animate-pulse"></div>

                            {/* 4. Enhanced Steam (Top) */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-3 justify-center z-0">
                                <div className="w-2 h-10 bg-slate-100 rounded-full blur-md animate-[steam_2.5s_ease-out_infinite]"></div>
                                <div className="w-2 h-14 bg-slate-200 rounded-full blur-md animate-[steam_3s_ease-out_infinite_0.5s]"></div>
                                <div className="w-2 h-8 bg-slate-100 rounded-full blur-md animate-[steam_2s_ease-out_infinite_1s]"></div>
                            </div>
                        </div>

                        {/* Text & Status */}
                        <div className="mt-12 text-center relative z-20 space-y-4">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                BREWING <span className="text-amber-600">INSIGHTS</span>
                            </h3>

                            <div className="bg-slate-50 border border-slate-200 px-6 py-3 rounded-full inline-block backdrop-blur-md">
                                <p key={loadingMsgIndex} className="text-amber-800 font-mono text-xs tracking-widest uppercase animate-[fade-in-up_0.4s_ease-out]">
                                    <span className="mr-2 animate-spin inline-block">⏳</span>
                                    {LOADING_MESSAGES[loadingMsgIndex % LOADING_MESSAGES.length]}
                                </p>
                            </div>
                            <div className="mx-auto h-2 w-64 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-[3000ms] ease-out"
                                    style={{ width: reportReady ? '100%' : `${Math.min(90, (loadingMsgIndex + 1) * 6)}%` }}
                                />
                            </div>
                            <p className="text-slate-500 text-[11px] max-w-xs mx-auto leading-relaxed">
                                A deep, personalized audit takes real analysis — this usually takes up to 90 seconds. Please keep this tab open.
                            </p>
                        </div>
                    </div>
                )}

                {/* --- LEAD CAPTURE MODAL --- */}
                {showLeadModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center border border-slate-200 relative">
                            <button
                                onClick={() => { setShowLeadModal(false); setLeadCouponCode(""); setLeadCouponError(""); setLeadCouponApplied(false); }}
                                className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 transition"
                            >✕</button>

                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Almost There</h2>
                            <p className="text-slate-600 mb-6 text-sm">Enter your details to unlock the full GMB audit report.</p>

                            <form onSubmit={handleLeadSubmit} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-cyan-500 outline-none text-slate-900 transition"
                                        placeholder="you@example.com"
                                        value={leadData.email}
                                        onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-cyan-500 outline-none text-slate-900 transition"
                                        placeholder="+91 98765 00000"
                                        value={leadData.phone}
                                        onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                                    />
                                </div>

                                {/* --- COUPON CODE SECTION --- */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Coupon Code <span className="text-slate-500 normal-case font-normal">(optional)</span></label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className={`flex-1 bg-slate-50 border p-3 rounded-xl outline-none text-slate-900 transition text-sm ${leadCouponApplied
                                                ? "border-emerald-300 text-emerald-600"
                                                : leadCouponError
                                                    ? "border-red-300"
                                                    : "border-slate-200 focus:border-cyan-500"
                                                }`}
                                            placeholder="Enter coupon code"
                                            value={leadCouponCode}
                                            onChange={(e) => { setLeadCouponCode(e.target.value); setLeadCouponError(""); setLeadCouponApplied(false); setLeadCouponDiscount(null); }}
                                            disabled={leadCouponApplied}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleLeadCouponApply}
                                            disabled={!leadCouponCode.trim() || leadCouponApplied || isCheckingCoupon}
                                            className="px-4 py-3 rounded-xl font-bold text-sm transition bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                                        >
                                            {leadCouponApplied ? "✓ Applied" : isCheckingCoupon ? "Checking…" : "Apply"}
                                        </button>
                                    </div>
                                    {leadCouponApplied && (
                                        <p className="text-emerald-600 text-xs mt-1.5 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                            {leadCouponDiscount === 100 ? "Coupon applied! Payment waived." : `Coupon applied! ${leadCouponDiscount}% off.`}
                                        </p>
                                    )}
                                    {leadCouponError && (
                                        <p className="text-red-600 text-xs mt-1.5">{leadCouponError}</p>
                                    )}
                                </div>

                                {/* PRICE LINE */}
                                {!leadCouponApplied ? (
                                    <div className="flex items-center justify-between px-1 pt-1">
                                        <span className="text-slate-600 text-xs">Unlock full audit report</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-900 font-bold text-sm">₹99</span>
                                            <span className="text-slate-500 line-through text-xs">₹999</span>
                                        </div>
                                    </div>
                                ) : leadCouponDiscount === 100 ? (
                                    <div className="flex items-center justify-between px-1 pt-1">
                                        <span className="text-emerald-600 text-xs font-medium">🎉 Coupon applied — Payment waived!</span>
                                        <span className="text-emerald-600 font-bold text-sm">FREE</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between px-1 pt-1">
                                        <span className="text-emerald-600 text-xs font-medium">🎉 Coupon applied — {leadCouponDiscount}% off!</span>
                                        <span className="text-emerald-600 font-bold text-sm">-{leadCouponDiscount}%</span>
                                    </div>
                                )}

                                {/* SUBMIT BUTTON */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full text-white py-4 rounded-xl font-bold transition mt-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${leadCouponApplied
                                        ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-sm"
                                        : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-sm"
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>{leadCouponApplied && leadCouponDiscount === 100 ? "Generating Report..." : "Processing Payment..."}</span>
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            <span className="text-base font-bold">
                                                {!leadCouponApplied
                                                    ? "Generate Report @ ₹99"
                                                    : leadCouponDiscount === 100
                                                        ? "Generate Report — Free"
                                                        : `Generate Report — ${leadCouponDiscount}% Off`}
                                            </span>
                                        </div>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- PAYMENT SUCCESS MODAL --- */}
                {isPaymentSuccess && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border border-emerald-200 relative overflow-hidden">
                            {/* Animated Background Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-blue-50 to-transparent animate-pulse pointer-events-none"></div>

                            {/* Success Checkmark Animation */}
                            <div className="relative z-10 mb-6 flex justify-center">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-50 to-blue-50 border-4 border-emerald-200 flex items-center justify-center animate-[scale-in_0.5s_ease-out] shadow-sm">
                                    <svg className="w-12 h-12 text-emerald-600 animate-[checkmark_0.6s_ease-out_0.2s_both]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Success Text */}
                            <div className="relative z-10 space-y-3">
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight animate-[fadeIn_0.5s_ease-out_0.3s_both]">
                                    Payment Successful!
                                </h2>
                                <p className="text-slate-600 text-sm animate-[fadeIn_0.5s_ease-out_0.4s_both]">
                                    Unlocking your full GMB audit report...
                                </p>

                                {/* Loader Dots */}
                                <div className="flex justify-center gap-2 pt-4 animate-[fadeIn_0.5s_ease-out_0.5s_both]">
                                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-[bounce_1s_ease-in-out_infinite]"></div>
                                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-[bounce_1s_ease-in-out_0.1s_infinite]"></div>
                                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-[bounce_1s_ease-in-out_0.2s_infinite]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* --- RAZORPAY PAYMENT MODAL (Optional if you want a pre-check, but we will trigger directly) --- */}




            </div>

            {/* --- FOOTER FOR BOTH LANDING & DASHBOARD --- */}
            <footer className={`border-t border-slate-200 text-center relative z-10 bg-slate-50 ${step === 1 ? 'py-6' : 'py-12'}`}>
                <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-[10px] md:text-xs font-mono text-slate-600">ALL SYSTEMS OPERATIONAL</span>
                </div>
                <div className="flex items-center justify-center gap-4 mb-3">
                    <Link href="/terms-and-conditions" className="text-[10px] md:text-xs text-slate-500 hover:text-blue-600 transition font-mono">Terms</Link>
                    <span className="text-slate-400">•</span>
                    <Link href="/privacy-policy" className="text-[10px] md:text-xs text-slate-500 hover:text-blue-600 transition font-mono">Privacy</Link>
                    <span className="text-slate-400">•</span>
                    <Link href="/refund-policy" className="text-[10px] md:text-xs text-slate-500 hover:text-blue-600 transition font-mono">Refund Policy</Link>
                </div>
                <p className="text-slate-500 text-[10px] md:text-xs font-mono">&copy; {new Date().getFullYear()} ADDINFI DIGITECH PVT. LTD. // SECURE CONNECTION</p>
            </footer>
        </div>
    );
}                                                                                                                                                                                                                                                                                                                                                                                                        