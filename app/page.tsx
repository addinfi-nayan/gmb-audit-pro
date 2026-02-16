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

// --- USER MENU COMPONENT ---
const UserMenu = ({ session }: { session: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [imageError, setImageError] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border border-white/10 hover:border-white/30 transition focus:outline-none ring-2 ring-transparent focus:ring-blue-500/50 p-0"
            >
                {session?.user?.image && !imageError ? (
                    <img
                        src={session.user.image}
                        alt="User"
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">
                        {session?.user?.name?.charAt(0) || "U"}
                    </div>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0B1120] border border-white/10 rounded-xl shadow-2xl py-1 z-50 animate-[fadeIn_0.1s_ease-out] backdrop-blur-xl">
                    <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                        <p className="text-sm text-white font-bold truncate">{session?.user?.name}</p>
                        <p className="text-xs text-gray-500 truncate font-mono">{session?.user?.email}</p>
                    </div>
                    <div className="p-1">
                        <button
                            onClick={() => signOut()}
                            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition rounded-lg flex items-center gap-2 group"
                        >
                            <div className="w-6 h-6 rounded-md bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            </div>
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const TESTIMONIALS = [
    { name: "Rahul S", role: "Cafe Owner", text: "Honestly, I was skeptical at first, but the gap analysis opened my eyes. I didn't realize how much traffic I was losing to the guy across the street just because he replied to reviews faster. My weekend footfall is up by 40% now!" },
    { name: "Priya M", role: "Clinic Manager", text: "We were stuck on page 2 for months. This tool pointed out exactly which keywords we were missing in our services section. Updated it, and within 3 weeks, we started popping up in the top 3 pack for 'dentist near me'." },
    { name: "Amit V", role: "Retail Store", text: "Bhai, pehle lagta tha GMB bas set karke chhod dena hai. Is audit ne bataya ki 'Updates' na dalne se ranking gir rahi thi. Ab regular post kar raha hu aur customers khud call kar rahe hain store open hone se pehle!" }, // Hinglish
    { name: "Arjun K", role: "Real Estate", text: "In my line of work, trust is everything. Seeing the 'Reputation Score' drop was a wake-up call. I followed the suggestions to get more detailed reviews from clients, and the difference in lead quality is night and day." },
    { name: "Sneha R", role: "Salon Owner", text: "Mere competitor ke paas 500 reviews the, mere paas bas 50. Mujhe laga kabhi beat nahi kar paungi. But this tool showed me that 'Review Velocity' matters more. Focused on getting 2 reviews every day, and now I'm ranking higher than them!" }, // Hinglish
    { name: "Vikram D", role: "Restaurant", text: "I spent thousands on ads with no luck. This ₹99 report showed me that my menu photos were outdated and categories were wrong. Fixed those basic things, and now Friday nights are fully booked without spending a rupee on ads." },
    { name: "Rohan M", role: "Gym Owner", text: "Simple aur effective tool hai. Sabse best cheez yeh hai ki yeh bata deta hai ki competitor kya kar raha hai jo hum nahi kar rahe. 'Suspension Risk' check karke maine apna profile safe kar liya warna mehnat bekaar jaati." }, // Hinglish
    { name: "Anjali S", role: "Bakery", text: "I used to ignore customer questions on my profile. The audit highlighted 'Response Time' as a critical failure. I started replying within an hour, and suddenly Google started showing my bakery to way more people in the area." },
    { name: "Kabir K", role: "Car Dealer", text: "Seedha report milti hai, koi technical jargon nahi. Mujhe pata chala ki 'Products' section khali hone se mein customers loose kar raha tha. Photos daali aur enquiries double ho gayi. Highly recommended for local businesses." }, // Hinglish
    { name: "Neha G", role: "Dentist", text: "Pehle pata nahi tha kya fix karna hai, bas randomly changes karti thi. Ab step-by-step clear hai. 'Profile Strength' 100% hone ke baad se new patient appointments apne aap badh gaye hain. Best investment for my clinic." } // Hinglish
];

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
    const [profileCount, setProfileCount] = useState(1245);
    const [issueCount, setIssueCount] = useState(4890);
    const [mounted, setMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { data: session } = useSession();

    useEffect(() => {
        setMounted(true);
        // 1. Initial wait, then add small "Daily Batch"
        const initialBatchTimer = setTimeout(() => {
            const randomIncrease = Math.floor(Math.random() * 3) + 2; // +2 to +4
            // Cap at small increment per session (max +10 total)
            setProfileCount(prev => Math.min(prev + randomIncrease, 1245 + 8));
            setIssueCount(prev => prev + (randomIncrease * 4));
        }, 3500);

        // 2. Slow "Live" drip
        const liveDripInterval = setInterval(() => {
            // Cap at +8 max increment total
            setProfileCount(prev => {
                if (prev >= 1245 + 8) return prev;
                return prev + 1;
            });
            setIssueCount(prev => prev + Math.floor(Math.random() * 3));
        }, 15000);

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
                        <span className="text-lg md:text-xl font-bold tracking-tight text-gray-100">What<span className="text-blue-500">My</span>Rank<span className="hidden md:inline"> - GMB</span></span>
                    </div>
                    <div className="flex items-center gap-4 md:gap-8 relative">


                        <div className="hidden md:flex items-center gap-8 text-xs font-medium text-gray-400 uppercase tracking-widest">
                            <a href="#benefits" className="hover:text-cyan-400 transition cursor-pointer">Architecture</a>
                            <a href="#protocol" className="hover:text-cyan-400 transition cursor-pointer">How It Works</a>
                            <a href="#faq" className="hover:text-cyan-400 transition cursor-pointer">FAQs</a>
                        </div>
                        <button
                            onClick={onStart}
                            className="px-6 py-2 bg-white text-black rounded-full font-bold text-sm transition hover:scale-105"
                        >
                            {session ? "Get Audit" : "Sign In"}
                        </button>

















                        {session && (
                            <div className="hidden md:block">
                                <UserMenu session={session} />
                            </div>
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


                    </div>
                )}
            </nav>

            {/* --- HERO SECTION --- */}
            <main className="relative z-10 text-center">
                <div className="max-w-6xl mx-auto px-4 md:px-6 w-full md:min-h-screen flex flex-col justify-center items-center pt-28 pb-12 md:pt-20 md:pb-0 relative">

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-400 text-[10px] md:text-xs font-mono mb-6 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span>
                        POWERED BY ADDINFI
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 md:mb-8 leading-[1.1] text-white max-w-5xl mx-auto">
                        Analyze Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-blue-600">
                            GMB & Competitors
                        </span>
                    </h1>

                    <p className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto mb-8 md:mb-12 font-light leading-relaxed">
                        Your Google Business Profile plays a major role in how customers find you on Google Search and Maps. Our Google Business Profile audit tool gives you a clear, data-driven view of how your GMB is performing and how it compares to your top local competitors.
                    </p>



                    <div className="flex justify-center mb-8 md:mb-24">
                        <button
                            onClick={onStart}
                            className="w-full md:w-auto px-8 md:px-12 py-4 md:py-5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold text-sm tracking-widest uppercase transition shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] flex items-center justify-center gap-3 transform hover:scale-105"
                        >
                            <span className="flex items-center gap-2">
                                {session ? "Get Report At ₹99" : "Sign In & Get Audit At ₹99"}
                            </span>
                        </button>
                    </div>
                </div>

                {/* --- TESTIMONIALS SECTION --- */}
                <section className="py-10 md:py-20 border-t border-white/5 bg-[#0B1120]/30 overflow-hidden mb-12">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-400 text-[10px] md:text-xs font-mono mb-6 backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.6)]"></span>
                            TRUSTED BY 500+ BUSINESSES
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Real Results from <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Local Businesses</span></h2>
                    </div>

                    {/* Infinite Marquee */}
                    <div className="relative w-full flex overflow-hidden group">
                        <div className="flex animate-marquee whitespace-nowrap gap-6 py-4 px-4 hover:[animation-play-state:paused]">
                            {[...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                                <div key={i} className="inline-block w-[350px] bg-[#030712] border border-white/10 p-6 rounded-2xl whitespace-normal hover:border-blue-500/30 transition group hover:-translate-y-1 duration-300">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                            {t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">{t.name}</div>
                                            <div className="text-xs text-blue-400 uppercase tracking-wider font-mono">{t.role}</div>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-sm leading-relaxed italic">"{t.text}"</p>
                                </div>
                            ))}
                        </div>
                        {/* Gradient Fade Edges */}
                        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#030712] to-transparent z-10"></div>
                        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#030712] to-transparent z-10"></div>
                    </div>
                </section>

                {/* --- LIVE STATS GRID (Below Fold) --- */}
                <div className="w-full max-w-7xl mx-auto px-4 md:px-6 mb-12 md:mb-32">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {/* Card 1 */}
                        <div className="bg-[#0B1120] border border-white/10 p-4 md:p-6 rounded-xl hover:border-blue-500/30 transition group flex flex-col items-center justify-center text-center">
                            <p className="text-gray-400 text-[10px] md:text-xs font-medium uppercase tracking-wider mb-2">Profiles Analyzed</p>
                            <div className="flex items-baseline justify-center gap-1 mb-2">
                                <span className="text-3xl md:text-4xl font-bold text-white tabular-nums leading-none">{profileCount.toLocaleString()}</span>
                                <span className="text-blue-500 font-bold text-xl leading-none">+</span>
                            </div>
                            <div className="hidden md:flex items-center justify-center gap-2 text-xs text-blue-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                <span>Real-time processing</span>
                            </div>
                        </div>
                        {/* ... other cards (same structure) ... */}
                        <div className="bg-[#0B1120] border border-white/10 p-4 md:p-6 rounded-xl hover:border-purple-500/30 transition group flex flex-col items-center justify-center text-center">
                            <p className="text-gray-400 text-[10px] md:text-xs font-medium uppercase tracking-wider mb-2">Issues Detected</p>
                            <div className="flex items-baseline justify-center gap-1 mb-2">
                                <span className="text-3xl md:text-4xl font-bold text-white tabular-nums leading-none">{issueCount.toLocaleString()}</span>
                                <span className="text-purple-500 font-bold text-xl leading-none">+</span>
                            </div>
                            <div className="hidden md:flex items-center justify-center gap-2 text-xs text-purple-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>Critical gaps found</span>
                            </div>
                        </div>
                        <div className="bg-[#0B1120] border border-white/10 p-4 md:p-6 rounded-xl hover:border-green-500/30 transition group flex flex-col items-center justify-center text-center">
                            <p className="text-gray-400 text-[10px] md:text-xs font-medium uppercase tracking-wider mb-2">Accuracy Rate</p>
                            <div className="flex items-baseline justify-center gap-1 mb-2">
                                <span className="text-3xl md:text-4xl font-bold text-white leading-none">99.8</span>
                                <span className="text-green-500 font-bold text-xl leading-none">%</span>
                            </div>
                            <div className="hidden md:flex items-center justify-center gap-2 text-xs text-green-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>Verified data sources</span>
                            </div>
                        </div>
                        <div className="bg-[#0B1120] border border-white/10 p-4 md:p-6 rounded-xl hover:border-cyan-500/30 transition group flex flex-col items-center justify-center text-center">
                            <p className="text-gray-400 text-[10px] md:text-xs font-medium uppercase tracking-wider mb-2">Hrs Saved</p>
                            <div className="flex items-baseline justify-center gap-1 mb-2">
                                <span className="text-3xl md:text-4xl font-bold text-white leading-none">4.5</span>
                                <span className="text-cyan-500 font-bold text-xl leading-none">hrs</span>
                            </div>
                            <div className="hidden md:flex items-center justify-center gap-2 text-xs text-cyan-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>vs Manual Auditing</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- BENEFITS & PROTOCOL SECTIONS --- */}
                <section id="benefits" className="py-10 md:py-32 relative border-t border-white/5 overflow-hidden">
                    {/* Background Tech Elements */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="text-center mb-10 md:mb-20">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-400 text-xs font-mono mb-6">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                                COMPREHENSIVE ANALYSIS
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">What You Get in Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">GBP Audit Report</span></h2>
                            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Receive a detailed breakdown of your profile's health and competitive standing.</p>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
                            {/* Left Column - Features */}
                            <div className="flex-1 space-y-6 w-full">
                                {[
                                    { title: "Executive Performance Summary", desc: "Current ranking potential score.", icon: "🧠", color: "text-pink-400", border: "group-hover:border-pink-500/30" },
                                    { title: "Competitor Comparison Insights", desc: "Why competitors win in local search.", icon: "⚔️", color: "text-red-400", border: "group-hover:border-red-500/30" },
                                    { title: "Review & Reputation Gaps", desc: "Trust growth opportunities.", icon: "📈", color: "text-purple-400", border: "group-hover:border-purple-500/30" },
                                ].map((item, i) => (
                                    <div key={i} className={`bg-[#0B1120]/80 backdrop-blur-sm p-6 rounded-xl border border-white/5 transition-all group hover:translate-x-2 ${item.border}`}>
                                        <div className="flex flex-col items-center text-center gap-4">
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
                                    { title: "Optimization & Visibility Issues", desc: "Hidden ranking blockers.", icon: "📍", color: "text-yellow-400", border: "group-hover:border-yellow-500/30" },
                                    { title: "Priority Areas for Improvement", desc: "Fastest impact actions.", icon: "💎", color: "text-cyan-400", border: "group-hover:border-cyan-500/30" },
                                    { title: "Keyword Ranking Opportunities", desc: "Discover high-value search terms you're missing.", icon: "🔍", color: "text-green-400", border: "group-hover:border-green-500/30" }
                                ].map((item, i) => (
                                    <div key={i} className={`bg-[#0B1120]/80 backdrop-blur-sm p-6 rounded-xl border border-white/5 transition-all group lg:hover:-translate-x-2 hover:translate-x-2 ${item.border}`}>
                                        <div className="flex flex-col items-center text-center gap-4">
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

                {/* --- INTERMEDIATE CTA --- */}
                <div className="flex justify-center py-12 border-t border-white/5 bg-[#0B1120]/30">
                    <button
                        onClick={onStart}
                        className="w-auto px-8 md:px-12 py-4 md:py-5 bg-white text-black hover:bg-gray-100 rounded-xl font-bold text-sm tracking-widest uppercase transition shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] flex items-center justify-center gap-3 transform hover:scale-105"
                    >
                        <span className="flex items-center gap-2">
                            {session ? "Get Audit At ₹99" : "Get Audit At ₹99"}
                        </span>
                    </button>
                </div>

                <section id="protocol" className="py-10 md:py-32 bg-[#0B1120]/30 border-t border-white/5">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row gap-12 items-center">
                            <div className="flex-1">
                                <div className="inline-block text-cyan-500 font-mono text-xs tracking-widest mb-4 border border-cyan-500/20 px-2 py-1 rounded bg-cyan-500/10">AUDIT PROCESS</div>
                                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-white">How the GBP <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Audit Tool Works</span></h2>
                                <p className="text-gray-400 mb-8 text-lg">Detailed analysis in 3 simple steps.</p>

                                <div className="space-y-8">
                                    {[
                                        { step: "01", title: "Enter Your Business Details", desc: "Provide your business name with a maximum of 2 competitors." },
                                        { step: "02", title: "Competitor & Profile Analysis", desc: "The tool analyzes your profile alongside top competitors using key local ranking factors." },
                                        { step: "03", title: "Get Your Audit Report", desc: "Receive a clear audit highlighting gaps, strengths, and opportunities." }
                                    ].map((s, i) => (
                                        <div key={i} className="flex gap-6 items-start text-left">
                                            <div className="min-w-[40px] font-mono text-blue-500 font-bold text-xl opacity-50 leading-none mt-1">{s.step}</div>
                                            <div>
                                                <h4 className="text-white font-bold text-lg mb-2">{s.title}</h4>
                                                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
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



                <section id="faq" className="py-10 md:py-32 border-t border-white/5">
                    <div className="max-w-4xl mx-auto px-6">
                        <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center text-white">Frequently Asked <span className="text-blue-500">Questions</span></h2>
                        <div className="space-y-4">
                            {[
                                { q: "What is a GBP audit tool?", a: "A GBP audit tool analyzes how well your GMB listing is optimized for local search. It evaluates key factors such as reviews, categories, profile completeness, activity, and competitor performance to identify gaps that may be affecting your Google Maps rankings." },
                                { q: "How does this GMB audit tool compare my business with competitors?", a: "The tool analyzes your GBP alongside top local competitors competing for the same searches. It highlights differences in reviews, optimization strength, and visibility signals, helping you understand why certain competitors rank higher in local results." },
                                { q: "Is this GBP audit suitable for all types of businesses?", a: "Yes. The audit tool is designed for any business that relies on local visibility, including service providers, clinics, retail stores, agencies, and multi-location brands. The analysis adapts to your local market and competitive landscape." },
                                { q: "Does this tool help improve Google Maps rankings?", a: "The audit itself does not change rankings, but it clearly identifies the issues that influence Google Maps visibility. By addressing the gaps highlighted in the audit, businesses can improve relevance, trust, and competitive positioning in local search results." },
                                { q: "How long does it take to generate a Google Business Profile audit report?", a: "The audit process is quick and requires no technical setup. Once you enter your business details, the tool analyzes your profile and competitors and generates a report within minutes." },
                                { q: "Do I need technical SEO knowledge to understand the audit report?", a: "No. The audit report is designed to be clear and decision-focused. It explains performance and gaps in simple terms so business owners, marketers, and consultants can easily understand what needs attention." }
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
                                <a href="mailto:info@addinfi.com" className="flex items-center gap-4 bg-[#0B1120] border border-white/5 p-4 rounded-xl hover:border-cyan-500/30 transition group min-w-[250px]">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Support</div>
                                        <div className="text-sm font-bold text-gray-200 group-hover:text-cyan-400 transition">info@addinfi.com</div>
                                    </div>
                                </a>


                            </div>
                        </div>
                    </div>
                </section>

                {/* --- FINAL CTA --- */}
                <div className="max-w-3xl mx-auto px-6 text-center mb-10">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 md:mb-8">Start Your GBP Audit Today</h2>
                    <p className="text-gray-400 mb-8 md:mb-10 text-sm md:text-base">If you want better local rankings, more visibility, and a clear understanding of how you compare to competitors, this audit is the right place to start.</p>
                    <button
                        onClick={onStart}
                        className="w-full md:w-auto px-16 py-5 bg-white text-black rounded-xl font-bold text-lg hover:scale-105 transition shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)]"
                    >
                        {session ? "Get Audit At ₹99" : "Sign In & Get Audit At ₹99"}
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
const WarningIcon = () => (<svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>);

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
    {
        key: "listing_age",
        label: "Profile Authority",
        getValue: (entry: any) => parseNumber(entry?.listing_age),
        display: (entry: any) => entry?.listing_age || "N/A",
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
            textClass: "text-cyan-400",
            barClass: "bg-cyan-500",
        },
        ...comparisonCompetitors.map((competitor: any, index: number) => ({
            key: `competitor-${index}`,
            label: competitor?.title || competitor?.name || competitor?.business_name || `Competitor ${index + 1}`,
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

    // --- GLOBAL RECENT ACTIVITY NOTIFICATIONS ---
    const [recentActivity, setRecentActivity] = useState<{ name: string, time: string, action: string } | null>(null);

    useEffect(() => {
        // Random Data Pools
        const names = [
            "Mohan", "Simran", "Rahul", "Vikram", "Neha", "Kabir", "Anjali", "Priya", "Suresh", "Rajesh", "Amit", "Divya", "Arjun", "Sneha",
            "Aarav", "Advik", "Akash", "Akshay", "Aman", "Ananya", "Aniket", "Anish", "Ankit", "Anmol", "Anup", "Anurag", "Aryan", "Ashish",
            "Avinash", "Ayush", "Bhavya", "Chirag", "Deep", "Deepak", "Dev", "Diya", "Gaurav", "Harsh", "Himanshu", "Ishaan", "Ishani",
            "Jatin", "Jyoti", "Karan", "Karthik", "Kavya", "Kiran", "Kritika", "Kunal", "Lakshya", "Madhav", "Manish", "Manvi", "Mayank",
            "Megha", "Nakul", "Naman", "Nayan", "Nikhil", "Nishi", "Nitin", "Om", "Pankaj", "Parth", "Payal", "Piyush", "Pranav", "Pranay",
            "Prateek", "Prerna", "Puneet", "Raghav", "Raj", "Rajat", "Rakesh", "Ram", "Rhea", "Riddhima", "Rishi", "Ritika", "Ritu",
            "Ritvik", "Rohan", "Rohit", "Roshni", "Rudra", "Sahil", "Sakshi", "Sameer", "Sandeep", "Sanjay", "Sanjana", "Sanya", "Saransh",
            "Saurabh", "Shaurya", "Shivam", "Shreya", "Shubham", "Siddharth", "Smriti", "Somesh", "Sonali", "Sumit", "Sunny", "Tanmay",
            "Tanishq", "Tanvi", "Tarun", "Tushar", "Uday", "Utkarsh", "Vaibhav", "Vanshika", "Varun", "Vedant", "Vidhi", "Vinay", "Vishal",
            "Yash", "Yogesh", "Abhay", "Aditi", "Aishwarya", "Alok", "Amrita", "Anant", "Ansh", "Archana", "Bala", "Bhuvnesh", "Daksh",
            "Daman", "Ekta", "Falguni", "Ganesh", "Gayatri", "Gopal", "Gunjita", "Hemant", "Inder", "Indu", "Jagdish", "Janvi", "Jaspreet",
            "Kailash", "Kalpana", "Kamlesh", "Kanchan", "Komal", "Lalit", "Lata", "Leela", "Manoj", "Meenakshi", "Mridul", "Mukesh",
            "Nanda", "Narendra", "Navdeep", "Naveen", "Nilam", "Nirmal", "Pallavi", "Pawan", "Poonam", "Prabha", "Pramod", "Prashant",
            "Radha", "Rajni", "Rani", "Ratna", "Rekha", "Reena", "Richa", "Sagar", "Sangeeta", "Santosh", "Sarita", "Seema", "Shalini",
            "Shanti", "Sharda", "Shashi", "Shikha", "Shilpa", "Shivani", "Shobha", "Shruti", "Suman", "Sunita", "Sushma", "Swati", "Trupti",
            "Uma", "Urmila", "Usha", "Vandana", "Varsha", "Veena", "Vimala", "Vineeta", "Brijesh", "Dinesh", "Girdhari", "Hariram", "Jaipal",
            "Kishan", "Laxman", "Mahender", "Murari", "Narayan", "Omkar", "Prabhu", "Radhe", "Shyamlal", "Tarachand", "Upendra", "Vasu",
            "Yadram", "Zeeshan", "Afzal", "Imran", "Javed", "Khalid", "Mansoor", "Nasir", "Parvez", "Qasim", "Rashid", "Sajid", "Tahir",
            "Usman", "Waseem", "Yasin", "Zahid", "Ayesha", "Farida", "Ghazala", "Hamida", "Irat", "Jabeen", "Kehkashan", "Lubna", "Mumtaz",
            "Nargis", "Parveen", "Qamar", "Razia", "Sultana", "Tasnim", "Uzma", "Wahida", "Yasmin", "Zeba"
        ];
        const actions = [
            "just generated a free audit",
            "downloaded their GMB report",
            "unlocked competitor insights",
            "analyzed their local ranking",
            "is optimizing their profile",
            "fixed a GMB listing error",
            "scanned 3 local competitors",
            "just saved 90% on an audit",
            "unlocked full SEO metrics",
            "ran a real-time gap analysis",
            "found missing keywords",
            "evaluated their reputation",
            "checked for GMB suspension risk",
            "compared with top rivals",
            "generated a citations report",
            "audited their map visibility"
        ];
        const times = [
            "just now", "just now", "2 sec ago", "5 sec ago", "8 sec ago", "12 sec ago", "15 sec ago", "20 sec ago",
            "25 sec ago", "30 sec ago", "45 sec ago", "55 sec ago", "1 min ago", "1 min ago", "2 min ago", "3 min ago",
            "5 min ago", "8 min ago", "10 min ago"
        ];

        const showRandomToast = () => {
            // Random selection
            const rawName = names[Math.floor(Math.random() * names.length)];
            const action = actions[Math.floor(Math.random() * actions.length)];
            const time = times[Math.floor(Math.random() * times.length)];

            // Mask name: "Moh***"
            const maskedName = rawName.substring(0, 3) + "***";

            // Set Toast
            setRecentActivity({ name: maskedName, time, action });

            // Hide after 4 seconds
            setTimeout(() => setRecentActivity(null), 4000);
        };

        // 1. Initial Toast (Fast)
        const initialTimer = setTimeout(showRandomToast, 3000);

        // 2. Random Interval Loop (10s - 25s)
        const loop = () => {
            const delay = Math.floor(Math.random() * 15000) + 10000; // 10s to 25s
            return setTimeout(() => {
                showRandomToast();
                loopId = loop(); // Recurse
            }, delay);
        };

        let loopId = loop();

        return () => {
            clearTimeout(initialTimer);
            clearTimeout(loopId);
        };
    }, []);

    // 1. Fix "Invalid Hook Call": Ensure no hooks are outside this function
    if (status === "loading") return <div className="min-h-screen bg-[#030712]" />;

    const handleStartAction = () => {
        if (!session) {
            signIn("google");
        } else {
            setView("dashboard");
        }
    };

    return (
        <>
            {/* --- GLOBAL TOAST OVERLAY --- */}
            {recentActivity && (
                <div className="fixed bottom-6 left-6 z-[9999] bg-[#0B1120]/90 border border-cyan-500/30 backdrop-blur-md rounded-xl p-4 shadow-[0_0_20px_rgba(6,182,212,0.2)] animate-[slide-up_0.3s_ease-out] flex items-center gap-3 hover:scale-105 transition cursor-default pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                        {recentActivity.name.charAt(0)}
                    </div>
                    <div>
                        <div className="text-sm text-white font-bold tracking-wide">
                            {recentActivity.name} <span className="font-normal text-gray-400 text-xs ml-1">{recentActivity.action}</span>
                        </div>
                        <div className="text-[10px] text-cyan-400 font-mono mt-0.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            {recentActivity.time}
                        </div>
                    </div>
                </div>
            )}

            {/* --- MAIN CONTENT --- */}
            {view === "dashboard" && session ? (
                <DashboardLogic onHome={() => setView("landing")} />
            ) : (
                <LandingPage onStart={handleStartAction} />
            )}
        </>
    );
}

interface DashboardProps {
    onHome: () => void;
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
    const [reportReady, setReportReady] = useState(false);
    const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

    // --- NEW: LEAD CAPTURE STATE ---
    const [showLeadModal, setShowLeadModal] = useState(false);
    const [leadData, setLeadData] = useState({ email: "", phone: "" });
    const comparisonEntities = useMemo(() =>
        buildComparisonEntities(report, myBusiness?.title),
        [report, myBusiness]);

    const comparisonMetrics = useMemo(() =>
        COMPARISON_METRICS,
        []);

    // --- LOADER EFFECT ---
    useEffect(() => {
        if (!loading) { setLoadingMsgIndex(0); return; }
        const interval = setInterval(() => {
            setLoadingMsgIndex((prev) => {
                // Stop cycling at the last message if API hasn't responded yet
                if (prev >= LOADING_MESSAGES.length - 1) return prev;
                return prev + 1;
            });
        }, 6000);
        return () => clearInterval(interval);
    }, [loading]);

    // --- TRANSITION EFFECT: only show report when loader is done AND API has responded ---
    useEffect(() => {
        if (reportReady && loadingMsgIndex >= LOADING_MESSAGES.length - 1) {
            // Show the last message for 1.5s before transitioning
            const timer = setTimeout(() => {
                finalize();
                setReportReady(false);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [reportReady, loadingMsgIndex]);

    // --- GATEKEEPER LOGIC ---
    const handleRestrictedAction = () => {
        // Always show the lead confirmation modal to trigger payment
        setShowLeadModal(true);
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
        setReportReady(false);

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



    const performAnalysis = async () => {
        setLoading(true);
        setErrorMsg(null);
        setReport(null);

        // 1. Smart Keyword Logic
        const finalKeyword = compQuery.trim() ? compQuery : (myBusiness?.title || "Digital Marketing Agency");
        console.log("Starting Analysis with Keyword:", finalKeyword);

        try {
            // 2. Direct Connection to n8n
            const webhookUrl = "https://n8n-pro-775604255858.asia-south1.run.app/webhook/analyze-gmb";

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
                setIsUnlocked(true); // Payment is done, so unlock immediately
                // Don't finalize immediately — let the loader animation complete first
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

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            email: leadData.email,
            // phone: leadData.phone, // Removed
            business: myBusiness?.title || "Unknown Business",
            date: new Date().toLocaleString()
        };

        try {
            // 1. Save Lead (Background)
            axios.post("https://n8n-pro-775604255858.asia-south1.run.app/webhook/save-lead", payload).catch(err => console.error("Lead Error:", err));

            // 2. Load Razorpay SDK
            const isLoaded = await loadRazorpay();
            if (!isLoaded) {
                alert("Razorpay SDK failed to load. Please checks your internet connection.");
                setIsSubmitting(false);
                return;
            }

            // 3. Create Order
            const { data: orderData } = await axios.post("/api/razorpay/create-order");

            if (!orderData || !orderData.id) {
                alert("Failed to create payment order. Please try again.");
                setIsSubmitting(false);
                return;
            }

            // 4. Open Razorpay Options
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
                        });

                        if (result.data.success) {
                            setShowLeadModal(false);
                            setIsPaymentSuccess(true);
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
                    name: "User", // We could add a name field if needed
                    email: leadData.email,
                    // contact: leadData.phone, // Removed
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
                const res = await axios.post("/api/n8n-search", { keyword: debouncedMyQuery });
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
                const res = await axios.post("/api/n8n-search", { keyword: debouncedCompQuery });
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
            generatePDF();
        } else {
            handleRestrictedAction(); // <--- WAS: setShowPaymentModal(true)
        }
    };

    // --- PDF GENERATION ---
    // --- AUTO DOWNLOAD ON REPORT READY ---
    useEffect(() => {
        if (step === 3 && report && !errorMsg) {
            // Wait for DOM to paint completely
            setTimeout(() => {
                generatePDF();
            }, 1000);
        }
    }, [step, report, errorMsg]);

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

                        // FIX: Force Sans-Serif Font for PDF to avoid "Times New Roman" fallback
                        clonedElement.style.fontFamily = 'Arial, sans-serif';

                        // FIX: Iterate through all elements to remove backdrop-filter and complex shadows
                        // This fixes the "black box" and alignment issues caused by unsupported CSS in html2canvas
                        const allElements = clonedElement.getElementsByTagName('*');
                        for (let i = 0; i < allElements.length; i++) {
                            const el = allElements[i] as HTMLElement;
                            el.style.fontFamily = 'Arial, sans-serif';
                            el.style.backdropFilter = 'none';
                            el.style.boxShadow = 'none';
                            // Optional: Add a simple border if shadows are removed to keep definition
                            if (window.getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)') {
                                // el.style.border = '1px solid #333';
                            }
                        }
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
                            <span className="text-lg md:text-xl font-bold tracking-tight text-gray-100">What<span className="text-blue-500">My</span>Rank</span>
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
                                    <UserMenu session={session} />
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
                                <input className="w-full bg-[#0B1120] border border-white/10 pl-12 pr-12 py-5 rounded-xl text-xl text-white placeholder-gray-500 shadow-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition" placeholder="Type business name..." value={myQuery} onChange={e => { setMyQuery(e.target.value); setMyBusiness(null); }} />
                                {myQuery && (
                                    <button
                                        onClick={() => { setMyQuery(""); setMySuggestions([]); setMyBusiness(null); }}
                                        className="absolute right-4 text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                                        aria-label="Clear search"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}
                            </div>
                            {mySuggestions.length > 0 && !myBusiness && (
                                <div className="absolute top-full left-0 w-full bg-[#0B1120] border border-white/10 rounded-xl shadow-2xl mt-2 z-50 max-h-80 overflow-y-auto text-left">
                                    {mySuggestions.map((place, i) => (
                                        <div key={place.place_id || place.cid || i} className="p-4 hover:bg-cyan-500/10 cursor-pointer border-b border-white/5 last:border-0 flex justify-between items-start group transition-colors" onClick={() => { setMyBusiness(place); setStep(2); setMyQuery(place.title); setMySuggestions([]); }}>
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
                            <div className="relative flex items-center">
                                <input
                                    className="w-full bg-[#0B1120] border border-white/10 p-4 pr-12 rounded-xl text-lg text-white placeholder-gray-500 focus:border-cyan-500 outline-none transition"

                                    // --- NEW: Dynamic Placeholder ---
                                    placeholder={competitors.length === 1 ? "You can add one more GMB profile..." : "Search for a competitor..."}

                                    value={compQuery}
                                    onChange={e => setCompQuery(e.target.value)}
                                />
                                {compQuery && (
                                    <button
                                        onClick={() => { setCompQuery(""); setCompSuggestions([]); }}
                                        className="absolute right-4 text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                                        aria-label="Clear search"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}
                            </div>
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
                                                <span className={`ml-auto font-bold text-xs px-3 py-1 rounded whitespace-nowrap border ${isAdded ? 'bg-white/10 border-white/20 text-gray-400' : 'bg-green-500/10 border-green-500/50 text-green-400 hover:bg-green-500/20'}`}>
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
                                <div key={place.place_id || place.cid} className="p-4 border border-green-500/50 bg-green-500/10 rounded-xl flex justify-between items-center shadow-[0_0_15px_rgba(34,197,94,0.1)] backdrop-blur-sm">
                                    <div className="font-bold text-green-400 truncate pr-2">{place.title}</div>
                                    <button onClick={() => toggleCompetitor(place)} className="text-red-400 hover:bg-red-500/20 p-2 rounded text-sm font-bold flex-shrink-0 transition">✕</button>
                                </div>
                            ))}
                        </div>


                        {competitors.length > 0 && (
                            <div className="flex justify-center pt-4">
                                <button onClick={() => setShowLeadModal(true)} disabled={loading} className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 transition disabled:opacity-50 disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-3 text-sm">
                                    {loading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
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

                        <div className="bg-[#0B1120] border border-white/10 py-12 px-8 md:px-16 rounded-xl shadow-2xl mb-12 relative overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-16">

                                {/* LEFT — GMB Logo */}
                                <div className="flex flex-col items-center gap-4 md:min-w-[220px] shrink-0">
                                    <div className="w-40 h-40 relative flex items-center justify-center">
                                        <img
                                            src="/gmb.png"
                                            alt="GMB Logo"
                                            className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(66,133,244,0.3)]"
                                        />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-black text-white tracking-tight">WhatMyRank</div>
                                        <div className="text-xs font-bold text-blue-400 tracking-[0.15em] uppercase">Google Business Profile Audit</div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="hidden md:block w-px h-48 bg-gradient-to-b from-transparent via-white/15 to-transparent"></div>

                                {/* RIGHT — Score + Rating Bar */}
                                <div className="flex-1 flex flex-col items-center text-center">
                                    <div className="text-sm font-bold tracking-[0.3em] text-cyan-400 uppercase mb-4">Overall Performance</div>
                                    <div className="flex items-baseline gap-2">
                                        <div className="text-8xl md:text-9xl font-black tracking-tighter text-white">{report.audit_score}<span className="text-4xl md:text-5xl text-gray-500">/100</span></div>
                                        <span className="text-xs font-medium text-gray-400 opacity-90 -mt-2">- Powered by Addinfi</span>
                                    </div>

                                    {/* Rating Scale Bar */}
                                    <div className="mt-8 w-full max-w-xl px-4">
                                        <div className="relative">
                                            {/* Score Position Indicator */}
                                            <div className="absolute -top-5 transition-all duration-500" style={{ left: `${Math.min(Math.max(report.audit_score || 0, 0), 100)}%`, transform: 'translateX(-50%)' }}>
                                                <div className="flex flex-col items-center">
                                                    <svg className="w-3 h-3 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 12 12"><path d="M6 9L1 3h10L6 9z" /></svg>
                                                </div>
                                            </div>
                                            {/* Gradient Bar */}
                                            <div className="flex h-2.5 rounded-full overflow-hidden border border-white/10">
                                                <div className="w-1/4 bg-gradient-to-r from-red-600 to-red-400"></div>
                                                <div className="w-1/4 bg-gradient-to-r from-orange-500 to-amber-400"></div>
                                                <div className="w-1/4 bg-gradient-to-r from-yellow-400 to-lime-400"></div>
                                                <div className="w-1/4 bg-gradient-to-r from-emerald-400 to-green-500"></div>
                                            </div>
                                            {/* Labels */}
                                            <div className="flex mt-2.5">
                                                <div className="w-1/4 text-center">
                                                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Poor</span>
                                                    <span className="block text-[8px] text-white font-mono mt-0.5">0 – 25</span>
                                                </div>
                                                <div className="w-1/4 text-center">
                                                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Average</span>
                                                    <span className="block text-[8px] text-white font-mono mt-0.5">26 – 50</span>
                                                </div>
                                                <div className="w-1/4 text-center">
                                                    <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">Good</span>
                                                    <span className="block text-[8px] text-white font-mono mt-0.5">51 – 75</span>
                                                </div>
                                                <div className="w-1/4 text-center">
                                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Excellent</span>
                                                    <span className="block text-[8px] text-white font-mono mt-0.5">76 – 100</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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

                                    {/* RIGHT: STRATEGIC COMPARISON — ENHANCED MULTI-VIZ */}
                                    <div className="lg:col-span-8 bg-[#0B1120] border border-white/10 rounded-3xl overflow-hidden flex flex-col h-full relative">
                                        {/* Header */}
                                        <div className="px-8 py-6 border-b border-white/10 bg-gradient-to-r from-cyan-900/10 via-purple-900/5 to-indigo-900/10">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                                                        <h3 className="text-white font-bold uppercase tracking-widest text-sm">Strategic Comparison</h3>
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 font-mono ml-5">LIVE METRICS • MULTI-DIMENSIONAL ANALYSIS</p>
                                                </div>
                                                <div className="flex flex-wrap gap-3">
                                                    {comparisonEntities.map((entity) => (
                                                        <div key={entity.key} className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-full">
                                                            <div className={`w-2.5 h-2.5 rounded-full ${entity.barClass} shadow-lg`}></div>
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${entity.textClass}`}>{entity.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Enhanced Multi-Visualization Grid */}
                                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                                {/* ══════════ 1. REPUTATION SCORE — Star Rating Display ══════════ */}
                                                {(() => {
                                                    const metric = comparisonMetrics.find(m => m.key === "rating");
                                                    if (!metric) return null;
                                                    return (
                                                        <div className="bg-[#060D1B] border border-yellow-500/10 rounded-2xl p-5 hover:border-yellow-500/30 transition-all duration-300 group relative overflow-hidden">
                                                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                                            <div className="flex items-center gap-3 mb-5 relative z-10">
                                                                <div className="p-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                                                                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-white font-bold text-sm tracking-wide">Reputation Score</h4>
                                                                    <p className="text-[9px] text-gray-500 font-mono uppercase">Google Star Rating</p>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-4 relative z-10">
                                                                {comparisonEntities.map((entity) => {
                                                                    const rating = parseNumber(entity.data?.rating);
                                                                    const fullStars = Math.floor(rating);
                                                                    const hasHalf = rating % 1 >= 0.3;
                                                                    return (
                                                                        <div key={`rating-${entity.key}`} className="flex items-center gap-3">
                                                                            <span className={`text-[10px] font-bold w-20 truncate ${entity.textClass}`}>{entity.label}</span>
                                                                            <div className="flex items-center gap-0.5">
                                                                                {[1, 2, 3, 4, 5].map(i => (
                                                                                    <svg key={i} className={`w-5 h-5 ${i <= fullStars ? 'text-yellow-400' : (i === fullStars + 1 && hasHalf ? 'text-yellow-400/50' : 'text-gray-700')}`} fill="currentColor" viewBox="0 0 20 20">
                                                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                                    </svg>
                                                                                ))}
                                                                            </div>
                                                                            <span className="text-white font-mono font-bold text-sm ml-auto">{metric.display(entity.data)}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {/* ══════════ 2. REVIEW VOLUME — Vertical Bar Chart ══════════ */}
                                                {(() => {
                                                    const metric = comparisonMetrics.find(m => m.key === "reviews");
                                                    if (!metric) return null;
                                                    const values = comparisonEntities.map(e => metric.getValue(e.data));
                                                    const maxVal = Math.max(1, ...values);
                                                    return (
                                                        <div className="bg-[#060D1B] border border-blue-500/10 rounded-2xl p-5 hover:border-blue-500/30 transition-all duration-300 group relative overflow-hidden">
                                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                                            <div className="flex items-center gap-3 mb-5 relative z-10">
                                                                <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-white font-bold text-sm tracking-wide">Review Volume</h4>
                                                                    <p className="text-[9px] text-gray-500 font-mono uppercase">Total Google Reviews</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-end justify-around gap-4 h-32 relative z-10 px-2">
                                                                {comparisonEntities.map((entity, idx) => {
                                                                    const val = values[idx];
                                                                    const pct = maxVal ? Math.max(10, (val / maxVal) * 100) : 10;
                                                                    const gradients: Record<string, string> = { 'bg-cyan-500': 'from-cyan-600 to-cyan-400', 'bg-purple-500': 'from-purple-600 to-purple-400', 'bg-indigo-500': 'from-indigo-600 to-indigo-400' };
                                                                    return (
                                                                        <div key={`vol-${entity.key}`} className="flex flex-col items-center flex-1">
                                                                            <span className={`text-xs font-bold mb-2 ${entity.textClass}`}>{metric.display(entity.data)}</span>
                                                                            <div className="w-full max-w-[50px] h-24 bg-white/5 rounded-xl overflow-hidden flex flex-col justify-end border border-white/5">
                                                                                <div className={`w-full bg-gradient-to-t ${gradients[entity.barClass] || 'from-gray-600 to-gray-400'} rounded-xl transition-all duration-1000 relative overflow-hidden`} style={{ height: `${pct}%` }}>
                                                                                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/15 to-transparent"></div>
                                                                                </div>
                                                                            </div>
                                                                            <span className="text-[8px] text-gray-500 mt-1.5 font-medium truncate max-w-[60px] text-center">{entity.label}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {/* ══════════ 3. REVIEW VELOCITY — Radial Gauge ══════════ */}
                                                {(() => {
                                                    const metric = comparisonMetrics.find(m => m.key === "review_velocity");
                                                    if (!metric) return null;
                                                    return (
                                                        <div className="bg-[#060D1B] border border-emerald-500/10 rounded-2xl p-5 hover:border-emerald-500/30 transition-all duration-300 group relative overflow-hidden">
                                                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                                            <div className="flex items-center gap-3 mb-5 relative z-10">
                                                                <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                                                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-white font-bold text-sm tracking-wide">Review Velocity</h4>
                                                                    <p className="text-[9px] text-gray-500 font-mono uppercase">New Reviews Frequency</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-around gap-2 relative z-10">
                                                                {comparisonEntities.map((entity) => {
                                                                    const score = metric.getValue(entity.data);
                                                                    const pct = Math.min(score, 100);
                                                                    const circumference = 2 * Math.PI * 32;
                                                                    const dashoffset = circumference - (pct / 100) * circumference;
                                                                    const colorMap: Record<string, string> = { 'bg-cyan-500': '#22d3ee', 'bg-purple-500': '#a855f7', 'bg-indigo-500': '#818cf8' };
                                                                    const strokeColor = colorMap[entity.barClass] || '#6b7280';
                                                                    return (
                                                                        <div key={`vel-${entity.key}`} className="flex flex-col items-center">
                                                                            <div className="relative w-20 h-20">
                                                                                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                                                                                    <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                                                                                    <circle cx="40" cy="40" r="32" fill="none" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashoffset} className="transition-all duration-1000" />
                                                                                </svg>
                                                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                                                    <span className={`text-[10px] font-bold ${entity.textClass}`}>{metric.display(entity.data).split('(')[0].trim()}</span>
                                                                                </div>
                                                                            </div>
                                                                            <span className={`text-[9px] font-bold mt-1 ${entity.textClass} truncate max-w-[70px] text-center`}>{metric.display(entity.data)}</span>
                                                                            <span className="text-[8px] text-gray-500 font-medium">{entity.label}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {/* ══════════ 4. RESPONSE SPEED — Horizontal Timer Bars ══════════ */}
                                                {(() => {
                                                    const metric = comparisonMetrics.find(m => m.key === "review_response");
                                                    if (!metric) return null;
                                                    const values = comparisonEntities.map(e => metric.getValue(e.data));
                                                    const maxVal = Math.max(1, ...values);
                                                    return (
                                                        <div className="bg-[#060D1B] border border-orange-500/10 rounded-2xl p-5 hover:border-orange-500/30 transition-all duration-300 group relative overflow-hidden">
                                                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                                            <div className="flex items-center gap-3 mb-5 relative z-10">
                                                                <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                                                                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-white font-bold text-sm tracking-wide">Response Speed</h4>
                                                                    <p className="text-[9px] text-gray-500 font-mono uppercase">Owner Reply Time</p>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-4 relative z-10">
                                                                {comparisonEntities.map((entity, idx) => {
                                                                    const val = values[idx];
                                                                    const pct = maxVal ? Math.min((val / maxVal) * 100, 100) : 0;
                                                                    const colorMap: Record<string, string> = { 'bg-cyan-500': 'from-cyan-500 to-cyan-300', 'bg-purple-500': 'from-purple-500 to-purple-300', 'bg-indigo-500': 'from-indigo-500 to-indigo-300' };
                                                                    return (
                                                                        <div key={`resp-${entity.key}`}>
                                                                            <div className="flex items-center justify-between mb-1.5">
                                                                                <span className={`text-[10px] font-bold ${entity.textClass}`}>{entity.label}</span>
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <svg className="w-3 h-3 text-orange-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                                    <span className="text-[10px] text-gray-400 font-mono">{metric.display(entity.data)}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                                                <div className={`h-full bg-gradient-to-r ${colorMap[entity.barClass] || 'from-gray-500 to-gray-300'} rounded-full transition-all duration-1000 relative`} style={{ width: `${pct}%` }}>
                                                                                    <div className="absolute right-0 top-0 w-1.5 h-full bg-white/40 rounded-full"></div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {/* ══════════ 5. CONTENT ENGINE — Activity Heatmap Dots ══════════ */}
                                                {(() => {
                                                    const metric = comparisonMetrics.find(m => m.key === "post_frequency");
                                                    if (!metric) return null;
                                                    return (
                                                        <div className="bg-[#060D1B] border border-pink-500/10 rounded-2xl p-5 hover:border-pink-500/30 transition-all duration-300 group relative overflow-hidden">
                                                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                                            <div className="flex items-center gap-3 mb-5 relative z-10">
                                                                <div className="p-2 bg-pink-500/10 rounded-xl border border-pink-500/20">
                                                                    <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-white font-bold text-sm tracking-wide">Content Engine</h4>
                                                                    <p className="text-[9px] text-gray-500 font-mono uppercase">GMB Post Frequency</p>
                                                                </div>
                                                            </div>
                                                            <div className={`space-y-4 relative z-10 ${!isUnlocked ? 'blur-sm opacity-40 grayscale select-none pointer-events-none' : ''}`}>
                                                                {comparisonEntities.map((entity) => {
                                                                    const displayVal = metric.display(entity.data).toLowerCase();
                                                                    const activeDots = displayVal.includes('bi-weekly') || displayVal.includes('2-3x') ? 2 : 1;
                                                                    const colorMap: Record<string, string> = { 'bg-cyan-500': 'bg-cyan-400', 'bg-purple-500': 'bg-purple-400', 'bg-indigo-500': 'bg-indigo-400' };
                                                                    const dotColor = colorMap[entity.barClass] || 'bg-gray-400';
                                                                    return (
                                                                        <div key={`content-${entity.key}`} className="flex items-center gap-3">
                                                                            <span className={`text-[10px] font-bold w-20 truncate ${entity.textClass}`}>{entity.label}</span>
                                                                            <div className="flex gap-1.5 flex-1">
                                                                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                                                                    <div key={i} className="flex flex-col items-center gap-1">
                                                                                        <div className={`w-4 h-4 rounded-md transition-all ${i < activeDots ? `${dotColor} shadow-lg shadow-current/20` : 'bg-white/5 border border-white/5'}`}></div>
                                                                                        <span className="text-[7px] text-gray-600">{day}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            <span className="text-[9px] text-gray-400 font-mono w-16 text-right truncate">{metric.display(entity.data)}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                            {/* Lock Overlay */}
                                                            {!isUnlocked && (
                                                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center cursor-pointer group/lock" onClick={handleRestrictedAction}>
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#060D1B] via-[#060D1B]/80 to-transparent"></div>
                                                                    <div className="relative z-10 flex flex-col items-center gap-2">
                                                                        <div className="w-10 h-10 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover/lock:scale-110 transition-transform shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                                                                            <LockIcon />
                                                                        </div>
                                                                        <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest group-hover/lock:underline">Unlock Details</span>
                                                                        <span className="text-[9px] text-pink-300 font-semibold opacity-0 group-hover/lock:opacity-100 transition-opacity">@ ₹99</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}

                                                {/* ══════════ 6. PRODUCTS — Status Badge Cards ══════════ */}
                                                {(() => {
                                                    const metric = comparisonMetrics.find(m => m.key === "products_services");
                                                    if (!metric) return null;
                                                    return (
                                                        <div className="bg-[#060D1B] border border-violet-500/10 rounded-2xl p-5 hover:border-violet-500/30 transition-all duration-300 group relative overflow-hidden">
                                                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                                            <div className="flex items-center gap-3 mb-5 relative z-10">
                                                                <div className="p-2 bg-violet-500/10 rounded-xl border border-violet-500/20">
                                                                    <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-white font-bold text-sm tracking-wide">Products & Services</h4>
                                                                    <p className="text-[9px] text-gray-500 font-mono uppercase">GMB Product Listings</p>
                                                                </div>
                                                            </div>
                                                            <div className={`space-y-3 relative z-10 ${!isUnlocked ? 'blur-sm opacity-40 grayscale select-none pointer-events-none' : ''}`}>
                                                                {comparisonEntities.map((entity) => {
                                                                    const val = metric.getValue(entity.data);
                                                                    const isOptimized = val > 0;
                                                                    return (
                                                                        <div key={`prod-${entity.key}`} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isOptimized ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isOptimized ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                                                {isOptimized ? (
                                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                                                                ) : (
                                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                                )}
                                                                            </div>
                                                                            <span className={`text-[10px] font-bold ${entity.textClass} flex-1`}>{entity.label}</span>
                                                                            <span className={`text-[9px] font-mono font-bold px-2 py-1 rounded-md ${isOptimized ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{metric.display(entity.data)}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                            {/* Lock Overlay */}
                                                            {!isUnlocked && (
                                                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center cursor-pointer group/lock" onClick={handleRestrictedAction}>
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#060D1B] via-[#060D1B]/80 to-transparent"></div>
                                                                    <div className="relative z-10 flex flex-col items-center gap-2">
                                                                        <div className="w-10 h-10 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover/lock:scale-110 transition-transform shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                                                                            <LockIcon />
                                                                        </div>
                                                                        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest group-hover/lock:underline">Unlock Details</span>
                                                                        <span className="text-[9px] text-violet-300 font-semibold opacity-0 group-hover/lock:opacity-100 transition-opacity">@ ₹99</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}

                                                {/* ══════════ 7. PROFILE AUTHORITY — Timeline / Age Comparison ══════════ */}
                                                {(() => {
                                                    const metric = comparisonMetrics.find(m => m.key === "listing_age");
                                                    if (!metric) return null;
                                                    const values = comparisonEntities.map(e => metric.getValue(e.data));
                                                    const maxVal = Math.max(1, ...values);
                                                    return (
                                                        <div className="md:col-span-2 bg-[#060D1B] border border-amber-500/10 rounded-2xl p-5 hover:border-amber-500/30 transition-all duration-300 group relative overflow-hidden">
                                                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                                            <div className="flex items-center gap-3 mb-5 relative z-10">
                                                                <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                                                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-white font-bold text-sm tracking-wide">Profile Authority</h4>
                                                                    <p className="text-[9px] text-gray-500 font-mono uppercase">GMB Listing Age & Domain Trust</p>
                                                                </div>
                                                            </div>
                                                            <div className={`space-y-4 relative z-10 ${!isUnlocked ? 'blur-sm opacity-40 grayscale select-none pointer-events-none' : ''}`}>
                                                                {comparisonEntities.map((entity, idx) => {
                                                                    const val = values[idx];
                                                                    const pct = maxVal ? Math.min((val / maxVal) * 100, 100) : 0;
                                                                    const colorMap: Record<string, string> = { 'bg-cyan-500': 'from-amber-600 via-cyan-500 to-cyan-400', 'bg-purple-500': 'from-amber-600 via-purple-500 to-purple-400', 'bg-indigo-500': 'from-amber-600 via-indigo-500 to-indigo-400' };
                                                                    return (
                                                                        <div key={`auth-${entity.key}`}>
                                                                            <div className="flex items-center justify-between mb-1.5">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className={`text-[10px] font-bold ${entity.textClass}`}>{entity.label}</span>
                                                                                    <svg className="w-3 h-3 text-amber-400/50" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                                                </div>
                                                                                <span className="text-[10px] text-gray-400 font-mono">{metric.display(entity.data)}</span>
                                                                            </div>
                                                                            <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                                                                                <div className={`h-full bg-gradient-to-r ${colorMap[entity.barClass] || 'from-gray-600 to-gray-400'} rounded-full transition-all duration-1000 relative`} style={{ width: `${pct}%` }}>
                                                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                                                                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg"></div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                            {/* Lock Overlay */}
                                                            {!isUnlocked && (
                                                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center cursor-pointer group/lock" onClick={handleRestrictedAction}>
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#060D1B] via-[#060D1B]/80 to-transparent"></div>
                                                                    <div className="relative z-10 flex flex-col items-center gap-2">
                                                                        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover/lock:scale-110 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                                                                            <LockIcon />
                                                                        </div>
                                                                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest group-hover/lock:underline">Unlock Details</span>
                                                                        <span className="text-[9px] text-amber-300 font-semibold opacity-0 group-hover/lock:opacity-100 transition-opacity">@ ₹99</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}

                                            </div>
                                        </div>
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
                                                <div className="mb-8 bg-red-900/10 border border-red-500/50 rounded-xl p-6 flex items-start gap-4 animate-pulse">
                                                    <div className="p-3 bg-red-500/20 rounded-lg shrink-0 border border-red-500/30">
                                                        <WarningIcon />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-red-400 font-bold text-lg mb-1 uppercase tracking-wider flex items-center gap-2">
                                                            Critical Attention Needed
                                                        </h3>
                                                        <p className="text-gray-300 text-sm leading-relaxed">
                                                            No new reviews detected for <span className="text-white font-bold">{days} days</span>.
                                                            Your profile is becoming dormant, which negatively impacts local ranking velocity.
                                                        </p>
                                                        <div className="mt-3 inline-block bg-red-500/20 px-3 py-1 rounded border border-red-500/30">
                                                            <span className="text-xs font-bold text-red-300 uppercase tracking-wide">Recommended Action: Initiate SMS review campaign immediately</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}

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

                                    {/* VERTICAL TIMELINE LAYOUT WITH ILLUSTRATIONS */}
                                    <div className="space-y-0 relative">
                                        {/* Central Timeline Line */}
                                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/30 via-cyan-500/20 to-purple-500/30 hidden md:block"></div>

                                        {report.four_week_plan.map((week: any, i: number) => {
                                            const isWeekLocked = !isUnlocked && i > 0;
                                            const isCurrent = !isUnlocked && i === 0;
                                            const weekColors = [
                                                { border: 'border-blue-500/40', glow: 'shadow-[0_0_40px_-10px_rgba(59,130,246,0.15)]', accent: 'from-blue-600 to-cyan-400', tag: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-500', text: 'text-blue-400' },
                                                { border: 'border-purple-500/40', glow: 'shadow-[0_0_40px_-10px_rgba(168,85,247,0.15)]', accent: 'from-purple-600 to-pink-400', tag: 'bg-purple-500/10 text-purple-400 border-purple-500/20', dot: 'bg-purple-500', text: 'text-purple-400' },
                                                { border: 'border-emerald-500/40', glow: 'shadow-[0_0_40px_-10px_rgba(16,185,129,0.15)]', accent: 'from-emerald-600 to-teal-400', tag: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500', text: 'text-emerald-400' },
                                                { border: 'border-amber-500/40', glow: 'shadow-[0_0_40px_-10px_rgba(245,158,11,0.15)]', accent: 'from-amber-600 to-orange-400', tag: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-500', text: 'text-amber-400' },
                                            ];
                                            const color = weekColors[i] || weekColors[0];

                                            // SVG Illustration data for all 4 weeks
                                            const illustrations = [
                                                {
                                                    title: "Phase 1: Foundation",
                                                    subtitle: "Strategic Audit",
                                                    icon: (
                                                        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="28" stroke="url(#grad1)" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" /><path d="M22 38V26l10-6 10 6v12l-10 6-10-6z" stroke="url(#grad1)" strokeWidth="1.5" fill="rgba(59,130,246,0.1)" /><path d="M32 20v24M22 26l10 6 10-6" stroke="url(#grad1)" strokeWidth="1.5" strokeLinecap="round" /><circle cx="32" cy="16" r="3" fill="url(#grad1)" className="animate-pulse" /><defs><linearGradient id="grad1" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#3b82f6" /><stop offset="1" stopColor="#22d3ee" /></linearGradient></defs></svg>
                                                    )
                                                },
                                                {
                                                    title: "Phase 2: Growth",
                                                    subtitle: "Content Engine",
                                                    icon: (
                                                        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="28" stroke="url(#grad2)" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" /><path d="M20 44l8-12 8 6 8-18" stroke="url(#grad2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="44" cy="20" r="4" fill="url(#grad2)" className="animate-pulse" /><rect x="18" y="46" width="4" height="6" rx="1" fill="rgba(168,85,247,0.3)" /><rect x="24" y="42" width="4" height="10" rx="1" fill="rgba(168,85,247,0.5)" /><rect x="30" y="38" width="4" height="14" rx="1" fill="rgba(168,85,247,0.7)" /><defs><linearGradient id="grad2" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#a855f7" /><stop offset="1" stopColor="#ec4899" /></linearGradient></defs></svg>
                                                    )
                                                },
                                                {
                                                    title: "Phase 3: Authority",
                                                    subtitle: "Social Trust",
                                                    icon: (
                                                        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="28" stroke="url(#grad3)" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" /><path d="M32 14v8M26 18l6-4 6 4" stroke="url(#grad3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M24 28h16v16c0 2-2 4-4 4h-8c-2 0-4-2-4-4V28z" stroke="url(#grad3)" strokeWidth="1.5" fill="rgba(16,185,129,0.1)" /><circle cx="32" cy="36" r="3" fill="url(#grad3)" className="animate-pulse" /><defs><linearGradient id="grad3" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#10b981" /><stop offset="1" stopColor="#14b8a6" /></linearGradient></defs></svg>
                                                    )
                                                },
                                                {
                                                    title: "Phase 4: Scaling",
                                                    subtitle: "Dominance",
                                                    icon: (
                                                        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="28" stroke="url(#grad4)" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" /><path d="M16 48h32M32 48V16M32 16l-8 8M32 16l8 8" stroke="url(#grad4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="32" cy="40" r="4" fill="url(#grad4)" className="animate-pulse" /><defs><linearGradient id="grad4" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#f59e0b" /><stop offset="1" stopColor="#fbbf24" /></linearGradient></defs></svg>
                                                    )
                                                },
                                            ];

                                            return (
                                                <div key={i}>
                                                    {/* Week Card - alternating alignment */}
                                                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 relative ${i % 2 === 0 ? '' : 'md:direction-rtl'}`}>
                                                        {/* Timeline Dot */}
                                                        <div className="hidden md:block absolute left-1/2 top-8 -translate-x-1/2 z-20">
                                                            <div className={`w-4 h-4 rounded-full ${isWeekLocked ? 'bg-gray-600 border-gray-500' : color.dot} border-2 border-[#030712] shadow-lg ${!isWeekLocked ? 'animate-pulse' : ''}`}></div>
                                                        </div>

                                                        {/* Week Card - placed on alternating sides */}
                                                        {i % 2 === 0 ? (
                                                            <>
                                                                <div className={`relative bg-[#0B1120] rounded-2xl border transition-all duration-500 group overflow-hidden ${isWeekLocked
                                                                    ? 'border-white/5 opacity-60'
                                                                    : isCurrent ? `${color.border} ${color.glow}` : 'border-white/10 hover:border-blue-500/30'
                                                                    }`}>
                                                                    <div className="absolute -right-4 -top-4 text-[120px] font-black text-white/[0.02] select-none leading-none z-0">0{i + 1}</div>
                                                                    <div className={`h-1 bg-gradient-to-r ${color.accent}`}></div>
                                                                    <div className="relative z-10 p-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                                                                        <div className="flex justify-between items-start mb-3">
                                                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${isWeekLocked ? 'bg-gray-800 text-gray-500 border-gray-700' : color.tag}`}>
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
                                                                    <div className="relative z-10 p-6 min-h-[220px]">
                                                                        <ul className="space-y-4">
                                                                            {!isUnlocked && i === 0 ? (
                                                                                <>
                                                                                    {week.tasks?.slice(0, Math.ceil(week.tasks.length / 2)).map((task: string, k: number) => (
                                                                                        <li key={k} className="flex items-start gap-3">
                                                                                            <div className={`mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full ${color.dot} shadow-[0_0_8px_rgba(59,130,246,0.8)]`}></div>
                                                                                            <span className="text-sm text-gray-300 leading-snug">{task}</span>
                                                                                        </li>
                                                                                    ))}
                                                                                    <div className="absolute inset-x-0 bottom-0 pt-20 pb-6 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/95 to-transparent flex flex-col items-center justify-end cursor-pointer group/btn" onClick={handleRestrictedAction}>
                                                                                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/20 border border-blue-500/50 text-blue-400 text-xs font-bold uppercase tracking-wider group-hover/btn:bg-blue-600 group-hover/btn:text-white transition-all shadow-lg">
                                                                                            <LockIcon /><span>Unlock Full Plan</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </>
                                                                            ) : isWeekLocked ? (
                                                                                <div className="h-full flex flex-col items-center justify-center text-center cursor-pointer opacity-50 hover:opacity-100 transition-opacity" onClick={handleRestrictedAction}>
                                                                                    <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-gray-500 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all"><LockIcon /></div>
                                                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-blue-400">Awaiting Clearance</span>
                                                                                </div>
                                                                            ) : (
                                                                                week.tasks?.map((task: string, k: number) => (
                                                                                    <li key={k} className="flex items-start gap-3 group/item">
                                                                                        <div className={`mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full ${color.dot}/50 group-hover/item:${color.dot} transition-colors`}></div>
                                                                                        <span className="text-sm text-gray-300 leading-snug group-hover/item:text-white transition-colors">{task}</span>
                                                                                    </li>
                                                                                ))
                                                                            )}
                                                                        </ul>
                                                                    </div>
                                                                    <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${isWeekLocked ? 'w-0' : `w-full bg-gradient-to-r ${color.accent}`}`}></div>
                                                                </div>
                                                                {/* Empty side for alternating layout */}
                                                                <div className="hidden md:flex items-center justify-center p-6">
                                                                    <div className="text-center space-y-4">
                                                                        <div className="relative flex items-center justify-center">
                                                                            <div className="absolute inset-0 blur-2xl opacity-20 scale-150">{illustrations[i]?.icon}</div>
                                                                            <div className="relative z-10 w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm overflow-hidden group">
                                                                                <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity flex items-center justify-center">{illustrations[i]?.icon}</div>
                                                                                <span className={`text-5xl font-black ${color.text} relative z-10 drop-shadow-lg`}>0{i + 1}</span>
                                                                            </div>
                                                                        </div>
                                                                        <p className="text-[11px] text-white font-bold uppercase tracking-[0.2em] max-w-[200px] leading-relaxed drop-shadow-sm">{week.focus}</p>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                {/* Empty side for alternating layout */}
                                                                <div className="hidden md:flex items-center justify-center p-6">
                                                                    <div className="text-center space-y-4">
                                                                        <div className="relative flex items-center justify-center">
                                                                            <div className="absolute inset-0 blur-2xl opacity-20 scale-150">{illustrations[i]?.icon}</div>
                                                                            <div className="relative z-10 w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm overflow-hidden group">
                                                                                <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity flex items-center justify-center">{illustrations[i]?.icon}</div>
                                                                                <span className={`text-5xl font-black ${color.text} relative z-10 drop-shadow-lg`}>0{i + 1}</span>
                                                                            </div>
                                                                        </div>
                                                                        <p className="text-[11px] text-white font-bold uppercase tracking-[0.2em] max-w-[200px] leading-relaxed drop-shadow-sm">{week.focus}</p>
                                                                    </div>
                                                                </div>
                                                                <div className={`relative bg-[#0B1120] rounded-2xl border transition-all duration-500 group overflow-hidden ${isWeekLocked
                                                                    ? 'border-white/5 opacity-60'
                                                                    : isCurrent ? `${color.border} ${color.glow}` : 'border-white/10 hover:border-blue-500/30'
                                                                    }`}>
                                                                    <div className="absolute -right-4 -top-4 text-[120px] font-black text-white/[0.02] select-none leading-none z-0">0{i + 1}</div>
                                                                    <div className={`h-1 bg-gradient-to-r ${color.accent}`}></div>
                                                                    <div className="relative z-10 p-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                                                                        <div className="flex justify-between items-start mb-3">
                                                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${isWeekLocked ? 'bg-gray-800 text-gray-500 border-gray-700' : color.tag}`}>
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
                                                                    <div className="relative z-10 p-6 min-h-[220px]">
                                                                        <ul className="space-y-4">
                                                                            {isWeekLocked ? (
                                                                                <div className="h-full flex flex-col items-center justify-center text-center cursor-pointer opacity-50 hover:opacity-100 transition-opacity" onClick={handleRestrictedAction}>
                                                                                    <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-gray-500 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all"><LockIcon /></div>
                                                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-blue-400">Awaiting Clearance</span>
                                                                                </div>
                                                                            ) : (
                                                                                week.tasks?.map((task: string, k: number) => (
                                                                                    <li key={k} className="flex items-start gap-3 group/item">
                                                                                        <div className={`mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full ${color.dot}/50 group-hover/item:${color.dot} transition-colors`}></div>
                                                                                        <span className="text-sm text-gray-300 leading-snug group-hover/item:text-white transition-colors">{task}</span>
                                                                                    </li>
                                                                                ))
                                                                            )}
                                                                        </ul>
                                                                    </div>
                                                                    <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${isWeekLocked ? 'w-0' : `w-full bg-gradient-to-r ${color.accent}`}`}></div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Central Illustration between weeks */}
                                                    {i < illustrations.length && (
                                                        <div className="flex items-center justify-center py-8 relative">
                                                            {/* Connecting dots */}
                                                            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px border-l border-dashed border-white/10"></div>

                                                            <div className="relative z-10 flex flex-col items-center gap-3 bg-[#030712] px-6 py-4 rounded-2xl border border-white/5">
                                                                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                                                                    {illustrations[i].icon}
                                                                </div>
                                                                <div className="text-center">
                                                                    <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">{illustrations[i].title}</p>
                                                                    <p className="text-[9px] text-gray-600 font-mono mt-0.5">{illustrations[i].subtitle}</p>
                                                                </div>
                                                                {/* Animated connector arrow */}
                                                                <svg className="w-6 h-6 text-gray-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    )}
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
                                <div
                                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-[3000ms] ease-out"
                                    style={{ width: reportReady ? '100%' : `${Math.min(85, ((loadingMsgIndex + 1) / LOADING_MESSAGES.length) * 85)}%` }}
                                />
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



                            <h2 className="text-2xl font-bold text-white mb-2">Almost There</h2>
                            <p className="text-gray-400 mb-6 text-sm">Enter your email to generate the secure download link and get future updates.</p>

                            <form onSubmit={handleLeadSubmit} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-[#020617] border border-white/10 p-3 rounded-xl focus:border-cyan-500 outline-none text-white transition"
                                        placeholder="you@example.com"
                                        value={leadData.email}
                                        onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
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
                                            <span>Processing Payment...</span>
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center gap-3">
                                            <span className="text-lg font-bold">Pay ₹99</span>
                                            <span className="text-red-500 line-through text-sm">₹999</span>
                                        </div>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- PAYMENT SUCCESS MODAL --- */}
                {isPaymentSuccess && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
                        <div className="bg-[#0B1120] rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border border-green-500/20 relative overflow-hidden">
                            {/* Animated Background Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-cyan-500/5 to-transparent animate-pulse pointer-events-none"></div>

                            {/* Success Checkmark Animation */}
                            <div className="relative z-10 mb-6 flex justify-center">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-cyan-500/20 border-4 border-green-500/30 flex items-center justify-center animate-[scale-in_0.5s_ease-out] shadow-[0_0_40px_rgba(34,197,94,0.4)]">
                                    <svg className="w-12 h-12 text-green-400 animate-[checkmark_0.6s_ease-out_0.2s_both]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Success Text */}
                            <div className="relative z-10 space-y-3">
                                <h2 className="text-3xl font-black text-white tracking-tight animate-[fadeIn_0.5s_ease-out_0.3s_both]">
                                    Payment Successful!
                                </h2>
                                <p className="text-gray-400 text-sm animate-[fadeIn_0.5s_ease-out_0.4s_both]">
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
