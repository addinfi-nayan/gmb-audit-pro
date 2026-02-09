"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ThemeToggle } from "../components/ThemeToggle";

// ==========================================
//  PART 1: THE CYBER-CORE LANDING PAGE
// ==========================================

const FAQItem = ({ q, a }: { q: string, a: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-[#0B1120] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
            >
                <h3 className="text-base font-bold text-gray-200 pr-8">{q}</h3>
                <svg className={`w-5 h-5 text-blue-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div className={`px-4 text-gray-400 text-sm leading-relaxed transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 pb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                {a}
            </div>
        </div>
    );
};

interface LandingProps {
    onStart: () => void;
}

const LandingPage = ({ onStart }: { onStart: () => void }) => {

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
    const [profileCount, setProfileCount] = useState(470);
    const [issueCount, setIssueCount] = useState(1890);
    const [mounted, setMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { data: session } = useSession();

    useEffect(() => {
        setMounted(true);
        // 1. Initial wait, then add "Daily Batch"
        const initialBatchTimer = setTimeout(() => {
            const randomIncrease = Math.floor(Math.random() * 6) + 10;
            setProfileCount(prev => prev + randomIncrease);
            setIssueCount(prev => prev + (randomIncrease * 4));
        }, 2500);

        // 2. Slow "Live" drip
        const liveDripInterval = setInterval(() => {
            setProfileCount(prev => prev + 1);
            setIssueCount(prev => prev + Math.floor(Math.random() * 5));
        }, 12000);

        return () => {
            clearTimeout(initialBatchTimer);
            clearInterval(liveDripInterval);
        };
    }, []);

    if (!mounted) return null; // Prevent hydration mismatch
    return (
        <div className="min-h-screen bg-[#030712] text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden relative flex flex-col justify-between">

            {/* --- GLOBAL BACKGROUND --- */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#030712,transparent)]"></div>
            </div>

            {/* --- NAVBAR --- */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-lg md:text-xl font-bold tracking-tight text-gray-100">GMB<span className="text-blue-500">Audit</span>Pro</span>
                    </div>
                    <div className="flex items-center gap-4 md:gap-8 relative">
                        {/* Theme toggle (desktop) */}
                        <div className="hidden md:block">
                            <ThemeToggle />
                        </div>

                        <div className="hidden md:flex items-center gap-8 text-xs font-medium text-gray-400 uppercase tracking-widest">
                            <a href="#benefits" className="hover:text-cyan-400 transition cursor-pointer">Architecture</a>
                            <a href="#protocol" className="hover:text-cyan-400 transition cursor-pointer">How It Works</a>
                            <a href="#faq" className="hover:text-cyan-400 transition cursor-pointer">FAQs</a>
                        </div>
                        <button
                            onClick={onStart}
                            className="px-6 py-2 bg-white text-black rounded-full font-bold text-sm transition hover:scale-105"
                        >
                            {session ? "Get Audit" : "Get Started"}
                        </button>
                        {session && (
                            <button
                                onClick={() => signOut()}
                                className="hidden md:inline-flex px-4 py-2 border border-white/10 rounded-full text-sm font-semibold text-gray-300 hover:text-white hover:border-white/30 transition"
                            >
                                Sign Out
                            </button>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden text-gray-300 hover:text-white focus:outline-none"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-[#030712] border-b border-white/10 px-4 py-6 space-y-4 animate-[fadeIn_0.2s_ease-out] flex flex-col items-center text-center">
                        <a
                            href="#benefits"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-sm font-medium text-gray-400 uppercase tracking-widest hover:text-cyan-400 transition"
                        >
                            Architecture
                        </a>
                        <a
                            href="#protocol"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-sm font-medium text-gray-400 uppercase tracking-widest hover:text-cyan-400 transition"
                        >
                            How It Works
                        </a>
                        <a
                            href="#faq"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-sm font-medium text-gray-400 uppercase tracking-widest hover:text-cyan-400 transition"
                        >
                            FAQs
                        </a>
                        {session && (
                            <button
                                onClick={() => { setIsMobileMenuOpen(false); signOut(); }}
                                className="w-full text-sm font-semibold text-gray-300 hover:text-white transition py-3 border-t border-white/10"
                            >
                                Sign Out
                            </button>
                        )}

                        {/* Theme toggle (mobile) */}
                        <div className="pt-4 border-t border-white/10">
                            <ThemeToggle />
                        </div>
                    </div>
                )}
            </nav>

            {/* --- HERO SECTION --- */}
            <main className="relative z-10 pt-24 md:pt-32 text-center flex-grow">
                <div className="max-w-6xl mx-auto px-4 md:px-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] md:text-xs font-mono mb-6 md:mb-8 animate-fade-in-up">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                        SYSTEM V2.4 ONLINE
                    </div>

                    <h1 className="text-4xl md:text-8xl font-bold tracking-tighter mb-6 md:mb-8 leading-[1.1] md:leading-[0.9] text-white">
                        DECODE LOCAL <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-blue-600">
                            SEARCH ALGORITHMS
                        </span>
                    </h1>

                    <p className="text-base md:text-xl text-gray-400 max-w-xl md:max-w-2xl mx-auto mb-8 md:mb-12 font-light leading-relaxed">
                        Analyze ranking vectors, detect competitor weaknesses, and auto-generate
                        strategic growth protocols using enterprise-grade AI.
                    </p>

                    <div className="flex justify-center mb-16 md:mb-24">
                        <button
                            onClick={onStart}
                            className="w-full md:w-auto px-8 md:px-12 py-4 md:py-5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold text-sm tracking-widest uppercase transition shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] flex items-center justify-center gap-3"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Start Auditing
                        </button>
                    </div>
                </div>

                {/* --- SCANNER VISUALIZATION --- */}
                <div className=" terminal-dashboard hidden md:block relative w-full max-w-5xl mx-auto h-[350px] md:h-[400px] border-y border-white/5 bg-[#0B1120]/30 backdrop-blur-sm overflow-hidden mb-20 md:mb-32">
                    <div className="absolute inset-0 flex items-center justify-center scale-75 md:scale-100">
                        {/* Radar Circles */}
                        <div className="w-[600px] h-[600px] border border-white/5 rounded-full absolute"></div>
                        <div className="w-[400px] h-[400px] border border-white/5 rounded-full absolute"></div>
                        <div className="w-[200px] h-[200px] border border-blue-500/20 rounded-full absolute animate-pulse"></div>
                    </div>
                    {/* Moving Grid Line */}
                    <div className="absolute top-0 left-0 w-full h-[4px] bg-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.8)] animate-[scan_4s_ease-in-out_infinite]"></div>

                    {/* Top Right Status Overlay */}
                    <div className="absolute top-4 right-4 md:top-8 md:right-8 text-right font-mono text-xs z-40 opacity-90 pointer-events-none hidden md:block">
                        <div className="text-cyan-500 text-[10px] tracking-[0.2em] mb-1 font-bold">SYSTEM STATUS: OPERATIONAL</div>
                        <div className="text-gray-500 text-[10px] tracking-widest">SCAN ID: 4793-A</div>
                        <div className="text-gray-500 text-[10px] tracking-widest">LATENCY: 12ms</div>
                        <div className="text-cyan-400 text-[10px] mt-1 animate-pulse tracking-widest font-bold">[&gt;] TARGET ACQUIRED</div>
                    </div>

                    {/* Modern Glass Card Overlay */}
                    <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl max-w-sm w-full animate-fade-in-up hidden md:block">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"></path></svg>
                            </div>
                            <div>
                                <div className="text-base font-bold text-white">Live Intelligence</div>
                                <div className="text-xs text-blue-400 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                                    Processing Data
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Sentiment Analysis</span>
                                <span className="text-white font-mono">98%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full w-[98%] rounded-full animate-[shimmer_2s_infinite]"></div>
                            </div>

                            <div className="flex justify-between text-xs text-gray-400 mb-1 mt-3">
                                <span>Competitor Benchmarking</span>
                                <span className="text-white font-mono">Processing...</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full w-[65%] rounded-full animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- LIVE STATS GRID --- */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 mb-24 md:mb-32">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {/* Card 1 */}
                        <div className="bg-[#0B1120] border border-white/10 p-4 md:p-6 rounded-xl hover:border-blue-500/30 transition group">
                            <p className="text-gray-400 text-[10px] md:text-xs font-medium uppercase tracking-wider mb-2">Profiles Analyzed</p>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-3xl md:text-4xl font-bold text-white tabular-nums leading-none">{profileCount.toLocaleString()}</span>
                                <span className="text-blue-500 font-bold text-xl leading-none">+</span>
                            </div>
                            <div className="hidden md:flex items-center gap-2 text-xs text-blue-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                <span>Real-time processing</span>
                            </div>
                        </div>
                        {/* ... other cards (same structure) ... */}
                        <div className="bg-[#0B1120] border border-white/10 p-4 md:p-6 rounded-xl hover:border-purple-500/30 transition group">
                            <p className="text-gray-400 text-[10px] md:text-xs font-medium uppercase tracking-wider mb-2">Issues Detected</p>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-3xl md:text-4xl font-bold text-white tabular-nums leading-none">{issueCount.toLocaleString()}</span>
                                <span className="text-purple-500 font-bold text-xl leading-none">+</span>
                            </div>
                            <div className="hidden md:flex items-center gap-2 text-xs text-purple-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>Critical gaps found</span>
                            </div>
                        </div>
                        <div className="bg-[#0B1120] border border-white/10 p-4 md:p-6 rounded-xl hover:border-green-500/30 transition group">
                            <p className="text-gray-400 text-[10px] md:text-xs font-medium uppercase tracking-wider mb-2">Accuracy Rate</p>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-3xl md:text-4xl font-bold text-white leading-none">99.8</span>
                                <span className="text-green-500 font-bold text-xl leading-none">%</span>
                            </div>
                            <div className="hidden md:flex items-center gap-2 text-xs text-green-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>Verified data sources</span>
                            </div>
                        </div>
                        <div className="bg-[#0B1120] border border-white/10 p-4 md:p-6 rounded-xl hover:border-cyan-500/30 transition group">
                            <p className="text-gray-400 text-[10px] md:text-xs font-medium uppercase tracking-wider mb-2">Hrs Saved</p>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-3xl md:text-4xl font-bold text-white leading-none">4.5</span>
                                <span className="text-cyan-500 font-bold text-xl leading-none">hrs</span>
                            </div>
                            <div className="hidden md:flex items-center gap-2 text-xs text-cyan-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>vs Manual Auditing</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- BENEFITS & PROTOCOL SECTIONS --- */}
                <section id="benefits" className="py-20 md:py-32 relative border-t border-white/5 overflow-hidden">
                    {/* Background Tech Elements */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="text-center mb-20">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-400 text-xs font-mono mb-6">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                                SYSTEM ARCHITECTURE V2.0
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Propulsion Engine</span></h2>
                            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Our proprietary stack processes 50+ ranking signals to launch your profile to the top of local search grids.</p>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
                            {/* Left Column - Features */}
                            <div className="flex-1 space-y-6 w-full">
                                {[
                                    { title: "Sentiment Decoding", desc: "NLP algorithms parse review text to identify specific service complaints.", icon: "🧠", color: "text-pink-400", border: "group-hover:border-pink-500/30" },
                                    { title: "Competitor Matrix", desc: "Real-time benchmarking against top 3 local rivals to expose weakness.", icon: "⚔️", color: "text-red-400", border: "group-hover:border-red-500/30" },
                                    { title: "Ranking Vectors", desc: "Reverse-engineering local search signals for maximum visibility.", icon: "📊", color: "text-green-400", border: "group-hover:border-green-500/30" }
                                ].map((item, i) => (
                                    <div key={i} className={`bg-[#0B1120]/80 backdrop-blur-sm p-6 rounded-xl border border-white/5 transition-all group hover:translate-x-2 ${item.border}`}>
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-lg bg-white/5 border border-white/10 text-2xl ${item.color}`}>{item.icon}</div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-100 mb-1 group-hover:text-white transition">{item.title}</h3>
                                                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Center - Rocket Animation */}
                            <div className="relative w-full max-w-sm flex justify-center py-10 lg:py-0">
                                <div className="relative w-64 h-64 md:w-80 md:h-80 border border-white/10 rounded-full flex items-center justify-center bg-[#0B1120]/50 backdrop-blur-md shadow-[0_0_50px_-10px_rgba(6,182,212,0.2)]">
                                    <div className="absolute inset-0 border border-dashed border-white/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                                    <div className="absolute inset-4 border border-white/5 rounded-full"></div>

                                    {/* Rocket Container */}
                                    <div className="relative z-10 animate-[bounce_3s_infinite]">
                                        <div className="text-7xl md:text-8xl filter drop-shadow-[0_0_20px_rgba(59,130,246,0.5)] transform -rotate-45">🚀</div>
                                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-16 bg-gradient-to-t from-transparent to-orange-500/80 blur-md rounded-full"></div>
                                    </div>

                                    {/* Orbiting Elements */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#030712] px-3 py-1 rounded-full border border-cyan-500/30 text-cyan-400 text-[10px] font-mono shadow-lg tracking-widest">SCANNING</div>
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-[#030712] px-3 py-1 rounded-full border border-green-500/30 text-green-400 text-[10px] font-mono shadow-lg tracking-widest">OPTIMIZING</div>
                                </div>
                            </div>

                            {/* Right Column - Features */}
                            <div className="flex-1 space-y-6 w-full">
                                {[
                                    { title: "Growth Protocol", desc: "Auto-generated 4-week action plan prioritized by impact probability.", icon: "📈", color: "text-purple-400", border: "group-hover:border-purple-500/30" },
                                    { title: "Grid Triangulation", desc: "Hyper-local proximity analysis to dominate neighborhood search.", icon: "📍", color: "text-yellow-400", border: "group-hover:border-yellow-500/30" },
                                    { title: "Conversion Heuristics", desc: "Traffic pattern optimization to turn views into paying customers.", icon: "💎", color: "text-cyan-400", border: "group-hover:border-cyan-500/30" }
                                ].map((item, i) => (
                                    <div key={i} className={`bg-[#0B1120]/80 backdrop-blur-sm p-6 rounded-xl border border-white/5 transition-all group lg:hover:-translate-x-2 hover:translate-x-2 ${item.border}`}>
                                        <div className="flex items-start gap-4 flex-row lg:flex-row-reverse text-left lg:text-right">
                                            <div className={`p-3 rounded-lg bg-white/5 border border-white/10 text-2xl ${item.color}`}>{item.icon}</div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-100 mb-1 group-hover:text-white transition">{item.title}</h3>
                                                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section id="protocol" className="py-20 md:py-32 bg-[#0B1120]/30 border-t border-white/5">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row gap-12 items-center">
                            <div className="flex-1">
                                <div className="inline-block text-cyan-500 font-mono text-xs tracking-widest mb-4 border border-cyan-500/20 px-2 py-1 rounded bg-cyan-500/10">OPERATIONAL PROTOCOL</div>
                                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-white">Precision Auditing in <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">3 Simple Steps</span></h2>
                                <p className="text-gray-400 mb-8 text-lg">Bypass manual analysis. Our system automates the data collection and strategy formulation process.</p>

                                <div className="space-y-8">
                                    {[
                                        { step: "01", title: "Target Identification", desc: "Input your business name. We locate your specific GMB Node ID." },
                                        { step: "02", title: "Deep Scan Analysis", desc: "We extract 2 years of data points and cross-reference with category leaders." },
                                        { step: "03", title: "Strategy Deployment", desc: "Receive a PDF report with exact keywords, fixes, and response scripts." }
                                    ].map((s, i) => (
                                        <div key={i} className="flex gap-4 items-start">
                                            <div className="font-mono text-blue-500 font-bold text-xl opacity-50 leading-none mt-1">{s.step}</div>
                                            <div>
                                                <h4 className="text-white font-bold text-lg">{s.title}</h4>
                                                <p className="text-gray-500 text-sm">{s.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 relative w-full">
                                {/* Abstract Visual - Modern Replacement */}
                                <div className="relative z-10 bg-[#0B1120] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <div className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">System Active</div>
                                            <div className="text-xl font-bold text-white">Audit Protocol</div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 animate-pulse">
                                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Step 1 Visual */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30 text-green-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <div className="flex-1">
                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-green-500 w-full"></div>
                                                </div>
                                                <div className="flex justify-between mt-1">
                                                    <span className="text-xs text-gray-400">Target Identification</span>
                                                    <span className="text-xs text-green-400">Complete</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Step 2 Visual */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-blue-400">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 w-[70%] animate-[shimmer_2s_infinite]"></div>
                                                </div>
                                                <div className="flex justify-between mt-1">
                                                    <span className="text-xs text-gray-400">Deep Scan Analysis</span>
                                                    <span className="text-xs text-blue-400">Processing...</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Step 3 Visual */}
                                        <div className="flex items-center gap-4 opacity-50">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-gray-500">
                                                <span className="text-xs font-bold">03</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="h-2 bg-white/5 rounded-full"></div>
                                                <div className="flex justify-between mt-1">
                                                    <span className="text-xs text-gray-500">Strategy Deployment</span>
                                                    <span className="text-xs text-gray-600">Pending</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -z-10"></div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="faq" className="py-20 md:py-32 border-t border-white/5">
                    <div className="max-w-4xl mx-auto px-6">
                        <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center text-white">Frequently Asked <span className="text-blue-500">Questions</span></h2>
                        <div className="space-y-4">
                            {[
                                { q: "Is this audit really free?", a: "Yes. The initial diagnostic scan and summary report are completely free. We offer a premium unlock for the detailed 4-week execution plan." },
                                { q: "Do I need to give you access to my GMB?", a: "No. We use public data available via Google Maps API. No login credentials or manager access is required." },
                                { q: "How long does the scan take?", a: "Approximately 30-60 seconds depending on the volume of reviews and competitor data we need to process." },
                                { q: "Can I download the report?", a: "Yes, the full report is generated as a high-resolution PDF suitable for presentation to stakeholders or clients." },
                                { q: "How accurate is the competitor analysis?", a: "We use real-time data directly from Google Maps API to ensure 100% accuracy in benchmarking your profile against live competitors." },
                                { q: "Can I audit multiple locations?", a: "Yes. You can run separate audits for each location. For enterprise bulk auditing, please contact our support team." },
                                { q: "What if my business isn't listed?", a: "If your business doesn't appear in the search, ensure it's verified on Google. You can also try searching by your exact Google Maps address." }
                            ].map((item, i) => (
                                <FAQItem key={i} q={item.q} a={item.a} />
                            ))}
                        </div>

                        {/* Contact Section */}
                        <div className="mt-16 pt-10 border-t border-white/5">
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-bold text-white">Still have questions?</h3>
                                <p className="text-gray-400 text-sm mt-2">Our support team is ready to help you optimize your local presence.</p>
                            </div>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                                <a href="mailto:nayan@addinfi.com" className="flex items-center gap-4 bg-[#0B1120] border border-white/5 p-4 rounded-xl hover:border-cyan-500/30 transition group min-w-[250px]">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Support</div>
                                        <div className="text-sm font-bold text-gray-200 group-hover:text-cyan-400 transition">nayan@addinfi.com</div>
                                    </div>
                                </a>

                                <a href="tel:+918381032114" className="flex items-center gap-4 bg-[#0B1120] border border-white/5 p-4 rounded-xl hover:border-green-500/30 transition group min-w-[250px]">
                                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 group-hover:scale-110 transition">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Call Us</div>
                                        <div className="text-sm font-bold text-gray-200 group-hover:text-green-400 transition">+91 83810 32114</div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- FINAL CTA --- */}
                <div className="max-w-3xl mx-auto px-6 text-center mb-10">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 md:mb-8">Ready to deploy?</h2>
                    <p className="text-gray-400 mb-8 md:mb-10 text-sm md:text-base">Access the full suite of auditing tools. No credit card required for initial diagnostics.</p>
                    <button
                        onClick={onStart}
                        className="w-full md:w-auto px-16 py-5 bg-white text-black rounded-xl font-bold text-lg hover:scale-105 transition shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)]"
                    >
                        Start Auditing
                    </button>
                </div>

            </main>

            <footer className="border-t border-white/5 py-12 text-center relative z-10 bg-[#02040a]">
                <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-[10px] md:text-xs font-mono text-gray-400">ALL SYSTEMS OPERATIONAL</span>
                </div>
                <p className="text-gray-600 text-[10px] md:text-xs font-mono">&copy; {new Date().getFullYear()} ADDINFI DIGITECH PVT. LTD. // SECURE CONNECTION</p>
            </footer>
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
    "Letting the competitor insights simmer...",
    "Brewing your growth strategy...",
    "Adding the final garnish...",
    "Serving up your report hot & fresh!"
];

// --- ICONS ---
const SearchIcon = () => (<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>);
const MapPinIcon = () => (<svg className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>);
const StarIcon = () => (<svg className="w-3 h-3 text-yellow-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>);
const ErrorIcon = () => (<svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>);
const LockIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>);
const ChartIcon = () => (<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"></path></svg>);
const TrophyIcon = () => (<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>);
const ListIcon = () => (<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>);
const BookIcon = () => (<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>);

// --- HOOK: DEBOUNCE ---
function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

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
    {
        key: "listing_age",
        label: "Profile Authority",
        getValue: (entry: any) => parseNumber(entry?.listing_age),
        display: (entry: any) => entry?.listing_age || "N/A",
    },
];

const buildComparisonEntities = (report: any) => {
    const comparisonCompetitors = report?.matrix?.competitors?.slice(0, 2) ?? [];
    return [
        {
            key: "me",
            label: "You",
            data: report?.matrix?.me,
            textClass: "text-cyan-400",
            barClass: "bg-cyan-500",
        },
        ...comparisonCompetitors.map((competitor: any, index: number) => ({
            key: `competitor-${index}`,
            label: competitor?.title || `Competitor ${index + 1}`,
            data: competitor,
            textClass: index === 0 ? "text-purple-400" : "text-indigo-400",
            barClass: index === 0 ? "bg-purple-500" : "bg-indigo-500",
        })),
    ];
};

// --- MAIN PAGE COMPONENT ---
export default function Page() {
    const { data: session, status } = useSession();
    const [view, setView] = useState<"landing" | "dashboard">("landing");

    // 1. Fix "Invalid Hook Call": Ensure no hooks are outside this function
    if (status === "loading") return <div className="min-h-screen bg-[#030712]" />;

    const handleStartAction = () => {
        if (!session) {
            signIn("google");
        } else {
            setView("dashboard");
        }
    };

    // 2. Fix "Property onHome does not exist": 
    // We pass the setView function down so the sub-components can change the view
    if (view === "dashboard" && session) {
        return <DashboardLogic onHome={() => setView("landing")} />;
    }

    return <LandingPage onStart={handleStartAction} />;
}

interface DashboardProps {
    onHome: () => void;
}
// --- DASHBOARD COMPONENT ---
function DashboardLogic({ onHome }: DashboardProps) {
    const { data: session } = useSession();
    const reportRef = useRef<HTMLDivElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // STATE
    const [step, setStep] = useState(1);
    const [myQuery, setMyQuery] = useState("");
    const [compQuery, setCompQuery] = useState("");
    const debouncedMyQuery = useDebounce(myQuery, 400);
    const debouncedCompQuery = useDebounce(compQuery, 400);

    const [mySuggestions, setMySuggestions] = useState<any[]>([]);
    const [compSuggestions, setCompSuggestions] = useState<any[]>([]);

    const [myBusiness, setMyBusiness] = useState<any>(null);
    const [competitors, setCompetitors] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

    const [downloading, setDownloading] = useState(false);
    const [report, setReport] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // PAYMENT / COUPON STATE
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [couponError, setCouponError] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- NEW: LEAD CAPTURE STATE ---
    const [showLeadModal, setShowLeadModal] = useState(false);
    const [leadData, setLeadData] = useState({ email: "", phone: "" });

    // --- LOADER EFFECT ---
    useEffect(() => {
        if (!loading) { setLoadingMsgIndex(0); return; }
        const interval = setInterval(() => {
            setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [loading]);

    // --- GATEKEEPER LOGIC ---
    const handleRestrictedAction = () => {
        // If we already have their email, go straight to payment/coupon
        if (leadData.email) {
            setShowPaymentModal(true);
        } else {
            // Otherwise, ask for lead info first
            setShowLeadModal(true);
        }
    };

    // --- UPDATED RESET HANDLER ---
    const handleReset = () => {
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

        // 3. Clear User & Gate Data (This wipes the email/phone)
        setLeadData({ email: "", phone: "" });
        setIsUnlocked(false);

        // 4. Close any open modals just in case
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

    const comparisonEntities = useMemo(() => {
        return buildComparisonEntities(report);
    }, [report]);

    const comparisonMetrics = useMemo(() => COMPARISON_METRICS, []);

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true); // 1. Start Loader

        const payload = {
            email: leadData.email,
            phone: leadData.phone,
            business: myBusiness?.title || "Unknown Business",
            date: new Date().toLocaleString()
        };

        try {
            // Send data (happens in background during the delay)
            await axios.post("https://nnhore.app.n8n.cloud/webhook/save-lead", payload);
            console.log("Lead saved");
        } catch (err) {
            console.error("Error saving lead:", err);
        }

        // 2. Wait 1 Second before transitioning
        setTimeout(() => {
            setIsSubmitting(false);    // Stop Loader
            setShowLeadModal(false);   // Close Lead Form
            setShowPaymentModal(true); // Open Payment/Lock Modal
        }, 300);
    };
    // --- SEARCH EFFECTS ---
    // --- SEARCH EFFECTS (UPDATED FOR SERPER.DEV) ---
    useEffect(() => {
        if (debouncedMyQuery.length < 3) return setMySuggestions([]);
        if (myBusiness) return;
        const fetchMyBiz = async () => {
            try {
                const res = await axios.post("/api/n8n-search", { keyword: debouncedMyQuery });

                // FIX 1: Check for 'places' (Serper format)
                if (res.data.places) {
                    setMySuggestions(res.data.places);
                }
                // Fallback for 'local_results' (SerpApi format)
                else if (res.data.local_results) {
                    setMySuggestions(res.data.local_results);
                }
                else if (Array.isArray(res.data)) {
                    setMySuggestions(res.data);
                }
            } catch (e) { console.error(e); }
        };
        fetchMyBiz();
    }, [debouncedMyQuery]);

    useEffect(() => {
        if (debouncedCompQuery.length < 3) return setCompSuggestions([]);
        const fetchComp = async () => {
            try {
                const res = await axios.post("/api/n8n-search", { keyword: debouncedCompQuery });

                // FIX 1: Check for 'places' here too
                if (res.data.places) {
                    setCompSuggestions(res.data.places);
                }
                else if (res.data.local_results) {
                    setCompSuggestions(res.data.local_results);
                }
                else if (Array.isArray(res.data)) {
                    setCompSuggestions(res.data);
                }
            } catch (e) { console.error(e); }
        };
        fetchComp();
    }, [debouncedCompQuery]);

    // Analyse

    const handleAnalyze = async () => {
        setLoading(true);
        setErrorMsg(null);
        setReport(null);

        // 1. Smart Keyword Logic
        const finalKeyword = compQuery.trim() ? compQuery : (myBusiness?.title || "Digital Marketing Agency");
        console.log("Starting Analysis with Keyword:", finalKeyword);

        try {
            // 2. Direct Connection to n8n
            const webhookUrl = "https://nnhore.app.n8n.cloud/webhook/analyze-gmb";

            const res = await axios.post(webhookUrl, {
                keyword: finalKeyword,
                myBusiness: myBusiness,
                competitors: competitors,
                action: "analyze"
            });

            // --- NEW: THE CLEANING LOGIC ---
            let rawData = res.data;
            let finalReport = null;

            // Scenario A: It came back as an Array (Common with n8n AI Agent)
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
                finalize();
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
            generatePDF();
        } else {
            handleRestrictedAction(); // <--- WAS: setShowPaymentModal(true)
        }
    };

    // --- PDF GENERATION ---
    // --- UPDATED PDF GENERATION (Desktop Layout Fix) ---
    const generatePDF = async () => {
        if (!reportRef.current) return;
        setDownloading(true);

        // 1. Force scroll to top to capture everything
        window.scrollTo(0, 0);
        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
            const element = reportRef.current;

            // 2. Capture with forced Desktop Width (1440px)
            const canvas = await html2canvas(element, {
                scale: 2, // High resolution
                useCORS: true,
                allowTaint: true,
                scrollY: 0,
                windowWidth: 1440, // <--- FORCES DESKTOP LAYOUT
                width: 1440,       // <--- ENSURES CONTAINER IS WIDE
                backgroundColor: "#030712", // Match your background color
                onclone: (clonedDoc) => {
                    // Optional: Force the cloned element to be full width
                    const clonedElement = clonedDoc.getElementById('report-content');
                    if (clonedElement) {
                        clonedElement.style.width = '1440px';
                        clonedElement.style.padding = '40px';
                    }
                }
            });

            // 3. Calculate PDF dimensions (Dynamic Height to fit content)
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // A4 Width in mm
            const pageHeight = 295; // A4 Height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // 4. Generate PDF (Standard A4 Format)
            // If content is very long, this creates a long scrolling PDF (User friendly)
            const pdf = new jsPDF('p', 'mm', [imgWidth, imgHeight]);

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`${myBusiness?.title || 'GMB'}_Audit_Report.pdf`);

        } catch (err) {
            console.error("PDF Error", err);
            alert("Failed to generate PDF.");
        }
        setDownloading(false);
    };

    const toggleCompetitor = (place: any) => {
        const uniqueId = place.place_id || place.cid;
        if (!uniqueId) return;

        const isSelected = competitors.find(c => (c.place_id || c.cid) === uniqueId);

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
                    <div className="bg-black/60 p-3 rounded-full border border-cyan-500/50 text-cyan-400 group-hover:text-white group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                        <LockIcon />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`bg-[#030712] font-sans text-white flex flex-col justify-between ${step === 1 ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
            <div className="mx-auto w-full max-w-[95rem] bg-[#030712] shadow-none flex-grow relative flex flex-col">

                {/* HEADER */}
                {/* HEADER / NAVBAR */}
                <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl">
                    <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">

                        {/* Logo (Clicking also goes home) */}
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = "/"}>
                            <span className="text-lg md:text-xl font-bold tracking-tight text-gray-100">GMB<span className="text-blue-500">Audit</span>Pro</span>
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-4">
                            {/* Theme toggle (dashboard desktop) */}
                            <ThemeToggle />

                            {/* Download Button (Visible only at Step 3) */}
                            {step === 3 && !errorMsg && (
                                <button
                                    onClick={initiateDownload}
                                    disabled={downloading}
                                    data-html2canvas-ignore="true"
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-xs md:text-sm hover:bg-green-700 transition flex items-center gap-2"
                                >
                                    {downloading ? "Generating..." : "Download PDF 📥"}
                                </button>
                            )}

                            {/* Reset Button (Visible only if user has moved past Step 1) */}
                            {step > 1 && (
                                <button
                                    onClick={handleReset}
                                    className="text-xs md:text-sm text-gray-400 hover:text-red-400 font-medium transition"
                                >
                                    Reset
                                </button>
                            )}

                            <div className="flex items-center gap-4">
                                {/* STATE A: Find My Business (Steps 1 & 2) */}
                                {step < 3 && (
                                    <>
                                        <button onClick={onHome} className="text-xs font-bold text-gray-400 uppercase">
                                            Home
                                        </button>
                                    </>
                                )}

                                {/* STATE B: Report is Created (Step 3) */}
                                {step === 3 && (
                                    <>
                                        <button onClick={onHome} className="text-xs font-bold text-gray-400 uppercase">
                                            Home
                                        </button>
                                    </>
                                )}
                                {session && (
                                    <button onClick={() => signOut()} className="text-xs font-bold text-gray-400 uppercase hover:text-white transition">
                                        Sign Out
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <div className="md:hidden flex items-center">
                            <button
                                className="text-gray-300 hover:text-white focus:outline-none"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden bg-[#030712] border-b border-white/10 px-4 py-6 space-y-4 animate-[fadeIn_0.2s_ease-out] flex flex-col items-center text-center">
                            {step === 3 && !errorMsg && (
                                <button
                                    onClick={() => { setIsMobileMenuOpen(false); initiateDownload(); }}
                                    disabled={downloading}
                                    className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-bold text-sm hover:bg-green-700 transition flex items-center justify-center gap-2 mb-4"
                                >
                                    {downloading ? "Generating..." : "Download PDF 📥"}
                                </button>
                            )}

                            {step > 1 && (
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        handleReset();
                                    }}
                                    className="w-full text-center text-sm text-gray-400 hover:text-red-400 font-medium transition py-3 border-b border-white/5"
                                >
                                    Reset Audit
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    window.location.href = "/";
                                }}
                                className="w-full text-center text-sm text-gray-400 hover:text-white font-medium transition py-3"
                            >
                                Home
                            </button>
                            {session && (
                                <button
                                    onClick={() => { setIsMobileMenuOpen(false); signOut(); }}
                                    className="w-full text-center text-sm text-gray-400 hover:text-white font-medium transition py-3"
                                >
                                    Sign Out
                                </button>
                            )}

                            {/* Theme toggle (dashboard mobile) */}
                            <div className="pt-4 border-t border-white/10">
                                <ThemeToggle />
                            </div>
                        </div>
                    )}
                </nav>

                {/* STEP 1: FIND ME */}
                {step === 1 && (
                    <div className="flex-grow flex flex-col items-center justify-center pt-24 pb-12 px-4 animate-[fadeIn_0.5s_ease-out]">
                        <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Find Your Business</h2>
                        <p className="text-gray-400 text-lg mb-10">Search for your GMB profile to start the audit.</p>
                        <div className="relative w-full max-w-2xl">
                            <div className="relative flex items-center">
                                <div className="absolute left-4 text-gray-400"><SearchIcon /></div>
                                <input className="w-full bg-[#0B1120] border border-white/10 pl-12 pr-4 py-5 rounded-xl text-xl text-white placeholder-gray-500 shadow-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition" placeholder="Type business name..." value={myQuery} onChange={e => { setMyQuery(e.target.value); setMyBusiness(null); }} />
                            </div>
                            {mySuggestions.length > 0 && !myBusiness && (
                                <div className="absolute top-full left-0 w-full bg-[#0B1120] border border-white/10 rounded-xl shadow-2xl mt-2 z-50 max-h-80 overflow-y-auto text-left">
                                    {mySuggestions.map((place) => (
                                        <div key={place.place_id} className="p-4 hover:bg-cyan-500/10 cursor-pointer border-b border-white/5 last:border-0 flex justify-between items-start group transition-colors" onClick={() => { setMyBusiness(place); setStep(2); setMyQuery(place.title); setMySuggestions([]); }}>
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1 bg-white/5 p-2 rounded-full group-hover:bg-cyan-500/20 group-hover:text-cyan-400 text-gray-400 transition"><MapPinIcon /></div>
                                                <div>
                                                    <div className="font-bold text-lg text-gray-200 group-hover:text-cyan-400 transition-colors">{place.title}</div>
                                                    <div className="text-sm text-gray-500">{place.address}</div>({place.reviews || place.user_ratings_total || place.ratingCount || 0} reviews)
                                                    <div className="flex items-center gap-2 mt-1"><span className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded text-xs font-bold border border-yellow-500/20"><StarIcon /> {place.rating || "N/A"}</span><span className="text-xs text-gray-500 font-medium">(</span></div>
                                                </div>
                                            </div>
                                            <span className="text-xs bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded group-hover:bg-cyan-500/20 text-cyan-400 font-bold mt-2">SELECT</span>
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
                        <div className="bg-[#0B1120] border border-cyan-500/30 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-4 shadow-[0_0_30px_-10px_rgba(6,182,212,0.15)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[50px] -z-10"></div>
                            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white p-4 rounded-xl shadow-lg shadow-blue-500/20 font-bold text-2xl w-14 h-14 flex items-center justify-center">{myBusiness?.title.charAt(0)}</div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-1">Auditing Target</div>
                                <div className="font-bold text-2xl text-white tracking-tight">{myBusiness?.title}</div>
                                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                                    <span className="flex items-center gap-1 text-sm font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-1 rounded-md"><StarIcon /> {myBusiness?.rating || "N/A"}</span>
                                    <span className="text-sm text-gray-500 font-medium tracking-tight">({myBusiness?.reviews || myBusiness?.user_ratings_total || myBusiness?.ratingCount || 0} reviews)</span>
                                </div>
                            </div>
                            <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium text-gray-400 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition">Change</button>
                        </div>


                        <div className="flex flex-col md:flex-row justify-between items-center mt-12 mb-6 gap-4">
                            <h2 className="text-2xl font-bold text-white text-center md:text-left">Step 2: Add Competitors <span className="text-sm font-normal text-gray-500 ml-2 block md:inline">(Max 2)</span></h2>
                        </div>

                        <div className="relative z-50">
                            <input
                                className="w-full bg-[#0B1120] border border-white/10 p-4 rounded-xl text-lg text-white placeholder-gray-500 focus:border-cyan-500 outline-none transition"

                                // --- NEW: Dynamic Placeholder ---
                                placeholder={competitors.length === 1 ? "You can add one more GMB profile..." : "Search for a competitor..."}

                                value={compQuery}
                                onChange={e => setCompQuery(e.target.value)}
                            />
                            {compSuggestions.length > 0 && (
                                <div className="absolute top-full left-0 w-full bg-[#0B1120] border border-white/10 rounded-xl shadow-2xl mt-2 max-h-60 overflow-y-auto z-50">
                                    {compSuggestions.map((place, i) => {
                                        // FIX: Define the ID once, handling both formats
                                        const uniqueId = place.place_id || place.cid;
                                        const isAdded = competitors.find(c => (c.place_id || c.cid) === uniqueId);

                                        return (
                                            <div
                                                key={uniqueId || i}
                                                onClick={() => toggleCompetitor(place)}
                                                className={`p-4 cursor-pointer border-b border-white/5 flex justify-between items-center transition-colors ${isAdded ? 'bg-green-900/20' : 'hover:bg-white/5'}`}
                                            >
                                                <div className="font-medium text-gray-200 truncate pr-4">{place.title}</div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 whitespace-nowrap">
                                                    <span className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">
                                                        <StarIcon /> {place.rating || "N/A"}
                                                    </span>
                                                </div>
                                                <button className={`ml-auto font-bold text-xs px-3 py-1 rounded whitespace-nowrap border ${isAdded ? 'bg-white/10 border-white/20 text-gray-400' : 'bg-green-500/10 border-green-500/50 text-green-400 hover:bg-green-500/20'}`}>
                                                    {isAdded ? "ADDED ✓" : "+ ADD"}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                            {competitors.map((place) => (
                                <div key={place.place_id} className="p-4 border border-green-500/50 bg-green-500/10 rounded-xl flex justify-between items-center shadow-[0_0_15px_rgba(34,197,94,0.1)] backdrop-blur-sm">
                                    <div className="font-bold text-green-400 truncate pr-2">{place.title}</div>
                                    <button onClick={() => toggleCompetitor(place)} className="text-red-400 hover:bg-red-500/20 p-2 rounded text-sm font-bold flex-shrink-0 transition">✕</button>
                                </div>
                            ))}
                        </div>

                        
                        {competitors.length > 0 && (
                            <div className="flex justify-center pt-4">
                                <button onClick={handleAnalyze} disabled={loading} className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 transition disabled:opacity-50 disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-3 text-sm">
                                    {loading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <span>Generate Audit Report</span>
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
                        <h2 className="text-3xl font-bold text-white mb-4">Report Cannot Be Analyzed</h2>
                        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl max-w-2xl w-full">
                            <p className="text-red-400 font-medium mb-2">Reason for failure:</p>
                            <p className="text-gray-300 font-mono text-sm break-words">{errorMsg}</p>
                        </div>
                        <div className="mt-8 flex gap-4">
                            <button onClick={() => setErrorMsg(null)} className="px-6 py-3 bg-white/10 text-white rounded-lg font-bold hover:bg-white/20 transition">Try Again</button>
                            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">Restart</button>
                        </div>
                    </div>
                )}

                {/* STEP 3: REPORT */}
                {step === 3 && report && !errorMsg && (
                    // WRAPPER REF FOR PDF CAPTURE (UPDATED STYLES FOR PDF MODE)
                    <div ref={reportRef} id="report-content" className="bg-[#030712] pt-24 md:pt-32 px-4 md:px-12 pb-40 min-h-screen text-white">

                        <div className="bg-[#0B1120] border border-white/10 pt-16 pb-24 text-center rounded-xl shadow-2xl mb-12 relative overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="text-sm font-bold tracking-[0.3em] text-cyan-400 uppercase mb-4">Overall Performance</div>
                                <div className="flex items-baseline gap-2">
                                    <div className="text-9xl font-black tracking-tighter text-white">{report.audit_score}<span className="text-5xl text-gray-500">/100</span></div>
                                    <span className="text-xs font-medium text-gray-400 opacity-90 -mt-2">- Powered by Addinfi</span>
                                </div>
                                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-semibold text-gray-400">
                                    <div className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1">0-25 Poor</div>
                                    <div className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1">26-50 Average</div>
                                    <div className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1">51-75 Good</div>
                                    <div className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1">76-100 Excellent</div>
                                </div>
                            </div>
                        </div>

                        <div className="max-w-[95rem] mx-auto space-y-20">

                            {/* ========================================================== */}
                            {/* "NEXUS COMMAND" MASTER DASHBOARD (Complete & Optimized)   */}
                            {/* ========================================================== */}
                            <div className="space-y-6 font-sans text-gray-300">

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                                    {/* LEFT COLUMN: THE REACTOR & INTELLIGENCE (4 Cols) */}
                                    {/* LEFT COLUMN: REACTOR & INTELLIGENCE */}
                                    <div className="lg:col-span-4 flex flex-col gap-6">

                                        {/* 1. AUDIT REACTOR (ALWAYS VISIBLE) */}
                                        <div className="bg-[#0B1120] border border-cyan-500/30 rounded-3xl p-8 relative overflow-hidden shadow-[0_0_50px_-15px_rgba(6,182,212,0.3)] flex flex-col items-center text-center group">
                                            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                            <h3 className="text-cyan-400 font-bold tracking-[0.3em] text-[10px] uppercase mb-6 z-10">System Integrity Score</h3>
                                            <div className="relative z-10 mb-6">
                                                <div className="w-40 h-40 rounded-full border-4 border-cyan-900/50 flex items-center justify-center relative">
                                                    <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent border-l-transparent animate-spin-slow opacity-80"></div>
                                                    <div className="w-32 h-32 rounded-full bg-cyan-900/20 backdrop-blur-md flex flex-col items-center justify-center shadow-inner border border-white/10 relative overflow-hidden">
                                                        {report.audit_score && report.audit_score > 0 ? (
                                                            <span className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] z-20">{report.audit_score}</span>
                                                        ) : (
                                                            <div className="relative z-10 animate-pulse"><svg className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" /></svg></div>
                                                        )}
                                                        <div className="mt-1 relative z-10"><span className="text-[10px] font-bold text-cyan-200 uppercase tracking-widest bg-cyan-900/40 px-2 py-0.5 rounded-full border border-cyan-500/20">Health</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="z-10 flex flex-col gap-2 w-full">
                                                <div className="flex justify-between items-center text-xs px-4 py-2 bg-white/5 rounded-lg border border-white/5"><span className="text-gray-400 uppercase font-bold text-[10px]">Audit Gap</span><span className={`font-mono font-bold ${report.matrix?.me?.audit_gap?.includes("-") ? "text-red-400" : "text-green-400"}`}>{report.matrix?.me?.audit_gap || "N/A"}</span></div>
                                                <div className="flex justify-between items-center text-xs px-4 py-2 bg-white/5 rounded-lg border border-white/5"><span className="text-gray-400 uppercase font-bold text-[10px]">Market Status</span><span className={`font-bold text-[10px] uppercase ${report.matrix?.me?.audit_gap?.includes("-") ? "text-red-400" : "text-green-400"}`}>{report.matrix?.me?.audit_gap?.includes("-") ? "CRITICAL LAG" : "MARKET LEADER"}</span></div>
                                            </div>
                                        </div>

                                        {/* 2. TRUST MATRIX (LOCKED) */}
                                        <div className="relative">
                                            {!isUnlocked && (
                                                <div onClick={() => setShowLeadModal(true)} className="absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-md bg-[#0B1120]/80 rounded-3xl border border-white/10 cursor-pointer group">
                                                    <div className="bg-[#0B1120] p-3 rounded-full border border-cyan-500/30 mb-2 group-hover:scale-110 transition-transform"><LockIcon /></div>
                                                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Trust Matrix Locked</span>
                                                </div>
                                            )}
                                            <div className={`bg-[#0B1120] border border-white/10 rounded-3xl p-6 relative overflow-hidden flex-1 min-h-[200px] ${!isUnlocked ? 'blur-sm opacity-50 grayscale select-none' : ''}`}>
                                                <h3 className="text-gray-500 font-bold tracking-[0.2em] text-[10px] uppercase mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Trust Matrix</h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <div className="flex justify-between text-[10px] uppercase mb-1"><span className="text-white font-bold">Positive Sentiment</span><span className="text-emerald-400">{report.matrix?.me?.sentiment?.match(/\d+/)?.[0] || 0}%</span></div>
                                                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden flex"><div className="bg-emerald-500 h-full" style={{ width: `${report.matrix?.me?.sentiment?.match(/\d+/)?.[0] || 0}%` }}></div><div className="w-1 h-full bg-white relative z-10" style={{ left: `-${100 - (parseInt(report.matrix?.competitors?.[0]?.sentiment?.match(/\d+/)?.[0]) || 50)}%` }}></div></div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="bg-white/5 rounded-xl p-3 border border-white/5"><span className="text-gray-400 text-[9px] uppercase font-bold block mb-1">NPS Score</span><div className="flex items-center gap-2"><span className="text-white font-bold font-mono text-lg">{report.matrix?.me?.nps}</span><span className="text-[9px] text-gray-600">vs {report.matrix?.competitors?.[0]?.nps}</span></div></div>
                                                        <div className="bg-white/5 rounded-xl p-3 border border-white/5"><span className="text-gray-400 text-[9px] uppercase font-bold block mb-1">Keyword Heat</span><div className="flex items-center gap-2"><span className="text-cyan-400 font-bold font-mono text-lg">{report.matrix?.me?.keyword_sentiment || "8.5"}</span><span className="text-[9px] text-gray-600">/ 10</span></div></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* RIGHT: MASTER LEDGER (HALF LOCKED) */}
                                    <div className="lg:col-span-8 bg-[#0B1120] border border-white/10 rounded-3xl overflow-hidden flex flex-col h-full relative">
                                        <div className="px-8 py-6 border-b border-white/10 flex flex-col gap-3 bg-gradient-to-r from-cyan-900/10 to-purple-900/10">
                                            <div>
                                                <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-1">Strategic Comparison</h3>
                                                <p className="text-[10px] text-gray-500 font-mono">LIVE FEED • YOU VS UP TO 2 COMPETITORS</p>
                                            </div>
                                            <div className="flex flex-wrap gap-4">
                                                {comparisonEntities.map((entity) => (
                                                    <div key={entity.key} className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded ${entity.barClass}`}></div>
                                                        <span className={`text-[10px] font-bold uppercase ${entity.textClass}`}>{entity.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar relative">
                                            {comparisonMetrics.map((metric) => {
                                                const values = comparisonEntities.map((entity) => metric.getValue(entity.data));
                                                const maxValue = metric.max ?? Math.max(1, ...values);

                                                return (
                                                    <div key={metric.key} className="space-y-3">
                                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{metric.label}</div>
                                                        <div className="flex flex-wrap items-end gap-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                                                            {comparisonEntities.map((entity, index) => {
                                                                const value = values[index];
                                                                const height = maxValue ? Math.min((value / maxValue) * 100, 100) : 0;

                                                                return (
                                                                    <div key={`${metric.key}-${entity.key}`} className="flex flex-col items-center gap-2 min-w-[90px]">
                                                                        <div className="text-[10px] font-bold uppercase tracking-wide text-gray-500">{entity.label}</div>
                                                                        <div className="flex items-end h-28 w-10 rounded-full bg-gray-800/70 overflow-hidden">
                                                                            <div className={`w-full ${entity.barClass}`} style={{ height: `${height}%` }}></div>
                                                                        </div>
                                                                        <div className="text-xs text-gray-300">{metric.display(entity.data)}</div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                </div>

                                {/* BOTTOM ROW: GROWTH & RISK MODULES */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* MODULE 1: GROWTH PROJECTION */}
                                    <div className="bg-[#0B1120] border border-white/10 rounded-3xl p-6 relative overflow-hidden flex items-center justify-between group hover:border-blue-500/30 transition">
                                        <div>
                                            <h4 className="text-blue-400 font-bold text-[10px] uppercase tracking-widest mb-1">Growth Projection</h4>
                                            <div className="text-3xl font-mono font-bold text-white mb-1">+{report.matrix?.me?.review_growth}</div>
                                            <div className="text-[10px] text-gray-500">New Reviews (30 Days)</div>
                                        </div>
                                        <div className="h-16 w-32 relative">
                                            <div className="absolute bottom-0 left-0 w-full h-px bg-white/10"></div>
                                            <div className="absolute bottom-0 left-0 w-2 h-[20%] bg-blue-900/50 rounded-t"></div>
                                            <div className="absolute bottom-0 left-4 w-2 h-[40%] bg-blue-800/50 rounded-t"></div>
                                            <div className="absolute bottom-0 left-8 w-2 h-[30%] bg-blue-700/50 rounded-t"></div>
                                            <div className="absolute bottom-0 left-12 w-2 h-[60%] bg-blue-600/50 rounded-t"></div>
                                            <div className="absolute bottom-0 left-16 w-2 h-[80%] bg-blue-500 rounded-t shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                        </div>
                                    </div>

                                    {/* MODULE 2: SUSPENSION RISK */}
                                    <div className={`bg-[#0B1120] border rounded-3xl p-6 relative overflow-hidden flex items-center justify-between ${report.matrix?.me?.suspension_risk?.includes("Low") ? "border-green-500/20" : "border-red-500/20"}`}>
                                        <div>
                                            <h4 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-1">Compliance Shield</h4>
                                            <div className={`text-2xl font-bold mb-1 ${report.matrix?.me?.suspension_risk?.includes("Low") ? "text-green-400" : "text-red-400"}`}>
                                                {report.matrix?.me?.suspension_risk}
                                            </div>
                                            <div className="text-[10px] text-gray-500">Name Policy Check</div>
                                        </div>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${report.matrix?.me?.suspension_risk?.includes("Low") ? "border-green-500/30 text-green-500 bg-green-900/10" : "border-red-500/30 text-red-500 bg-red-900/10"}`}>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* EXECUTIVE SUMMARY */}
                            {report.executive_summary && (
                                <div className="max-w-5xl mx-auto">
                                    <div className="bg-[#0B1120] p-8 rounded-xl shadow-2xl border-t-4 border-blue-600 border-x border-b border-white/5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="bg-blue-900/30 text-blue-400 p-2 rounded-lg border border-blue-500/20"><SearchIcon /></span>
                                            <h3 className="font-bold text-gray-100 text-xl uppercase tracking-wide">Executive Summary</h3>
                                        </div>
                                        <ul className="list-disc pl-6 space-y-3 text-gray-300 leading-7 text-base font-medium">
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
                                <div className="bg-[#0B1120] rounded-2xl border border-red-500/20 overflow-hidden flex flex-col">
                                    {/* Header */}
                                    <div className="p-6 border-b border-red-500/10 bg-red-500/5 flex items-center gap-4">
                                        <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20 text-red-500 shadow-[0_0_15px_-3px_rgba(239,68,68,0.4)]">
                                            <ErrorIcon />
                                        </div>
                                        <h3 className="text-lg font-bold text-white tracking-wide uppercase">Your Profile Gaps</h3>
                                    </div>

                                    {/* List Content */}
                                    <div className="p-6 relative flex-grow">
                                        <ul className="space-y-5">
                                            {/* Top 3 Gaps (Always Visible) */}
                                            {report.weaknesses?.slice(0, 3).map((item: string, i: number) => (
                                                <li key={i} className="flex items-start gap-4 group">
                                                    <span className="flex-shrink-0 mt-1 w-5 h-5 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 text-xs font-bold group-hover:bg-red-500 group-hover:text-white transition-colors">✕</span>
                                                    <span className="text-gray-300 text-sm leading-relaxed font-medium group-hover:text-gray-100 transition-colors">{item}</span>
                                                </li>
                                            )) || <p className="text-gray-500 italic px-2">No critical gaps detected.</p>}

                                            {/* Locked Gaps (Blurred) */}
                                            {!isUnlocked && report.weaknesses?.length > 3 && (
                                                <div className="relative mt-2 pt-4 border-t border-dashed border-white/10 cursor-pointer group/lock" onClick={handleRestrictedAction}>
                                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0B1120]/95 z-10 flex flex-col items-center justify-center text-center -mx-6 -mb-6 pb-4">
                                                        <div className="bg-[#0B1120] p-3 rounded-full border border-red-500/30 text-red-400 shadow-[0_0_20px_-5px_rgba(239,68,68,0.4)] group-hover/lock:scale-110 transition-transform mb-2">
                                                            <LockIcon />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest border-b border-red-500/30 pb-0.5">Unlock {report.weaknesses.length - 3} More Gaps</span>
                                                    </div>
                                                    {/* Visual Fake Content */}
                                                    <div className="space-y-4 opacity-30 blur-[2px] pointer-events-none select-none grayscale">
                                                        <li className="flex items-start gap-4"><span className="w-5 h-5 rounded-full bg-red-500/20"></span><span className="h-4 bg-white/10 rounded w-3/4"></span></li>
                                                        <li className="flex items-start gap-4"><span className="w-5 h-5 rounded-full bg-red-500/20"></span><span className="h-4 bg-white/10 rounded w-2/3"></span></li>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Unlocked Remaining Gaps */}
                                            {isUnlocked && report.weaknesses?.slice(3).map((item: string, i: number) => (
                                                <li key={i + 3} className="flex items-start gap-4 group animate-[fadeIn_0.5s_ease-out]">
                                                    <span className="flex-shrink-0 mt-1 w-5 h-5 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 text-xs font-bold group-hover:bg-red-500 group-hover:text-white transition-colors">✕</span>
                                                    <span className="text-gray-300 text-sm leading-relaxed font-medium group-hover:text-gray-100 transition-colors">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* 2. PROFILE WINS CARD (Green/Success Theme) */}
                                <div className="bg-[#0B1120] rounded-2xl border border-green-500/20 overflow-hidden flex flex-col">
                                    {/* Header */}
                                    <div className="p-6 border-b border-green-500/10 bg-green-500/5 flex items-center gap-4">
                                        <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20 text-green-500 shadow-[0_0_15px_-3px_rgba(34,197,94,0.4)]">
                                            <TrophyIcon />
                                        </div>
                                        <h3 className="text-lg font-bold text-white tracking-wide uppercase">Profile Wins</h3>
                                    </div>

                                    {/* List Content */}
                                    <div className="p-6 relative flex-grow">
                                        <ul className="space-y-5">
                                            {/* Top 3 Wins (Always Visible) */}
                                            {report.competitor_strengths?.slice(0, 3).map((item: string, i: number) => (
                                                <li key={i} className="flex items-start gap-4 group">
                                                    <span className="flex-shrink-0 mt-1 w-5 h-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center border border-green-500/20 text-xs font-bold group-hover:bg-green-500 group-hover:text-white transition-colors">✓</span>
                                                    <span className="text-gray-300 text-sm leading-relaxed font-medium group-hover:text-gray-100 transition-colors">{item}</span>
                                                </li>
                                            )) || <p className="text-gray-500 italic px-2">Analyzing competitive advantages...</p>}

                                            {/* Locked Wins (Blurred) */}
                                            {!isUnlocked && report.competitor_strengths?.length > 3 && (
                                                <div className="relative mt-2 pt-4 border-t border-dashed border-white/10 cursor-pointer group/lock" onClick={handleRestrictedAction}>
                                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0B1120]/95 z-10 flex flex-col items-center justify-center text-center -mx-6 -mb-6 pb-4">
                                                        <div className="bg-[#0B1120] p-3 rounded-full border border-green-500/30 text-green-400 shadow-[0_0_20px_-5px_rgba(34,197,94,0.4)] group-hover/lock:scale-110 transition-transform mb-2">
                                                            <LockIcon />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest border-b border-green-500/30 pb-0.5">Unlock All Wins</span>
                                                    </div>
                                                    {/* Visual Fake Content */}
                                                    <div className="space-y-4 opacity-30 blur-[2px] pointer-events-none select-none grayscale">
                                                        <li className="flex items-start gap-4"><span className="w-5 h-5 rounded-full bg-green-500/20"></span><span className="h-4 bg-white/10 rounded w-3/4"></span></li>
                                                        <li className="flex items-start gap-4"><span className="w-5 h-5 rounded-full bg-green-500/20"></span><span className="h-4 bg-white/10 rounded w-2/3"></span></li>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Unlocked Remaining Wins */}
                                            {isUnlocked && report.competitor_strengths?.slice(3).map((item: string, i: number) => (
                                                <li key={i + 3} className="flex items-start gap-4 group animate-[fadeIn_0.5s_ease-out]">
                                                    <span className="flex-shrink-0 mt-1 w-5 h-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center border border-green-500/20 text-xs font-bold group-hover:bg-green-500 group-hover:text-white transition-colors">✓</span>
                                                    <span className="text-gray-300 text-sm leading-relaxed font-medium group-hover:text-gray-100 transition-colors">{item}</span>
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
                                    <div className="flex items-center justify-center gap-4 mb-8">
                                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/20"></div>
                                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                                            <span className="text-xs font-bold text-gray-300 tracking-[0.2em] uppercase">Optimization Protocols</span>
                                        </div>
                                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/20"></div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-6">

                                        {/* 1. REPUTATION MODULE */}
                                        <div className="bg-[#0B1120] rounded-2xl border border-blue-500/20 overflow-hidden relative group hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.2)] transition-all duration-500">
                                            {/* Header */}
                                            <div className="h-1 bg-gradient-to-r from-blue-600 to-cyan-400"></div>
                                            <div className="p-5 border-b border-white/5 bg-blue-900/5 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                        <StarIcon />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white text-sm tracking-wide">REPUTATION</h3>
                                                        <p className="text-[10px] text-blue-400/70 font-mono uppercase">Priority: High</p>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] font-mono text-gray-600 border border-white/5 px-2 py-1 rounded">SYS_01</div>
                                            </div>

                                            {/* Content List */}
                                            <div className="p-5 space-y-6 relative">
                                                {/* Connecting Line */}
                                                <div className="absolute left-[29px] top-8 bottom-8 w-px bg-gradient-to-b from-blue-500/30 to-transparent"></div>

                                                {/* STEP 1 (Always Visible) */}
                                                <div className="relative flex gap-4">
                                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0B1120] border border-blue-500 text-blue-500 flex items-center justify-center z-10 shadow-[0_0_10px_rgba(59,130,246,0.4)] group-hover:scale-110 transition-transform">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-blue-400 text-xs font-bold uppercase mb-1">Immediate Action</h4>
                                                        <p className="text-gray-400 text-sm leading-relaxed">{report.gap_analysis.reputation?.[0]}</p>
                                                    </div>
                                                </div>

                                                {/* LOCKED / UNLOCKED STEPS */}
                                                {isUnlocked ? (
                                                    report.gap_analysis.reputation?.slice(1).map((fix: string, i: number) => (
                                                        <div key={i} className="relative flex gap-4 animate-[fadeIn_0.5s_ease-out]">
                                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0B1120] border border-blue-500/50 text-blue-400/80 flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-blue-400/80 text-xs font-bold uppercase mb-1">Follow-up Protocol</h4>
                                                                <p className="text-gray-400 text-sm leading-relaxed">{fix}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    // LOCKED STATE
                                                    <div className="relative mt-4 pt-4 border-t border-dashed border-white/10 cursor-pointer group/lock" onClick={handleRestrictedAction}>
                                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0B1120]/90 z-0"></div>
                                                        <div className="relative z-10 flex flex-col items-center justify-center py-6 text-center space-y-3">
                                                            <div className="w-10 h-10 rounded-full bg-black/60 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover/lock:scale-110 transition-transform">
                                                                <LockIcon />
                                                            </div>
                                                            <div className="text-xs font-medium text-gray-500 group-hover/lock:text-blue-400 transition-colors">
                                                                2 Advanced Strategies Hidden <br />
                                                                <span className="font-bold underline decoration-blue-500/50 underline-offset-2">Tap to Unlock</span>
                                                            </div>
                                                        </div>
                                                        {/* Fake Blurred Text for Effect */}
                                                        <div className="absolute inset-0 blur-[4px] opacity-30 select-none pointer-events-none grayscale pt-6 pl-10">
                                                            <p className="text-sm text-gray-500">Implement automated SMS review generation...</p>
                                                            <p className="text-sm text-gray-500 mt-2">Filter negative feedback via gateway...</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 2. ENGAGEMENT MODULE */}
                                        <div className="bg-[#0B1120] rounded-2xl border border-purple-500/20 overflow-hidden relative group hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.2)] transition-all duration-500">
                                            <div className="h-1 bg-gradient-to-r from-purple-600 to-pink-400"></div>
                                            <div className="p-5 border-b border-white/5 bg-purple-900/5 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white text-sm tracking-wide">ENGAGEMENT</h3>
                                                        <p className="text-[10px] text-purple-400/70 font-mono uppercase">Priority: Medium</p>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] font-mono text-gray-600 border border-white/5 px-2 py-1 rounded">SYS_02</div>
                                            </div>

                                            <div className="p-5 space-y-6 relative">
                                                <div className="absolute left-[29px] top-8 bottom-8 w-px bg-gradient-to-b from-purple-500/30 to-transparent"></div>

                                                {/* STEP 1 */}
                                                <div className="relative flex gap-4">
                                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0B1120] border border-purple-500 text-purple-500 flex items-center justify-center z-10 shadow-[0_0_10px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-transform">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-purple-400 text-xs font-bold uppercase mb-1">Content Fix</h4>
                                                        <p className="text-gray-400 text-sm leading-relaxed">{report.gap_analysis.engagement?.[0]}</p>
                                                    </div>
                                                </div>

                                                {/* LOCKED / UNLOCKED */}
                                                {isUnlocked ? (
                                                    report.gap_analysis.engagement?.slice(1).map((fix: string, i: number) => (
                                                        <div key={i} className="relative flex gap-4 animate-[fadeIn_0.5s_ease-out]">
                                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0B1120] border border-purple-500/50 text-purple-400/80 flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h7l-1.5-4.5L20 13H13l1.5 4.5L3 10z" /></svg>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-purple-400/80 text-xs font-bold uppercase mb-1">Interaction Boost</h4>
                                                                <p className="text-gray-400 text-sm leading-relaxed">{fix}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="relative mt-4 pt-4 border-t border-dashed border-white/10 cursor-pointer group/lock" onClick={handleRestrictedAction}>
                                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0B1120]/90 z-0"></div>
                                                        <div className="relative z-10 flex flex-col items-center justify-center py-6 text-center space-y-3">
                                                            <div className="w-10 h-10 rounded-full bg-black/60 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] group-hover/lock:scale-110 transition-transform">
                                                                <LockIcon />
                                                            </div>
                                                            <div className="text-xs font-medium text-gray-500 group-hover/lock:text-purple-400 transition-colors">
                                                                2 Content Scripts Hidden <br />
                                                                <span className="font-bold underline decoration-purple-500/50 underline-offset-2">Tap to Unlock</span>
                                                            </div>
                                                        </div>
                                                        <div className="absolute inset-0 blur-[4px] opacity-30 select-none pointer-events-none grayscale pt-6 pl-10">
                                                            <p className="text-sm text-gray-500">Post 3x weekly using high-contrast visuals...</p>
                                                            <p className="text-sm text-gray-500 mt-2">Respond to Q&A within 2 hours...</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 3. RELEVANCE MODULE */}
                                        <div className="bg-[#0B1120] rounded-2xl border border-green-500/20 overflow-hidden relative group hover:shadow-[0_0_30px_-10px_rgba(34,197,94,0.2)] transition-all duration-500">
                                            <div className="h-1 bg-gradient-to-r from-green-600 to-emerald-400"></div>
                                            <div className="p-5 border-b border-white/5 bg-green-900/5 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                                                        <MapPinIcon />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white text-sm tracking-wide">RELEVANCE</h3>
                                                        <p className="text-[10px] text-green-400/70 font-mono uppercase">Priority: Critical</p>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] font-mono text-gray-600 border border-white/5 px-2 py-1 rounded">SYS_03</div>
                                            </div>

                                            <div className="p-5 space-y-6 relative">
                                                <div className="absolute left-[29px] top-8 bottom-8 w-px bg-gradient-to-b from-green-500/30 to-transparent"></div>

                                                {/* STEP 1 */}
                                                <div className="relative flex gap-4">
                                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0B1120] border border-green-500 text-green-500 flex items-center justify-center z-10 shadow-[0_0_10px_rgba(34,197,94,0.4)] group-hover:scale-110 transition-transform">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3zm0 0v6m-6 0h12" /></svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-green-400 text-xs font-bold uppercase mb-1">Keyword Injection</h4>
                                                        <p className="text-gray-400 text-sm leading-relaxed">{report.gap_analysis.relevance?.[0]}</p>
                                                    </div>
                                                </div>

                                                {/* LOCKED / UNLOCKED */}
                                                {isUnlocked ? (
                                                    report.gap_analysis.relevance?.slice(1).map((fix: string, i: number) => (
                                                        <div key={i} className="relative flex gap-4 animate-[fadeIn_0.5s_ease-out]">
                                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0B1120] border border-green-500/50 text-green-400/80 flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12l5 5L20 7" /></svg>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-green-400/80 text-xs font-bold uppercase mb-1">Authority Signal</h4>
                                                                <p className="text-gray-400 text-sm leading-relaxed">{fix}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="relative mt-4 pt-4 border-t border-dashed border-white/10 cursor-pointer group/lock" onClick={handleRestrictedAction}>
                                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0B1120]/90 z-0"></div>
                                                        <div className="relative z-10 flex flex-col items-center justify-center py-6 text-center space-y-3">
                                                            <div className="w-10 h-10 rounded-full bg-black/60 border border-green-500/30 flex items-center justify-center text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)] group-hover/lock:scale-110 transition-transform">
                                                                <LockIcon />
                                                            </div>
                                                            <div className="text-xs font-medium text-gray-500 group-hover/lock:text-green-400 transition-colors">
                                                                2 Geo-Grid Fixes Hidden <br />
                                                                <span className="font-bold underline decoration-green-500/50 underline-offset-2">Tap to Unlock</span>
                                                            </div>
                                                        </div>
                                                        <div className="absolute inset-0 blur-[4px] opacity-30 select-none pointer-events-none grayscale pt-6 pl-10">
                                                            <p className="text-sm text-gray-500">Update secondary categories to match buyer intent...</p>
                                                            <p className="text-sm text-gray-500 mt-2">Embed geo-coordinates in photo metadata...</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}
                            {/* 4-WEEK PLAN - "EXECUTION PHASE" REDESIGN */}
                            {report.four_week_plan && (
                                <div className="mt-16 space-y-8">

                                    {/* Header */}
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                                                <ListIcon />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white tracking-wide">EXECUTION ROADMAP</h3>
                                                <p className="text-xs text-blue-400/60 font-mono uppercase tracking-widest mt-1">4-Phase Deployment Cycle</p>
                                            </div>
                                        </div>
                                        {/* Duration Badge */}
                                        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                            <span className="text-xs font-mono text-gray-300">EST. DURATION: 30 DAYS</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                        {report.four_week_plan.map((week: any, i: number) => {
                                            const isWeekLocked = !isUnlocked && i > 0;
                                            const isCurrent = !isUnlocked && i === 0;

                                            return (
                                                <div key={i} className={`relative bg-[#0B1120] rounded-2xl border transition-all duration-500 group overflow-hidden ${isWeekLocked
                                                    ? 'border-white/5 opacity-60'
                                                    : isCurrent
                                                        ? 'border-blue-500/40 shadow-[0_0_40px_-10px_rgba(59,130,246,0.15)]'
                                                        : 'border-white/10 hover:border-blue-500/30'
                                                    }`}>

                                                    {/* Background Number (Visual Depth) */}
                                                    <div className="absolute -right-4 -top-4 text-[120px] font-black text-white/[0.02] select-none leading-none z-0">
                                                        0{i + 1}
                                                    </div>

                                                    {/* Card Header */}
                                                    <div className="relative z-10 p-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${isWeekLocked
                                                                ? 'bg-gray-800 text-gray-500 border-gray-700'
                                                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                                }`}>
                                                                {isWeekLocked ? 'LOCKED' : 'PHASE ' + (i + 1)}
                                                            </span>
                                                            <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1 bg-black/40 px-2 py-1 rounded">
                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                {week.time_est}
                                                            </span>
                                                        </div>
                                                        <h4 className="text-xl font-bold text-white mb-1">{week.week}</h4>
                                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide truncate opacity-80">{week.focus}</p>
                                                    </div>

                                                    {/* Card Body */}
                                                    <div className="relative z-10 p-6 min-h-[280px]">
                                                        <ul className="space-y-4">
                                                            {!isUnlocked && i === 0 ? (
                                                                // Week 1: Partial View (Teaser)
                                                                <>
                                                                    {week.tasks?.slice(0, Math.ceil(week.tasks.length / 2)).map((task: string, k: number) => (
                                                                        <li key={k} className="flex items-start gap-3">
                                                                            <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                                                                            <span className="text-sm text-gray-300 leading-snug">{task}</span>
                                                                        </li>
                                                                    ))}
                                                                    {/* Unlock Trigger for Week 1 */}
                                                                    <div className="absolute inset-x-0 bottom-0 pt-20 pb-6 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/95 to-transparent flex flex-col items-center justify-end cursor-pointer group/btn" onClick={() => setShowPaymentModal(true)}>
                                                                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/20 border border-blue-500/50 text-blue-400 text-xs font-bold uppercase tracking-wider group-hover/btn:bg-blue-600 group-hover/btn:text-white transition-all shadow-lg">
                                                                            <LockIcon />
                                                                            <span>Unlock Full Plan</span>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            ) : isWeekLocked ? (
                                                                // Weeks 2-4: Completely Blurred
                                                                <div className="h-full flex flex-col items-center justify-center text-center cursor-pointer opacity-50 hover:opacity-100 transition-opacity" onClick={() => setShowPaymentModal(true)}>
                                                                    <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-gray-500 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all">
                                                                        <LockIcon />
                                                                    </div>
                                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-blue-400">Awaiting Clearance</span>
                                                                </div>
                                                            ) : (
                                                                // Unlocked View
                                                                week.tasks?.map((task: string, k: number) => (
                                                                    <li key={k} className="flex items-start gap-3 group/item">
                                                                        <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-cyan-500/50 group-hover/item:bg-cyan-400 transition-colors"></div>
                                                                        <span className="text-sm text-gray-300 leading-snug group-hover/item:text-white transition-colors">{task}</span>
                                                                    </li>
                                                                ))
                                                            )}
                                                        </ul>
                                                    </div>

                                                    {/* Bottom Accent Line (Active Only) */}
                                                    <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${isWeekLocked ? 'w-0' : 'w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600'}`}></div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            {/* GLOSSARY & DISCLAIMER */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-px bg-white/10 flex-1"></div>
                                    <div className="flex items-center gap-3">
                                        <span className="bg-white/5 text-gray-400 p-2 rounded-lg border border-white/10"><BookIcon /></span>
                                        <h3 className="font-bold text-gray-100 text-xl uppercase tracking-wide">Metric Definitions</h3>
                                    </div>
                                    <div className="h-px bg-white/10 flex-1"></div>
                                </div>

                                {/* Definitions Grid */}
                                <div className="bg-[#0B1120] p-8 rounded-2xl shadow-lg border border-white/10">
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6 text-sm">
                                        {METRIC_DEFINITIONS.map((def, i) => (
                                            <div key={i} className="flex flex-col">
                                                <span className="font-bold text-gray-200 mb-1">{def.label}</span>
                                                <span className="text-gray-500 leading-snug">{def.desc}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* LEGAL DISCLAIMER */}
                                <div className="mt-8 p-4 rounded-xl border border-white/5 bg-white/[0.02] text-center">
                                    <p className="text-[10px] text-gray-500 leading-relaxed max-w-4xl mx-auto">
                                        <span className="font-bold text-gray-400 uppercase">Disclaimer:</span> All analysis, insights, and recommendations provided in this report are generated by artificial intelligence. These suggestions are for informational purposes only. Implementation of any strategies is at the sole discretion and risk of the user. We are not liable for any negative outcomes, including but not limited to profile suspension, blacklisting, ranking drops, or loss of data that may occur from applying these recommendations.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* --- GOURMET BREW LOADER --- */}
                {loading && (
                    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030712]/95 backdrop-blur-xl transition-all duration-300 overflow-hidden">

                        {/* Background Atmosphere */}
                        <div className="absolute inset-0 bg-radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.1) 0%, transparent 70%) pointer-events-none"></div>

                        {/* The Brewing Setup */}
                        <div className="relative">

                            {/* 1. Floating "Data Spices" (Falling particles) */}
                            <div className="absolute -top-12 left-0 w-full h-full z-0">
                                <div className="absolute top-0 left-1/4 w-1 h-1 bg-white/40 rounded-full animate-[fall_3s_linear_infinite]"></div>
                                <div className="absolute top-[-10px] left-1/2 w-1.5 h-1.5 bg-amber-300/40 rounded-full animate-[fall_4s_linear_infinite_1s]"></div>
                                <div className="absolute top-[-5px] left-3/4 w-1 h-1 bg-white/30 rounded-full animate-[fall_2.5s_linear_infinite_0.5s]"></div>
                            </div>

                            {/* 2. The Cup */}
                            <div className="relative w-36 h-44 z-10">
                                {/* Handle */}
                                <div className="absolute top-8 -right-5 w-14 h-20 border-[6px] border-white/10 rounded-r-3xl pointer-events-none shadow-lg"></div>

                                {/* Glass Body */}
                                <div className="w-full h-full border-[3px] border-white/20 border-t-0 rounded-b-[3rem] relative overflow-hidden bg-white/5 backdrop-blur-md shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)]">

                                    {/* The Liquid (Coffee/Amber Gradient) */}
                                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#451a03] via-[#92400e] to-[#f59e0b] opacity-95 animate-[fill-up_12s_ease-in-out_forwards] flex flex-col justify-start overflow-visible">
                                        {/* Froth / Foam Layer */}
                                        <div className="w-full h-3 bg-[#fcd34d] absolute top-0 blur-[1px] opacity-80 animate-[wave_2s_linear_infinite]"></div>

                                        {/* Wavy Surface */}
                                        <div className="w-[200%] h-6 bg-white/10 absolute -top-3 animate-[wave_2.5s_linear_infinite] rounded-[50%]"></div>

                                        {/* Vigorously Boiling Bubbles */}
                                        <div className="absolute bottom-0 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-[bubble_1.5s_ease-in_infinite]"></div>
                                        <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-white/20 rounded-full animate-[bubble_2s_ease-in_infinite_0.2s]"></div>
                                        <div className="absolute bottom-0 left-3/4 w-2 h-2 bg-white/30 rounded-full animate-[bubble_1.8s_ease-in_infinite_0.5s]"></div>
                                        <div className="absolute bottom-4 left-1/3 w-1 h-1 bg-amber-200/50 rounded-full animate-[bubble_2.2s_ease-in_infinite_1s]"></div>
                                    </div>
                                </div>

                                {/* Reflection/Shine on Glass */}
                                <div className="absolute top-4 left-3 w-2 h-32 bg-gradient-to-b from-white/20 to-transparent rounded-full blur-[1px]"></div>
                            </div>

                            {/* 3. Heating Element Glow (Bottom) */}
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-orange-500/50 blur-xl rounded-full animate-pulse"></div>

                            {/* 4. Enhanced Steam (Top) */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-3 justify-center z-0">
                                <div className="w-2 h-10 bg-white/10 rounded-full blur-md animate-[steam_2.5s_ease-out_infinite]"></div>
                                <div className="w-2 h-14 bg-white/20 rounded-full blur-md animate-[steam_3s_ease-out_infinite_0.5s]"></div>
                                <div className="w-2 h-8 bg-white/10 rounded-full blur-md animate-[steam_2s_ease-out_infinite_1s]"></div>
                            </div>
                        </div>

                        {/* Text & Status */}
                        <div className="mt-12 text-center relative z-20 space-y-4">
                            <h3 className="text-3xl font-black text-white tracking-tight">
                                BREWING <span className="text-amber-500">INSIGHTS</span>
                            </h3>

                            <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-full inline-block backdrop-blur-md">
                                <p key={loadingMsgIndex} className="text-amber-200 font-mono text-xs tracking-widest uppercase animate-[fade-in-up_0.4s_ease-out]">
                                    <span className="mr-2 animate-spin inline-block">⏳</span>
                                    {LOADING_MESSAGES[loadingMsgIndex]}
                                </p>
                            </div>
                            <div className="mx-auto h-2 w-64 rounded-full bg-white/10 border border-white/10 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 animate-[progress-fill_45s_linear_forwards]" />
                            </div>
                        </div>
                    </div>
                )}

                {/* --- LEAD CAPTURE MODAL --- */}
                {showLeadModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]">
                        <div className="bg-[#0B1120] rounded-2xl shadow-2xl max-w-md w-full p-8 text-center border border-white/10 relative">
                            <button
                                onClick={() => setShowLeadModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
                            >✕</button>

                            <div className="bg-blue-600/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">Save Your Progress</h2>
                            <p className="text-gray-400 mb-6 text-sm">Enter your details to generate the secure download link and proceed to checkout.</p>

                            <form onSubmit={handleLeadSubmit} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-[#020617] border border-white/10 p-3 rounded-xl focus:border-cyan-500 outline-none text-white transition"
                                        placeholder="you@business.com"
                                        value={leadData.email}
                                        onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full bg-[#020617] border border-white/10 p-3 rounded-xl focus:border-cyan-500 outline-none text-white transition"
                                        placeholder="+1 (555) 000-0000"
                                        value={leadData.phone}
                                        onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                                    />
                                </div>
                                {/* UPDATED SUBMIT BUTTON WITH LOADER */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        "Proceed to Unlock →"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                {/* --- PAYMENT MODAL --- */}
                {showPaymentModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                        <div className="bg-[#0B1120] rounded-2xl shadow-2xl max-w-md w-full p-8 text-center border border-white/10 transform transition-all scale-100">
                            <div className="bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                                <LockIcon />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Unlock Full Report</h2>
                            <p className="text-gray-400 mb-6 text-sm">Get immediate access to your comprehensive audit PDF, including competitor data and the 4-week growth plan.</p>

                            <div className="space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 text-sm font-bold">PROMO</div>
                                    <input
                                        type="text"
                                        placeholder="Enter Coupon Code"
                                        className="w-full bg-[#020617] border-2 border-white/10 pl-16 pr-4 py-3 rounded-xl focus:border-cyan-500 outline-none font-mono text-center uppercase text-white"
                                        value={couponCode}
                                        onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
                                    />
                                </div>
                                {couponError && <p className="text-red-500 text-xs font-bold">{couponError}</p>}

                                <button
                                    onClick={handleUnlock}
                                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl font-bold hover:from-blue-500 hover:to-cyan-500 transition shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                                >
                                    Unlock Download 🔓
                                </button>

                                <div className="text-xs text-gray-500 mt-4">
                                    Limited time: Use code <span className="font-mono bg-yellow-500/10 text-yellow-500 px-1 rounded border border-yellow-500/20">first20</span> for free access.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* --- FOOTER FOR BOTH LANDING & DASHBOARD --- */}
            <footer className={`border-t border-white/5 text-center relative z-10 bg-[#02040a] ${step === 1 ? 'py-6' : 'py-12'}`}>
                <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-[10px] md:text-xs font-mono text-gray-400">ALL SYSTEMS OPERATIONAL</span>
                </div>
                <p className="text-gray-600 text-[10px] md:text-xs font-mono">&copy; {new Date().getFullYear()} ADDINFI DIGITECH PVT. LTD. // SECURE CONNECTION</p>
            </footer>
        </div>
    );
} 
