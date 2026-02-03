"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

export default function Dashboard() {
  const { data: session } = useSession();
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
  const [downloading, setDownloading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // PAYMENT / COUPON STATE
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [couponError, setCouponError] = useState("");

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
      // Automatically trigger download after unlock
      setTimeout(() => {
        generatePDF();
      }, 500);
    } else {
      setCouponError("Invalid coupon code or limit reached.");
    }
  };

  const initiateDownload = () => {
    if (isUnlocked) {
      generatePDF();
    } else {
      setShowPaymentModal(true);
    }
  };

  // --- PDF GENERATION ---
  const generatePDF = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    
    // 1. Force Scroll Top for clean capture
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 500)); 

    try {
        const element = reportRef.current;
        
        // 2. CONFIG: Set fixed width to emulate desktop view for the PDF
        const canvas = await html2canvas(element, { 
            scale: 2, 
            useCORS: true,
            allowTaint: true,
            scrollY: 0, 
            windowWidth: 1440, // Forces desktop layout even on mobile
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

  if (!session) return <div className="flex h-screen items-center justify-center"><button onClick={() => signIn("google")} className="bg-blue-600 text-white px-6 py-3 rounded font-bold">Sign in</button></div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <div className="mx-auto max-w-[95rem] bg-white shadow-none min-h-screen relative">
        
        {/* HEADER */}
        <div className="bg-white px-8 py-6 border-b flex justify-between items-center sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white p-2 rounded-lg"><SearchIcon /></span>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">GMB Strategic Auditor</h1>
          </div>
          <div className="flex gap-4">
             {step === 3 && !errorMsg && (
                 <button 
                    onClick={initiateDownload} 
                    disabled={downloading} 
                    data-html2canvas-ignore="true" // Prevents button from appearing in PDF
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition flex items-center gap-2"
                 >
                    {downloading ? "Generating..." : "Download PDF 📥"}
                 </button>
             )}
             {step > 1 && <button onClick={() => { window.location.reload(); }} className="text-sm text-gray-500 hover:text-red-500 font-medium">Reset Audit</button>}
          </div>
        </div>

        {/* STEP 1: FIND ME */}
        {step === 1 && (
          <div className="flex flex-col items-center justify-center pt-24 pb-12 px-4">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Find Your Business</h2>
            <p className="text-gray-500 text-lg mb-10">Search for your GMB profile to start the audit.</p>
            <div className="relative w-full max-w-2xl">
                <div className="relative flex items-center">
                    <div className="absolute left-4 text-gray-400"><SearchIcon /></div>
                    <input className="w-full border-2 border-gray-200 pl-12 pr-4 py-5 rounded-xl text-xl shadow-sm focus:border-blue-500 outline-none transition" placeholder="Type business name..." value={myQuery} onChange={e => { setMyQuery(e.target.value); setMyBusiness(null); }} />
                </div>
                {mySuggestions.length > 0 && !myBusiness && (
                    <div className="absolute top-full left-0 w-full bg-white border rounded-xl shadow-2xl mt-2 z-50 max-h-80 overflow-y-auto text-left">
                        {mySuggestions.map((place) => (
                            <div key={place.place_id} className="p-4 hover:bg-blue-50 cursor-pointer border-b last:border-0 flex justify-between items-start group" onClick={() => { setMyBusiness(place); setStep(2); setMyQuery(place.title); setMySuggestions([]); }}>
                                <div className="flex items-start gap-3">
                                   <div className="mt-1 bg-gray-100 p-2 rounded-full group-hover:bg-blue-200 group-hover:text-blue-600 transition"><MapPinIcon /></div>
                                   <div>
                                       <div className="font-bold text-lg group-hover:text-blue-700">{place.title}</div>
                                       <div className="text-sm text-gray-400">{place.address}</div>
                                       <div className="flex items-center gap-2 mt-1"><span className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded text-xs font-bold border border-yellow-100"><StarIcon /> {place.rating || "N/A"}</span><span className="text-xs text-gray-400 font-medium">({place.reviews || place.user_ratings_total || 0} reviews)</span></div>
                                   </div>
                                </div>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded group-hover:bg-blue-200 text-blue-800 font-bold mt-2">SELECT</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>
        )}

        {/* STEP 2: COMPETITORS */}
        {step === 2 && !errorMsg && (
          <div className="p-10 space-y-8 max-w-4xl mx-auto">
             <div className="bg-white border border-blue-100 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
               <div className="bg-blue-600 text-white p-3 rounded-xl shadow-lg shadow-blue-200"><span className="font-bold text-xl">{myBusiness?.title.charAt(0)}</span></div>
               <div className="flex-1">
                  <div className="text-xs font-bold text-blue-500 uppercase tracking-wide">Auditing Target</div>
                  <div className="font-bold text-2xl text-gray-900">{myBusiness?.title}</div>
                  <div className="flex items-center gap-2 mt-2"><span className="flex items-center gap-1 text-sm font-bold text-gray-800 bg-yellow-100 border border-yellow-200 px-2 py-1 rounded-md"><StarIcon /> {myBusiness?.rating || "N/A"}</span><span className="text-sm text-gray-500 font-medium tracking-tight">({myBusiness?.reviews || myBusiness?.user_ratings_total || 0} reviews)</span></div>
               </div>
               <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border rounded-lg hover:bg-gray-50">Change</button>
            </div>

            <div className="flex justify-between items-center mt-10 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Step 2: Add Competitors <span className="text-sm font-normal text-gray-500 ml-2">(Max 2)</span></h2>
                <button onClick={handleAnalyze} disabled={loading || competitors.length === 0} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition disabled:opacity-50 disabled:scale-100 disabled:shadow-none flex items-center gap-2">
                    {loading ? "Analyzing..." : `Audit vs ${competitors.length} Rivals 🚀`}
                </button>
            </div>

            <div className="relative z-50">
                <input className="w-full border-2 border-gray-200 p-4 rounded-lg text-lg focus:border-blue-500 outline-none" placeholder="Search for a competitor..." value={compQuery} onChange={e => setCompQuery(e.target.value)} />
                {compSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white border rounded-xl shadow-2xl mt-2 max-h-60 overflow-y-auto z-50">
                         {compSuggestions.map((place) => {
                           const isAdded = competitors.find(c => c.place_id === place.place_id);
                           return (
                            <div key={place.place_id} onClick={() => toggleCompetitor(place)} className={`p-4 cursor-pointer border-b flex justify-between items-center ${isAdded ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                                <div className="font-medium text-gray-900 truncate pr-4">{place.title}</div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 whitespace-nowrap">
                                    <span className="flex items-center gap-1 text-yellow-600 font-bold bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-100"><StarIcon /> {place.rating || "N/A"}</span>
                                </div>
                                <button className={`ml-auto font-bold text-xs px-3 py-1 rounded whitespace-nowrap ${isAdded ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-green-700'}`}>{isAdded ? "ADDED ✓" : "+ ADD"}</button>
                            </div>
                           );
                         })}
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-8">
              {competitors.map((place) => (
                <div key={place.place_id} className="p-4 border-2 border-green-500 bg-green-50 rounded-xl flex justify-between items-center shadow-sm">
                  <div className="font-bold text-green-900 truncate pr-2">{place.title}</div>
                  <button onClick={() => toggleCompetitor(place)} className="text-red-500 hover:bg-red-100 p-2 rounded text-sm font-bold flex-shrink-0">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- ERROR DISPLAY --- */}
        {errorMsg && (
            <div className="flex flex-col items-center justify-center min-h-[500px] p-8 text-center">
                <ErrorIcon />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Report Cannot Be Analyzed</h2>
                <div className="bg-red-50 border border-red-200 p-6 rounded-xl max-w-2xl w-full">
                    <p className="text-red-800 font-medium mb-2">Reason for failure:</p>
                    <p className="text-gray-700 font-mono text-sm break-words">{errorMsg}</p>
                </div>
                <div className="mt-8 flex gap-4">
                    <button onClick={() => setErrorMsg(null)} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300 transition">Try Again</button>
                    <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">Restart</button>
                </div>
            </div>
        )}

        {/* STEP 3: REPORT */}
        {step === 3 && report && !errorMsg && (
          // WRAPPER REF FOR PDF CAPTURE: NOW INCLUDES GLOSSARY
          <div ref={reportRef} id="report-content" className="bg-gray-50 pb-40 p-12 min-h-screen">
            
            <div className="bg-gray-900 text-white pt-16 pb-24 text-center rounded-xl shadow-xl mb-12 relative overflow-hidden">
              <div className="relative z-10 flex flex-col items-center">
                  <div className="text-sm font-bold tracking-[0.3em] text-blue-400 uppercase mb-4">Overall Performance</div>
                  <div className="flex items-baseline gap-2">
                     <div className="text-9xl font-black tracking-tighter text-white">{report.audit_score}<span className="text-5xl text-gray-500">/100</span></div>
                     {/* ADDINFI BRANDING */}
                     <span className="text-xs font-medium text-white opacity-90 -mt-2">- Powered by Addinfi</span>
                  </div>
              </div>
            </div>

            {/* EXECUTIVE SUMMARY */}
            {report.executive_summary && (
                <div className="max-w-5xl mx-auto -mt-24 mb-20 relative z-20">
                    <div className="bg-white p-8 rounded-xl shadow-2xl border-t-4 border-blue-600">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-blue-100 text-blue-700 p-2 rounded-lg"><SearchIcon /></span>
                            <h3 className="font-bold text-gray-900 text-xl uppercase tracking-wide">Executive Summary</h3>
                        </div>
                        <p className="text-gray-700 leading-8 text-lg font-medium text-justify whitespace-pre-line">{report.executive_summary}</p>
                    </div>
                </div>
            )}

            <div className="max-w-[95rem] mx-auto space-y-20">
              
              {/* MATRIX TABLE */}
              <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                   {/* HEADER MATCHING EXEC SUMMARY */}
                   <div className="flex items-center gap-3">
                        <span className="bg-blue-100 text-blue-700 p-2 rounded-lg"><ChartIcon /></span>
                        <h3 className="font-bold text-gray-900 text-xl uppercase tracking-wide">Detailed Market Data</h3>
                   </div>
                </div>
                <div className="w-full">
                  <table className="w-full table-fixed">
                    <thead>
                      <tr className="bg-white text-left text-gray-500 text-sm uppercase tracking-wider">
                        <th className="p-4 font-medium border-b w-[20%]">Metric</th>
                        <th className="p-4 text-blue-600 font-bold text-lg border-b border-l-4 border-blue-500 w-[26%] bg-blue-50/50 align-top">YOU</th>
                        {report.matrix?.competitors?.map((c: any, i: number) => <th key={i} className="p-4 font-bold text-gray-800 border-b border-l w-[27%] align-top break-words">{c.name}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700 text-base">
                      {/* INCREASED PADDING (py-6) AND ADDED DIVIDERS */}
                      <tr><td className="py-6 px-4 font-bold bg-gray-50">Category</td><td className="py-6 px-4 bg-blue-50/50 border-l-4 border-blue-500 font-medium break-words align-top">{report.matrix?.me?.category}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l break-words align-top">{c.category}</td>)}</tr>
                      <tr><td className="py-6 px-4 font-bold bg-gray-50">Reviews</td><td className="py-6 px-4 bg-blue-50/50 border-l-4 border-blue-500 font-medium break-words align-top">{report.matrix?.me?.rating}⭐ ({report.matrix?.me?.reviews})</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l break-words align-top">{c.rating}⭐ ({c.reviews})</td>)}</tr>
                      <tr><td className="py-6 px-4 font-bold bg-gray-50">Review Velocity</td><td className="py-6 px-4 bg-blue-50/50 border-l-4 border-blue-500 font-medium break-words align-top">{report.matrix?.me?.review_velocity}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l break-words align-top">{c.review_velocity}</td>)}</tr>
                      <tr><td className="py-6 px-4 font-bold bg-gray-50">Review Response</td><td className="py-6 px-4 bg-blue-50/50 border-l-4 border-blue-500 font-medium break-words align-top">{report.matrix?.me?.review_response}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l break-words align-top">{c.review_response}</td>)}</tr>
                      <tr><td className="py-6 px-4 font-bold bg-gray-50">Review Growth</td><td className="py-6 px-4 bg-blue-50/50 border-l-4 border-blue-500 font-medium break-words align-top">{report.matrix?.me?.review_growth}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l break-words align-top">{c.review_growth}</td>)}</tr>
                      <tr><td className="py-6 px-4 font-bold bg-gray-50">Rating Trend</td><td className="py-6 px-4 bg-blue-50/50 border-l-4 border-blue-500 font-medium break-words align-top">{report.matrix?.me?.rating_trend}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l break-words align-top">{c.rating_trend}</td>)}</tr>
                      <tr><td className="py-6 px-4 font-bold bg-gray-50">Sentiment</td><td className="py-6 px-4 bg-blue-50/50 border-l-4 border-blue-500 font-medium break-words align-top">{report.matrix?.me?.sentiment}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l break-words align-top">{c.sentiment}</td>)}</tr>
                      <tr><td className="py-6 px-4 font-bold bg-gray-50">NPS Score</td><td className="py-6 px-4 bg-blue-50/50 border-l-4 border-blue-500 font-medium break-words align-top">{report.matrix?.me?.nps}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l break-words align-top">{c.nps}</td>)}</tr>
                      <tr><td className="py-6 px-4 font-bold bg-gray-50">Post Freq</td><td className="py-6 px-4 bg-blue-50/50 border-l-4 border-blue-500 font-medium break-words align-top">{report.matrix?.me?.post_frequency}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l break-words align-top">{c.post_frequency}</td>)}</tr>
                      <tr><td className="py-6 px-4 font-bold bg-gray-50">Engagement</td><td className="py-6 px-4 bg-blue-50/50 border-l-4 border-blue-500 font-medium break-words align-top">{report.matrix?.me?.post_engagement}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l break-words align-top">{c.post_engagement}</td>)}</tr>
                      <tr><td className="py-6 px-4 font-bold bg-gray-50">Photos</td><td className="py-6 px-4 bg-blue-50/50 border-l-4 border-blue-500 font-medium break-words align-top">{report.matrix?.me?.total_photos}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l break-words align-top">{c.total_photos}</td>)}</tr>
                      <tr><td className="py-6 px-4 font-bold bg-gray-50">Age</td><td className="py-6 px-4 bg-blue-50/50 border-l-4 border-blue-500 font-medium break-words align-top">{report.matrix?.me?.listing_age}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l break-words align-top">{c.listing_age}</td>)}</tr>
                      <tr><td className="py-6 px-4 font-bold bg-gray-50">Profile Strength</td><td className="py-6 px-4 bg-blue-50/50 border-l-4 border-blue-500 font-medium break-words align-top">{report.matrix?.me?.profile_strength}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l break-words align-top">{c.profile_strength}</td>)}</tr>
                      <tr><td className="py-6 px-4 font-bold bg-gray-50">Risk</td><td className="py-6 px-4 bg-blue-50/50 border-l-4 border-blue-500 font-medium break-words align-top">{report.matrix?.me?.suspension_risk}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l break-words align-top">{c.suspension_risk}</td>)}</tr>
                      <tr><td className="py-6 px-4 font-bold bg-gray-50">Audit Gap</td><td className="py-6 px-4 bg-blue-50/50 border-l-4 border-blue-500 font-medium break-words align-top">{report.matrix?.me?.audit_gap}</td>{report.matrix?.competitors?.map((c: any, i: number) => <td key={i} className="py-6 px-4 border-l break-words align-top">{c.audit_gap}</td>)}</tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* STRATEGIC CARDS */}
              <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-lg border-l-4 border-red-500 p-6">
                      {/* HEADER MATCHING EXEC SUMMARY */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-red-100 text-red-700 p-0.5 rounded-lg"><ErrorIcon /></span>
                        <h3 className="font-bold text-gray-900 text-xl uppercase tracking-wide">Your Profile Gaps</h3>
                      </div>
                      <ul className="space-y-3">
                          {report.weaknesses?.map((item: string, i: number) => (
                              <li key={i} className="flex items-start gap-3 text-gray-600 text-lg"><span className="text-red-500 font-bold mt-0.5 flex-shrink-0">✕</span>{item}</li>
                          )) || <p className="text-gray-400 italic">No critical issues found.</p>}
                      </ul>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg border-l-4 border-green-500 p-6">
                      {/* HEADER MATCHING EXEC SUMMARY */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-green-100 text-green-700 p-2 rounded-lg"><TrophyIcon /></span>
                        <h3 className="font-bold text-gray-900 text-xl uppercase tracking-wide">Competitor Wins</h3>
                      </div>
                      <ul className="space-y-3">
                          {report.competitor_strengths?.map((item: string, i: number) => (
                              <li key={i} className="flex items-start gap-3 text-gray-600 text-lg"><span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>{item}</li>
                          )) || <p className="text-gray-400 italic">Analyzing competitor data...</p>}
                      </ul>
                  </div>
              </div>

               {/* GAP ANALYSIS */}
               {report.gap_analysis && (
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-px bg-gray-300 flex-1"></div>
                        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Metric Gap Analysis & Fixes</h2>
                        <div className="h-px bg-gray-300 flex-1"></div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white border rounded-xl p-6 shadow-md">
                            <h3 className="font-bold text-blue-600 mb-4 uppercase pb-2">Reputation Fixes</h3>
                            <ul className="space-y-4">{report.gap_analysis.reputation?.map((fix: string, i: number) => <li key={i} className="text-base text-gray-700 bg-blue-50 p-4 rounded-lg"><span className="font-bold text-blue-800 block mb-1">Step {i+1}:</span> {fix}</li>)}</ul>
                        </div>
                        <div className="bg-white border rounded-xl p-6 shadow-md">
                            <h3 className="font-bold text-purple-600 mb-4 uppercase pb-2">Engagement Fixes</h3>
                             <ul className="space-y-4">{report.gap_analysis.engagement?.map((fix: string, i: number) => <li key={i} className="text-base text-gray-700 bg-purple-50 p-4 rounded-lg"><span className="font-bold text-purple-800 block mb-1">Step {i+1}:</span> {fix}</li>)}</ul>
                        </div>
                        <div className="bg-white border rounded-xl p-6 shadow-md">
                            <h3 className="font-bold text-green-600 mb-4 uppercase pb-2">Relevance Fixes</h3>
                             <ul className="space-y-4">{report.gap_analysis.relevance?.map((fix: string, i: number) => <li key={i} className="text-base text-gray-700 bg-green-50 p-4 rounded-lg"><span className="font-bold text-green-800 block mb-1">Step {i+1}:</span> {fix}</li>)}</ul>
                        </div>
                    </div>
                 </div>
               )}

               {/* 4-WEEK PLAN */}
               {report.four_week_plan && (
                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="h-px bg-gray-300 flex-1"></div>
                      <div className="flex items-center gap-3">
                         <span className="bg-blue-100 text-blue-700 p-2 rounded-lg"><ListIcon /></span>
                         <h3 className="font-bold text-gray-900 text-xl uppercase tracking-wide">4-Week Growth Architecture</h3>
                      </div>
                      <div className="h-px bg-gray-300 flex-1"></div>
                   </div>
                   <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      {report.four_week_plan.map((week: any, i: number) => (
                        <div key={i} className="bg-white rounded-xl shadow-lg border p-6">
                           <div className="flex justify-between items-center mb-4">
                              <h3 className="font-black text-2xl text-blue-900">{week.week}</h3>
                              <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">{week.time_est}</span>
                           </div>
                           <div className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-4 pb-2">{week.focus}</div>
                           <ul className="space-y-3">{week.tasks?.map((task: string, k: number) => <li key={k} className="flex items-start gap-2 text-base text-gray-600"><span className="text-blue-400 font-bold mt-px">•</span><span className="leading-snug font-medium">{task}</span></li>)}</ul>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {/* GLOSSARY */}
              <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="h-px bg-gray-300 flex-1"></div>
                      <div className="flex items-center gap-3">
                         <span className="bg-gray-100 text-gray-700 p-2 rounded-lg"><BookIcon /></span>
                         <h3 className="font-bold text-gray-900 text-xl uppercase tracking-wide">Metric Definitions</h3>
                      </div>
                      <div className="h-px bg-gray-300 flex-1"></div>
                   </div>
                   <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6 text-sm">
                        {METRIC_DEFINITIONS.map((def, i) => (
                            <div key={i} className="flex flex-col">
                                <span className="font-bold text-gray-900 mb-1">{def.label}</span>
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
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm transition-all duration-300">
            <div className="relative mb-6">
              <div className="w-20 h-20 border-4 border-blue-100 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <SearchIcon />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Generating Audit Report</h3>
            <p className="text-gray-500 font-medium animate-pulse">Analyzing competitors, sentiment, and ranking gaps...</p>
            <div className="w-64 h-1.5 bg-gray-100 rounded-full mt-6 overflow-hidden">
              <div className="h-full bg-blue-600 animate-[loading_2s_ease-in-out_infinite] w-1/2 rounded-full"></div>
            </div>
          </div>
        )}

        {/* --- PAYMENT MODAL --- */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
             <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center border border-gray-100 transform transition-all scale-100">
                 <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <LockIcon />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Unlock Full Report</h2>
                 <p className="text-gray-500 mb-6 text-sm">Get immediate access to your comprehensive audit PDF, including competitor data and the 4-week growth plan.</p>
                 
                 <div className="space-y-4">
                    <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-sm font-bold">PROMO</div>
                       <input 
                         type="text" 
                         placeholder="Enter Coupon Code" 
                         className="w-full border-2 border-gray-200 pl-16 pr-4 py-3 rounded-xl focus:border-blue-500 outline-none font-mono text-center uppercase"
                         value={couponCode}
                         onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
                       />
                    </div>
                    {couponError && <p className="text-red-500 text-xs font-bold">{couponError}</p>}
                    
                    <button 
                       onClick={handleUnlock}
                       className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                    >
                       Unlock Download 🔓
                    </button>
                    
                    <div className="text-xs text-gray-400 mt-4">
                        Limited time: Use code <span className="font-mono bg-yellow-100 text-yellow-800 px-1 rounded">first20</span> for free access.
                    </div>
                 </div>
             </div>
          </div>
        )}
        
      </div>
    </div>
  );
}