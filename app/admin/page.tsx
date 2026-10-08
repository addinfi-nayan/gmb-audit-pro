"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import jsPDF from "jspdf";
import { useSession, signOut } from "@/lib/auth";

type Tab = "dashboard" | "users" | "leads" | "searchLogs" | "coupons" | "reports";

interface AdminUser {
    id: string;
    email: string;
    isPremium: boolean;
    premiumGrantedAt: string | null;
    isAdmin: boolean;
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

interface Payment {
    id: string;
    user_email: string | null;
    gmb_name: string | null;
    amount: number;
    currency: string;
    coupon_code: string | null;
    created_at: string;
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
const DashboardIcon = () => (<svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3v18h18M8 17V9m4 8V5m4 12v-6" /></svg>);

export default function AdminPage() {
    const { data: session, status } = useSession();
    const [tab, setTab] = useState<Tab>("dashboard");
    const [authState, setAuthState] = useState<"checking" | "denied" | "ok">("checking");
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [reports, setReports] = useState<ReportRow[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
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

    const [search, setSearch] = useState("");
    const q = search.trim().toLowerCase();
    const matches = (...fields: (string | number | null | undefined)[]) =>
        !q || fields.some((f) => f != null && String(f).toLowerCase().includes(q));

    const filteredUsers = users.filter((u) => matches(u.email));
    const filteredReports = reports.filter((r) => matches(r.gmbName, r.userEmail));
    const filteredLeads = leads.filter((l) => matches(l.business, l.email, l.phone, l.coupon));
    const filteredSearchLogs = searchLogs.filter((s) => matches(s.name, s.phone, s.website));
    const filteredCoupons = coupons.filter((c) => matches(c.code, c.note));

    const SEARCH_PLACEHOLDERS: Record<Tab, string> = {
        dashboard: "",
        users: "Search by email...",
        reports: "Search by business or user email...",
        leads: "Search by business, email, phone, or coupon...",
        searchLogs: "Search by business, phone, or website...",
        coupons: "Search by code or note...",
    };

    // --- DASHBOARD: range + coupon filters ---
    type DashRange = "day" | "week" | "month" | "all";
    const [dashRange, setDashRange] = useState<DashRange>("week");
    const [dashCoupon, setDashCoupon] = useState<string>("");

    const dashRangeStart = (): Date | null => {
        const now = new Date();
        if (dashRange === "day") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (dashRange === "week") { const d = new Date(now); d.setDate(d.getDate() - 7); return d; }
        if (dashRange === "month") { const d = new Date(now); d.setMonth(d.getMonth() - 1); return d; }
        return null; // "all"
    };
    const rangeStart = dashRangeStart();
    const inRange = (iso: string) => !rangeStart || new Date(iso) >= rangeStart;

    const dashPayments = payments
        .filter((p) => inRange(p.created_at))
        .filter((p) => !dashCoupon || (p.coupon_code || "") === dashCoupon);
    const dashReports = reports.filter((r) => inRange(r.createdAt));
    const dashNewUsers = users.filter((u) => inRange(u.createdAt));

    const totalRevenue = dashPayments.reduce((sum, p) => sum + p.amount, 0);
    const avgOrderValue = dashPayments.length ? Math.round(totalRevenue / dashPayments.length) : 0;

    const revenueByCoupon = (() => {
        const map = new Map<string, { count: number; revenue: number }>();
        for (const p of dashPayments) {
            const key = p.coupon_code || "— No coupon —";
            const entry = map.get(key) || { count: 0, revenue: 0 };
            entry.count += 1;
            entry.revenue += p.amount;
            map.set(key, entry);
        }
        return Array.from(map.entries())
            .map(([code, v]) => ({ code, ...v }))
            .sort((a, b) => b.revenue - a.revenue);
    })();

    // Revenue trend — bucketed by day (day/week/month ranges) or by month ("all").
    const revenueTrend = (() => {
        const byMonth = dashRange === "all";
        const buckets = new Map<string, number>();
        for (const p of dashPayments) {
            const d = new Date(p.created_at);
            const key = byMonth
                ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
                : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            buckets.set(key, (buckets.get(key) || 0) + p.amount);
        }
        return Array.from(buckets.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, revenue]) => ({
                key,
                revenue,
                label: byMonth
                    ? new Date(key + "-01").toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
                    : new Date(key).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
            }));
    })();
    const maxTrendRevenue = Math.max(1, ...revenueTrend.map((b) => b.revenue));

    const loadAll = useCallback(async () => {
        setLoadingData(true);
        try {
            const [uRes, lRes, sRes, cRes, rRes, pRes] = await Promise.all([
                fetch("/api/admin/users"),
                fetch("/api/admin/leads"),
                fetch("/api/admin/search-logs"),
                fetch("/api/admin/coupons"),
                fetch("/api/admin/reports"),
                fetch("/api/admin/payments"),
            ]);

            if (uRes.status === 403) {
                setAuthState("denied");
                return;
            }
            setAuthState("ok");

            const [uData, lData, sData, cData, rData, pData] = await Promise.all([
                uRes.json(), lRes.json(), sRes.json(), cRes.json(), rRes.json(), pRes.json(),
            ]);
            setUsers(uData.users || []);
            setLeads(lData.leads || []);
            setSearchLogs(sData.searchLogs || []);
            setCoupons(cData.coupons || []);
            setReports(rData.reports || []);
            setPayments(pData.payments || []);
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

    const [adminBusyEmail, setAdminBusyEmail] = useState<string | null>(null);
    const [adminMsg, setAdminMsg] = useState<string | null>(null);
    const handleGrantAdmin = async (email: string, isAdmin: boolean) => {
        setAdminBusyEmail(email);
        setAdminMsg(null);
        try {
            const res = await fetch("/api/admin/users/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, isAdmin }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed");
            await loadAll();
        } catch (e: any) {
            setAdminMsg(e.message || "Something went wrong.");
        } finally {
            setAdminBusyEmail(null);
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
            <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center gap-4 px-4 text-center">
                <h1 className="text-2xl font-bold">Sign in required</h1>
                <p className="text-slate-600 max-w-sm">Sign in with the Google account on the admin allowlist to access this panel.</p>
                <Link href="/" className="px-5 py-2.5 bg-blue-600 text-white rounded-full font-bold text-sm hover:scale-105 transition">Go to app</Link>
            </div>
        );
    }

    if (authState === "denied") {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center gap-4 px-4 text-center">
                <h1 className="text-2xl font-bold text-red-600">Not authorized</h1>
                <p className="text-slate-600 max-w-sm">
                    {session.user.email} isn't on the admin allowlist. Add it to <code className="text-blue-600">ADMIN_EMAILS</code> in your server env to grant access.
                </p>
                <Link href="/" className="px-5 py-2.5 bg-blue-600 text-white rounded-full font-bold text-sm hover:scale-105 transition">Go to app</Link>
            </div>
        );
    }

    const NAV_ITEMS: { id: Tab; label: string; count: number; icon: React.ReactNode }[] = [
        { id: "dashboard", label: "Dashboard", count: payments.length, icon: <DashboardIcon /> },
        { id: "users", label: "Users", count: users.length, icon: <UsersIcon /> },
        { id: "reports", label: "Reports", count: reports.length, icon: <ReportsIcon /> },
        { id: "leads", label: "Leads", count: leads.length, icon: <LeadsIcon /> },
        { id: "searchLogs", label: "Search Logs", count: searchLogs.length, icon: <SearchIcon /> },
        { id: "coupons", label: "Coupons", count: coupons.length, icon: <CouponIcon /> },
    ];

    const activeNavItem = NAV_ITEMS.find((n) => n.id === tab)!;

    const NavButton = ({ item }: { item: typeof NAV_ITEMS[number] }) => (
        <button
            onClick={() => { setTab(item.id); setMobileNavOpen(false); setSearch(""); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition text-left ${tab === item.id
                ? "bg-gradient-to-r from-blue-50 to-blue-50 text-slate-900 border border-blue-200 shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                }`}
        >
            <span className={tab === item.id ? "text-blue-600" : "text-slate-500"}>{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            <span className={`text-xs font-mono px-1.5 py-0.5 rounded-md min-w-[1.75rem] text-center ${tab === item.id ? "bg-blue-100 text-blue-700" : "bg-slate-50 text-slate-500"}`}>
                {item.count}
            </span>
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
                <div className="px-4 md:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileNavOpen((v) => !v)}
                            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-700"
                            aria-label="Toggle navigation"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
                            What<span className="text-blue-600">My</span>Rank <span className="text-blue-600 font-mono text-xs align-top">ADMIN</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-500 font-mono hidden sm:inline">{session.user.email}</span>
                        <Link href="/" className="text-xs font-bold text-slate-600 uppercase hover:text-slate-900 transition">Back to App</Link>
                        <button onClick={() => signOut()} className="text-xs font-bold text-red-600 uppercase hover:text-red-700 transition">Sign Out</button>
                    </div>
                </div>
            </nav>

            <div className="relative z-10 flex flex-col md:flex-row">
                {/* Sidebar */}
                <aside className={`md:w-64 md:shrink-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)] border-b md:border-b-0 md:border-r border-slate-200 bg-white/60 backdrop-blur-xl overflow-y-auto ${mobileNavOpen ? "block" : "hidden md:block"}`}>
                    <div className="p-4 space-y-1">
                        <p className="px-4 pt-2 pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Manage</p>
                        {NAV_ITEMS.map((item) => <NavButton key={item.id} item={item} />)}
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 min-w-0 px-4 md:px-10 py-8 md:py-10">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-blue-600">{activeNavItem.icon}</span>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{activeNavItem.label}</h1>
                    </div>
                    <p className="text-slate-500 text-sm mb-8">
                        {tab === "dashboard" && "Revenue, reports, and signups — filterable by time range and coupon."}
                        {tab === "users" && "Every signed-up account and their premium status."}
                        {tab === "reports" && "Every generated audit report — re-download the PDF for any user."}
                        {tab === "leads" && "Email/phone captured at the paywall before unlock or payment."}
                        {tab === "searchLogs" && "Top result logged for every business search."}
                        {tab === "coupons" && "Codes that discount or fully skip payment at checkout."}
                    </p>

                    {!loadingData && tab !== "dashboard" && (
                        <div className="relative mb-6 max-w-md">
                            <svg className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" /></svg>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={SEARCH_PLACEHOLDERS[tab]}
                                className="w-full bg-white border border-slate-200 focus:border-blue-300 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition"
                                    aria-label="Clear search"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}
                        </div>
                    )}

                    {loadingData ? (
                        <div className="text-slate-500 text-sm">Loading…</div>
                    ) : tab === "dashboard" ? (
                        <div className="space-y-6">
                            {/* Filters */}
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1">
                                    {([
                                        { id: "day", label: "Today" },
                                        { id: "week", label: "7 Days" },
                                        { id: "month", label: "30 Days" },
                                        { id: "all", label: "All Time" },
                                    ] as { id: DashRange; label: string }[]).map((r) => (
                                        <button
                                            key={r.id}
                                            onClick={() => setDashRange(r.id)}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${dashRange === r.id
                                                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                                                : "text-slate-600 hover:text-slate-900"
                                                }`}
                                        >
                                            {r.label}
                                        </button>
                                    ))}
                                </div>

                                <select
                                    value={dashCoupon}
                                    onChange={(e) => setDashCoupon(e.target.value)}
                                    className="bg-white border border-slate-200 focus:border-blue-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none transition [color-scheme:dark]"
                                >
                                    <option value="">All Coupons</option>
                                    {Array.from(new Set(payments.map((p) => p.coupon_code).filter(Boolean))).map((code) => (
                                        <option key={code as string} value={code as string}>{code}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Stat tiles */}
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                {[
                                    { label: "Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, accent: "text-blue-600" },
                                    { label: "Payments", value: dashPayments.length, accent: "text-blue-600" },
                                    { label: "Avg Order Value", value: `₹${avgOrderValue.toLocaleString("en-IN")}`, accent: "text-violet-600" },
                                    { label: "Reports Generated", value: dashReports.length, accent: "text-emerald-600" },
                                    { label: "New Users", value: dashNewUsers.length, accent: "text-amber-600" },
                                ].map((tile) => (
                                    <div key={tile.label} className="bg-white border border-slate-200 rounded-2xl p-5">
                                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">{tile.label}</p>
                                        <p className={`text-2xl font-bold font-mono ${tile.accent}`}>{tile.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Revenue trend */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
                                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-5">Revenue Trend</h2>
                                {revenueTrend.length === 0 ? (
                                    <p className="text-slate-500 text-sm py-8 text-center">No payments in this range.</p>
                                ) : (
                                    <div className="flex items-end gap-1.5 h-40 overflow-x-auto pb-1">
                                        {revenueTrend.map((b) => (
                                            <div key={b.key} className="flex flex-col items-center gap-1.5 shrink-0" style={{ width: revenueTrend.length > 20 ? 10 : 28 }}>
                                                <div
                                                    title={`${b.label}: ₹${b.revenue.toLocaleString("en-IN")}`}
                                                    className="w-full rounded-t-[3px] bg-cyan-500 hover:bg-cyan-400 transition-colors"
                                                    style={{ height: `${Math.max(3, (b.revenue / maxTrendRevenue) * 130)}px` }}
                                                />
                                                {revenueTrend.length <= 14 && (
                                                    <span className="text-[9px] text-slate-500 whitespace-nowrap">{b.label}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Revenue by coupon */}
                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider p-5 pb-0">Revenue by Coupon</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm mt-3">
                                        <thead>
                                            <tr className="text-left text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                                <th className="p-4">Coupon</th>
                                                <th className="p-4">Payments</th>
                                                <th className="p-4">Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {revenueByCoupon.map((row) => (
                                                <tr key={row.code} className="border-b border-slate-200 last:border-0 hover:bg-slate-50">
                                                    <td className="p-4 font-mono text-blue-600">{row.code}</td>
                                                    <td className="p-4 text-slate-600">{row.count}</td>
                                                    <td className="p-4 text-slate-800 font-mono">₹{row.revenue.toLocaleString("en-IN")}</td>
                                                </tr>
                                            ))}
                                            {revenueByCoupon.length === 0 && (
                                                <tr><td colSpan={3} className="p-8 text-center text-slate-500">No payments in this range.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : tab === "users" ? (
                        <div className="space-y-6">
                            <div className="bg-white border border-slate-200 rounded-2xl p-5">
                                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Grant Premium by Email</h2>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="email"
                                        value={grantEmail}
                                        onChange={(e) => setGrantEmail(e.target.value)}
                                        placeholder="user@example.com"
                                        className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none text-slate-900 text-sm focus:border-cyan-500 transition"
                                    />
                                    <button
                                        disabled={!grantEmail.trim() || grantBusy}
                                        onClick={() => handleGrantPremium(grantEmail.trim(), true)}
                                        className="px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition shrink-0"
                                    >
                                        Grant Premium
                                    </button>
                                </div>
                                {grantMsg && <p className="text-xs text-blue-600 mt-2">{grantMsg}</p>}
                                <p className="text-[11px] text-slate-500 mt-2">Works even if this person hasn't signed in yet — they'll be premium automatically the moment they do.</p>
                            </div>

                            {adminMsg && (
                                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{adminMsg}</p>
                            )}

                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                                <th className="p-4">Email</th>
                                                <th className="p-4">Status</th>
                                                <th className="p-4">Admin</th>
                                                <th className="p-4">Reports</th>
                                                <th className="p-4">Joined</th>
                                                <th className="p-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map((u) => (
                                                <tr key={u.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50">
                                                    <td className="p-4 font-mono text-xs text-slate-700">{u.email}</td>
                                                    <td className="p-4">
                                                        {u.isPremium ? (
                                                            <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold">Premium</span>
                                                        ) : (
                                                            <span className="px-2 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold">Guest</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        {u.isAdmin ? (
                                                            <span className="px-2 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-200 text-xs font-bold">Admin</span>
                                                        ) : (
                                                            <span className="text-slate-500 text-xs">—</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-slate-600">{u.reportCount}</td>
                                                    <td className="p-4 text-slate-500 text-xs">{formatDate(u.createdAt)}</td>
                                                    <td className="p-4 text-right whitespace-nowrap">
                                                        <button
                                                            onClick={() => handleGrantPremium(u.email, !u.isPremium)}
                                                            disabled={grantBusy}
                                                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${u.isPremium
                                                                ? "text-red-600 hover:bg-red-50"
                                                                : "text-blue-600 hover:bg-blue-50"
                                                                }`}
                                                        >
                                                            {u.isPremium ? "Revoke" : "Make Premium"}
                                                        </button>
                                                        <button
                                                            onClick={() => handleGrantAdmin(u.email, !u.isAdmin)}
                                                            disabled={adminBusyEmail === u.email}
                                                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition disabled:opacity-40 ${u.isAdmin
                                                                ? "text-red-600 hover:bg-red-50"
                                                                : "text-violet-600 hover:bg-violet-50"
                                                                }`}
                                                        >
                                                            {adminBusyEmail === u.email ? "…" : u.isAdmin ? "Revoke Admin" : "Make Admin"}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredUsers.length === 0 && (
                                                <tr><td colSpan={6} className="p-8 text-center text-slate-500">{search ? "No users match your search." : "No users yet."}</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : tab === "reports" ? (
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                            <th className="p-4">Business</th>
                                            <th className="p-4">User</th>
                                            <th className="p-4">Score</th>
                                            <th className="p-4">Generated</th>
                                            <th className="p-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredReports.map((r) => (
                                            <tr key={r.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50">
                                                <td className="p-4 text-slate-800">{r.gmbName || "—"}</td>
                                                <td className="p-4 font-mono text-xs text-slate-700">{r.userEmail || "—"}</td>
                                                <td className="p-4">
                                                    {r.auditScore != null ? (
                                                        <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold">{r.auditScore}/100</span>
                                                    ) : "—"}
                                                </td>
                                                <td className="p-4 text-slate-500 text-xs">{formatDate(r.createdAt)}</td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => handleDownloadReport(r)}
                                                        disabled={downloadingId === r.id}
                                                        title={r.hasPdf ? "Download PDF" : "No cached PDF yet — user hasn't downloaded it themselves"}
                                                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition disabled:opacity-40 ${r.hasPdf
                                                            ? "text-blue-600 hover:bg-blue-50"
                                                            : "text-slate-500 hover:bg-slate-50"
                                                            }`}
                                                    >
                                                        <DownloadIcon />
                                                        {downloadingId === r.id ? "Preparing…" : r.hasPdf ? "Download PDF" : "Not cached"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredReports.length === 0 && (
                                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">{search ? "No reports match your search." : "No reports generated yet."}</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : tab === "leads" ? (
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                            <th className="p-4">Business</th>
                                            <th className="p-4">Email</th>
                                            <th className="p-4">Phone</th>
                                            <th className="p-4">Coupon</th>
                                            <th className="p-4">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLeads.map((l) => (
                                            <tr key={l.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50">
                                                <td className="p-4 text-slate-800">{l.business || "—"}</td>
                                                <td className="p-4 font-mono text-xs text-slate-700">{l.email || "—"}</td>
                                                <td className="p-4 text-slate-600">{l.phone || "—"}</td>
                                                <td className="p-4">{l.coupon ? <span className="px-2 py-0.5 rounded bg-slate-50 text-blue-600 text-xs font-mono">{l.coupon}</span> : "—"}</td>
                                                <td className="p-4 text-slate-500 text-xs">{formatDate(l.created_at)}</td>
                                            </tr>
                                        ))}
                                        {filteredLeads.length === 0 && (
                                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">{search ? "No leads match your search." : "No leads captured yet."}</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : tab === "searchLogs" ? (
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                            <th className="p-4">Business Searched</th>
                                            <th className="p-4">Phone</th>
                                            <th className="p-4">Website</th>
                                            <th className="p-4">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSearchLogs.map((s) => (
                                            <tr key={s.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50">
                                                <td className="p-4 text-slate-800">{s.name || "—"}</td>
                                                <td className="p-4 text-slate-600">{s.phone || "—"}</td>
                                                <td className="p-4 text-slate-600 truncate max-w-xs">{s.website || "—"}</td>
                                                <td className="p-4 text-slate-500 text-xs">{formatDate(s.created_at)}</td>
                                            </tr>
                                        ))}
                                        {filteredSearchLogs.length === 0 && (
                                            <tr><td colSpan={4} className="p-8 text-center text-slate-500">{search ? "No search logs match your search." : "No searches logged yet."}</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-white border border-slate-200 rounded-2xl p-5">
                                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Add Coupon</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                    <input
                                        value={newCouponCode}
                                        onChange={(e) => setNewCouponCode(e.target.value)}
                                        placeholder="code (e.g. launch50)"
                                        className="col-span-2 sm:col-span-1 bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none text-slate-900 text-sm focus:border-cyan-500 transition"
                                    />
                                    <input
                                        value={newCouponNote}
                                        onChange={(e) => setNewCouponNote(e.target.value)}
                                        placeholder="note (optional)"
                                        className="col-span-2 sm:col-span-1 bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none text-slate-900 text-sm focus:border-cyan-500 transition"
                                    />
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min={1}
                                            max={100}
                                            value={newCouponDiscount}
                                            onChange={(e) => setNewCouponDiscount(e.target.value)}
                                            placeholder="100"
                                            className="w-full bg-slate-50 border border-slate-200 p-3 pr-7 rounded-xl outline-none text-slate-900 text-sm focus:border-cyan-500 transition"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">%</span>
                                    </div>
                                    <input
                                        type="number"
                                        min={1}
                                        value={newCouponMaxUses}
                                        onChange={(e) => setNewCouponMaxUses(e.target.value)}
                                        placeholder="max uses (∞)"
                                        className="bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none text-slate-900 text-sm focus:border-cyan-500 transition"
                                    />
                                    <input
                                        type="date"
                                        value={newCouponExpiresAt}
                                        onChange={(e) => setNewCouponExpiresAt(e.target.value)}
                                        className="bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none text-slate-900 text-sm focus:border-cyan-500 transition [color-scheme:dark]"
                                    />
                                </div>
                                <button
                                    disabled={!newCouponCode.trim() || couponBusy}
                                    onClick={handleAddCoupon}
                                    className="mt-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
                                >
                                    Add Coupon
                                </button>
                                <p className="text-[11px] text-slate-500 mt-2">Discount defaults to 100% (fully skips payment). Leave max uses / expiry blank for unlimited / never-expiring.</p>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
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
                                            {filteredCoupons.map((c) => editingCode === c.code ? (
                                                <tr key={c.code} className="border-b border-slate-200 last:border-0 bg-slate-50">
                                                    <td className="p-4 font-mono text-blue-600">{c.code}</td>
                                                    <td className="p-4">
                                                        <div className="relative w-20">
                                                            <input
                                                                type="number" min={1} max={100}
                                                                value={editForm.discountPercent}
                                                                onChange={(e) => setEditForm({ ...editForm, discountPercent: e.target.value })}
                                                                className="w-full bg-slate-50 border border-slate-200 p-2 pr-6 rounded-lg outline-none text-slate-900 text-sm focus:border-cyan-500 transition"
                                                            />
                                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">%</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <input
                                                            type="number" min={1}
                                                            value={editForm.maxUses}
                                                            onChange={(e) => setEditForm({ ...editForm, maxUses: e.target.value })}
                                                            placeholder="∞"
                                                            className="w-20 bg-slate-50 border border-slate-200 p-2 rounded-lg outline-none text-slate-900 text-sm focus:border-cyan-500 transition"
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <input
                                                            type="date"
                                                            value={editForm.expiresAt}
                                                            onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })}
                                                            className="bg-slate-50 border border-slate-200 p-2 rounded-lg outline-none text-slate-900 text-sm focus:border-cyan-500 transition [color-scheme:dark]"
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <input
                                                            value={editForm.note}
                                                            onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                                                            placeholder="note"
                                                            className="w-32 bg-slate-50 border border-slate-200 p-2 rounded-lg outline-none text-slate-900 text-sm focus:border-cyan-500 transition"
                                                        />
                                                    </td>
                                                    <td className="p-4 text-slate-500 text-xs">—</td>
                                                    <td className="p-4 text-right whitespace-nowrap">
                                                        <button
                                                            onClick={() => saveEditCoupon(c.code)}
                                                            disabled={editBusy}
                                                            className="text-xs font-bold px-3 py-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition disabled:opacity-40"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={cancelEditCoupon}
                                                            className="text-xs font-bold px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </td>
                                                </tr>
                                            ) : (
                                                <tr key={c.code} className="border-b border-slate-200 last:border-0 hover:bg-slate-50">
                                                    <td className="p-4 font-mono text-blue-600">{c.code}</td>
                                                    <td className="p-4 text-slate-800">{c.discount_percent}%</td>
                                                    <td className="p-4 text-slate-600">{c.used_count}{c.max_uses != null ? ` / ${c.max_uses}` : " / ∞"}</td>
                                                    <td className={`p-4 text-xs ${isExpired(c.expires_at) ? "text-red-600" : "text-slate-600"}`}>
                                                        {c.expires_at ? formatDateShort(c.expires_at) : "Never"}
                                                        {isExpired(c.expires_at) && <span className="ml-1">(expired)</span>}
                                                    </td>
                                                    <td className="p-4 text-slate-600">{c.note || "—"}</td>
                                                    <td className="p-4">
                                                        <button
                                                            onClick={() => toggleCoupon(c.code, !c.active)}
                                                            className={`px-2 py-1 rounded-full text-xs font-bold border transition ${c.active
                                                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                                                : "bg-slate-50 text-slate-500 border-slate-200"
                                                                }`}
                                                        >
                                                            {c.active ? "Active" : "Inactive"}
                                                        </button>
                                                    </td>
                                                    <td className="p-4 text-right whitespace-nowrap">
                                                        <button
                                                            onClick={() => startEditCoupon(c)}
                                                            className="text-xs font-bold px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => deleteCoupon(c.code)}
                                                            className="text-xs font-bold px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredCoupons.length === 0 && (
                                                <tr><td colSpan={7} className="p-8 text-center text-slate-500">{search ? "No coupons match your search." : "No coupons yet."}</td></tr>
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
