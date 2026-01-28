"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Plus, RefreshCw, ShieldCheck, Users, Ticket, AlertTriangle, Search, Wallet, CheckCircle, XCircle, Settings, Megaphone, Bell, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Types
interface Voucher {
    id: number;
    code: string;
    valueRp: number;
    gemsAmount: number;
    cashbackAmount: number;
    isClaimed: boolean;
    claimedBy: string | null;
    createdAt: string;
}

interface UserData {
    userId: string;
    userName: string;
    hearts: number;
    points: number;
    hasActiveSubscription: boolean;
    isGuest: boolean;
    isCourseCompleted: boolean;
}

interface RedeemRequest {
    id: number;
    userId: string;
    userName: string;
    gemsAmount: number;
    rupiahAmount: number;
    paymentMethod: string;
    accountNumber: string;
    accountName: string | null;
    status: string;
    adminNotes: string | null;
    createdAt: string;
    processedAt: string | null;
}

interface Feedback {
    id: number;
    user_id: string;
    user_name: string;
    message: string;
    type: "saran" | "kritik" | "other";
    created_at: string;
}

export default function ManagerPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [activeTab, setActiveTab] = useState<"users" | "vouchers" | "redeem" | "treasure" | "feedback" | "ads" | "security" | "transactions">("vouchers");

    // Data State
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [users, setUsers] = useState<UserData[]>([]);
    const [generatedVouchers, setGeneratedVouchers] = useState<Voucher[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);

    // Gen State
    const [qty, setQty] = useState(10);
    const [denom, setDenom] = useState(10000);
    const [isLoading, setIsLoading] = useState(false);

    // Voucher Management State
    const [adminVouchers, setAdminVouchers] = useState<Voucher[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Claims Pagination State
    const [claimsPage, setClaimsPage] = useState(1);
    const [claimsTotalPages, setClaimsTotalPages] = useState(1);
    const [claimsStartDate, setClaimsStartDate] = useState("");
    const [claimsEndDate, setClaimsEndDate] = useState("");
    const [totalCashback, setTotalCashback] = useState(0);

    // Redeem Requests State
    const [redeemRequests, setRedeemRequests] = useState<RedeemRequest[]>([]);
    const [pendingRedeemCount, setPendingRedeemCount] = useState(0);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [feedbackPage, setFeedbackPage] = useState(1);
    const [feedbackTotalPages, setFeedbackTotalPages] = useState(1);
    const [feedbackStartDate, setFeedbackStartDate] = useState("");
    const [feedbackEndDate, setFeedbackEndDate] = useState("");

    // Treasure Settings State
    const [treasureSettings, setTreasureSettings] = useState({
        paid4linkUrl: "",
        isEnabled: true,
        requirePaid4link: false,
    });
    const [savingTreasure, setSavingTreasure] = useState(false);

    // Ads Settings State
    const [adsList, setAdsList] = useState<any[]>([]);
    const [editingAd, setEditingAd] = useState<any>(null); // For Dialog
    const [isAdDialogOpen, setIsAdDialogOpen] = useState(false);
    const [savingAds, setSavingAds] = useState(false);

    // Security Logs State
    const [securityLogs, setSecurityLogs] = useState<any[]>([]);
    const [securityPage, setSecurityPage] = useState(1);
    const [securityTotalPages, setSecurityTotalPages] = useState(1);

    // Transactions State
    const [transactions, setTransactions] = useState<any[]>([]);
    const [transPage, setTransPage] = useState(1);
    const [transTotalPages, setTransTotalPages] = useState(1);

    const fetchTransactions = () => {
        fetch(`/api/admin/transactions?page=${transPage}`)
            .then(res => res.json())
            .then(data => {
                setTransactions(data.data || []);
                setTransTotalPages(data.pagination?.totalPages || 1);
            })
            .catch(console.error);
    };

    const fetchSecurityLogs = () => {
        fetch(`/api/admin/security/logs?page=${securityPage}`)
            .then(res => res.json())
            .then(data => {
                setSecurityLogs(data.data || []);
                setSecurityTotalPages(data.pagination?.totalPages || 1);
            })
            .catch(console.error);
    };

    const fetchAdSettings = () => {
        // Add timestamp to prevent Cloudflare caching
        fetch(`/api/admin/ads?t=${Date.now()}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAdsList(data);
                }
            })
            .catch(console.error);
    }

    const handleApproveManual = async (orderId: string, action: "approve" | "reject") => {
        if (!confirm(`Are you sure you want to ${action.toUpperCase()} this transaction?`)) return;

        try {
            const res = await fetch("/api/admin/manual-approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, action })
            });
            const data = await res.json();

            if (data.success) {
                toast.success(`Transaction ${action}ed successfully!`);
                fetchTransactions(); // Refresh
            } else {
                toast.error("Process failed: " + data.error);
            }
        } catch (e) {
            toast.error("Connection error");
        }
    };

    const handleSaveAd = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingAds(true);
        const action = editingAd.id ? "update" : "create";

        try {
            const res = await fetch("/api/admin/ads/manage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, ...editingAd })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Ad ${action}d successfully`);
                setIsAdDialogOpen(false);
                fetchAdSettings();
            } else {
                toast.error(data.error || "Failed");
            }
        } catch (error) {
            toast.error("Connection Error");
        } finally {
            setSavingAds(false);
        }
    }

    const handleDeleteAd = async (id: number) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;
        try {
            await fetch("/api/admin/ads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "delete", id })
            });
            toast.success("Ad Deleted");
            fetchAdSettings();
        } catch (e) { toast.error("Error deleting"); }
    }

    const openNewAdDialog = () => {
        setEditingAd({
            title: "New Promotion",
            type: "image",
            placement: "banner",
            weight: 50,
            frequency: 0,
            image_url: "",
            target_url: "",
            script_code: "",
            is_active: true
        });
        setIsAdDialogOpen(true);
    }

    const fetchUsers = () => {
        fetch("/api/admin/users")
            .then(res => res.json())
            .then(setUsers)
            .catch(console.error);
    };

    const fetchVouchers = () => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: "10",
        });
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        fetch(`/api/admin/vouchers?${params.toString()}`)
            .then(res => res.json())
            .then(res => {
                setAdminVouchers(res?.data || []);
                setTotalPages(res?.pagination?.totalPages || 1);
            })
            .catch(err => {
                console.error("Fetch vouchers error:", err);
                setAdminVouchers([]);
                setTotalPages(1);
            });
    };

    const fetchClaims = () => {
        const params = new URLSearchParams({
            page: claimsPage.toString(),
            limit: "10",
        });
        if (claimsStartDate) params.append("startDate", claimsStartDate);
        if (claimsEndDate) params.append("endDate", claimsEndDate);

        fetch(`/api/admin/claims?${params.toString()}`)
            .then(res => res.json())
            .then(res => {
                setAlerts(res?.data || []);
                setClaimsTotalPages(res?.pagination?.totalPages || 1);
                setTotalCashback(res?.summary?.totalCashback || 0);
            })
            .catch(err => {
                console.error("Fetch claims error:", err);
                setAlerts([]);
            });
    };

    const fetchFeedbacks = () => {
        const params = new URLSearchParams({
            page: feedbackPage.toString(),
            limit: "10",
        });
        if (feedbackStartDate) params.append("startDate", feedbackStartDate);
        if (feedbackEndDate) params.append("endDate", feedbackEndDate);

        fetch(`/api/admin/feedback?${params.toString()}`)
            .then(res => res.json())
            .then(res => {
                setFeedbacks(res?.data || []);
                setFeedbackTotalPages(res?.pagination?.totalPages || 1);
            })
            .catch(console.error);
    };

    const fetchRedeemRequests = () => {
        fetch("/api/admin/redeem")
            .then(res => res.json())
            .then(res => {
                setRedeemRequests(res?.requests || []);
                setPendingRedeemCount(res?.pendingCount || 0);
            })
            .catch(err => {
                console.error("Fetch redeem requests error:", err);
                setRedeemRequests([]);
            });
    };

    useEffect(() => {
        if (isAuthenticated && activeTab === "feedback") {
            fetchFeedbacks();
        }
    }, [isAuthenticated, activeTab, feedbackPage, feedbackStartDate, feedbackEndDate]);

    useEffect(() => {
        if (isAuthenticated && activeTab === "ads") {
            fetchAdSettings();
        }
    }, [isAuthenticated, activeTab]);

    useEffect(() => {
        if (isAuthenticated && activeTab === "security") {
            fetchSecurityLogs();
        }
    }, [isAuthenticated, activeTab, securityPage]);

    useEffect(() => {
        if (isAuthenticated && activeTab === "transactions") {
            fetchTransactions();
        }
    }, [isAuthenticated, activeTab, transPage]);

    useEffect(() => {
        if (isAuthenticated && activeTab === "vouchers") {
            fetchVouchers();
        }
    }, [isAuthenticated, activeTab, page, startDate, endDate]);

    useEffect(() => {
        if (isAuthenticated) {
            // Fetch Users
            fetch("/api/admin/users").then(res => res.json()).then(setUsers);
            // Fetch Claims (with pagination)
            fetchClaims();
        }
    }, [isAuthenticated, claimsPage, claimsStartDate, claimsEndDate]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchRedeemRequests();
            // Fetch Treasure Settings
            fetch(`/api/admin/treasure-settings?t=${Date.now()}`, { cache: "no-store", headers: { "Pragma": "no-cache" } })
                .then(res => res.json())
                .then(data => setTreasureSettings({
                    paid4linkUrl: data.paid4linkUrl || "",
                    isEnabled: data.isEnabled ?? true,
                    requirePaid4link: data.requirePaid4link ?? false,
                }))
                .catch(console.error);
        }
    }, [isAuthenticated]);

    const handleLogin = () => {
        if (password === "admin123") {
            setIsAuthenticated(true);
        } else {
            toast.error("Password Salah!");
        }
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/vouchers/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qty, valueRp: denom }),
            });
            const data = await response.json();
            if (data.success) {
                setGeneratedVouchers(data.vouchers);
                fetchVouchers(); // Refresh List
                toast.success("Sukses Generate Voucher! 🎉");
            }
        } catch (error) {
            toast.error("Gagal Generate!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to DELETE this user? This cannot be undone.")) return;

        try {
            const res = await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success("User deleted successfully");
                fetchUsers();
            } else {
                toast.error(data.error || "Failed to delete user");
            }
        } catch (error) {
            toast.error("Error deleting user");
        }
    };

    const handleGrantPro = async (userId: string) => {
        if (!confirm("Jadikan User ini JAWARA PRO?")) return;

        await fetch("/api/admin/users/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, hasActiveSubscription: true }),
        });

        // Refresh local data
        setUsers(users.map(u => u.userId === userId ? { ...u, hasActiveSubscription: true } : u));
        toast.success("User berhasil di-upgrade! 🏆");
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.info("Kode berhasil di-copy! 📋");
    };

    const handleUpdateRedeemStatus = async (id: number, status: string, notes?: string) => {
        if (!confirm(`Ubah status ke ${status}?`)) return;

        await fetch("/api/admin/redeem/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status, adminNotes: notes }),
        });

        fetchRedeemRequests();
        toast.success(`Status diubah ke ${status}`);
    };

    const handleSaveTreasureSettings = async () => {
        setSavingTreasure(true);
        try {
            await fetch("/api/admin/treasure-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(treasureSettings),
            });
            toast.success("Treasure settings saved!");
        } catch {
            toast.error("Failed to save settings");
        } finally {
            setSavingTreasure(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="bg-white p-8 rounded-xl shadow-lg w-[350px] flex flex-col gap-4 text-center">
                    <ShieldCheck className="h-16 w-16 text-slate-700 mx-auto" />
                    <h1 className="text-2xl font-bold">Admin Access</h1>
                    <Input
                        type="password"
                        placeholder="Enter PIN"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button onClick={handleLogin}>Login</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">🛠️ Cendra Admin CMS</h1>
                        <p className="text-slate-500">Pusat Kontrol & Cetak Uang (Manager V2)</p>
                    </div>
                    {/* Course Completion Alert Bell */}
                    {users.filter(u => u.isCourseCompleted).length > 0 && (
                        <div
                            onClick={() => setActiveTab("users")}
                            className="relative cursor-pointer bg-green-100 p-3 rounded-xl border-2 border-green-400 hover:bg-green-200 transition-all animate-bounce"
                            title="Ada user yang sudah menyelesaikan course!"
                        >
                            <Bell className="h-6 w-6 text-green-600" />
                            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-lg">
                                {users.filter(u => u.isCourseCompleted).length}
                            </span>
                        </div>
                    )}
                    {/* Redeem Requests Alert Bell */}
                    {pendingRedeemCount > 0 && (
                        <div
                            onClick={() => setActiveTab("redeem")}
                            className="relative cursor-pointer bg-red-100 p-3 rounded-xl border-2 border-red-400 hover:bg-red-200 transition-all animate-pulse"
                            title="Ada permintaan penarikan dana menunggu!"
                        >
                            <Wallet className="h-6 w-6 text-red-600" />
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-lg">
                                {pendingRedeemCount}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between mb-8">
                    <div></div>
                    <div className="flex gap-2">
                        <Button
                            variant={activeTab === "vouchers" ? "primary" : "ghost"}
                            onClick={() => setActiveTab("vouchers")}
                            className="relative"
                        >
                            <Ticket className="mr-2 h-4 w-4" /> Vouchers
                            {alerts.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                    {alerts.length > 9 ? "9+" : alerts.length}
                                </span>
                            )}
                        </Button>
                        <Button
                            variant={activeTab === "users" ? "primary" : "ghost"}
                            onClick={() => setActiveTab("users")}
                            className="relative"
                        >
                            <Users className="mr-2 h-4 w-4" /> Users Management
                            {users.filter(u => u.isCourseCompleted).length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                                    {users.filter(u => u.isCourseCompleted).length}
                                </span>
                            )}
                        </Button>
                        <Button
                            variant={activeTab === "redeem" ? "primary" : "ghost"}
                            onClick={() => setActiveTab("redeem")}
                            className="relative"
                        >
                            <Wallet className="mr-2 h-4 w-4" /> Redeem Requests
                            {pendingRedeemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                                    {pendingRedeemCount}
                                </span>
                            )}
                        </Button>
                        <Button
                            variant={activeTab === "treasure" ? "primary" : "ghost"}
                            onClick={() => setActiveTab("treasure")}
                        >
                            <Settings className="mr-2 h-4 w-4" /> Treasure Settings
                        </Button>
                        <Button
                            variant={activeTab === "feedback" ? "primary" : "ghost"}
                            onClick={() => setActiveTab("feedback")}
                            className="relative"
                        >
                            <Users className="mr-2 h-4 w-4" /> Feedback
                            {feedbacks.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                    {feedbacks.length > 9 ? "9+" : feedbacks.length}
                                </span>
                            )}
                        </Button>
                        <Button
                            variant={activeTab === "ads" ? "primary" : "ghost"}
                            onClick={() => setActiveTab("ads")}
                            className="bg-emerald-600 text-white hover:bg-emerald-700 ml-2"
                        >
                            <Megaphone className="mr-2 h-4 w-4" /> Ads Manager
                        </Button>
                    </div>
                    <Button
                        variant={activeTab === "security" ? "primary" : "ghost"}
                        onClick={() => setActiveTab("security")}
                        className="bg-rose-100 text-rose-700 hover:bg-rose-200 ml-2 border border-rose-200"
                    >
                        <ShieldCheck className="mr-2 h-4 w-4" /> Security
                    </Button>
                    <Button
                        variant={activeTab === "transactions" ? "primary" : "ghost"}
                        onClick={() => setActiveTab("transactions")}
                        className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 ml-2 border border-indigo-200"
                    >
                        <Wallet className="mr-2 h-4 w-4" /> Transactions
                    </Button>
                </div>
            </div>

            {/* --- TAB: TRANSACTIONS --- */}
            {
                activeTab === "transactions" && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-100 border-b border-slate-200 font-bold flex justify-between items-center">
                            <span>Riwayat Pembayaran (Midtrans)</span>
                            <Button size="sm" onClick={fetchTransactions} variant="outline"><RefreshCw className="h-4 w-4" /></Button>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="p-4">WAKTU</th>
                                    <th className="p-4">ORDER ID</th>
                                    <th className="p-4">USER ID</th>
                                    <th className="p-4">AMOUNT</th>
                                    <th className="p-4">STATUS</th>
                                    <th className="p-4">TYPE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-slate-400">Belum ada transaksi terekam.</td></tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx.order_id} className="border-b hover:bg-slate-50">
                                            <td className="p-4 text-xs font-mono text-slate-500">
                                                {new Date(Number(tx.created_at)).toLocaleString("id-ID")}
                                            </td>
                                            <td className="p-4 font-mono font-bold text-slate-700">{tx.order_id}</td>
                                            <td className="p-4 text-xs font-mono">{tx.user_id}</td>
                                            <td className="p-4 font-bold">Rp {Number(tx.gross_amount || 0).toLocaleString()}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${tx.status === 'settlement' || tx.status === 'capture' ? 'bg-green-100 text-green-700 border-green-200' :
                                                    tx.status === 'pending' || tx.status === 'pending_manual' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                        'bg-red-100 text-red-700 border-red-200'
                                                    }`}>
                                                    {tx.status?.toUpperCase().replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs uppercase text-slate-500">{tx.payment_type?.replace("_", " ")}</td>
                                            {/* Action Column for Manual Approval */}
                                            {tx.status === 'pending_manual' && (
                                                <td className="p-4 flex gap-2">
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8" onClick={() => handleApproveManual(tx.order_id, "approve")}>
                                                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="h-8 bg-red-100 text-red-600 hover:bg-red-200" onClick={() => handleApproveManual(tx.order_id, "reject")}>
                                                        <XCircle className="h-4 w-4 mr-1" /> Reject
                                                    </Button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        {/* Pagination */}
                        <div className="p-4 flex justify-between items-center border-t border-slate-200">
                            <span className="text-xs text-slate-500">Page {transPage} of {transTotalPages}</span>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" disabled={transPage === 1} onClick={() => setTransPage(p => p - 1)}>Prev</Button>
                                <Button size="sm" variant="outline" disabled={transPage === transTotalPages} onClick={() => setTransPage(p => p + 1)}>Next</Button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* --- TAB: VOUCHERS --- */}
            {
                activeTab === "vouchers" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT: Generator */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Plus className="h-5 w-5" /> Generate Baru
                                    <div className="ml-auto flex gap-2">
                                        {[1000, 10000, 50000].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => setDenom(val)}
                                                className={`px-3 py-1 text-xs rounded-full border ${denom === val ? 'bg-sky-100 border-sky-500 text-sky-700' : 'bg-slate-50'}`}
                                            >
                                                {val / 1000}K
                                            </button>
                                        ))}
                                    </div>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                    <div className="flex flex-col gap-2">
                                        <label className="font-bold text-slate-600">Nominal (Rp)</label>
                                        <select
                                            className="p-2 border rounded-md"
                                            value={denom}
                                            onChange={(e) => setDenom(Number(e.target.value))}
                                        >
                                            <option value={1000}>1K (12 Gems)</option>
                                            <option value={5000}>5K (60 Gems)</option>
                                            <option value={10000}>10K (125 Gems)</option>
                                            <option value={15000}>15K (200 Gems)</option>
                                            <option value={25000}>25K (350 Gems)</option>
                                            <option value={50000}>50K (800 Gems)</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="font-bold text-slate-600">Jumlah (Qty)</label>
                                        <Input
                                            type="number"
                                            value={qty}
                                            onChange={(e) => setQty(Number(e.target.value))}
                                        />
                                    </div>
                                    <Button size="lg" className="col-span-2" onClick={handleGenerate} disabled={isLoading}>
                                        {isLoading ? <RefreshCw className="animate-spin mr-2" /> : "PRODUKSI VOUCHER"}
                                    </Button>
                                </div>
                            </div>





                            {/* CENTER: Voucher Management List (Replaces "Result Table" for wider view) */}
                            <div className="lg:col-span-3 space-y-4">
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end justify-between">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-bold text-slate-500">Dari Tanggal</label>
                                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-[150px]" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-bold text-slate-500">Sampai Tanggal</label>
                                            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-[150px]" />
                                        </div>
                                        <Button variant="secondary" onClick={() => { setStartDate(""); setEndDate(""); }} className="h-[42px]">
                                            RESET FILTER
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-500">Page {page} of {totalPages}</span>
                                        <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                                        <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="p-4 bg-slate-100 border-b border-slate-200 font-bold flex justify-between">
                                        <span>Master Data Voucher (Max 10/Page)</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 border-b font-bold text-slate-500 uppercase text-xs">
                                                <tr>
                                                    <th className="p-4">DIBUAT TANGGAL</th>
                                                    <th className="p-4">KODE</th>
                                                    <th className="p-4">NILAI (RP)</th>
                                                    <th className="p-4">STATUS</th>
                                                    <th className="p-4">ACTION</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(adminVouchers || []).length === 0 ? (
                                                    <tr><td colSpan={5} className="p-8 text-center italic text-slate-400">Tidak ada data.</td></tr>
                                                ) : (
                                                    (adminVouchers || []).map((v) => (
                                                        <tr key={v.id} className={`border-b hover:bg-slate-50 ${v.isClaimed ? "bg-slate-50 opacity-60" : ""}`}>
                                                            <td className="p-4 text-xs font-mono text-slate-500">
                                                                {new Date(Number(v.createdAt)).toLocaleString("id-ID", {
                                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                                    hour: '2-digit', minute: '2-digit'
                                                                })}
                                                            </td>
                                                            <td className={`p-4 font-mono font-bold ${v.isClaimed ? "line-through text-slate-400" : "text-sky-700"}`}>
                                                                {v.code}
                                                            </td>
                                                            <td className="p-4">Rp {v.valueRp.toLocaleString()}</td>
                                                            <td className="p-4">
                                                                {v.isClaimed ? (
                                                                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold border border-red-200">
                                                                        SUDAH TERPAKAI
                                                                    </span>
                                                                ) : (
                                                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold border border-green-200">
                                                                        ACTIVE
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="p-4">
                                                                {!v.isClaimed && (
                                                                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(v.code)}>
                                                                        <Copy className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* LEFT: Generator (Compact) */}
                            <div className="space-y-4 lg:col-span-3"> {/* Moved to bottom or top if preferred, kept logic same but just rendering order */}
                                {/* ... (Keep Generator UI, maybe collapsed or same) ... */}
                            </div>

                            {/* RIGHT: Notifications / Alerts for ALL Claims */}
                            <div className="space-y-4">
                                <div className="bg-white border-2 border-slate-200 rounded-xl p-4">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                                        <AlertTriangle className="h-5 w-5 text-amber-500" /> Live Claim Feed
                                    </h3>

                                    {/* Date Filters */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <Input
                                            type="date"
                                            value={claimsStartDate}
                                            onChange={(e) => { setClaimsStartDate(e.target.value); setClaimsPage(1); }}
                                            className="w-[130px] text-xs h-8"
                                            placeholder="Dari"
                                        />
                                        <Input
                                            type="date"
                                            value={claimsEndDate}
                                            onChange={(e) => { setClaimsEndDate(e.target.value); setClaimsPage(1); }}
                                            className="w-[130px] text-xs h-8"
                                            placeholder="Sampai"
                                        />
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 text-xs"
                                            onClick={() => { setClaimsStartDate(""); setClaimsEndDate(""); setClaimsPage(1); }}
                                        >
                                            Reset
                                        </Button>
                                    </div>

                                    {/* Total Cashback Summary */}
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3 flex justify-between items-center">
                                        <span className="text-xs text-green-700">Total Bayar Periode Ini:</span>
                                        <span className="font-bold text-green-800">Rp {totalCashback.toLocaleString()}</span>
                                    </div>

                                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                        {(alerts || []).length === 0 ? (
                                            <div className="bg-slate-50 p-4 rounded border border-slate-100 text-sm text-slate-400 italic text-center">
                                                Belum ada klaim voucher.
                                            </div>
                                        ) : (
                                            (alerts || []).map((alert, idx) => {
                                                // Dynamic Color based on Value
                                                let bgClass = "bg-slate-50 border-slate-200";
                                                let textClass = "text-slate-700";
                                                if (alert.valueRp >= 50000) { bgClass = "bg-rose-50 border-rose-200"; textClass = "text-rose-800"; }
                                                else if (alert.valueRp >= 25000) { bgClass = "bg-purple-50 border-purple-200"; textClass = "text-purple-800"; }
                                                else if (alert.valueRp >= 10000) { bgClass = "bg-amber-50 border-amber-200"; textClass = "text-amber-800"; }
                                                else if (alert.valueRp >= 5000) { bgClass = "bg-blue-50 border-blue-200"; textClass = "text-blue-800"; }

                                                return (
                                                    <div key={idx} className={`${bgClass} p-3 rounded-lg border text-sm shadow-sm flex flex-col transition-all hover:scale-[1.02]`}>
                                                        <div className="flex justify-between items-start">
                                                            <span className={`font-bold ${textClass}`}>
                                                                {alert.userName || "Unknown User"}
                                                            </span>
                                                            <div className="text-right">
                                                                <span className="text-xs font-mono bg-green-100 text-green-700 px-1 rounded font-bold">
                                                                    Bayar: Rp {alert.cashbackAmount?.toLocaleString() || 0}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-slate-500 mt-1">
                                                            Voucher {alert.valueRp?.toLocaleString()} • Kode: <span className="font-mono text-slate-700 font-bold">{alert.code}</span>
                                                            {alert.claimedAt && (
                                                                <span className="ml-2 text-slate-400">
                                                                    • {new Date(alert.claimedAt).toLocaleDateString("id-ID")}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    {/* Pagination */}
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                                        <span className="text-xs text-slate-500">Page {claimsPage} of {claimsTotalPages}</span>
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs px-2"
                                                disabled={claimsPage === 1}
                                                onClick={() => setClaimsPage(p => p - 1)}
                                            >
                                                Prev
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs px-2"
                                                disabled={claimsPage === claimsTotalPages}
                                                onClick={() => setClaimsPage(p => p + 1)}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                    <h3 className="font-bold text-blue-800 mb-2">Statistik Global</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>User Terdaftar</span>
                                            <span className="font-bold">{(users || []).length}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Pro Users</span>
                                            <span className="font-bold text-amber-600">{(users || []).filter(u => u.hasActiveSubscription).length}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>🏆 Course Completed</span>
                                            <span className="font-bold text-green-600">{(users || []).filter(u => u.isCourseCompleted).length}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Total Gems Beredar</span>
                                            <span className="font-bold text-sky-600">{(users || []).reduce((acc, curr) => acc + curr.points, 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* --- TAB: USERS --- */}
            {
                activeTab === "users" && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-100 border-b border-slate-200 font-bold flex justify-between items-center">
                            <span>Daftar Pengguna (Real-time Sync)</span>
                            <div className="relative">
                                <Search className="absolute left-2 top-2 h-4 w-4 text-slate-400" />
                                <Input placeholder="Cari User..." className="pl-8 w-[200px] bg-white h-8" />
                            </div>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="p-4">USER ID</th>
                                    <th className="p-4">STATUS</th>
                                    <th className="p-4">COMPLETION</th>
                                    <th className="p-4">HEARTS</th>
                                    <th className="p-4">POINTS</th>
                                    <th className="p-4">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(users || []).map((u) => (
                                    <tr key={u.userId} className="border-b hover:bg-slate-50">
                                        <td className="p-4 font-mono text-xs text-slate-500">
                                            {u.userId.substring(0, 8)}...
                                            <span className="block text-xs font-bold text-slate-700">{u.userName}</span>
                                        </td>
                                        <td className="p-4">
                                            {u.hasActiveSubscription ? (
                                                <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1">
                                                    <Trophy className="h-3 w-3" /> PRO
                                                </span>
                                            ) : (
                                                <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-full text-xs font-bold">
                                                    FREE
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {u.isCourseCompleted ? (
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1 animate-pulse">
                                                    🏆 SELESAI
                                                </span>
                                            ) : (
                                                <span className="bg-slate-50 text-slate-400 px-2 py-1 rounded-full text-xs">
                                                    Belum
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1 text-rose-500 font-bold">
                                                {u.hearts} ❤️
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1 text-sky-500 font-bold">
                                                {u.points} 💎
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {!u.hasActiveSubscription && (
                                                <Button size="sm" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50" onClick={() => handleGrantPro(u.userId)}>
                                                    GRANT PRO
                                                </Button>
                                            )}
                                            {u.hasActiveSubscription && (
                                                <span className="text-xs text-green-600 font-bold">Terverifikasi</span>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-500 hover:bg-red-50 hover:text-red-700 ml-2"
                                                onClick={() => handleDeleteUser(u.userId)}
                                                title="Delete User"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            }

            {/* --- TAB: REDEEM REQUESTS --- */}
            {
                activeTab === "redeem" && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200 font-bold flex justify-between items-center">
                            <span className="flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-green-600" />
                                Permintaan Penarikan Dana
                            </span>
                            <Button size="sm" variant="outline" onClick={fetchRedeemRequests}>
                                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                            </Button>
                        </div>

                        {redeemRequests.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                Tidak ada permintaan penarikan.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="p-4">TANGGAL</th>
                                            <th className="p-4">USER</th>
                                            <th className="p-4">METODE</th>
                                            <th className="p-4">NOMOR TUJUAN</th>
                                            <th className="p-4">GEMS</th>
                                            <th className="p-4">RUPIAH</th>
                                            <th className="p-4">STATUS</th>
                                            <th className="p-4">ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {redeemRequests.map((r) => (
                                            <tr key={r.id} className={`border-b hover:bg-slate-50 ${r.status === "completed" ? "bg-green-50/50" : r.status === "rejected" ? "bg-red-50/50" : ""}`}>
                                                <td className="p-4 text-xs text-slate-500">
                                                    {new Date(Number(r.createdAt)).toLocaleString("id-ID", {
                                                        day: "numeric", month: "short", year: "numeric",
                                                        hour: "2-digit", minute: "2-digit"
                                                    })}
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-bold text-slate-700">{r.userName}</span>
                                                    <span className="block text-xs text-slate-400 font-mono">{r.userId.substring(0, 8)}...</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="uppercase font-bold text-slate-600">{r.paymentMethod}</span>
                                                </td>
                                                <td className="p-4 font-mono text-slate-700">
                                                    {r.accountNumber}
                                                    {r.accountName && <span className="block text-xs text-slate-400">{r.accountName}</span>}
                                                </td>
                                                <td className="p-4 font-bold text-orange-500">{r.gemsAmount} 💎</td>
                                                <td className="p-4 font-bold text-green-600">Rp {r.rupiahAmount.toLocaleString()}</td>
                                                <td className="p-4">
                                                    {r.status === "pending" && (
                                                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold border border-yellow-200">
                                                            PENDING
                                                        </span>
                                                    )}
                                                    {r.status === "approved" && (
                                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold border border-blue-200">
                                                            APPROVED
                                                        </span>
                                                    )}
                                                    {r.status === "completed" && (
                                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold border border-green-200">
                                                            ✓ DONE
                                                        </span>
                                                    )}
                                                    {r.status === "rejected" && (
                                                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold border border-red-200">
                                                            ✗ REJECTED
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-1">
                                                        {r.status === "pending" && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="border-green-500 text-green-600 hover:bg-green-50"
                                                                    onClick={() => handleUpdateRedeemStatus(r.id, "approved")}
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="border-red-500 text-red-600 hover:bg-red-50"
                                                                    onClick={() => handleUpdateRedeemStatus(r.id, "rejected", "Ditolak oleh admin")}
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                        {r.status === "approved" && (
                                                            <Button
                                                                size="sm"
                                                                className="bg-green-500 hover:bg-green-600 text-white"
                                                                onClick={() => handleUpdateRedeemStatus(r.id, "completed", "Transfer selesai")}
                                                            >
                                                                Tandai Selesai
                                                            </Button>
                                                        )}
                                                        {(r.status === "completed" || r.status === "rejected") && (
                                                            <span className="text-xs text-slate-400 italic">
                                                                {r.processedAt ? new Date(r.processedAt).toLocaleDateString("id-ID") : "-"}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )
            }

            {/* --- TAB: TREASURE SETTINGS --- */}
            {
                activeTab === "treasure" && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-slate-200 font-bold flex items-center gap-2">
                            <Settings className="h-5 w-5 text-orange-600" />
                            Pengaturan Harta Karun / Paid4link
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex flex-col gap-2">
                                <label className="font-bold text-slate-700">Paid4link URL</label>
                                <Input
                                    placeholder="https://paid4link.com/your-link (kosongkan jika tidak pakai)"
                                    value={treasureSettings.paid4linkUrl}
                                    onChange={(e) => setTreasureSettings(s => ({ ...s, paid4linkUrl: e.target.value }))}
                                />
                                <p className="text-xs text-slate-500">
                                    Jika diisi, user akan redirect ke sini saat klik widget. Setelah selesai iklan, user akan kembali ke /treasure.
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={treasureSettings.isEnabled}
                                        onChange={(e) => setTreasureSettings(s => ({ ...s, isEnabled: e.target.checked }))}
                                        className="w-4 h-4"
                                    />
                                    <span className="font-bold text-slate-700">Fitur Aktif</span>
                                </label>
                                <p className="text-xs text-slate-500">Matikan untuk menyembunyikan widget dari semua user</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={treasureSettings.requirePaid4link}
                                        onChange={(e) => setTreasureSettings(s => ({ ...s, requirePaid4link: e.target.checked }))}
                                        className="w-4 h-4"
                                    />
                                    <span className="font-bold text-slate-700">Wajib Lewat Paid4link</span>
                                </label>
                                <p className="text-xs text-slate-500">Jika aktif, user harus klik widget (tidak bisa akses /treasure langsung)</p>
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <Button onClick={handleSaveTreasureSettings} disabled={savingTreasure} className="bg-orange-500 hover:bg-orange-600">
                                    {savingTreasure ? <RefreshCw className="animate-spin mr-2 h-4 w-4" /> : null}
                                    Simpan Pengaturan
                                </Button>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
                                <h4 className="font-bold text-slate-700 mb-2">📌 Cara Test:</h4>
                                <ol className="text-sm text-slate-600 list-decimal list-inside space-y-1">
                                    <li>Kosongkan "Paid4link URL" untuk test tanpa redirect</li>
                                    <li>Matikan "Wajib Lewat Paid4link" untuk test akses langsung</li>
                                    <li>Buka /learn dan klik widget "Harta Karun Gem"</li>
                                    <li>Spin dan lihat hasilnya!</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* --- TAB: FEEDBACK --- */}
            {
                activeTab === "feedback" && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-100 border-b border-slate-200 font-bold flex flex-wrap gap-4 justify-between items-center">
                            <span className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-slate-600" />
                                Kotak Masukan User
                            </span>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded border border-slate-300">
                                    <span className="text-xs text-slate-500 font-medium">Filter Tanggal:</span>
                                    <input
                                        type="date"
                                        className="text-xs border-none outline-none text-slate-700 font-mono bg-transparent"
                                        value={feedbackStartDate}
                                        onChange={(e) => setFeedbackStartDate(e.target.value)}
                                    />
                                    <span className="text-slate-400">-</span>
                                    <input
                                        type="date"
                                        className="text-xs border-none outline-none text-slate-700 font-mono bg-transparent"
                                        value={feedbackEndDate}
                                        onChange={(e) => setFeedbackEndDate(e.target.value)}
                                    />
                                </div>
                                <Button size="sm" variant="outline" onClick={fetchFeedbacks}>
                                    <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                                </Button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="p-4">TANGGAL</th>
                                        <th className="p-4">USER</th>
                                        <th className="p-4">TIPE</th>
                                        <th className="p-4">PESAN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(feedbacks || []).length === 0 ? (
                                        <tr><td colSpan={4} className="p-8 text-center italic text-slate-400">Belum ada masukan.</td></tr>
                                    ) : (
                                        feedbacks.map((f) => (
                                            <tr key={f.id} className="border-b hover:bg-slate-50 align-top">
                                                <td className="p-4 text-xs text-slate-500 whitespace-nowrap">
                                                    {new Date(Number(f.created_at)).toLocaleString("id-ID")}
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-bold text-slate-700">{f.user_name}</div>
                                                    <div className="text-xs text-slate-400 font-mono">{f.user_id.substring(0, 8)}...</div>
                                                </td>
                                                <td className="p-4">
                                                    {f.type === 'saran' && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">SARAN</span>}
                                                    {f.type === 'kritik' && <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs font-bold">KRITIK</span>}
                                                    {f.type === 'other' && <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">LAINNYA</span>}
                                                </td>
                                                <td className="p-4 text-slate-700 max-w-lg">
                                                    {f.message}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        {feedbackTotalPages > 1 && (
                            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-center items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={feedbackPage === 1}
                                    onClick={() => setFeedbackPage(p => Math.max(1, p - 1))}
                                >
                                    Prev
                                </Button>
                                <div className="flex gap-1 overflow-x-auto max-w-[300px] no-scrollbar">
                                    {Array.from({ length: feedbackTotalPages }, (_, i) => i + 1).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setFeedbackPage(p)}
                                            className={`min-w-[28px] h-7 px-1 flex items-center justify-center rounded text-xs font-bold transition-colors ${feedbackPage === p
                                                ? "bg-primary text-white shadow-sm"
                                                : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-100"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={feedbackPage === feedbackTotalPages}
                                    onClick={() => setFeedbackPage(p => Math.min(feedbackTotalPages, p + 1))}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                )
            }

            {/* --- TAB: ADS MANAGER --- */}
            {
                activeTab === "ads" && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 bg-emerald-50 border-b border-emerald-200 flex justify-between items-center">
                                <h3 className="font-bold text-lg flex items-center text-emerald-800">
                                    <Megaphone className="mr-2 h-5 w-5" />
                                    Sporadic Ads Manager
                                </h3>
                                <Button onClick={openNewAdDialog} className="bg-emerald-600 hover:bg-emerald-700">
                                    <Plus className="h-4 w-4 mr-1" /> Buat Iklan Baru
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="p-4">TITLE</th>
                                            <th className="p-4">TYPE</th>
                                            <th className="p-4">PLACEMENT</th>
                                            <th className="p-4">CHANCE (WEIGHT)</th>
                                            <th className="p-4">STATUS</th>
                                            <th className="p-4">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {adsList.length === 0 ? (
                                            <tr><td colSpan={6} className="p-8 text-center text-slate-400">Belum ada iklan.</td></tr>
                                        ) : (
                                            adsList.map((ad) => (
                                                <tr key={ad.id} className="border-b hover:bg-slate-50">
                                                    <td className="p-4 font-bold text-slate-700">{ad.title}</td>
                                                    <td className="p-4 uppercase text-xs font-mono">{ad.type}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${ad.placement === 'interstitial' ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'}`}>
                                                            {ad.placement.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 font-mono">{ad.weight}</td>
                                                    <td className="p-4">
                                                        {ad.is_active ?
                                                            <span className="text-green-600 font-bold text-xs">ACTIVE</span> :
                                                            <span className="text-slate-400 font-bold text-xs">INACTIVE</span>
                                                        }
                                                    </td>
                                                    <td className="p-4 flex gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => { setEditingAd(ad); setIsAdDialogOpen(true); }}>
                                                            Edit
                                                        </Button>
                                                        <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteAd(ad.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* EDIT DIALOG */}
                        <Dialog open={isAdDialogOpen} onOpenChange={setIsAdDialogOpen}>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{editingAd?.id ? "Edit Ad" : "Create New Ad"}</DialogTitle>
                                </DialogHeader>
                                {editingAd && (
                                    <form onSubmit={handleSaveAd} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold">Judul Iklan</label>
                                                <Input
                                                    value={editingAd.title}
                                                    onChange={(e) => setEditingAd({ ...editingAd, title: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold">Placement</label>
                                                <select
                                                    className="w-full p-2 border rounded-md"
                                                    value={editingAd.placement}
                                                    onChange={(e) => setEditingAd({ ...editingAd, placement: e.target.value })}
                                                >
                                                    <option value="banner">Banner (Sticky)</option>
                                                    <option value="interstitial">Interstitial (Popup)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold">Type</label>
                                                <select
                                                    className="w-full p-2 border rounded-md"
                                                    value={editingAd.type}
                                                    onChange={(e) => setEditingAd({ ...editingAd, type: e.target.value })}
                                                >
                                                    <option value="image">Image Link</option>
                                                    <option value="script">Custom Script</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold">Weight (Chance)</label>
                                                <Input
                                                    type="number"
                                                    value={editingAd.weight}
                                                    onChange={(e) => setEditingAd({ ...editingAd, weight: Number(e.target.value) })}
                                                />
                                                <p className="text-[10px] text-slate-500">Higher = More often</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold">Status</label>
                                                <div className="flex items-center h-10">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!editingAd.is_active}
                                                            onChange={(e) => setEditingAd({ ...editingAd, is_active: e.target.checked })}
                                                            className="w-4 h-4 accent-emerald-600"
                                                        />
                                                        <span className="text-sm">Active</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {editingAd.type === 'image' ? (
                                            <div className="space-y-4 border-t pt-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold">Image URL</label>
                                                    <Input
                                                        value={editingAd.image_url}
                                                        onChange={(e) => setEditingAd({ ...editingAd, image_url: e.target.value })}
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold">Target URL (Click Destination)</label>
                                                    <Input
                                                        value={editingAd.target_url}
                                                        onChange={(e) => setEditingAd({ ...editingAd, target_url: e.target.value })}
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 border-t pt-4">
                                                <label className="text-sm font-bold">Script Code</label>
                                                <textarea
                                                    className="w-full h-32 p-2 border rounded-md font-mono text-xs bg-slate-900 text-green-400"
                                                    value={editingAd.script_code}
                                                    onChange={(e) => setEditingAd({ ...editingAd, script_code: e.target.value })}
                                                />
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-2 pt-4">
                                            <Button type="button" variant="ghost" onClick={() => setIsAdDialogOpen(false)}>Cancel</Button>
                                            <Button type="submit" disabled={savingAds} className="bg-emerald-600 hover:bg-emerald-700">
                                                {savingAds ? "Saving..." : "Save Ad"}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>
                )
            }

            {/* --- TAB: SECURITY --- */}
            {
                activeTab === "security" && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-rose-50 border-b border-rose-100 font-bold flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center text-rose-800">
                                <ShieldCheck className="mr-2 h-5 w-5 text-rose-600" />
                                Security Audit Logs
                            </h3>
                            <Button size="sm" variant="outline" onClick={fetchSecurityLogs} className="border-rose-200 text-rose-700 hover:bg-rose-100">
                                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="p-4">WAKTU</th>
                                        <th className="p-4">SEVERITY</th>
                                        <th className="p-4">EVENT</th>
                                        <th className="p-4">USER</th>
                                        <th className="p-4">DESKRIPSI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(securityLogs || []).length === 0 ? (
                                        <tr><td colSpan={5} className="p-8 text-center italic text-slate-400">Tidak ada log keamanan. Sistem aman.</td></tr>
                                    ) : (
                                        securityLogs.map((log: any) => (
                                            <tr key={log.id} className="border-b hover:bg-slate-50">
                                                <td className="p-4 text-xs text-slate-500 font-mono whitespace-nowrap">
                                                    {new Date(Number(log.created_at)).toLocaleString("id-ID")}
                                                </td>
                                                <td className="p-4">
                                                    {log.severity === 'CRITICAL' && <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">CRITICAL</span>}
                                                    {log.severity === 'HIGH' && <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">HIGH</span>}
                                                    {log.severity === 'MEDIUM' && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold border border-yellow-300">MEDIUM</span>}
                                                    {log.severity === 'LOW' && <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">LOW</span>}
                                                </td>
                                                <td className="p-4 font-bold text-slate-700">{log.event_type}</td>
                                                <td className="p-4">
                                                    <div className="font-bold text-slate-700">{log.user_name}</div>
                                                    <div className="text-xs text-slate-400 font-mono">{log.user_id.substring(0, 8)}...</div>
                                                </td>
                                                <td className="p-4 text-slate-600 max-w-md">{log.description}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {securityTotalPages > 1 && (
                            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-center items-center gap-2">
                                <Button size="sm" variant="outline" disabled={securityPage === 1} onClick={() => setSecurityPage(p => p - 1)}>Prev</Button>
                                <span className="text-xs font-bold text-slate-500">Page {securityPage} of {securityTotalPages}</span>
                                <Button size="sm" variant="outline" disabled={securityPage === securityTotalPages} onClick={() => setSecurityPage(p => p + 1)}>Next</Button>
                            </div>
                        )}
                    </div>
                )
            }
        </div>
    );
}

function Trophy({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
    )
}
