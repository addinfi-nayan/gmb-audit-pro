"use client";
import React, { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";

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

export default UserMenu;
