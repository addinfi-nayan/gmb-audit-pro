"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// ==========================================
//  PART 1: THE CYBER-CORE LANDING PAGE
// ==========================================

const LandingPage = () => {
  
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

  // --- LIVE STATS COUNTER ---
  const [profileCount, setProfileCount] = useState(470);
  const [issueCount, setIssueCount] = useState(1890);

  useEffect(() => {
    let start = 0;
    const end = 369;
    const timer = setInterval(() => {
      start += 3; 
      if (start > end) {
        start = end;
        clearInterval(timer);
        setInterval(() => {
            setProfileCount(prev => prev + 1);
            setIssueCount(prev => prev + Math.floor(Math.random() * 5)); 
        }, 5000); 
      }
      setProfileCount(start);
      setIssueCount(Math.floor(start * 4.2)); 
    }, 10);
    return () => clearInterval(timer);
  }, []);

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
           <div className="flex items-center gap-4 md:gap-8">
              <div className="hidden md:flex items-center gap-8 text-xs font-medium text-gray-400 uppercase tracking-widest">
                 <a href="#benefits" className="hover:text-cyan-400 transition cursor-pointer">Architecture</a>
                 <a href="#protocol" className="hover:text-cyan-400 transition cursor-pointer">How It Works</a>
                 <a href="#faq" className="hover:text-cyan-400 transition cursor-pointer">FAQs</a>
              </div>
              <button 
                onClick={() => signIn("google")} 
                className="group relative px-4 py-2 md:px-6 md:py-2 bg-white text-black text-xs md:text-sm font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-gray-200 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative">Get Started</span>
              </button>
           </div>
        </div>
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
                onClick={() => signIn("google")}
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
            
            {/* Code Terminal Overlay */}
            <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-auto md:w-auto p-4 md:p-6 bg-black/80 border border-white/10 rounded-lg font-mono text-[10px] md:text-xs text-left max-w-sm backdrop-blur-md">
                <div className="flex gap-2 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-1 text-gray-400">
                    <p>&gt; Connecting to GMB API...</p>
                    <p className="text-green-400">&gt; Connection Established (24ms)</p>
                    <p>&gt; Fetching Competitor Nodes [Node 1, Node 2]...</p>
                    <p>&gt; Analyzing Sentiment Vectors...</p>
                    <p className="text-cyan-400 animate-pulse">&gt; WAITING FOR USER INPUT_</p>
                </div>
            </div>
         </div>

         {/* --- LIVE STATS GRID --- */}
         <div className="max-w-7xl mx-auto px-4 md:px-6 mb-24 md:mb-32">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {/* Card 1 */}
                <div className="bg-[#0B1120] border border-white/10 p-4 md:p-6 rounded-xl hover:border-blue-500/30 transition group">
                    <p className="text-gray-400 text-[10px] md:text-xs font-medium uppercase tracking-wider mb-2">Profiles Analyzed</p>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-2xl md:text-4xl font-bold text-white tabular-nums">{profileCount}</span>
                        <span className="text-blue-500 mb-1 font-bold">+</span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-xs text-blue-400">
                        <span>Real-time processing</span>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-[#0B1120] border border-white/10 p-4 md:p-6 rounded-xl hover:border-purple-500/30 transition group">
                    <p className="text-gray-400 text-[10px] md:text-xs font-medium uppercase tracking-wider mb-2">Issues Detected</p>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-2xl md:text-4xl font-bold text-white tabular-nums">{issueCount}</span>
                        <span className="text-purple-500 mb-1 font-bold">+</span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-xs text-purple-400">
                        <span>Critical gaps found</span>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-[#0B1120] border border-white/10 p-4 md:p-6 rounded-xl hover:border-green-500/30 transition group">
                    <p className="text-gray-400 text-[10px] md:text-xs font-medium uppercase tracking-wider mb-2">Accuracy Rate</p>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-2xl md:text-4xl font-bold text-white">99.8</span>
                        <span className="text-green-500 mb-1 font-bold">%</span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-xs text-green-400">
                        <span>Verified data sources</span>
                    </div>
                </div>

                {/* Card 4 */}
                <div className="bg-[#0B1120] border border-white/10 p-4 md:p-6 rounded-xl hover:border-cyan-500/30 transition group">
                    <p className="text-gray-400 text-[10px] md:text-xs font-medium uppercase tracking-wider mb-2">Hrs Saved</p>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-2xl md:text-4xl font-bold text-white">4.5</span>
                        <span className="text-cyan-500 mb-1 font-bold">hrs</span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-xs text-cyan-400">
                        <span>vs Manual Auditing</span>
                    </div>
                </div>
            </div>
         </div>

         {/* --- BENEFITS SECTION --- */}
         <div id="benefits" className="max-w-7xl mx-auto px-4 md:px-6 mb-24 md:mb-40 text-left">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
               <div>
                  <h2 className="text-2xl md:text-5xl font-bold text-white mb-4 md:mb-6">SYSTEM ARCHITECTURE</h2>
                  <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-6 md:mb-8">
                     Most audit tools just dump data. We process it. Our engine cross-references 20+ ranking signals against the top 3 competitors in your exact proximity to find the "Winning Formula."
                  </p>
                  <ul className="space-y-3 md:space-y-4">
                     {[
                        "Real-time Local Pack Extraction",
                        "Sentiment Analysis using OpenAI GPT-4",
                        "Suspension Risk Probability Calculation",
                        "Week-by-Week Growth Roadmap"
                     ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-gray-300 text-sm md:text-base">
                           <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs">✓</span>
                           {item}
                        </li>
                     ))}
                  </ul>
               </div>
               
               <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-[#0f172a] p-4 md:p-6 rounded-2xl border border-white/5 hover:border-cyan-500/50 transition duration-300">
                     <div className="text-2xl md:text-4xl mb-3 md:mb-4">🚀</div>
                     <h3 className="font-bold text-white mb-1 md:mb-2 text-sm md:text-base">High Velocity</h3>
                     <p className="text-[10px] md:text-xs text-gray-500">20x faster than manual auditing. Get results in 45 seconds.</p>
                  </div>
                  <div className="bg-[#0f172a] p-4 md:p-6 rounded-2xl border border-white/5 hover:border-cyan-500/50 transition duration-300 mt-0 md:mt-8">
                     <div className="text-2xl md:text-4xl mb-3 md:mb-4">🎯</div>
                     <h3 className="font-bold text-white mb-1 md:mb-2 text-sm md:text-base">Hyper Accuracy</h3>
                     <p className="text-[10px] md:text-xs text-gray-500">Live data scraping ensures 100% current market reality.</p>
                  </div>
                  <div className="bg-[#0f172a] p-4 md:p-6 rounded-2xl border border-white/5 hover:border-cyan-500/50 transition duration-300">
                     <div className="text-2xl md:text-4xl mb-3 md:mb-4">🛡️</div>
                     <h3 className="font-bold text-white mb-1 md:mb-2 text-sm md:text-base">Safe & Secure</h3>
                     <p className="text-[10px] md:text-xs text-gray-500">Official API compliance. No account risk.</p>
                  </div>
                  <div className="bg-[#0f172a] p-4 md:p-6 rounded-2xl border border-white/5 hover:border-cyan-500/50 transition duration-300 mt-0 md:mt-8">
                     <div className="text-2xl md:text-4xl mb-3 md:mb-4">🤖</div>
                     <h3 className="font-bold text-white mb-1 md:mb-2 text-sm md:text-base">Automated Strategy</h3>
                     <p className="text-[10px] md:text-xs text-gray-500">We don't just find problems; we generate the fix.</p>
                  </div>
               </div>
            </div>
         </div>

         {/* --- HOW IT WORKS (PROTOCOL) --- */}
         <div id="protocol" className="max-w-7xl mx-auto px-4 md:px-6 mb-24 md:mb-40 text-left pt-10 md:pt-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 border-b border-white/10 pb-6">
                <div className="mb-4 md:mb-0">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">OPERATIONAL PROTOCOL</h2>
                    <p className="text-gray-500 text-xs md:text-sm font-mono">SYSTEM WORKFLOW V2.0</p>
                </div>
                <div className="text-left md:text-right">
                    <p className="text-cyan-500 font-mono text-[10px] md:text-xs">STATUS: READY</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
                {/* Connector Line (Hidden on Mobile) */}
                <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-blue-900 via-cyan-900 to-blue-900 -z-10"></div>

                {[
                    { step: "01", title: "Target Identification", desc: "System scans local pack specifically for your niche keywords to identify the dominant competitors." },
                    { step: "02", title: "Gap Analysis", desc: "AI compares your review velocity, sentiment, and profile completeness against the market leaders." },
                    { step: "03", title: "Strategic Injection", desc: "Receive a 4-week tactical roadmap to inject missing signals and boost ranking authority." }
                ].map((item, i) => (
                    <div key={i} className="group relative bg-[#030712] p-6 md:p-8 border border-white/10 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.2)]">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 mb-4 md:mb-6 text-lg md:text-xl font-mono font-bold text-cyan-400 group-hover:bg-cyan-500/10 transition-colors">
                            {item.step}
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3 group-hover:text-cyan-400 transition-colors">{item.title}</h3>
                        <p className="text-gray-400 text-xs md:text-sm leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>
         </div>

         {/* --- MODULES GRID --- */}
         <div id="modules" className="max-w-7xl mx-auto px-4 md:px-6 mb-24 md:mb-32 pt-10 md:pt-20">
            <div className="bg-[#0B1120] border border-white/10 rounded-2xl p-6 md:p-12 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-blue-600/10 rounded-full blur-[100px]"></div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 md:mb-12 text-center">INTELLIGENCE MODULES</h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {[
                        { title: "Sentiment Engine", val: "ACTIVE", desc: "Natural Language Processing to detect negative sentiment clusters in reviews." },
                        { title: "Velocity Tracker", val: "ACTIVE", desc: "Monitors the frequency of new reviews compared to the 90-day average." },
                        { title: "Keyword Matrix", val: "ACTIVE", desc: "Identifies high-value keywords missing from your business description." },
                        { title: "Rival Spy", val: "ACTIVE", desc: "Deconstructs competitor profiles to reveal their ranking category strategy." },
                        { title: "Risk Assessor", val: "ACTIVE", desc: "Calculates probability of profile suspension based on policy violations." },
                        { title: "Growth Architect", val: "BETA", desc: "Generates actionable weekly tasks to systematically improve rank." }
                    ].map((mod, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 p-4 md:p-6 rounded-xl hover:bg-white/10 transition duration-300">
                            <div className="flex justify-between items-start mb-3 md:mb-4">
                                <h4 className="font-bold text-white text-sm md:text-base">{mod.title}</h4>
                                <span className="text-[9px] md:text-[10px] font-mono bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded border border-cyan-500/20">{mod.val}</span>
                            </div>
                            <p className="text-gray-400 text-xs leading-relaxed">{mod.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
         </div>

         {/* --- FAQS SECTION --- */}
         <div id="faq" className="max-w-6xl mx-auto px-4 md:px-6 mb-24 md:mb-32">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 md:mb-10 text-center">SYSTEM FAQs</h2>
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                {[
                    { q: "Is this data accurate?", a: "Yes. We pull live data directly from the Google Places API, ensuring 100% fidelity with current search results." },
                    { q: "Will this flag my account?", a: "No. Our audit is a passive 'read-only' scan. We do not make automated edits to your profile, so there is zero suspension risk." },
                    { q: "How long does an audit take?", a: "The Deep Scan typically completes in 45-60 seconds, depending on the volume of competitor reviews to analyze." },
                    { q: "What is the 'Growth Plan'?", a: "It is a customized checklist of actions (e.g., 'Upload 3 photos', 'Reply to John's review') generated by AI to boost your specific ranking gaps." }
                ].map((item, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-5 md:p-6 rounded-lg hover:border-blue-500/30 transition">
                        <h4 className="font-bold text-white mb-2 text-sm">{item.q}</h4>
                        <p className="text-gray-400 text-xs md:text-sm leading-relaxed">{item.a}</p>
                    </div>
                ))}
                
                {/* Contact / Support Card */}
                <div className="bg-gradient-to-br from-blue-900/40 to-black border border-blue-500/30 p-6 rounded-lg col-span-1 md:col-span-2 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                        <h4 className="font-bold text-white mb-1 text-sm">Need Enterprise Support?</h4>
                        <p className="text-gray-400 text-xs md:text-sm">Contact our technical team for custom integrations.</p>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-white font-mono text-sm">nayan@addinfi.com</p>
                        <p className="text-gray-500 text-xs font-mono">+91 83810 32114</p>
                    </div>
                </div>
            </div>
         </div>

         {/* --- FINAL CTA --- */}
         <div className="max-w-3xl mx-auto px-6 text-center mb-10">
             <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 md:mb-8">Ready to deploy?</h2>
             <p className="text-gray-400 mb-8 md:mb-10 text-sm md:text-base">Access the full suite of auditing tools. No credit card required for initial diagnostics.</p>
             <button 
               onClick={() => signIn("google")}
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
      
      <style jsx global>{`
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
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
const LockIcon = () => (<svg className="w-12 h-12 text-blue-600 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>);
const ChartIcon = () => (<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"></path></svg>);
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
  if (!session) { return <LandingPage />; }
  return <DashboardLogic />;
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
        competitors: competitors
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 group-hover:bg-black/20 transition-all rounded-xl z-10">
           <div className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transform group-hover:scale-105 transition-transform">
              <LockIcon /> Unlock Full Report
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#030712] font-sans text-white flex flex-col justify-between">
      <div className="mx-auto w-full max-w-[95rem] bg-[#030712] shadow-none min-h-screen relative flex flex-col">
        
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
                <button onClick={() => signOut()} className="text-xs md:text-sm text-gray-400 hover:text-white font-medium ml-2 transition">Sign Out</button>
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
             <div className="bg-[#0B1120] border border-cyan-500/30 p-6 rounded-2xl flex items-center gap-4 shadow-[0_0_30px_-10px_rgba(6,182,212,0.15)] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[50px] -z-10"></div>
               <div className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white p-4 rounded-xl shadow-lg shadow-blue-500/20 font-bold text-2xl w-14 h-14 flex items-center justify-center">{myBusiness?.title.charAt(0)}</div>
               <div className="flex-1">
                  <div className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-1">Auditing Target</div>
                  <div className="font-bold text-2xl text-white tracking-tight">{myBusiness?.title}</div>
                  <div className="flex items-center gap-2 mt-2">
                      <span className="flex items-center gap-1 text-sm font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-1 rounded-md"><StarIcon /> {myBusiness?.rating || "N/A"}</span>
                      <span className="text-sm text-gray-500 font-medium tracking-tight">({myBusiness?.reviews || myBusiness?.user_ratings_total || 0} reviews)</span>
                  </div>
               </div>
               <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium text-gray-400 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition">Change</button>
            </div>

            <div className="flex justify-between items-center mt-12 mb-6">
                <h2 className="text-2xl font-bold text-white">Step 2: Add Competitors <span className="text-sm font-normal text-gray-500 ml-2">(Max 2)</span></h2>
                <button onClick={handleAnalyze} disabled={loading || competitors.length === 0} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:scale-105 transition disabled:opacity-50 disabled:scale-100 disabled:shadow-none flex items-center gap-2 border border-white/10">
                    {loading ? "Analyzing..." : `Audit vs ${competitors.length} Rivals 🚀`}
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

            <div className="grid md:grid-cols-2 gap-4 mt-8">
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
                               <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#0B1120] to-transparent z-10">
                                  <button onClick={() => setShowPaymentModal(true)} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full shadow-lg flex items-center gap-2 transition-all transform hover:scale-105">
                                     <LockIcon /> Unlock Full Market Data
                                  </button>
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
                          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/90 to-transparent flex items-center justify-center pt-10">
                              <button onClick={() => setShowPaymentModal(true)} className="px-4 py-2 bg-red-900/80 hover:bg-red-800 text-red-100 text-sm font-bold rounded-full flex items-center gap-2 border border-red-500/30 backdrop-blur-sm transition-all">
                                  <LockIcon /> Unlock {report.weaknesses.length - 3} More Gaps
                              </button>
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
                          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/90 to-transparent flex items-center justify-center pt-10">
                              <button onClick={() => setShowPaymentModal(true)} className="px-4 py-2 bg-green-900/80 hover:bg-green-800 text-green-100 text-sm font-bold rounded-full flex items-center gap-2 border border-green-500/30 backdrop-blur-sm transition-all">
                                  <LockIcon /> Unlock Full Competitor Intel
                              </button>
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
                                           <div className="relative mt-4 cursor-pointer group" onClick={() => setShowPaymentModal(true)}>
                                                <div className="absolute inset-0 bg-white/5 blur-sm rounded-lg"></div>
                                                <div className="relative flex items-center justify-center py-2 text-xs text-blue-400 font-bold gap-2 group-hover:text-white transition-colors">
                                                    <LockIcon /> Unlock Remaining Tasks
                                                </div>
                                           </div>
                                       </>
                                   ) : isWeekLocked ? (
                                       // Weeks 2-4: Completely Blurred
                                       <div className="h-40 flex items-center justify-center relative cursor-pointer" onClick={() => setShowPaymentModal(true)}>
                                           <div className="absolute inset-0 filter blur-md bg-white/5"></div>
                                           <div className="relative z-10 bg-black/50 px-4 py-2 rounded-full border border-white/20 text-white text-xs font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors">
                                               <LockIcon /> Unlock Week {i+1}
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
      <footer className="border-t border-white/5 py-12 text-center relative z-10 bg-[#02040a]">
         <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-[10px] md:text-xs font-mono text-gray-400">ALL SYSTEMS OPERATIONAL</span>
         </div>
         <p className="text-gray-600 text-[10px] md:text-xs font-mono">&copy; {new Date().getFullYear()} ADDINFI DIGITECH PVT. LTD. // SECURE CONNECTION</p>
      </footer>
    </div>
  );
}