"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
              <div className="hidden md:flex items-center gap-8 text-xs font-medium text-gray-400 uppercase tracking-widest">
                 <a href="#benefits" className="hover:text-cyan-400 transition cursor-pointer">Architecture</a>
                 <a href="#protocol" className="hover:text-cyan-400 transition cursor-pointer">How It Works</a>
                 <a href="#faq" className="hover:text-cyan-400 transition cursor-pointer">FAQs</a>
              </div>
              <button 
                onClick={onStart} 
                className="group relative px-4 py-2 md:px-6 md:py-2 bg-white text-black text-xs md:text-sm font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-gray-200 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative">Get Started</span>
              </button>

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
            <div className="md:hidden bg-[#030712] border-b border-white/10 px-4 py-6 space-y-4 animate-[fadeIn_0.2s_ease-out]">
                 <a href="#benefits" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-gray-400 uppercase tracking-widest hover:text-cyan-400 transition">Architecture</a>
                 <a href="#protocol" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-gray-400 uppercase tracking-widest hover:text-cyan-400 transition">How It Works</a>
                 <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-gray-400 uppercase tracking-widest hover:text-cyan-400 transition">FAQs</a>
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                Start Auditing
                </button>
            </div>
         </div>

         {/* --- SCANNER VISUALIZATION --- */}
         <div className="relative w-full max-w-5xl mx-auto h-[350px] md:h-[400px] border-y border-white/5 bg-[#0B1120]/30 backdrop-blur-sm overflow-hidden mb-20 md:mb-32">
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
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-white">Precision Auditing in <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">3 Simple Steps</span></h2>
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
                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                {/* Step 1 Visual */}
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30 text-green-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
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
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                            </div>
                            <div className="text-left">
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Support</div>
                                <div className="text-sm font-bold text-gray-200 group-hover:text-cyan-400 transition">nayan@addinfi.com</div>
                            </div>
                        </a>

                        <a href="tel:+918381032114" className="flex items-center gap-4 bg-[#0B1120] border border-white/5 p-4 rounded-xl hover:border-green-500/30 transition group min-w-[250px]">
                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 group-hover:scale-110 transition">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
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
  { label: "Engagement Rate", desc: "Estimated level of customer interaction (clicks, views) with your posts." },
  { label: "Total Photos", desc: "The total volume of images uploaded by the owner and customers combined." },
  { label: "Listing Age", desc: "The estimated number of years the business profile has been active on Google." },
  { label: "Profile Strength", desc: "An overall health score (0-100) based on profile completeness and optimization." },
  { label: "Suspension Risk", desc: "The likelihood of Google suspending the profile due to policy violations." },
  { label: "Audit Gap", desc: "The percentage difference in overall performance metrics between you and the market leader." }
];

// --- LOADING MESSAGES ---
const LOADING_MESSAGES = [
  "Initiating secure profile scan...",
  "Identifying top local competitors...",
  "Analyzing review sentiment & gaps...",
  "Synthesizing strategic growth insights...",
  "Almost there! Finalizing your report..."
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

// --- MAIN PAGE COMPONENT ---
export default function Page() {
  const { data: session } = useSession();
  const [started, setStarted] = useState(false);
  if (session || started) { return <DashboardLogic />; }
  return <LandingPage onStart={() => setStarted(true)} />;
}

// --- DASHBOARD COMPONENT ---
function DashboardLogic() {
  const reportRef = useRef<HTMLDivElement>(null);
  
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

  // --- LOADER EFFECT ---
  useEffect(() => {
    if (!loading) { setLoadingMsgIndex(0); return; }
    const interval = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [loading]);

  // --- SEARCH EFFECTS ---
  useEffect(() => {
    if (debouncedMyQuery.length < 3) return setMySuggestions([]);
    if (myBusiness) return; 
    const fetchMyBiz = async () => {
      try {
        const res = await axios.post("/api/n8n-search", { keyword: debouncedMyQuery });
        if (Array.isArray(res.data)) setMySuggestions(res.data);
        else if (res.data.local_results) setMySuggestions(res.data.local_results);
      } catch (e) { console.error(e); }
    };
    fetchMyBiz();
  }, [debouncedMyQuery]);

  useEffect(() => {
    if (debouncedCompQuery.length < 3) return setCompSuggestions([]);
    const fetchComp = async () => {
      try {
        const res = await axios.post("/api/n8n-search", { keyword: debouncedCompQuery });
        if (Array.isArray(res.data)) setCompSuggestions(res.data);
        else if (res.data.local_results) setCompSuggestions(res.data.local_results);
      } catch (e) { console.error(e); }
    };
    fetchComp();
  }, [debouncedCompQuery]);

  // --- ANALYZE ---
  const handleAnalyze = async () => {
    setLoading(true);
    setErrorMsg(null); 
    setReport(null);
    try {
      const res = await axios.post("/api/n8n-proxy", {
        keyword: compQuery,
        myBusiness: myBusiness,
        competitors: competitors,
        userDetails: {
            name: myBusiness?.title || myBusiness?.name || "",
            phone: myBusiness?.phone || myBusiness?.formatted_phone_number || "",
            website: myBusiness?.website || "",
            email: myBusiness?.email || ""
        }
      });

      let cleanJson = "";
      if (res.data) {
          if (res.data.audit_score) { setReport(res.data); finalize(); return; }
          if (Array.isArray(res.data) && res.data[0]?.text) cleanJson = res.data[0].text;
          else if (res.data.text) cleanJson = res.data.text;
          else if (res.data.output) cleanJson = res.data.output;
          else if (typeof res.data === 'string') cleanJson = res.data;
          else cleanJson = JSON.stringify(res.data);
      }

      if (!cleanJson || cleanJson.trim() === "") throw new Error("Empty Response from Analysis Engine");

      const sanitized = cleanJson.replace(/```json/g, "").replace(/```/g, "").trim();
      setReport(JSON.parse(sanitized));
      finalize();

    } catch (e: any) {
      console.error("Analysis Failed", e);
      const message = e.response?.data?.error || e.message || "Unknown Connection Error";
      setErrorMsg(message);
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
    if (isUnlocked) { generatePDF(); } else { setShowPaymentModal(true); }
  };

  // --- PDF GENERATION ---
  const generatePDF = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 500)); 

    try {
        const element = reportRef.current;
        const canvas = await html2canvas(element, { 
            scale: 2, 
            useCORS: true,
            allowTaint: true,
            scrollY: 0, 
            windowWidth: 1440,
            backgroundColor: "#ffffff"
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidthPx = canvas.width;
        const imgHeightPx = canvas.height;
        const marginPx = 40; 
        const pdfWidth = imgWidthPx + (marginPx * 2);
        const pdfHeight = imgHeightPx + (marginPx * 2);

        const pdf = new jsPDF({
            orientation: "p",
            unit: "px",
            format: [pdfWidth, pdfHeight] 
        });

        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
        pdf.addImage(imgData, 'PNG', marginPx, marginPx, imgWidthPx, imgHeightPx);
        pdf.save(`${myBusiness?.title || 'GMB'}_Audit_Report.pdf`);
    } catch (err) {
        console.error("PDF Error", err);
        alert("Failed to generate PDF.");
    }
    setDownloading(false);
  };

  const toggleCompetitor = (place: any) => {
    const isSelected = competitors.find(c => c.place_id === place.place_id);
    if (isSelected) setCompetitors(competitors.filter(c => c.place_id !== place.place_id));
    else {
      if (competitors.length >= 2) return alert("Max 2 competitors allowed.");
      setCompetitors([...competitors, place]);
    }
  };

  // --- HELPER COMPONENT FOR PAYWALL BLUR ---
  const PaywallBlur = ({ children, isLocked }: { children: React.ReactNode, isLocked: boolean }) => {
    if (!isLocked) return <>{children}</>;
    return (
      <div className="relative group cursor-pointer" onClick={() => setShowPaymentModal(true)}>
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
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <span className="text-lg md:text-xl font-bold tracking-tight text-gray-100">GMB<span className="text-blue-500">Audit</span>Pro</span>
             </div>
             <div className="flex items-center gap-4">
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
                {step > 1 && <button onClick={() => { window.location.reload(); }} className="text-xs md:text-sm text-gray-400 hover:text-red-400 font-medium transition">Reset</button>}
                <button onClick={() => window.location.href = "/"} className="text-xs md:text-sm text-gray-400 hover:text-white font-medium ml-2 transition">Home</button>
             </div>
          </div>
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
                                       <div className="text-sm text-gray-500">{place.address}</div>
                                       <div className="flex items-center gap-2 mt-1"><span className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded text-xs font-bold border border-yellow-500/20"><StarIcon /> {place.rating || "N/A"}</span><span className="text-xs text-gray-500 font-medium">({place.reviews || place.user_ratings_total || 0} reviews)</span></div>
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
                      <span className="text-sm text-gray-500 font-medium tracking-tight">({myBusiness?.reviews || myBusiness?.user_ratings_total || 0} reviews)</span>
                  </div>
               </div>
               <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium text-gray-400 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition">Change</button>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mt-12 mb-6 gap-4">
                <h2 className="text-2xl font-bold text-white text-center md:text-left">Step 2: Add Competitors <span className="text-sm font-normal text-gray-500 ml-2 block md:inline">(Max 2)</span></h2>
                <button onClick={handleAnalyze} disabled={loading || competitors.length === 0} className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 transition disabled:opacity-50 disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-3 text-sm">
                    {loading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Processing...
                        </>
                    ) : (
                        <>
                            <span>Generate Audit Report</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        </>
                    )}
                </button>
            </div>

            <div className="relative z-50">
                <input className="w-full bg-[#0B1120] border border-white/10 p-4 rounded-xl text-lg text-white placeholder-gray-500 focus:border-cyan-500 outline-none transition" placeholder="Search for a competitor..." value={compQuery} onChange={e => setCompQuery(e.target.value)} />
                {compSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-[#0B1120] border border-white/10 rounded-xl shadow-2xl mt-2 max-h-60 overflow-y-auto z-50">
                         {compSuggestions.map((place) => {
                           const isAdded = competitors.find(c => c.place_id === place.place_id);
                           return (
                            <div key={place.place_id} onClick={() => toggleCompetitor(place)} className={`p-4 cursor-pointer border-b border-white/5 flex justify-between items-center transition-colors ${isAdded ? 'bg-green-900/20' : 'hover:bg-white/5'}`}>
                                <div className="font-medium text-gray-200 truncate pr-4">{place.title}</div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 whitespace-nowrap">
                                    <span className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20"><StarIcon /> {place.rating || "N/A"}</span>
                                </div>
                                <button className={`ml-auto font-bold text-xs px-3 py-1 rounded whitespace-nowrap border ${isAdded ? 'bg-white/10 border-white/20 text-gray-400' : 'bg-green-500/10 border-green-500/50 text-green-400 hover:bg-green-500/20'}`}>{isAdded ? "ADDED ✓" : "+ ADD"}</button>
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
              </div>
            </div>

            {/* EXECUTIVE SUMMARY */}
            {report.executive_summary && (
                <div className="max-w-5xl mx-auto -mt-24 mb-20 relative z-20">
                    <div className="bg-[#0B1120] p-8 rounded-xl shadow-2xl border-t-4 border-blue-600 border-x border-b border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-blue-900/30 text-blue-400 p-2 rounded-lg border border-blue-500/20"><SearchIcon /></span>
                            <h3 className="font-bold text-gray-100 text-xl uppercase tracking-wide">Executive Summary</h3>
                        </div>
                        <p className="text-gray-300 leading-8 text-lg font-medium text-justify whitespace-pre-line">{report.executive_summary}</p>
                    </div>
                </div>
            )}

            <div className="max-w-[95rem] mx-auto space-y-20">
              
              {/* MATRIX TABLE */}
              <div className="bg-[#0B1120] rounded-2xl shadow-xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                   <div className="flex items-center gap-3">
                        <span className="bg-blue-900/30 text-blue-400 p-2 rounded-lg border border-blue-500/20"><ChartIcon /></span>
                        <h3 className="font-bold text-gray-100 text-xl uppercase tracking-wide">Detailed Market Data</h3>
                   </div>
                </div>
                <div className="w-full overflow-x-auto">
                  <table className="w-full table-fixed min-w-[800px]">
                    <thead>
                      <tr className="bg-[#0B1120] text-left text-gray-400 text-sm uppercase tracking-wider">
                        <th className="p-4 font-medium border-b border-white/10 w-[20%]">Metric</th>
                        <th className="p-4 text-cyan-400 font-bold text-lg border-b border-white/10 border-l-4 border-l-cyan-500 w-[26%] bg-cyan-900/10 align-top">YOU</th>
                        {report.matrix?.competitors?.map((c: any, i: number) => <th key={i} className="p-4 font-bold text-gray-200 border-b border-white/10 border-l border-white/5 w-[27%] align-top break-words">{c.name}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-300 text-base">
                      {/* FIRST 7 ROWS (ALWAYS VISIBLE) */}
                      <tr><td className="py-6 px-4 font-bold bg-white/5">Category</td><td className="py-6 px-4 bg-cyan-900/10 border-l-4 border-cyan-500 font-medium break-words align-top">{report.matrix?.me?.category}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l border-white/5 break-words align-top">{c.category}</td>)}</tr>
                      <tr><td className="py-6 px-4 font-bold bg-white/5">Reviews</td><td className="py-6 px-4 bg-cyan-900/10 border-l-4 border-cyan-500 font-medium break-words align-top">{report.matrix?.me?.rating}⭐ ({report.matrix?.me?.reviews})</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l border-white/5 break-words align-top">{c.rating}⭐ ({c.reviews})</td>)}</tr>
                      <tr><td className="py-6 px-4 font-bold bg-white/5">Review Velocity</td><td className="py-6 px-4 bg-cyan-900/10 border-l-4 border-cyan-500 font-medium break-words align-top">{report.matrix?.me?.review_velocity}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l border-white/5 break-words align-top">{c.review_velocity}</td>)}</tr>
                      <tr><td className="py-6 px-4 font-bold bg-white/5">Review Response</td><td className="py-6 px-4 bg-cyan-900/10 border-l-4 border-cyan-500 font-medium break-words align-top">{report.matrix?.me?.review_response}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l border-white/5 break-words align-top">{c.review_response}</td>)}</tr>
                      <tr><td className="py-6 px-4 font-bold bg-white/5">Review Growth</td><td className="py-6 px-4 bg-cyan-900/10 border-l-4 border-cyan-500 font-medium break-words align-top">{report.matrix?.me?.review_growth}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l border-white/5 break-words align-top">{c.review_growth}</td>)}</tr>
                      <tr><td className="py-6 px-4 font-bold bg-white/5">Rating Trend</td><td className="py-6 px-4 bg-cyan-900/10 border-l-4 border-cyan-500 font-medium break-words align-top">{report.matrix?.me?.rating_trend}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l border-white/5 break-words align-top">{c.rating_trend}</td>)}</tr>
                      <tr><td className="py-6 px-4 font-bold bg-white/5">Sentiment</td><td className="py-6 px-4 bg-cyan-900/10 border-l-4 border-cyan-500 font-medium break-words align-top">{report.matrix?.me?.sentiment}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l border-white/5 break-words align-top">{c.sentiment}</td>)}</tr>
                      
                      {/* LOCKED ROWS (HIDDEN BEHIND BLUR IF NOT UNLOCKED) */}
                      {!isUnlocked ? (
                         <tr>
                            <td colSpan={2 + (report.matrix?.competitors?.length || 0)} className="p-0 relative h-64">
                               <div className="absolute inset-0 overflow-hidden">
                                  <table className="w-full table-fixed h-full opacity-30 pointer-events-none select-none filter blur-sm">
                                     <tbody className="divide-y divide-white/5">
                                        <tr><td className="py-6 px-4 font-bold">NPS Score</td><td className="py-6 px-4">82</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4">76</td>)}</tr>
                                        <tr><td className="py-6 px-4 font-bold">Post Freq</td><td className="py-6 px-4">Weekly</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4">Monthly</td>)}</tr>
                                        <tr><td className="py-6 px-4 font-bold">Engagement</td><td className="py-6 px-4">High</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4">Low</td>)}</tr>
                                        <tr><td className="py-6 px-4 font-bold">Photos</td><td className="py-6 px-4">120</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4">45</td>)}</tr>
                                     </tbody>
                                  </table>
                               </div>
                               <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#0B1120] to-transparent z-10 cursor-pointer group" onClick={() => setShowPaymentModal(true)}>
                                  <div className="bg-black/60 p-3 rounded-full border border-cyan-500/50 text-cyan-400 group-hover:text-white group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                                     <LockIcon />
                                  </div>
                               </div>
                            </td>
                         </tr>
                      ) : (
                         <>
                            <tr><td className="py-6 px-4 font-bold bg-white/5">NPS Score</td><td className="py-6 px-4 bg-cyan-900/10 border-l-4 border-cyan-500 font-medium break-words align-top">{report.matrix?.me?.nps}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l border-white/5 break-words align-top">{c.nps}</td>)}</tr>
                            <tr><td className="py-6 px-4 font-bold bg-white/5">Post Freq</td><td className="py-6 px-4 bg-cyan-900/10 border-l-4 border-cyan-500 font-medium break-words align-top">{report.matrix?.me?.post_frequency}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l border-white/5 break-words align-top">{c.post_frequency}</td>)}</tr>
                            <tr><td className="py-6 px-4 font-bold bg-white/5">Engagement</td><td className="py-6 px-4 bg-cyan-900/10 border-l-4 border-cyan-500 font-medium break-words align-top">{report.matrix?.me?.post_engagement}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l border-white/5 break-words align-top">{c.post_engagement}</td>)}</tr>
                            <tr><td className="py-6 px-4 font-bold bg-white/5">Photos</td><td className="py-6 px-4 bg-cyan-900/10 border-l-4 border-cyan-500 font-medium break-words align-top">{report.matrix?.me?.total_photos}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l border-white/5 break-words align-top">{c.total_photos}</td>)}</tr>
                            <tr><td className="py-6 px-4 font-bold bg-white/5">Age</td><td className="py-6 px-4 bg-cyan-900/10 border-l-4 border-cyan-500 font-medium break-words align-top">{report.matrix?.me?.listing_age}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l border-white/5 break-words align-top">{c.listing_age}</td>)}</tr>
                            <tr><td className="py-6 px-4 font-bold bg-white/5">Profile Strength</td><td className="py-6 px-4 bg-cyan-900/10 border-l-4 border-cyan-500 font-medium break-words align-top">{report.matrix?.me?.profile_strength}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l border-white/5 break-words align-top">{c.profile_strength}</td>)}</tr>
                            <tr><td className="py-6 px-4 font-bold bg-white/5">Risk</td><td className="py-6 px-4 bg-cyan-900/10 border-l-4 border-cyan-500 font-medium break-words align-top">{report.matrix?.me?.suspension_risk}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l border-white/5 break-words align-top">{c.suspension_risk}</td>)}</tr>
                            <tr><td className="py-6 px-4 font-bold bg-white/5">Audit Gap</td><td className="py-6 px-4 bg-cyan-900/10 border-l-4 border-cyan-500 font-medium break-words align-top">{report.matrix?.me?.audit_gap}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l border-white/5 break-words align-top">{c.audit_gap}</td>)}</tr>
                         </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* STRATEGIC CARDS */}
              <div className="grid md:grid-cols-2 gap-6">
                  {/* GAPS CARD */}
                  <div className="bg-[#0B1120] rounded-xl shadow-lg border-l-4 border-red-500 p-6 border border-white/5 relative overflow-hidden">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-red-500/10 text-red-500 p-0.5 rounded-lg border border-red-500/20"><ErrorIcon /></span>
                        <h3 className="font-bold text-gray-100 text-xl uppercase tracking-wide">Your Profile Gaps</h3>
                      </div>
                      <ul className="space-y-3">
                          {/* SHOW TOP 3 ONLY */}
                          {report.weaknesses?.slice(0, 3).map((item: string, i: number) => (
                              <li key={i} className="flex items-start gap-3 text-gray-300 text-lg"><span className="text-red-500 font-bold mt-0.5 flex-shrink-0">✕</span>{item}</li>
                          )) || <p className="text-gray-500 italic">No critical issues found.</p>}
                      </ul>
                      {/* PAYWALL BLUR FOR REMAINING */}
                      {!isUnlocked && report.weaknesses?.length > 3 && (
                          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/90 to-transparent flex items-center justify-center pt-10 cursor-pointer group" onClick={() => setShowPaymentModal(true)}>
                              <div className="bg-black/60 p-3 rounded-full border border-red-500/50 text-red-400 group-hover:text-white group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(248,113,113,0.5)]">
                                  <LockIcon />
                              </div>
                          </div>
                      )}
                      {/* SHOW REST IF UNLOCKED */}
                      {isUnlocked && report.weaknesses?.slice(3).map((item: string, i: number) => (
                          <li key={i+3} className="flex items-start gap-3 text-gray-300 text-lg mt-3"><span className="text-red-500 font-bold mt-0.5 flex-shrink-0">✕</span>{item}</li>
                      ))}
                  </div>

                  {/* WINS CARD */}
                  <div className="bg-[#0B1120] rounded-xl shadow-lg border-l-4 border-green-500 p-6 border border-white/5 relative overflow-hidden">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-green-500/10 text-green-500 p-2 rounded-lg border border-green-500/20"><TrophyIcon /></span>
                        <h3 className="font-bold text-gray-100 text-xl uppercase tracking-wide">Competitor Wins</h3>
                      </div>
                      <ul className="space-y-3">
                          {/* SHOW TOP 3 ONLY */}
                          {report.competitor_strengths?.slice(0, 3).map((item: string, i: number) => (
                              <li key={i} className="flex items-start gap-3 text-gray-300 text-lg"><span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>{item}</li>
                          )) || <p className="text-gray-500 italic">Analyzing competitor data...</p>}
                      </ul>
                      {/* PAYWALL BLUR */}
                      {!isUnlocked && report.competitor_strengths?.length > 3 && (
                          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/90 to-transparent flex items-center justify-center pt-10 cursor-pointer group" onClick={() => setShowPaymentModal(true)}>
                              <div className="bg-black/60 p-3 rounded-full border border-green-500/50 text-green-400 group-hover:text-white group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                                  <LockIcon />
                              </div>
                          </div>
                      )}
                      {isUnlocked && report.competitor_strengths?.slice(3).map((item: string, i: number) => (
                          <li key={i+3} className="flex items-start gap-3 text-gray-300 text-lg mt-3"><span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>{item}</li>
                      ))}
                  </div>
              </div>

               {/* GAP ANALYSIS */}
               {report.gap_analysis && (
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-px bg-white/10 flex-1"></div>
                        <h2 className="text-xl font-bold text-gray-100 uppercase tracking-wide">Metric Gap Analysis & Fixes</h2>
                        <div className="h-px bg-white/10 flex-1"></div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* REPUTATION */}
                        <div className="bg-[#0B1120] border border-white/10 rounded-xl p-6 shadow-md relative overflow-hidden">
                            <h3 className="font-bold text-blue-400 mb-4 uppercase pb-2">Reputation Fixes</h3>
                            <ul className="space-y-4">
                                {isUnlocked ? report.gap_analysis.reputation?.map((fix: string, i: number) => (
                                    <li key={i} className="text-base text-gray-300 bg-blue-500/5 p-4 rounded-lg border border-blue-500/10"><span className="font-bold text-blue-400 block mb-1">Step {i+1}:</span> {fix}</li>
                                )) : (
                                    <>
                                        <li className="text-base text-gray-300 bg-blue-500/5 p-4 rounded-lg border border-blue-500/10"><span className="font-bold text-blue-400 block mb-1">Step 1:</span> {report.gap_analysis.reputation?.[0]}</li>
                                        <PaywallBlur isLocked={true}><li className="text-base text-gray-300 bg-blue-500/5 p-4 rounded-lg border border-blue-500/10 blur-sm"><span className="font-bold text-blue-400 block mb-1">Step 2:</span> Hidden Strategy</li></PaywallBlur>
                                    </>
                                )}
                            </ul>
                        </div>
                        {/* ENGAGEMENT */}
                        <div className="bg-[#0B1120] border border-white/10 rounded-xl p-6 shadow-md relative overflow-hidden">
                            <h3 className="font-bold text-purple-400 mb-4 uppercase pb-2">Engagement Fixes</h3>
                             <ul className="space-y-4">
                                {isUnlocked ? report.gap_analysis.engagement?.map((fix: string, i: number) => (
                                    <li key={i} className="text-base text-gray-300 bg-purple-500/5 p-4 rounded-lg border border-purple-500/10"><span className="font-bold text-purple-400 block mb-1">Step {i+1}:</span> {fix}</li>
                                )) : (
                                    <>
                                        <li className="text-base text-gray-300 bg-purple-500/5 p-4 rounded-lg border border-purple-500/10"><span className="font-bold text-purple-400 block mb-1">Step 1:</span> {report.gap_analysis.engagement?.[0]}</li>
                                        <PaywallBlur isLocked={true}><li className="text-base text-gray-300 bg-purple-500/5 p-4 rounded-lg border border-purple-500/10 blur-sm"><span className="font-bold text-purple-400 block mb-1">Step 2:</span> Hidden Strategy</li></PaywallBlur>
                                    </>
                                )}
                             </ul>
                        </div>
                        {/* RELEVANCE */}
                        <div className="bg-[#0B1120] border border-white/10 rounded-xl p-6 shadow-md relative overflow-hidden">
                            <h3 className="font-bold text-green-400 mb-4 uppercase pb-2">Relevance Fixes</h3>
                             <ul className="space-y-4">
                                {isUnlocked ? report.gap_analysis.relevance?.map((fix: string, i: number) => (
                                    <li key={i} className="text-base text-gray-300 bg-green-500/5 p-4 rounded-lg border border-green-500/10"><span className="font-bold text-green-400 block mb-1">Step {i+1}:</span> {fix}</li>
                                )) : (
                                    <>
                                        <li className="text-base text-gray-300 bg-green-500/5 p-4 rounded-lg border border-green-500/10"><span className="font-bold text-green-400 block mb-1">Step 1:</span> {report.gap_analysis.relevance?.[0]}</li>
                                        <PaywallBlur isLocked={true}><li className="text-base text-gray-300 bg-green-500/5 p-4 rounded-lg border border-green-500/10 blur-sm"><span className="font-bold text-green-400 block mb-1">Step 2:</span> Hidden Strategy</li></PaywallBlur>
                                    </>
                                )}
                             </ul>
                        </div>
                    </div>
                 </div>
               )}

               {/* 4-WEEK PLAN */}
               {report.four_week_plan && (
                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="h-px bg-white/10 flex-1"></div>
                      <div className="flex items-center gap-3">
                         <span className="bg-blue-900/30 text-blue-400 p-2 rounded-lg border border-blue-500/20"><ListIcon /></span>
                         <h3 className="font-bold text-gray-100 text-xl uppercase tracking-wide">4-Week Growth Architecture</h3>
                      </div>
                      <div className="h-px bg-white/10 flex-1"></div>
                   </div>
                   <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      {report.four_week_plan.map((week: any, i: number) => {
                        const isWeekLocked = !isUnlocked && i > 0; // Lock weeks 2,3,4
                        return (
                            <div key={i} className={`bg-[#0B1120] rounded-xl shadow-lg border border-white/10 p-6 relative overflow-hidden ${isWeekLocked ? 'opacity-70' : 'hover:border-cyan-500/30 transition'}`}>
                               <div className="flex justify-between items-center mb-4">
                                  <h3 className="font-black text-2xl text-blue-400">{week.week}</h3>
                                  <span className="text-xs font-medium bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">{week.time_est}</span>
                               </div>
                               <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 pb-2">{week.focus}</div>
                               
                               <ul className="space-y-3">
                                   {!isUnlocked && i === 0 ? (
                                       // Week 1: Show half tasks, blur rest
                                       <>
                                           {week.tasks?.slice(0, Math.ceil(week.tasks.length / 2)).map((task: string, k: number) => (
                                               <li key={k} className="flex items-start gap-2 text-base text-gray-300"><span className="text-blue-500 font-bold mt-px">•</span><span className="leading-snug font-medium">{task}</span></li>
                                           ))}
                                           <div className="relative mt-4 cursor-pointer group flex justify-center" onClick={() => setShowPaymentModal(true)}>
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/80 to-transparent"></div>
                                                <div className="relative z-10 bg-black/60 p-3 rounded-full border border-blue-500/50 text-blue-400 group-hover:text-white group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                                                    <LockIcon />
                                                </div>
                                           </div>
                                       </>
                                   ) : isWeekLocked ? (
                                       // Weeks 2-4: Completely Blurred
                                       <div className="h-40 flex items-center justify-center relative cursor-pointer group" onClick={() => setShowPaymentModal(true)}>
                                           <div className="absolute inset-0 filter blur-md bg-white/5"></div>
                                           <div className="relative z-10 bg-black/60 p-3 rounded-full border border-white/20 text-gray-400 group-hover:text-white group-hover:scale-110 transition-all shadow-lg">
                                               <LockIcon />
                                           </div>
                                       </div>
                                   ) : (
                                       // Unlocked: Show all
                                       week.tasks?.map((task: string, k: number) => (
                                           <li key={k} className="flex items-start gap-2 text-base text-gray-300"><span className="text-blue-500 font-bold mt-px">•</span><span className="leading-snug font-medium">{task}</span></li>
                                       ))
                                   )}
                               </ul>
                            </div>
                        );
                      })}
                   </div>
                </div>
              )}

              {/* GLOSSARY */}
              <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="h-px bg-white/10 flex-1"></div>
                      <div className="flex items-center gap-3">
                         <span className="bg-white/5 text-gray-400 p-2 rounded-lg border border-white/10"><BookIcon /></span>
                         <h3 className="font-bold text-gray-100 text-xl uppercase tracking-wide">Metric Definitions</h3>
                      </div>
                      <div className="h-px bg-white/10 flex-1"></div>
                   </div>
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
              </div>

            </div>
          </div>
        )}

        {/* --- LOADER --- */}
        {loading && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030712]/90 backdrop-blur-sm transition-all duration-300">
            <div className="relative mb-6">
              <div className="w-20 h-20 border-4 border-blue-900 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-cyan-500">
                <SearchIcon />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Generating Audit Report</h3>
            
            <p key={loadingMsgIndex} className="text-gray-400 font-medium animate-[fadeIn_0.5s_ease-in-out]">
              {LOADING_MESSAGES[loadingMsgIndex]}
            </p>
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