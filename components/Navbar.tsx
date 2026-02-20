"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import UserMenu from "./UserMenu";

interface NavbarProps {
    onStart?: () => void;
    showAction?: boolean;
    actionLabel?: string;
    children?: React.ReactNode;
    mobileChildren?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ onStart, showAction = true, actionLabel = "Get Audit", children, mobileChildren }) => {
    const { data: session } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <span className="text-lg md:text-xl font-bold tracking-tight text-gray-100">
                        What<span className="text-blue-500">My</span>Rank<span className="hidden md:inline"> - GMB</span>
                    </span>
                </Link>
                <div className="flex items-center gap-4 md:gap-8 relative">
                    <div className="hidden md:flex items-center gap-8 text-xs font-medium text-gray-400 uppercase tracking-widest">
                        <Link href="/terms-and-conditions" className="hover:text-cyan-400 transition cursor-pointer">Terms</Link>
                        <Link href="/privacy-policy" className="hover:text-cyan-400 transition cursor-pointer">Privacy</Link>
                        <Link href="/refund-policy" className="hover:text-cyan-400 transition cursor-pointer">Refund Policy</Link>
                    </div>

                    {children}

                    {showAction && (
                        <button
                            onClick={onStart ? onStart : () => (window.location.href = "/")}
                            className="px-6 py-2 bg-white text-black rounded-full font-bold text-sm transition hover:scale-105"
                        >
                            {session ? actionLabel : "Sign In"}
                        </button>
                    )}

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
                    {mobileChildren}
                    <Link
                        href="/terms-and-conditions"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-sm font-medium text-gray-400 uppercase tracking-widest hover:text-cyan-400 transition"
                    >
                        Terms
                    </Link>
                    <Link
                        href="/privacy-policy"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-sm font-medium text-gray-400 uppercase tracking-widest hover:text-cyan-400 transition"
                    >
                        Privacy
                    </Link>
                    <Link
                        href="/refund-policy"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-sm font-medium text-gray-400 uppercase tracking-widest hover:text-cyan-400 transition"
                    >
                        Refund Policy
                    </Link>
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
    );
};

export default Navbar;
