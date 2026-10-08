"use client";

import React, { useEffect, useState } from "react";
import {
    ArrowRight, BadgePercent, Briefcase, Building2, CalendarCheck, Camera, Car, ChartColumn, Check, CircleCheck,
    Clock, Download, Dumbbell, FileText, GraduationCap, Hotel, House, MailCheck, Menu, MessageSquareText,
    Scissors, Search, ShieldAlert, Sparkles, Star, Stethoscope, Store, Swords, Target, TicketPercent, TrendingUp,
    Users, Utensils, Wrench, Zap,
} from "lucide-react";

import { AUDIT_PRICE } from "@/lib/seo";

export { AUDIT_PRICE };

type CtaProps = { onStart: () => void; signedIn: boolean };

const ctaLabel = (signedIn: boolean) => (signedIn ? `Get My Audit · ₹${AUDIT_PRICE}` : `Sign In & Get Audit · ₹${AUDIT_PRICE}`);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold tracking-wide uppercase mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        {children}
    </div>
);

const SectionHeading = ({ eyebrow, title, sub, align = "center" }: { eyebrow: string; title: React.ReactNode; sub?: string; align?: "center" | "left" }) => (
    <div className={align === "center" ? "text-center max-w-3xl mx-auto mb-12 md:mb-16" : "max-w-xl mb-10"}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">{title}</h2>
        {sub && <p className="mt-5 text-slate-600 text-base md:text-lg leading-relaxed">{sub}</p>}
    </div>
);

// ------------------------------------------------------------------
// HERO
// ------------------------------------------------------------------

const ROTATING_WORDS = ["outrank you", "get more calls", "win more reviews", "own the Map Pack"];

const RotatingWord = () => {
    const [i, setI] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setI((n) => (n + 1) % ROTATING_WORDS.length), 2600);
        return () => clearInterval(t);
    }, []);
    return (
        <span className="relative inline-block">
            <span key={i} className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 animate-[fadeInOut_2.6s_ease-in-out]">
                {ROTATING_WORDS[i]}
            </span>
            <span className="absolute left-0 right-0 -bottom-1 h-2 md:h-3 bg-blue-100 -z-10 rounded" />
        </span>
    );
};

// Phone mockup of a Google Maps local search, with audit cards floating beside it.
const PhoneHero = () => {
    const listings = [
        { rank: 1, name: "Bright Teeth Clinic", rating: 4.4, reviews: 480, color: "bg-violet-500" },
        { rank: 2, name: "City Dental Hub", rating: 4.2, reviews: 150, color: "bg-amber-500" },
        { rank: 3, name: "Smile Dental Care", rating: 4.6, reviews: 212, color: "bg-blue-600", you: true },
    ];
    const card = "bg-white rounded-2xl border border-slate-200 shadow-[0_18px_40px_-12px_rgba(15,23,42,0.25)]";
    return (
        <div className="relative w-full max-w-[580px] h-[640px] mx-auto lg:ml-auto lg:mr-0" role="img" aria-label="Sample GMB audit: a Google Maps local pack with your audit score, review gap and competitor comparison">
            {/* backdrop device */}
            <div className="absolute left-1/2 -translate-x-[42%] sm:left-auto sm:translate-x-0 sm:right-2 top-14 w-[300px] h-[560px] rounded-[3rem] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.18)_1.5px,transparent_1.5px)] bg-[size:22px_22px]" />
            </div>

            {/* phone */}
            <div className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 top-0 w-[290px] h-[590px] rounded-[2.8rem] bg-slate-900 p-[10px] shadow-2xl">
                <div className="relative w-full h-full rounded-[2.2rem] bg-white overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20 flex items-center justify-center gap-2">
                        <span className="w-10 h-1 rounded-full bg-slate-700" /><span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    </div>

                    {/* map */}
                    <div className="relative h-[210px] bg-[#e8f0e4] overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_46%,#fff_46%,#fff_50%,transparent_50%),linear-gradient(0deg,transparent_58%,#fff_58%,#fff_62%,transparent_62%)]" />
                        <div className="absolute -left-10 top-24 w-[140%] h-3 bg-[#fde68a] rotate-[-14deg]" />
                        <div className="absolute left-6 top-10 w-16 h-10 rounded-md bg-[#cfe3c4]" />
                        <div className="absolute right-6 bottom-6 w-20 h-12 rounded-md bg-[#c7dcf2]" />
                        {[{ l: "24%", t: "72%", c: "bg-violet-500", n: 1 }, { l: "70%", t: "64%", c: "bg-amber-500", n: 2 }, { l: "50%", t: "90%", c: "bg-blue-600", n: 3 }].map((p) => (
                            <div key={p.n} className="absolute -translate-x-1/2 -translate-y-full" style={{ left: p.l, top: p.t }}>
                                <div className={`w-7 h-7 rounded-full rounded-bl-none -rotate-45 ${p.c} flex items-center justify-center shadow-md ring-2 ring-white`}>
                                    <span className="rotate-45 text-[10px] font-bold text-white">{p.n}</span>
                                </div>
                            </div>
                        ))}
                        {/* search bar */}
                        <div className="absolute top-8 left-3 right-3 bg-white rounded-full shadow-md px-3 py-2 flex items-center gap-2 text-[11px] text-slate-700">
                            <Menu className="w-3.5 h-3.5 text-slate-500" />
                            <span className="flex-1">dentist near me</span>
                            <Search className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <div className="absolute top-[72px] left-3 flex gap-1.5">
                            {["Rating ▾", "Open now", "Top rated"].map((c) => (
                                <span key={c} className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[9px] text-slate-600 shadow-sm">{c}</span>
                            ))}
                        </div>
                    </div>

                    {/* results sheet */}
                    <div className="relative -mt-4 rounded-t-2xl bg-white px-3 pt-2">
                        <div className="w-8 h-1 rounded-full bg-slate-300 mx-auto mb-2" />
                        <div className="flex gap-3 text-[9px] font-semibold tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 mb-1">
                            <span className="text-blue-600 border-b-2 border-blue-600 pb-1 -mb-[7px]">MAP PACK</span><span>REVIEWS</span><span>PHOTOS</span><span>UPDATES</span>
                        </div>
                        {listings.map((l) => (
                            <div key={l.rank} className={`flex items-center gap-2.5 py-2.5 border-b border-slate-100 ${l.you ? "bg-blue-50/70 -mx-3 px-3" : ""}`}>
                                <span className={`w-9 h-9 rounded-lg ${l.color} text-white font-bold text-xs flex items-center justify-center shrink-0`}>#{l.rank}</span>
                                <div className="min-w-0 flex-1">
                                    <div className="text-[12px] font-semibold text-slate-900 truncate flex items-center gap-1">
                                        {l.name}{l.you && <span className="px-1 rounded bg-blue-600 text-white text-[8px]">YOU</span>}
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-600">
                                        {l.rating}
                                        <span className="flex">{[0, 1, 2, 3, 4].map((s) => <Star key={s} className={`w-2.5 h-2.5 ${s < Math.round(l.rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />)}</span>
                                        ({l.reviews})
                                    </div>
                                    <div className="text-[9px] text-slate-500">Dental clinic · <span className="text-emerald-600 font-medium">Open</span></div>
                                </div>
                            </div>
                        ))}
                        <div className="mt-3 rounded-xl bg-slate-900 text-white p-2.5 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-cyan-300 shrink-0" />
                            <span className="text-[10px] leading-snug">Best rating in the pack — but ranked <b>#3</b>. See why.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* connector line */}
            <div className="hidden sm:block absolute left-[22px] top-[150px] h-[330px] w-px border-l-2 border-dashed border-blue-200" />

            {/* floating cards */}
            <div className={`hidden sm:block absolute left-0 top-10 w-[230px] p-4 ${card} border-2 border-blue-200 animate-[float_7s_ease-in-out_infinite]`}>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold tracking-tight text-slate-900">What<span className="text-blue-600">My</span>Rank</span>
                </div>
                <p className="mt-2 text-sm text-slate-600 leading-snug">Get your full GMB audit in minutes</p>
                <div className="mt-3 flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
                    <span className="text-xs font-bold tracking-wider text-blue-700">AUDIT</span>
                    <Search className="w-4 h-4 text-blue-700" />
                </div>
            </div>

            <div className={`absolute left-0 sm:left-8 top-[470px] sm:top-[196px] w-[170px] sm:w-[190px] p-4 ${card}`}>
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-semibold text-blue-600">Results</span>
                <div className="text-xs font-medium text-slate-600">Audit Score</div>
                <div className="flex items-end justify-between mt-1">
                    <span className="text-4xl font-bold text-blue-600 tracking-tight">68<span className="text-lg text-slate-400">/100</span></span>
                    <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><TrendingUp className="w-4 h-4" /></span>
                </div>
            </div>

            <div className={`hidden sm:flex absolute left-10 top-[318px] w-[240px] p-3.5 gap-3 items-start ${card}`}>
                <span className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0"><ShieldAlert className="w-5 h-5" /></span>
                <div>
                    <div className="text-sm font-semibold text-slate-900">Review gap</div>
                    <div className="text-xs text-slate-600 mt-0.5">The #1 listing has <b className="text-red-600">268 more</b> reviews than you.</div>
                </div>
            </div>

            <div className={`hidden sm:block absolute left-4 top-[418px] w-[236px] p-4 ${card}`}>
                <div className="text-sm font-semibold text-slate-900 mb-3">Your top competitors</div>
                <div className="flex gap-3">
                    {[{ n: "Bright Teeth", c: "from-violet-500 to-fuchsia-500", s: 81 }, { n: "City Dental", c: "from-amber-400 to-orange-500", s: 59 }].map((x) => (
                        <div key={x.n} className="flex-1">
                            <div className={`h-12 rounded-lg bg-gradient-to-br ${x.c} flex items-center justify-center text-white text-lg font-bold`}>{x.n[0]}</div>
                            <div className="mt-1.5 text-[11px] font-medium text-slate-800 truncate">{x.n}</div>
                            <div className="text-[10px] text-slate-500">Score {x.s}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={`hidden sm:block absolute left-[120px] top-[556px] w-[200px] p-3 ${card}`}>
                <div className="text-xs font-semibold text-slate-900 mb-2">4-week action plan</div>
                <div className="grid grid-cols-4 gap-1">
                    {[100, 60, 25, 0].map((w, i) => (
                        <div key={i} className="text-center">
                            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-blue-600" style={{ width: `${w}%` }} /></div>
                            <div className="mt-1 text-[9px] text-slate-500">W{i + 1}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const Hero = ({ onStart, signedIn }: CtaProps) => (
    <section className="relative pt-28 md:pt-36 pb-6 md:pb-16 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[720px] bg-gradient-to-b from-blue-50 via-white/40 to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-[1fr_1fr] gap-10 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-medium text-slate-700 mb-6">
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wide">Offer</span>
                    Full GMB audit for just ₹{AUDIT_PRICE}
                    <span className="hidden sm:inline text-slate-300">|</span>
                    <a href="https://addinfi.com" target="_blank" rel="noopener" className="hidden sm:inline text-slate-500 hover:text-blue-700">Powered by <b className="font-semibold text-blue-700">Addinfi</b></a>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-slate-900">
                    <span className="block text-sm md:text-base font-semibold tracking-[0.18em] uppercase text-blue-600 mb-4">GMB Audit Tool for Google Business Profiles</span>
                    Find out why competitors <br className="hidden sm:block" />
                    <RotatingWord /> <br className="hidden sm:block" />
                    on Google Maps.
                </h1>

                <p className="mt-6 text-base md:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                    WhatMyRank is a GMB audit tool that checks your Google Business Profile against your top local
                    competitors on Google Maps. In minutes you get a scored GBP audit report, the ranking gaps holding
                    you back, and a 4-week plan to close them.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                    <button
                        onClick={onStart}
                        className="group inline-flex items-center justify-center gap-2 px-7 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-base shadow-lg shadow-blue-600/20 transition"
                    >
                        {ctaLabel(signedIn)}
                        <ArrowRight className="w-4 h-4 transition group-hover:translate-x-0.5" />
                    </button>
                    <a href="#inside" className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 rounded-xl font-semibold text-base transition">
                        <FileText className="w-4 h-4" /> See what&apos;s inside
                    </a>
                </div>

                <ul className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto lg:mx-0 text-sm text-slate-600">
                    {["One-time payment", "Report in minutes", "PDF + email copy"].map((t) => (
                        <li key={t} className="flex items-center justify-center lg:justify-start gap-2">
                            <CircleCheck className="w-4 h-4 text-emerald-600 shrink-0" /> {t}
                        </li>
                    ))}
                </ul>
            </div>

            <PhoneHero />
        </div>
    </section>
);

// ------------------------------------------------------------------
// INDUSTRY STRIP
// ------------------------------------------------------------------

const INDUSTRIES = [
    { icon: Stethoscope, label: "Clinics & Doctors" }, { icon: Utensils, label: "Restaurants & Cafés" },
    { icon: Scissors, label: "Salons & Spas" }, { icon: House, label: "Real Estate" },
    { icon: Store, label: "Retail Stores" }, { icon: Dumbbell, label: "Gyms & Fitness" },
    { icon: Car, label: "Auto Services" }, { icon: GraduationCap, label: "Coaching Institutes" },
    { icon: Hotel, label: "Hotels & Stays" }, { icon: Wrench, label: "Home Services" },
    { icon: Briefcase, label: "Agencies & Consultants" }, { icon: Building2, label: "Multi-location Brands" },
];

export const IndustryStrip = () => (
    <section className="border-y border-slate-200 bg-white py-6 overflow-hidden">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-5">A Google Business Profile audit for every local business</p>
        <div className="relative">
            <div className="absolute left-0 inset-y-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="absolute right-0 inset-y-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />
            <div className="flex w-max animate-marquee gap-3">
                {[...INDUSTRIES, ...INDUSTRIES].map(({ icon: Icon, label }, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 whitespace-nowrap">
                        <Icon className="w-4 h-4 text-blue-600" /> {label}
                    </div>
                ))}
            </div>
        </div>
    </section>
);

// ------------------------------------------------------------------
// STATS BAND
// ------------------------------------------------------------------

export const StatsBand = ({ profileCount, issueCount }: { profileCount: number; issueCount: number }) => {
    const stats = [
        { value: `${profileCount.toLocaleString()}+`, label: "Profiles analysed", icon: ChartColumn },
        { value: `${issueCount.toLocaleString()}+`, label: "Issues detected", icon: ShieldAlert },
        { value: "14", label: "Ranking signals checked", icon: Target },
        { value: "4.5 hrs", label: "Saved vs manual audit", icon: Clock },
    ];
    return (
        <section className="py-14 md:py-20">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 rounded-2xl border border-slate-200 bg-white shadow-sm divide-y lg:divide-y-0 divide-x-0 lg:divide-x divide-slate-200 overflow-hidden [&>*:nth-child(odd)]:border-r [&>*:nth-child(odd)]:border-slate-200 lg:[&>*:nth-child(odd)]:border-r-0">
                    {stats.map(({ value, label, icon: Icon }) => (
                        <div key={label} className="p-6 md:p-8 flex flex-col items-center lg:items-start text-center lg:text-left">
                            <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4"><Icon className="w-5 h-5" /></span>
                            <div className="text-3xl md:text-4xl font-bold text-slate-900 tabular-nums tracking-tight">{value}</div>
                            <div className="mt-1 text-sm text-slate-500">{label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// ------------------------------------------------------------------
// INSIDE THE REPORT
// ------------------------------------------------------------------

const REPORT_SECTIONS = [
    { icon: Target, title: "Overall audit score", desc: "A single 0–100 score showing how strong your profile is today, with a clear Poor → Excellent scale.", tone: "blue" },
    { icon: Swords, title: "Head-to-head competitor matrix", desc: "You vs up to 2 competitors on rating, reviews, velocity, response rate, posts, photos and more.", tone: "violet" },
    { icon: Star, title: "Review & reputation health", desc: "Review velocity, growth, rating trend, sentiment and an AI-estimated NPS for every profile.", tone: "amber" },
    { icon: MessageSquareText, title: "Engagement & posting", desc: "How often you post, how competitors engage, and where your content engine falls behind.", tone: "pink" },
    { icon: Camera, title: "Profile completeness", desc: "Photos, products & services, attributes and categories that Google uses to judge relevance.", tone: "emerald" },
    { icon: ShieldAlert, title: "Suspension risk check", desc: "Flags patterns that commonly lead to Google Business Profile suspensions before they hurt you.", tone: "red" },
    { icon: TrendingUp, title: "9 gaps & 9 wins", desc: "Plain-language list of exactly where you lose to competitors — and where you already beat them.", tone: "cyan" },
    { icon: Sparkles, title: "Gap analysis by pillar", desc: "Fixes grouped into Reputation, Engagement, Relevance and Accessibility, ordered by priority.", tone: "indigo" },
    { icon: CalendarCheck, title: "4-week action plan", desc: "Week-by-week tasks with time estimates so you or your team know exactly what to do next.", tone: "blue" },
];

const TONES: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100", violet: "bg-violet-50 text-violet-600 border-violet-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100", pink: "bg-pink-50 text-pink-600 border-pink-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100", red: "bg-red-50 text-red-600 border-red-100",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-100", indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
};

export const InsideReport = () => (
    <section id="inside" className="py-16 md:py-28 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
            <SectionHeading
                eyebrow="Inside your GMB audit report"
                title={<>Everything a professional Google Business Profile audit covers, <span className="text-blue-600">in one report</span></>}
                sub="Nine sections that explain where your GBP stands, why competitors outrank you on Google Maps, and what to fix first."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {REPORT_SECTIONS.map(({ icon: Icon, title, desc, tone }, i) => (
                    <div key={title} className="group relative rounded-2xl border border-slate-200 bg-white p-6 hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5 transition">
                        <span className="absolute top-5 right-6 text-xs font-mono text-slate-300">{String(i + 1).padStart(2, "0")}</span>
                        <span className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-5 ${TONES[tone]}`}><Icon className="w-5 h-5" /></span>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

// ------------------------------------------------------------------
// METRICS + HOW IT WORKS
// ------------------------------------------------------------------

export const MetricsAndSteps = ({ metrics }: { metrics: { label: string; desc: string }[] }) => {
    const steps = [
        { icon: Search, title: "Search your business", desc: "Type your business name and pick your Google listing — no login to Google or access needed." },
        { icon: Users, title: "Add up to 2 competitors", desc: "Choose the businesses that show up above you in the Map Pack for your key searches." },
        { icon: FileText, title: "Get your scored report", desc: "We analyse every profile and generate your audit, PDF and action plan within minutes." },
    ];
    return (
        <section id="how" className="py-16 md:py-28">
            <div className="max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-14 lg:gap-20 items-start">
                <div>
                    <SectionHeading align="left" eyebrow="How the GMB audit tool works" title={<>Audit your Google Business Profile in <span className="text-blue-600">three steps</span></>} sub="No SEO knowledge, no Google login and no access to your profile needed. Just your business name." />
                    <ol className="relative space-y-4">
                        <div className="absolute left-[27px] top-8 bottom-8 w-px bg-slate-200" />
                        {steps.map(({ icon: Icon, title, desc }, i) => (
                            <li key={title} className="relative flex gap-5 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                                <span className="relative z-10 w-14 h-14 shrink-0 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20"><Icon className="w-6 h-6" /></span>
                                <div>
                                    <div className="text-xs font-semibold text-blue-600 mb-0.5">Step {i + 1}</div>
                                    <h3 className="font-semibold text-slate-900 text-lg">{title}</h3>
                                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{desc}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">Our GBP audit checklist</div>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{metrics.length} ranking signals we score on every profile</h3>
                        </div>
                        <span className="hidden sm:flex w-12 h-12 rounded-xl bg-blue-50 text-blue-600 items-center justify-center"><Zap className="w-6 h-6" /></span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
                        {metrics.map((m) => (
                            <div key={m.label} className="flex gap-3 py-3 border-b border-slate-100">
                                <CircleCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                                <div>
                                    <div className="text-sm font-semibold text-slate-800">{m.label}</div>
                                    <div className="text-xs text-slate-500 leading-relaxed mt-0.5">{m.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

// ------------------------------------------------------------------
// OFFER / PRICING
// ------------------------------------------------------------------

export const Offer = ({ onStart, signedIn }: CtaProps) => {
    const included = [
        "Overall 0–100 audit score", "Matrix vs up to 2 competitors", "14 ranking signals per profile",
        "9 profile gaps & 9 wins", "Gap analysis across 4 pillars", "4-week action plan",
        "Downloadable PDF report", "Copy sent to your email", "Saved in My Reports",
    ];
    const compare = [
        { label: "Time to results", manual: "4–5 hours", us: "Minutes" },
        { label: "Competitors benchmarked", manual: "Usually skipped", us: "Up to 2, side-by-side" },
        { label: "Ranking signals checked", manual: "Varies", us: "All 14, every time" },
        { label: "Prioritised action plan", manual: "Extra cost", us: "Included" },
        { label: "Shareable PDF", manual: "Sometimes", us: "Included" },
    ];
    return (
        <section id="pricing" className="py-16 md:py-28 bg-gradient-to-b from-white to-slate-50 border-y border-slate-200">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <SectionHeading eyebrow="GMB audit pricing" title={<>One audit. One price. <span className="text-blue-600">No subscription.</span></>} sub="Pay once per Google Business Profile audit report. Run a fresh audit whenever you want to measure progress." />

                <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-8 items-stretch">
                    {/* price card */}
                    <div className="relative rounded-3xl bg-blue-950 text-white p-8 md:p-10 overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-500/40 blur-3xl" />
                        <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl" />
                        <div className="relative">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold uppercase tracking-wider">Full GMB Audit Report</span>
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-300/30 text-emerald-300 text-xs font-semibold"><BadgePercent className="w-3.5 h-3.5" /> Launch offer</span>
                            </div>
                            <div className="mt-6 flex items-end gap-2">
                                <span className="text-6xl md:text-7xl font-bold tracking-tight">₹{AUDIT_PRICE}</span>
                                <span className="text-slate-300 mb-3">/ report</span>
                            </div>
                            <p className="mt-2 text-slate-300 text-sm">One-time payment via Razorpay · UPI, cards & netbanking</p>

                            <ul className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-3">
                                {included.map((t) => (
                                    <li key={t} className="flex items-start gap-2.5 text-sm text-slate-100">
                                        <span className="mt-0.5 w-5 h-5 rounded-full bg-blue-500/30 text-blue-200 flex items-center justify-center shrink-0"><Check className="w-3 h-3" /></span>
                                        {t}
                                    </li>
                                ))}
                            </ul>

                            <button onClick={onStart} className="group mt-10 w-full inline-flex items-center justify-center gap-2 px-7 py-4 bg-white text-slate-900 hover:bg-blue-50 rounded-xl font-semibold transition">
                                {ctaLabel(signedIn)} <ArrowRight className="w-4 h-4 transition group-hover:translate-x-0.5" />
                            </button>
                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-300">
                                <TicketPercent className="w-4 h-4" /> Have a coupon code? Apply it at checkout.
                            </div>
                        </div>
                    </div>

                    {/* comparison */}
                    <div className="rounded-3xl bg-white border border-slate-200 p-6 md:p-8 flex flex-col">
                        <h3 className="text-xl font-bold text-slate-900">WhatMyRank vs a manual GMB audit</h3>
                        <p className="text-sm text-slate-500 mt-1">Why owners and agencies switch.</p>
                        <div className="mt-6 rounded-2xl border border-slate-200 overflow-hidden text-sm">
                            <div className="grid grid-cols-[1.2fr_1fr_1fr] bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <div className="px-4 py-3" />
                                <div className="px-4 py-3">Manual</div>
                                <div className="px-4 py-3 text-blue-700 bg-blue-50">WhatMyRank</div>
                            </div>
                            {compare.map((r) => (
                                <div key={r.label} className="grid grid-cols-[1.2fr_1fr_1fr] border-t border-slate-100">
                                    <div className="px-4 py-3 font-medium text-slate-800">{r.label}</div>
                                    <div className="px-4 py-3 text-slate-500">{r.manual}</div>
                                    <div className="px-4 py-3 font-semibold text-slate-900 bg-blue-50/50 flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />{r.us}</div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                            {[{ icon: Download, t: "Instant PDF" }, { icon: MailCheck, t: "Emailed to you" }, { icon: Clock, t: "Ready in minutes" }].map(({ icon: Icon, t }) => (
                                <div key={t} className="rounded-xl border border-slate-200 p-3">
                                    <Icon className="w-5 h-5 mx-auto text-blue-600" />
                                    <div className="mt-1.5 text-xs font-medium text-slate-700">{t}</div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto pt-6">
                            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex items-start gap-3">
                                <Building2 className="w-5 h-5 text-slate-700 mt-0.5 shrink-0" />
                                <p className="text-sm text-slate-600">
                                    <span className="font-semibold text-slate-900">Agency or multi-location brand?</span>{" "}
                                    Write to <a href="mailto:info@addinfi.com" className="text-blue-600 font-medium hover:underline">info@addinfi.com</a> for bulk audits.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// ------------------------------------------------------------------
// AUDIENCE
// ------------------------------------------------------------------

export const Audience = () => {
    const items = [
        { icon: Store, title: "Business owners", desc: "Understand in plain language why the shop down the road gets the calls — and what to fix this month." },
        { icon: TrendingUp, title: "Marketers", desc: "Back up your local SEO recommendations with a competitor benchmark your client or boss can read in 5 minutes." },
        { icon: Briefcase, title: "Agencies & consultants", desc: "Use the audit as a pitch opener or onboarding baseline, then re-run it to prove month-on-month progress." },
    ];
    return (
        <section className="py-16 md:py-28">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <SectionHeading eyebrow="Who uses our GBP audit tool" title={<>Made for people who need <span className="text-blue-600">answers, not dashboards</span></>} />
                <div className="grid md:grid-cols-3 gap-5">
                    {items.map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="rounded-2xl bg-white border border-slate-200 p-7 shadow-sm">
                            <span className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-5"><Icon className="w-5 h-5" /></span>
                            <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
                            <p className="mt-2 text-slate-600 text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// ------------------------------------------------------------------
// FINAL CTA
// ------------------------------------------------------------------

export const FinalCta = ({ onStart, signedIn }: CtaProps) => (
    <section className="px-4 md:px-6 pb-16 md:pb-24">
        <div className="relative max-w-7xl mx-auto rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 px-6 py-14 md:px-16 md:py-20 overflow-hidden text-center">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="relative">
                <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Stop guessing why you&apos;re not in the Map Pack.</h2>
                <p className="mt-5 text-blue-100 text-base md:text-lg max-w-2xl mx-auto">Run your GMB audit today and get your score, your competitor gaps and a 4-week plan — for less than the price of a coffee meeting.</p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={onStart} className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 hover:bg-blue-50 rounded-xl font-semibold text-base transition">
                        {ctaLabel(signedIn)} <ArrowRight className="w-4 h-4 transition group-hover:translate-x-0.5" />
                    </button>
                    <a href="#faq" className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition">Read the FAQ</a>
                </div>
            </div>
        </div>
    </section>
);

// ------------------------------------------------------------------
// GMB AUDIT GUIDE (long-form, search-intent content)
// ------------------------------------------------------------------

const GUIDE = [
    {
        id: "what-is-a-gmb-audit",
        title: "What is a GMB audit?",
        body: (
            <>
                <p>
                    A GMB audit (Google My Business audit, now called a Google Business Profile audit) is a structured review of the
                    listing that shows up when people search for your business or your services on Google Search and Google Maps.
                    It checks whether your profile is complete, active and trusted — and, more importantly, how it stacks up against
                    the businesses that already rank in the local 3-pack.
                </p>
                <p>
                    Most profiles don&apos;t lose rankings because of one big mistake. They slip behind slowly: competitors collect reviews
                    faster, reply to customers sooner, post more often and add more photos. A good GBP audit makes those gaps visible,
                    puts a number on them and tells you which ones to fix first.
                </p>
            </>
        ),
    },
    {
        id: "local-ranking-factors",
        title: "How Google ranks local businesses on Maps",
        body: (
            <>
                <p>Google says local results are based mainly on three factors. A GMB audit tool should measure the ones you can influence:</p>
                <ul>
                    <li><b>Relevance</b> — how well your profile matches the search. Categories, services, products, attributes and your business description drive this.</li>
                    <li><b>Distance</b> — how far your business is from the searcher. You can&apos;t change it, which is why the other two factors matter so much.</li>
                    <li><b>Prominence</b> — how well-known and trusted your business is. Review count, rating, review velocity, responses, photos and activity all feed prominence.</li>
                </ul>
                <p>WhatMyRank scores 14 signals across relevance and prominence for you and your competitors, so you can see exactly where the ranking gap comes from.</p>
            </>
        ),
    },
    {
        id: "gbp-audit-checklist",
        title: "Google Business Profile audit checklist",
        body: (
            <>
                <p>Whether you audit manually or with a tool, these are the checks that move Google Maps rankings the most:</p>
                <ol>
                    <li><b>Primary and secondary categories</b> match the searches you want to rank for.</li>
                    <li><b>Reviews</b>: total count, how many you get each month, rating trend and sentiment compared with competitors.</li>
                    <li><b>Review responses</b>: reply rate and speed — unanswered reviews signal an inactive business.</li>
                    <li><b>Google Posts</b>: regular updates, offers and events keep the profile fresh.</li>
                    <li><b>Photos</b>: owner and customer photos, uploaded consistently.</li>
                    <li><b>Products and services</b>: complete catalogue with keyword-relevant names.</li>
                    <li><b>Attributes, hours and contact details</b>: complete and consistent with your website.</li>
                    <li><b>Suspension risk</b>: keyword-stuffed names, virtual addresses or policy issues that can get a profile suspended.</li>
                </ol>
            </>
        ),
    },
    {
        id: "gmb-audit-vs-local-seo-audit",
        title: "GMB audit vs. a full local SEO audit",
        body: (
            <p>
                A local SEO audit looks at everything that affects local visibility — your website, citations, backlinks and your
                Google Business Profile. A GMB audit zooms in on the profile itself. Because your Google Business Profile is the
                single biggest driver of Map Pack visibility, it&apos;s the fastest place to find wins: most fixes take minutes and need no
                developer.
            </p>
        ),
    },
    {
        id: "what-to-fix-first",
        title: "What to fix first after your audit",
        body: (
            <>
                <p>Start with the gaps that are cheapest to close and have the biggest effect on prominence:</p>
                <ol>
                    <li>Reply to every unanswered review, then keep a 48-hour response habit.</li>
                    <li>Fix categories and add missing services and products.</li>
                    <li>Start a steady review request routine to close the review gap with the leader.</li>
                    <li>Publish at least one Google Post a week and add fresh photos monthly.</li>
                </ol>
                <p>Your WhatMyRank report turns this into a week-by-week plan specific to your profile and competitors.</p>
            </>
        ),
    },
    {
        id: "how-often-to-audit",
        title: "How often should you audit your Google Business Profile?",
        body: (
            <p>
                Run a GBP audit every month while you&apos;re actively optimising, and at least once a quarter after that. Competitors
                don&apos;t stand still, so re-auditing after you finish the 4-week plan is the simplest way to measure progress and
                catch new gaps early.
            </p>
        ),
    },
];

export const AuditGuide = ({ onStart, signedIn }: CtaProps) => (
    <section id="guide" className="py-16 md:py-28 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
            <SectionHeading
                eyebrow="GMB audit guide"
                title={<>The complete guide to auditing your <span className="text-blue-600">Google Business Profile</span></>}
                sub="What a GMB audit is, how Google ranks local businesses, and the checklist we use on every profile."
            />
            <div className="grid lg:grid-cols-[260px_1fr] gap-10 lg:gap-16">
                <aside className="hidden lg:block">
                    <nav aria-label="Guide contents" className="sticky top-28 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">On this page</div>
                        <ol className="space-y-2 text-sm">
                            {GUIDE.map((g, i) => (
                                <li key={g.id}><a href={`#${g.id}`} className="flex gap-2 text-slate-600 hover:text-blue-700"><span className="text-slate-400 tabular-nums">{i + 1}.</span>{g.title}</a></li>
                            ))}
                        </ol>
                        <button onClick={onStart} className="mt-5 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition">
                            {ctaLabel(signedIn)}
                        </button>
                    </nav>
                </aside>
                <article className="max-w-3xl space-y-12 text-slate-700 leading-relaxed [&_p]:mt-4 [&_ul]:mt-4 [&_ol]:mt-4 [&_ul]:space-y-2 [&_ol]:space-y-2 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_b]:text-slate-900">
                    {GUIDE.map((g) => (
                        <div key={g.id} id={g.id} className="scroll-mt-28">
                            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{g.title}</h3>
                            {g.body}
                        </div>
                    ))}
                </article>
            </div>
        </div>
    </section>
);
