"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import jsPDF from "jspdf";
import { useSession, signOut } from "@/lib/auth";

type Tab = "users" | "leads" | "searchLogs" | "coupons" | "reports";

interface AdminUser {
    id: string;
    email: string;
    isPremium: boolean;
    premiumGrantedAt: string | null;
    createdAt: string;
    reportCount: number;
}

interface Lead {
    id: string;
    business: string;
    email: string;
    phone: string;
    coupon: string | null;
    created_at: string;
}

interface SearchLog {
    id: string;
    name: string;
    phone: string;
    website: string;
    created_at: string;
}

interface Coupon {
    code: string;
    active: boolean;
    note: string | null;
    discount_percent: number;
    max_uses: number | null;
    used_count: number;
    expires_at: string | null;
    created_at: string;
}

interface ReportRow {
    id: string;
    gmbName: string;
    userEmail: string | null;
    auditScore: number | null;
    createdAt: string;
    hasPdf: boolean;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("en-IN", {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

function formatDateShort(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function isExpired(iso: string | null) {
    return !!iso && new Date(iso) <= new Date();
}

/** <input type="date"> wants YYYY-MM-DD; our stored value is a full ISO timestamptz. */
function toDateInputValue(iso: string | null) {
    return iso ? iso.slice(0, 10) : "";
}

// --- Sidebar icons ---
const UsersIcon = () => (<svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 100-8 4 4 0 000 8zm6 3a4 4 0 10-8 0" /></svg>);
const LeadsIcon = () => (<svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>);
const SearchIcon = () => (<svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const CouponIcon = () => (<svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>);
const ReportsIcon = () => (<svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);
const DownloadIcon = () => (<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" /></svg>);

export default function AdminPage() {
    const { data: session, status } = useSession();
    const [tab, setTab] = useState<Tab>("users");
    const [authState, setAuthState] = useState<"checking" | "denied" | "ok">("checking");
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [reports, setReports] = useState<ReportRow[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const [grantEmail, setGrantEmail] = useState("");
    const [grantBusy, setGrantBusy] = useState(false);
    const [grantMsg, setGrantMsg] = useState<string | null>(null);

    const [newCouponCode, setNewCouponCode] = useState("");
    const [newCouponNote, setNewCouponNote] = useState("");
    const [newCouponDiscount, setNewCouponDiscount] = useState("100");
    const [newCouponMaxUses, setNewCouponMaxUses] = useState("");
    const [newCouponExpiresAt, setNewCouponExpiresAt] = useState("");
    const [couponBusy, setCouponBusy] = useState(false);

    const [editingCode, setEditingCode] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ note: "", discountPercent: "100", maxUses: "", expiresAt: "" });
    const [editBusy, setEditBusy] = useState(false);

    const loadAll = useCallback(async () => {
        setLoadingData(true);
        try {
            const [uRes, lRes, sRes, cRes, rRes] = await Promise.all([
                fetch("/api/admin/users"),
                fetch("/api/admin/leads"),
                fetch("/api/admin/search-logs"),
                fetch("/api/admin/coupons"),
                fetch("/api/admin/reports"),
            ]);

            if (uRes.status === 403) {
                setAuthState("denied");
                return;
            }
            setAuthState("ok");

            const [uData, lData, sData, cData, rData] = await Promise.all([
                uRes.json(), lRes.json(), sRes.json(), cRes.json(), rRes.json(),
            ]);
            setUsers(uData.users || []);
            setLeads(lData.leads || []);
            setSearchLogs(sData.searchLogs || []);
            setCoupons(cData.coupons || []);
            setReports(rData.reports || []);
        } catch (e) {
            console.error(e);
            setAuthState("denied");
        } finally {
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        if (status === "loading") return;
        if (!session) { setAuthState("denied"); setLoadingData(false); return; }
        loadAll();
    }, [status, session, loadAll]);

    const handleGrantPremium = async (email: string, isPremium: boolean) => {
        setGrantBusy(true);
        setGrantMsg(null);
        try {
            const res = await fetch("/api/admin/users/premium", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, isPremium }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed");
            setGrantMsg(data.note || (isPremium ? `${email} is now premium.` : `${email} premium revoked.`));
            if (isPremium) setGrantEmail("");
            await loadAll();
        } catch (e: any) {
            setGrantMsg(e.message || "Something went wrong.");
        } finally {
            setGrantBusy(false);
        }
    };

    const handleAddCoupon = async () => {
        if (!newCouponCode.trim()) return;
        setCouponBusy(true);
        try {
            const res = await fetch("/api/admin/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: newCouponCode.trim(),
                    note: newCouponNote.trim() || undefined,
                    discountPercent: newCouponDiscount ? Number(newCouponDiscount) : undefined,
                    maxUses: newCouponMaxUses ? Number(newCouponMaxUses) : undefined,
                    expiresAt: newCouponExpiresAt ? new Date(newCouponExpiresAt).toISOString() : undefined,
                }),
            });
            if (res.ok) {
                setNewCouponCode("");
                setNewCouponNote("");
                setNewCouponDiscount("100");
                setNewCouponMaxUses("");
                setNewCouponExpiresAt("");
                await loadAll();
            }
        } finally {
            setCouponBusy(false);
        }
    };

    const toggleCoupon = async (code: string, active: boolean) => {
        await fetch(`/api/admin/coupons/${encodeURIComponent(code)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ active }),
        });
        await loadAll();
    };

    const deleteCoupon = async (code: string) => {
        if (!confirm(`Delete coupon "${code}"?`)) return;
        await fetch(`/api/admin/coupons/${encodeURIComponent(code)}`, { method: "DELETE" });
        await loadAll();
    };

    const startEditCoupon = (c: Coupon) => {
        setEditingCode(c.code);
        setEditForm({
            note: c.note || "",
            discountPercent: String(c.discount_percent),
            maxUses: c.max_uses != null ? String(c.max_uses) : "",
            expiresAt: toDateInputValue(c.expires_at),
        });
    };

    const cancelEditCoupon = () => setEditingCode(null);

    const saveEditCoupon = async (code: string) => {
        setEditBusy(true);
        try {
            await fetch(`/api/admin/coupons/${encodeURIComponent(code)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    note: editForm.note.trim(),
                    discountPercent: Number(editForm.discountPercent) || 100,
                    maxUses: editForm.maxUses ? Number(editForm.maxUses) : null,
                    expiresAt: editForm.expiresAt ? new Date(editForm.expiresAt).toISOString() : null,
                }),
            });
            setEditingCode(null);
            await loadAll();
        } finally {
            setEditBusy(false);
        }
    };

    const handleDownloadReport = async (r: ReportRow) => {
        setDownloadingId(r.id);
        try {
            const res = await fetch(`/api/admin/reports?id=${r.id}`);
            const data = await res.json();

            if (!data.pdfImageData) {
                alert("No cached PDF for this report yet — it becomes available here once the user downloads it once from their own account.");
                return;
            }

            const img = new Image();
            img.src = data.pdfImageData;
            await new Promise((resolve) => { img.onload = resolve; });

            const imgWidth = 210;
            const imgHeight = (img.naturalHeight * imgWidth) / img.naturalWidth;
            const pdf = new jsPDF("p", "mm", [imgWidth, imgHeight]);
            pdf.addImage(data.pdfImageData, "PNG", 0, 0, imgWidth, imgHeight);
            pdf.save(`${(data.gmbName || r.gmbName || "GMB").replace(/\s+/g, "_")}_Audit_Report.pdf`);
        } catch (e) {
            console.error(e);
            alert("Failed to download this report.");
        } finally {
            setDownloadingId(null);
        }
    };

    if (status === "loading" || (authState === "checking" && loadingData)) {
        return (
            <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center gap-4 px-4 text-center">
                <h1 className="text-2xl font-bold">Sign in required</h1>
                <p className="text-gray-400 max-w-sm">Sign in with the Google account on the admin allowlist to access this panel.</p>
                <Link href="/" className="px-5 py-2.5 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition">Go to app</Link>
            </div>
        );
    }

    if (authState === "denied") {
        return (
            <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center gap-4 px-4 text-center">
                <h1 className="text-2xl font-bold text-red-400">Not authorized</h1>
                <p className="text-gray-400 max-w-sm">
                    {session.user.email} isn't on the admin allowlist. Add it to <code className="text-cyan-400">ADMIN_EMAILS</code> in your server env to grant access.
                </p>
                <Link href="/" className="px-5 py-2.5 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition">Go to app</Link>
            </div>
        );
    }

    const NAV_ITEMS: { id: Tab; label: string; count: number; icon: React.ReactNode }[] = [
        { id: "users", label: "Users", count: users.length, icon: <UsersIcon /> },
        { id: "reports", label: "Reports", count: reports.length, icon: <ReportsIcon /> },
        { id: "leads", label: "Leads", count: leads.length, icon: <LeadsIcon /> },
        { id: "searchLogs", label: "Search Logs", count: searchLogs.length, icon: <SearchIcon /> },
        { id: "coupons", label: "Coupons", count: coupons.length, icon: <CouponIcon /> },
    ];

    const activeNavItem = NAV_ITEMS.find((n) => n.id === tab)!;

    const NavButton = ({ item }: { item: typeof NAV_ITEMS[number] }) => (
        <button
            onClick={() => { setTab(item.id); setMobileNavOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition text-left ${tab === item.id
                ? "bg-gradient-to-r from-blue-600/15 to-cyan-600/15 text-white border border-cyan-500/30 shadow-[0_0_16px_rgba(6,182,212,0.12)]"
                : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
        >
            <span className={tab === item.id ? "text-cyan-400" : "text-gray-500"}>{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            <span className={`text-xs font-mono px-1.5 py-0.5 rounded-md min-w-[1.75rem] text-center ${tab === item.id ? "bg-cyan-500/20 text-cyan-300" : "bg-white/5 text-gray-500"}`}>
                {item.count}
            </span>
        </button>
    );

    return (
        <div className="min-h-screen bg-[#030712] text-white font-sans">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            <nav className="sticky top-0 z-30 border-b border-white/5 bg-[#030712]/90 backdrop-blur-xl">
                <div className="px-4 md:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileNavOpen((v) => !v)}
                            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 text-gray-300"
                            aria-label="Toggle navigation"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <Link href="/" className="text-lg font-bold tracking-tight text-gray-100">
                            What<span className="text-blue-500">My</span>Rank <span className="text-cyan-400 font-mono text-xs align-top">ADMIN</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500 font-mono hidden sm:inline">{session.user.email}</span>
                        <Link href="/" className="text-xs font-bold text-gray-400 uppercase hover:text-white transition">Back to App</Link>
                        <button onClick={() => signOut()} className="text-xs font-bold text-red-400 uppercase hover:text-red-300 transition">Sign Out</button>
                    </div>
                </div>
            </nav>

            <div className="relative z-10 flex flex-col md:flex-row">
                {/* Sidebar */}
                <aside className={`md:w-64 md:shrink-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)] border-b md:border-b-0 md:border-r border-white/5 bg-[#0B1120]/60 backdrop-blur-xl overflow-y-auto ${mobileNavOpen ? "block" : "hidden md:block"}`}>
                    <div className="p-4 space-y-1">
                        <p className="px-4 pt-2 pb-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Manage</p>
                        {NAV_ITEMS.map((item) => <NavButton key={item.id} item={item} />)}
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 min-w-0 px-4 md:px-10 py-8 md:py-10">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-cyan-400">{activeNavItem.icon}</span>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{activeNavItem.label}</h1>
                    </div>
                    <p className="text-gray-500 text-sm mb-8">
                        {tab === "users" && "Every signed-up account and their premium status."}
                        {tab === "reports" && "Every generated audit report — re-download the PDF for any user."}
                        {tab === "leads" && "Email/phone captured at the paywall before unlock or payment."}
                        {tab === "searchLogs" && "Top result logged for every business search."}
                        {tab === "coupons" && "Codes that discount or fully skip payment at checkout."}
                    </p>

                    {loadingData ? (
                        <div className="text-gray-500 text-sm">Loading…</div>
                    ) : tab === "users" ? (
                        <div className="space-y-6">
                            <div className="bg-[#0B1120] border border-white/10 rounded-2xl p-5">
                                <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">Grant Premium by Email</h2>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="email"
                                        value={grantEmail}
                                        onChange={(e) => setGrantEmail(e.target.value)}
                                        placeholder="user@example.com"
                                        className="flex-1 bg-[#020617] border border-white/10 p-3 rounded-xl outline-none text-white text-sm focus:border-cyan-500 transition"
                                    />
                                    <button
                                        disabled={!grantEmail.trim() || grantBusy}
                                        onClick={() => handleGrantPremium(grantEmail.trim(), true)}
                                        className="px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition shrink-0"
                                    >
                                        Grant Premium
                                    </button>
                                </div>
                                {grantMsg && <p className="text-xs text-cyan-400 mt-2">{grantMsg}</p>}
                                <p className="text-[11px] text-gray-500 mt-2">Works even if this person hasn't signed in yet — they'll be premium automatically the moment they do.</p>
                            </div>

                            <div className="bg-[#0B1120] border border-white/10 rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                                                <th className="p-4">Email</th>
                                                <th className="p-4">Status</th>
                                                <th className="p-4">Reports</th>
                                                <th className="p-4">Joined</th>
                                                <th className="p-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((u) => (
                                                <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                                                    <td className="p-4 font-mono text-xs text-gray-300">{u.email}</td>
                                                    <td className="p-4">
                                                        {u.isPremium ? (
                                                            <span className="px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold">Premium</span>
                                                        ) : (
                                                            <span className="px-2 py-1 rounded-full bg-white/5 text-gray-400 border border-white/10 text-xs font-bold">Guest</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-gray-400">{u.reportCount}</td>
                                                    <td className="p-4 text-gray-500 text-xs">{formatDate(u.createdAt)}</td>
                                                    <td className="p-4 text-right">
                                                        <button
                                                            onClick={() => handleGrantPremium(u.email, !u.isPremium)}
                                                            disabled={grantBusy}
                                                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${u.isPremium
                                                                ? "text-red-400 hover:bg-red-500/10"
                                                                : "text-cyan-400 hover:bg-cyan-500/10"
                                                                }`}
                                                        >
                                                            {u.isPremium ? "Revoke" : "Make Premium"}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {users.length === 0 && (
                                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No users yet.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : tab === "reports" ? (
                        <div className="bg-[#0B1120] border border-white/10 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                                            <th className="p-4">Business</th>
                                            <th className="p-4">User</th>
                                            <th className="p-4">Score</th>
                                            <th className="p-4">Generated</th>
                                            <th className="p-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reports.map((r) => (
                                            <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                                                <td className="p-4 text-gray-200">{r.gmbName || "—"}</td>
                                                <td className="p-4 font-mono text-xs text-gray-300">{r.userEmail || "—"}</td>
                                                <td className="p-4">
                                                    {r.auditScore != null ? (
                                                        <span className="px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold">{r.auditScore}/100</span>
                                                    ) : "—"}
                                                </td>
                                                <td className="p-4 text-gray-500 text-xs">{formatDate(r.createdAt)}</td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => handleDownloadReport(r)}
                                                        disabled={downloadingId === r.id}
                                                        title={r.hasPdf ? "Download PDF" : "No cached PDF yet — user hasn't downloaded it themselves"}
                                                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition disabled:opacity-40 ${r.hasPdf
                                                            ? "text-cyan-400 hover:bg-cyan-500/10"
                                                            : "text-gray-600 hover:bg-white/5"
                                                            }`}
                                                    >
                                                        <DownloadIcon />
                                                        {downloadingId === r.id ? "Preparing…" : r.hasPdf ? "Download PDF" : "Not cached"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {reports.length === 0 && (
                                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">No reports generated yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : tab === "leads" ? (
                        <div className="bg-[#0B1120] border border-white/10 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                                            <th className="p-4">Business</th>
                                            <th className="p-4">Email</th>
                                            <th className="p-4">Phone</th>
                                            <th className="p-4">Coupon</th>
                                            <th className="p-4">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leads.map((l) => (
                                            <tr key={l.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                                                <td className="p-4 text-gray-200">{l.business || "—"}</td>
                                                <td className="p-4 font-mono text-xs text-gray-300">{l.email || "—"}</td>
                                                <td className="p-4 text-gray-400">{l.phone || "—"}</td>
                                                <td className="p-4">{l.coupon ? <span className="px-2 py-0.5 rounded bg-white/5 text-cyan-400 text-xs font-mono">{l.coupon}</span> : "—"}</td>
                                                <td className="p-4 text-gray-500 text-xs">{formatDate(l.created_at)}</td>
                                            </tr>
                                        ))}
                                        {leads.length === 0 && (
                                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">No leads captured yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : tab === "searchLogs" ? (
                        <div className="bg-[#0B1120] border border-white/10 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                                            <th className="p-4">Business Searched</th>
                                            <th className="p-4">Phone</th>
                                            <th className="p-4">Website</th>
                                            <th className="p-4">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searchLogs.map((s) => (
                                            <tr key={s.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                                                <td className="p-4 text-gray-200">{s.name || "—"}</td>
                                                <td className="p-4 text-gray-400">{s.phone || "—"}</td>
                                                <td className="p-4 text-gray-400 truncate max-w-xs">{s.website || "—"}</td>
                                                <td className="p-4 text-gray-500 text-xs">{formatDate(s.created_at)}</td>
                                            </tr>
                                        ))}
                                        {searchLogs.length === 0 && (
                                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">No searches logged yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-[#0B1120] border border-white/10 rounded-2xl p-5">
                                <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">Add Coupon</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                    <input
                                        value={newCouponCode}
                                        onChange={(e) => setNewCouponCode(e.target.value)}
                                        placeholder="code (e.g. launch50)"
                                        className="col-span-2 sm:col-span-1 bg-[#020617] border border-white/10 p-3 rounded-xl outline-none text-white text-sm focus:border-cyan-500 transition"
                                    />
                                    <input
                                        value={newCouponNote}
                                        onChange={(e) => setNewCouponNote(e.target.value)}
                                        placeholder="note (optional)"
                                        className="col-span-2 sm:col-span-1 bg-[#020617] border border-white/10 p-3 rounded-xl outline-none text-white text-sm focus:border-cyan-500 transition"
                                    />
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min={1}
                                            max={100}
                                            value={newCouponDiscount}
                                            onChange={(e) => setNewCouponDiscount(e.target.value)}
                                            placeholder="100"
                                            className="w-full bg-[#020617] border border-white/10 p-3 pr-7 rounded-xl outline-none text-white text-sm focus:border-cyan-500 transition"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">%</span>
                                    </div>
                                    <input
                                        type="number"
                                        min={1}
                                        value={newCouponMaxUses}
                                        onChange={(e) => setNewCouponMaxUses(e.target.value)}
                                        placeholder="max uses (∞)"
                                        className="bg-[#020617] border border-white/10 p-3 rounded-xl outline-none text-white text-sm focus:border-cyan-500 transition"
                                    />
                                    <input
                                        type="date"
                                        value={newCouponExpiresAt}
                                        onChange={(e) => setNewCouponExpiresAt(e.target.value)}
                                        className="bg-[#020617] border border-white/10 p-3 rounded-xl outline-none text-white text-sm focus:border-cyan-500 transition [color-scheme:dark]"
                                    />
                                </div>
                                <button
                                    disabled={!newCouponCode.trim() || couponBusy}
                                    onClick={handleAddCoupon}
                                    className="mt-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
                                >
                                    Add Coupon
                                </button>
                                <p className="text-[11px] text-gray-500 mt-2">Discount defaults to 100% (fully skips payment). Leave max uses / expiry blank for unlimited / never-expiring.</p>
                            </div>

                            <div className="bg-[#0B1120] border border-white/10 rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                                                <th className="p-4">Code</th>
                                                <th className="p-4">Discount</th>
                                                <th className="p-4">Uses</th>
                                                <th className="p-4">Expires</th>
                                                <th className="p-4">Note</th>
                                                <th className="p-4">Status</th>
                                                <th className="p-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {coupons.map((c) => editingCode === c.code ? (
                                                <tr key={c.code} className="border-b border-white/5 last:border-0 bg-white/[0.03]">
                                                    <td className="p-4 font-mono text-cyan-400">{c.code}</td>
                                                    <td className="p-4">
                                                        <div className="relative w-20">
                                                            <input
                                                                type="number" min={1} max={100}
                                                                value={editForm.discountPercent}
                                                                onChange={(e) => setEditForm({ ...editForm, discountPercent: e.target.value })}
                                                                className="w-full bg-[#020617] border border-white/10 p-2 pr-6 rounded-lg outline-none text-white text-sm focus:border-cyan-500 transition"
                                                            />
                                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">%</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <input
                                                            type="number" min={1}
                                                            value={editForm.maxUses}
                                                            onChange={(e) => setEditForm({ ...editForm, maxUses: e.target.value })}
                                                            placeholder="∞"
                                                            className="w-20 bg-[#020617] border border-white/10 p-2 rounded-lg outline-none text-white text-sm focus:border-cyan-500 transition"
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <input
                                                            type="date"
                                                            value={editForm.expiresAt}
                                                            onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })}
                                                            className="bg-[#020617] border border-white/10 p-2 rounded-lg outline-none text-white text-sm focus:border-cyan-500 transition [color-scheme:dark]"
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <input
                                                            value={editForm.note}
                                                            onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                                                            placeholder="note"
                                                            className="w-32 bg-[#020617] border border-white/10 p-2 rounded-lg outline-none text-white text-sm focus:border-cyan-500 transition"
                                                        />
                                                    </td>
                                                    <td className="p-4 text-gray-500 text-xs">—</td>
                                                    <td className="p-4 text-right whitespace-nowrap">
                                                        <button
                                                            onClick={() => saveEditCoupon(c.code)}
                                                            disabled={editBusy}
                                                            className="text-xs font-bold px-3 py-1.5 rounded-lg text-cyan-400 hover:bg-cyan-500/10 transition disabled:opacity-40"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={cancelEditCoupon}
                                                            className="text-xs font-bold px-3 py-1.5 rounded-lg text-gray-400 hover:bg-white/5 transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </td>
                                                </tr>
                                            ) : (
                                                <tr key={c.code} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                                                    <td className="p-4 font-mono text-cyan-400">{c.code}</td>
                                                    <td className="p-4 text-gray-200">{c.discount_percent}%</td>
                                                    <td className="p-4 text-gray-400">{c.used_count}{c.max_uses != null ? ` / ${c.max_uses}` : " / ∞"}</td>
                                                    <td className={`p-4 text-xs ${isExpired(c.expires_at) ? "text-red-400" : "text-gray-400"}`}>
                                                        {c.expires_at ? formatDateShort(c.expires_at) : "Never"}
                                                        {isExpired(c.expires_at) && <span className="ml-1">(expired)</span>}
                                                    </td>
                                                    <td className="p-4 text-gray-400">{c.note || "—"}</td>
                                                    <td className="p-4">
                                                        <button
                                                            onClick={() => toggleCoupon(c.code, !c.active)}
                                                            className={`px-2 py-1 rounded-full text-xs font-bold border transition ${c.active
                                                                ? "bg-green-500/10 text-green-400 border-green-500/30"
                                                                : "bg-white/5 text-gray-500 border-white/10"
                                                                }`}
                                                        >
                                                            {c.active ? "Active" : "Inactive"}
                                                        </button>
                                                    </td>
                                                    <td className="p-4 text-right whitespace-nowrap">
                                                        <button
                                                            onClick={() => startEditCoupon(c)}
                                                            className="text-xs font-bold px-3 py-1.5 rounded-lg text-gray-300 hover:bg-white/5 transition"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => deleteCoupon(c.code)}
                                                            className="text-xs font-bold px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {coupons.length === 0 && (
                                                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No coupons yet.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
