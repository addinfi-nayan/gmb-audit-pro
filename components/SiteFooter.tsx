"use client";
import React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { LEGAL_LINKS, SECTION_LINKS } from "./Navbar";

const SiteFooter = () => (
    <footer className="relative z-10 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
                <Link href="/" className="flex items-center gap-2.5">
                    <span className="text-lg font-bold tracking-tight text-slate-900">What<span className="text-blue-600">My</span>Rank</span>
                </Link>
                <p className="mt-4 text-sm text-slate-600 leading-relaxed max-w-xs">
                    Google Business Profile audits that show exactly why competitors outrank you — and how to catch up.
                </p>
            </div>
            <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Product</div>
                <ul className="space-y-2.5 text-sm">
                    {SECTION_LINKS.map((l) => (
                        <li key={l.id}><a href={`/#${l.id}`} className="text-slate-600 hover:text-blue-600 transition">{l.label}</a></li>
                    ))}
                </ul>
            </div>
            <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Legal</div>
                <ul className="space-y-2.5 text-sm">
                    {LEGAL_LINKS.map((l) => (
                        <li key={l.href}><Link href={l.href} className="text-slate-600 hover:text-blue-600 transition">{l.label}</Link></li>
                    ))}
                </ul>
            </div>
            <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Contact</div>
                <a href="mailto:info@addinfi.com" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition">
                    <Mail className="w-4 h-4" /> info@addinfi.com
                </a>
            </div>
        </div>
        <div className="border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                <span>A product of <a href="https://addinfi.com" target="_blank" rel="noopener" className="font-semibold text-blue-700 hover:underline">Addinfi</a> · &copy; {new Date().getFullYear()} Addinfi Digitech Pvt. Ltd. All rights reserved.</span>
                <span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /> All systems operational</span>
            </div>
        </div>
    </footer>
);

export default SiteFooter;
