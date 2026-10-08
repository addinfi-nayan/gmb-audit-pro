import React from "react";
import Navbar from "./Navbar";
import SiteFooter from "./SiteFooter";

interface PolicyLayoutProps {
    title: string;
    children: React.ReactNode;
}

const PolicyLayout: React.FC<PolicyLayoutProps> = ({ title, children }) => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-800 overflow-x-clip relative flex flex-col">
            {/* --- GLOBAL BACKGROUND --- */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#f8fafc,transparent)]"></div>
            </div>

            <Navbar />

            {/* --- CONTENT --- */}
            <main className="relative z-10 flex-grow pt-32 pb-20 px-4 md:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-[10px] md:text-xs font-mono mb-8 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-sm"></span>
                        OFFICIAL POLICY
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-12 text-slate-900">
                        {title}
                    </h1>
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-12 shadow-sm space-y-8 text-slate-700 leading-relaxed">
                        {children}
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
};

export default PolicyLayout;
