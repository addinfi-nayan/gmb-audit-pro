import React from "react";
import Link from "next/link";

interface PolicyLayoutProps {
    title: string;
    children: React.ReactNode;
}

const PolicyLayout: React.FC<PolicyLayoutProps> = ({ title, children }) => {
    return (
        <div className="min-h-screen bg-[#030712] text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden relative flex flex-col">
            {/* --- GLOBAL BACKGROUND --- */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#030712,transparent)]"></div>
            </div>

            {/* --- NAVBAR --- */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <span className="text-lg md:text-xl font-bold tracking-tight text-gray-100">
                            What<span className="text-blue-500">My</span>Rank<span className="hidden md:inline"> - GMB</span>
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-xs font-medium text-gray-400 uppercase tracking-widest hover:text-cyan-400 transition">
                            Home
                        </Link>
                    </div>
                </div>
            </nav>

            {/* --- CONTENT --- */}
            <main className="relative z-10 flex-grow pt-32 pb-20 px-4 md:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-400 text-[10px] md:text-xs font-mono mb-8 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span>
                        OFFICIAL POLICY
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-12 text-white">
                        {title}
                    </h1>
                    <div className="bg-[#0B1120]/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl space-y-8 text-gray-300 leading-relaxed">
                        {children}
                    </div>
                </div>
            </main>

            {/* --- FOOTER --- */}
            <footer className="border-t border-white/5 py-12 text-center relative z-10 bg-[#02040a]">
                <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-[10px] md:text-xs font-mono text-gray-400">ALL SYSTEMS OPERATIONAL</span>
                </div>
                <p className="text-gray-600 text-[10px] md:text-xs font-mono">
                    &copy; {new Date().getFullYear()} ADDINFI DIGITECH PVT. LTD. // SECURE CONNECTION
                </p>
            </footer>
        </div>
    );
};

export default PolicyLayout;
