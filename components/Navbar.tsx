"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, FileText, Menu, X } from "lucide-react";
import { useSession, signOut } from "@/lib/auth";
import UserMenu from "./UserMenu";

// Shared site header. Inside the single-page app (app/page.tsx) the callbacks switch views;
// on standalone routes (policy pages) they fall back to navigating to "/" and handing the
// intent over via sessionStorage / query string.

interface NavbarProps {
    onHome?: () => void;
    onStart?: () => void;
    onReports?: () => void;
    showCta?: boolean;
    ctaLabel?: string;
    /** Extra page-specific buttons (desktop), e.g. Download PDF on a report. */
    actions?: React.ReactNode;
    /** Extra page-specific buttons for the mobile menu. */
    mobileActions?: React.ReactNode;
}

export const SECTION_LINKS = [
    { id: "inside", label: "Features" },
    { id: "how", label: "How it works" },
    { id: "pricing", label: "Pricing" },
    { id: "guide", label: "Guide" },
    { id: "faq", label: "FAQ" },
];

export const LEGAL_LINKS = [
    { href: "/terms-and-conditions", label: "Terms & Conditions" },
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/refund-policy", label: "Cancellation & Refund" },
];

/** Scrolls to a landing-page section, retrying while the landing view mounts. */
export const scrollToSection = (id: string, attempts = 20) => {
    const el = document.getElementById(id);
    if (el) {
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
    } else if (attempts > 0) {
        setTimeout(() => scrollToSection(id, attempts - 1), 60);
    }
};

const Navbar: React.FC<NavbarProps> = ({ onHome, onStart, onReports, showCta = true, ctaLabel, actions, mobileActions }) => {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [legalOpen, setLegalOpen] = useState(false);
    const legalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const close = (e: MouseEvent) => {
            if (legalRef.current && !legalRef.current.contains(e.target as Node)) setLegalOpen(false);
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const goSection = (e: React.MouseEvent, id: string) => {
        setMobileOpen(false);
        if (pathname !== "/") return; // let the link navigate to /#id
        e.preventDefault();
        onHome?.();
        scrollToSection(id);
    };

    const goHome = (e: React.MouseEvent) => {
        setMobileOpen(false);
        if (pathname === "/" && onHome) {
            e.preventDefault();
            onHome();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const start = () => {
        setMobileOpen(false);
        if (onStart) return onStart();
        if (session) sessionStorage.setItem("gmb_view", "dashboard");
        window.location.href = session ? "/" : "/?signin=1";
    };

    const reports = () => {
        setMobileOpen(false);
        if (onReports) return onReports();
        sessionStorage.setItem("gmb_view", "reports");
        window.location.href = "/";
    };

    const linkCls = "px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition";
    const legalActive = LEGAL_LINKS.some((l) => l.href === pathname);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-xl" data-html2canvas-ignore="true">
            <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-[72px] flex items-center justify-between gap-4">
                <Link href="/" onClick={goHome} className="flex items-center gap-2.5 shrink-0">
                    <span className="flex flex-col leading-none">
                        <span className="text-lg font-bold tracking-tight text-slate-900">What<span className="text-blue-600">My</span>Rank</span>
                        <span className="mt-1 text-[10px] font-medium tracking-wide text-slate-500">by <span className="text-blue-700 font-semibold">Addinfi</span></span>
                    </span>
                </Link>

                {/* Desktop links */}
                <div className="hidden lg:flex items-center gap-1">
                    {SECTION_LINKS.map((l) => (
                        <a key={l.id} href={`/#${l.id}`} onClick={(e) => goSection(e, l.id)} className={linkCls}>{l.label}</a>
                    ))}
                    <div className="relative" ref={legalRef}>
                        <button
                            onClick={() => setLegalOpen((o) => !o)}
                            className={`${linkCls} inline-flex items-center gap-1 ${legalActive ? "text-blue-600" : ""}`}
                            aria-expanded={legalOpen}
                        >
                            Legal <ChevronDown className={`w-4 h-4 transition ${legalOpen ? "rotate-180" : ""}`} />
                        </button>
                        {legalOpen && (
                            <div className="absolute left-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-xl p-1.5">
                                {LEGAL_LINKS.map((l) => (
                                    <Link key={l.href} href={l.href} onClick={() => setLegalOpen(false)}
                                        className={`block px-3 py-2 rounded-lg text-sm transition ${pathname === l.href ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-700 hover:bg-slate-50"}`}>
                                        {l.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                    {session && (
                        <button onClick={reports} className={`${linkCls} inline-flex items-center gap-1.5`}>
                            <FileText className="w-4 h-4" /> My Reports
                        </button>
                    )}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-3">{actions}</div>
                    {showCta && (
                        <button onClick={start} className="hidden sm:inline-flex px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition">
                            {ctaLabel ?? (session ? "Get Audit" : "Sign In")}
                        </button>
                    )}
                    {session && <div className="hidden md:block"><UserMenu session={session} /></div>}
                    <button className="lg:hidden p-2 -mr-2 text-slate-700 hover:text-slate-900" onClick={() => setMobileOpen((o) => !o)} aria-label="Toggle menu">
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="lg:hidden border-t border-slate-200 bg-white px-4 pb-6 pt-3 max-h-[calc(100vh-4rem)] overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
                    {mobileActions && <div className="flex flex-col gap-2 pb-3 mb-3 border-b border-slate-200">{mobileActions}</div>}
                    <div className="flex flex-col">
                        <Link href="/" onClick={goHome} className="py-3 text-base font-medium text-slate-800 border-b border-slate-100">Home</Link>
                        {SECTION_LINKS.map((l) => (
                            <a key={l.id} href={`/#${l.id}`} onClick={(e) => goSection(e, l.id)} className="py-3 text-base font-medium text-slate-800 border-b border-slate-100">{l.label}</a>
                        ))}
                        {session && (
                            <button onClick={reports} className="py-3 text-left text-base font-medium text-blue-600 border-b border-slate-100 inline-flex items-center gap-2">
                                <FileText className="w-4 h-4" /> My Reports
                            </button>
                        )}
                    </div>
                    <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Legal</div>
                    <div className="flex flex-col">
                        {LEGAL_LINKS.map((l) => (
                            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                                className={`py-2.5 text-sm ${pathname === l.href ? "text-blue-600 font-medium" : "text-slate-600"}`}>{l.label}</Link>
                        ))}
                    </div>
                    {showCta && (
                        <button onClick={start} className="mt-5 w-full py-3 bg-blue-600 text-white rounded-lg font-semibold">
                            {ctaLabel ?? (session ? "Get Audit" : "Sign In")}
                        </button>
                    )}
                    {session && (
                        <button onClick={() => { setMobileOpen(false); signOut(); }} className="mt-2 w-full py-3 rounded-lg border border-slate-200 text-slate-700 font-medium">
                            Sign Out
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
