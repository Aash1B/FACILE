"use client";

import React, { useState } from "react";
import { 
  TrendingUp, DollarSign, Percent, Award, Users, UserCheck, UserPlus, 
  ShoppingBag, ShieldAlert, Activity, FileText, Check, X, Ban, AlertTriangle, 
  Trash2, Search, Sliders, ChevronDown, CheckCircle, HelpCircle, Server,
  Plus, Package
} from "lucide-react";

interface Seller {
  id: string;
  name: string;
  email: string;
  rating: number;
  performanceScore: number;
  commissionRate: number;
  warnings: number;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "BANNED" | "BLACKLISTED";
  documents: { type: string; name: string; url: string }[];
  phone: string;
  address: string;
  businessType: string;
  joinDate: string;
  totalSales: number;
  listedCount: number;
}

const INITIAL_SELLERS: Seller[] = [
  {
    id: "s1",
    name: "Studio Earth Ceramics",
    email: "contact@studioearth.com",
    rating: 4.8,
    performanceScore: 96,
    commissionRate: 10,
    warnings: 0,
    status: "ACTIVE",
    documents: [
      { type: "ID Proof", name: "owner_passport.pdf", url: "#" },
      { type: "Business License", name: "business_registration.pdf", url: "#" }
    ],
    phone: "+91 98765 01234",
    address: "Plot 42, Ceramic Crafts Zone, GIDC, Khurja, Uttar Pradesh - 203131",
    businessType: "Partnership Firm",
    joinDate: "2025-05-12",
    totalSales: 485000,
    listedCount: 14
  },
  {
    id: "s2",
    name: "Linen & Slow Co.",
    email: "hello@slowlinen.co",
    rating: 4.5,
    performanceScore: 89,
    commissionRate: 12,
    warnings: 1,
    status: "ACTIVE",
    documents: [
      { type: "ID Proof", name: "national_id.pdf", url: "#" },
      { type: "Tax Document", name: "vat_certificate.pdf", url: "#" }
    ],
    phone: "+91 88765 02468",
    address: "Block B, Floor 2, Linen Craft Mills, Ludhiana, Punjab - 141001",
    businessType: "Private Limited",
    joinDate: "2025-08-20",
    totalSales: 320000,
    listedCount: 8
  },
  {
    id: "s3",
    name: "Minimalist Maker",
    email: "info@minimalistmaker.com",
    rating: 0.0,
    performanceScore: 100,
    commissionRate: 15,
    warnings: 0,
    status: "PENDING",
    documents: [
      { type: "ID Proof", name: "driver_license.pdf", url: "#" },
      { type: "Business License", name: "llc_agreement.pdf", url: "#" }
    ],
    phone: "+91 91234 56789",
    address: "Studio 3C, Artistan Colony, Bandra West, Mumbai, Maharashtra - 400050",
    businessType: "Sole Proprietor",
    joinDate: "2026-07-10",
    totalSales: 0,
    listedCount: 0
  },
  {
    id: "s4",
    name: "Clay & Fire Studio",
    email: "support@clayfire.com",
    rating: 3.2,
    performanceScore: 68,
    commissionRate: 10,
    warnings: 3,
    status: "SUSPENDED",
    documents: [
      { type: "ID Proof", name: "owner_passport.pdf", url: "#" },
      { type: "Business License", name: "tax_registration.pdf", url: "#" }
    ],
    phone: "+91 76543 21098",
    address: "18, Terracotta Gali, Kumartuli, Kolkata, West Bengal - 700005",
    businessType: "Sole Proprietor",
    joinDate: "2025-03-01",
    totalSales: 125000,
    listedCount: 5
  },
  {
    id: "s5",
    name: "Vogue Fabrications",
    email: "voguefabrications@scam.com",
    rating: 1.5,
    performanceScore: 42,
    commissionRate: 20,
    warnings: 5,
    status: "BLACKLISTED",
    documents: [
      { type: "ID Proof", name: "fake_id.pdf", url: "#" }
    ],
    phone: "+91 99999 88888",
    address: "Unknown Commercial Area, Sector 5, Salt Lake, Kolkata",
    businessType: "Unregistered Entity",
    joinDate: "2025-11-15",
    totalSales: 18000,
    listedCount: 1
  }
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"executive" | "sellers" | "vouchers">("executive");
  const [sellers, setSellers] = useState<Seller[]>(INITIAL_SELLERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Voucher states
  interface Voucher {
    code: string;
    type: "PERCENT" | "FIXED";
    value: number;
    minOrder: number;
    expiry: string;
  }
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [vCode, setVCode] = useState("");
  const [vType, setVType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [vValue, setVValue] = useState("");
  const [vMinOrder, setVMinOrder] = useState("");
  const [vExpiry, setVExpiry] = useState("2026-12-31");
  const [vError, setVError] = useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("facile_vouchers");
      if (stored) {
        setVouchers(JSON.parse(stored));
      } else {
        const defaults: Voucher[] = [
          { code: "WELCOME10", type: "PERCENT", value: 10, minOrder: 30, expiry: "2026-12-31" },
          { code: "FLAT15", type: "FIXED", value: 15, minOrder: 100, expiry: "2026-12-31" }
        ];
        localStorage.setItem("facile_vouchers", JSON.stringify(defaults));
        setVouchers(defaults);
      }
    }
  }, []);

  const handleAddVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setVError("");

    if (!vCode || !vValue || !vMinOrder || !vExpiry) {
      setVError("All fields are required.");
      return;
    }

    const cleanedCode = vCode.toUpperCase().replace(/\s+/g, "");
    if (vouchers.some(v => v.code === cleanedCode)) {
      setVError("A voucher with this code already exists.");
      return;
    }

    const valNum = parseFloat(vValue);
    const minNum = parseFloat(vMinOrder);

    if (isNaN(valNum) || valNum <= 0) {
      setVError("Please enter a valid discount value.");
      return;
    }
    if (vType === "PERCENT" && valNum > 100) {
      setVError("Percentage discount cannot exceed 100%.");
      return;
    }
    if (isNaN(minNum) || minNum < 0) {
      setVError("Minimum order value cannot be negative.");
      return;
    }

    const newVoucher: Voucher = {
      code: cleanedCode,
      type: vType,
      value: valNum,
      minOrder: minNum,
      expiry: vExpiry
    };

    const updated = [newVoucher, ...vouchers];
    setVouchers(updated);
    localStorage.setItem("facile_vouchers", JSON.stringify(updated));

    setVCode("");
    setVValue("");
    setVMinOrder("");
    setVExpiry("2026-12-31");
  };

  const handleDeleteVoucher = (code: string) => {
    const updated = vouchers.filter(v => v.code !== code);
    setVouchers(updated);
    localStorage.setItem("facile_vouchers", JSON.stringify(updated));
  };

  // Document modal states
  const [selectedSellerDocs, setSelectedSellerDocs] = useState<Seller | null>(null);
  const [selectedSellerProfile, setSelectedSellerProfile] = useState<Seller | null>(null);

  // Commission editing states
  const [editingCommissionId, setEditingCommissionId] = useState<string | null>(null);
  const [newCommissionRate, setNewCommissionRate] = useState<string>("");

  // Executive Dashboard Stats State (for mock interactions)
  const [stats, setStats] = useState({
    gmv: 342850.00,
    netRevenue: 48420.00,
    commissionEarned: 34285.00,
    platformProfit: 28150.00,
    totalSellers: 84,
    activeSellers: 72,
    newSellersToday: 3,
    customers: 1240,
    ordersToday: 45,
    pendingVerifications: 6,
    fraudAlerts: 1,
    activeSessions: 184
  });

  // Action Handlers
  const handleApprove = (id: string) => {
    setSellers(sellers.map(s => {
      if (s.id === id) {
        return { ...s, status: "ACTIVE" };
      }
      return s;
    }));
    setStats(prev => ({
      ...prev,
      activeSellers: prev.activeSellers + 1,
      pendingVerifications: Math.max(0, prev.pendingVerifications - 1)
    }));
  };

  const handleReject = (id: string) => {
    setSellers(sellers.filter(s => s.id !== id));
    setStats(prev => ({
      ...prev,
      pendingVerifications: Math.max(0, prev.pendingVerifications - 1)
    }));
  };

  const handleSuspend = (id: string) => {
    setSellers(sellers.map(s => {
      if (s.id === id) {
        return { ...s, status: "SUSPENDED" };
      }
      return s;
    }));
  };

  const handleBan = (id: string) => {
    setSellers(sellers.map(s => {
      if (s.id === id) {
        return { ...s, status: "BANNED" };
      }
      return s;
    }));
  };

  const handleBlacklist = (id: string) => {
    setSellers(sellers.map(s => {
      if (s.id === id) {
        return { ...s, status: "BLACKLISTED", warnings: s.warnings + 1 };
      }
      return s;
    }));
    setStats(prev => ({
      ...prev,
      fraudAlerts: prev.fraudAlerts + 1
    }));
  };

  const handleSaveCommission = (id: string) => {
    const rate = parseInt(newCommissionRate);
    if (!isNaN(rate) && rate >= 0 && rate <= 100) {
      setSellers(sellers.map(s => {
        if (s.id === id) {
          return { ...s, commissionRate: rate };
        }
        return s;
      }));
      setEditingCommissionId(null);
    }
  };

  // Filter sellers
  const filteredSellers = sellers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 w-full space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-6" style={{ borderColor: 'rgba(165,142,116,0.15)' }}>
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-fern">
            Enterprise Admin Console
          </h1>
          <p className="text-xs text-natural font-medium">
            Manage global parameters, monitor platform growth, and regulate merchant accounts.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[#F4E6C7]/60 border p-1 rounded-2xl gap-1 mt-4 md:mt-0" style={{ borderColor: 'rgba(165,142,116,0.2)' }}>
          <button
            onClick={() => setActiveTab("executive")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            style={{
              backgroundColor: activeTab === "executive" ? '#424530' : 'transparent',
              color: activeTab === "executive" ? '#F4E6C7' : '#424530'
            }}
          >
            <TrendingUp size={14} />
            <span>Executive Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("sellers")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            style={{
              backgroundColor: activeTab === "sellers" ? '#424530' : 'transparent',
              color: activeTab === "sellers" ? '#F4E6C7' : '#424530'
            }}
          >
            <Users size={14} />
            <span>Seller Operations</span>
          </button>
          <button
            onClick={() => setActiveTab("vouchers")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            style={{
              backgroundColor: activeTab === "vouchers" ? '#424530' : 'transparent',
              color: activeTab === "vouchers" ? '#F4E6C7' : '#424530'
            }}
          >
            <Percent size={14} />
            <span>Vouchers & Promos</span>
          </button>
        </div>
      </div>

      {/* ── Tab 1: Executive Dashboard ────────────────────────────────── */}
      {activeTab === "executive" && (
        <div className="space-y-8 animate-fade-in">
          {/* Platform Performance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Platform GMV */}
            <div className="bg-white border rounded-3xl p-6 shadow-sm flex items-start justify-between" style={{ borderColor: 'rgba(165,142,116,0.2)' }}>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-natural tracking-wider uppercase">Total Platform GMV</p>
                <h3 className="text-2xl font-bold text-fern">₹{stats.gmv.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                <span className="text-[10px] font-bold text-green-700 bg-green-500/10 px-2 py-0.5 rounded">+14.2% MoM</span>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-fern bg-[#F4E6C7]">
                <TrendingUp size={18} />
              </div>
            </div>

            {/* Card 2: Net Revenue */}
            <div className="bg-white border rounded-3xl p-6 shadow-sm flex items-start justify-between" style={{ borderColor: 'rgba(165,142,116,0.2)' }}>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-natural tracking-wider uppercase">Net Revenue</p>
                <h3 className="text-2xl font-bold text-fern">₹{stats.netRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                <span className="text-[10px] font-bold text-green-700 bg-green-500/10 px-2 py-0.5 rounded">Payouts Deducted</span>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-fern bg-[#F4E6C7]">
                <DollarSign size={18} />
              </div>
            </div>

            {/* Card 3: Commission Earned */}
            <div className="bg-white border rounded-3xl p-6 shadow-sm flex items-start justify-between" style={{ borderColor: 'rgba(165,142,116,0.2)' }}>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-natural tracking-wider uppercase">Commission Earned</p>
                <h3 className="text-2xl font-bold text-fern">₹{stats.commissionEarned.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                <span className="text-[10px] font-bold text-apricot bg-apricot/10 px-2 py-0.5 rounded">Avg Rate 12.5%</span>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#E09132] bg-[#F4E6C7]">
                <Percent size={16} />
              </div>
            </div>

            {/* Card 4: Platform Profit */}
            <div className="bg-white border rounded-3xl p-6 shadow-sm flex items-start justify-between" style={{ borderColor: 'rgba(165,142,116,0.2)' }}>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-natural tracking-wider uppercase">Platform Profit</p>
                <h3 className="text-2xl font-bold text-fern">₹{stats.platformProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                <span className="text-[10px] font-bold text-green-700 bg-green-500/10 px-2 py-0.5 rounded">Net Earnings</span>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-fern bg-[#F4E6C7]">
                <Award size={18} />
              </div>
            </div>
          </div>

          {/* Operational Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1: Seller Metrics */}
            <div className="border rounded-3xl p-6 shadow-sm" style={{ backgroundColor: '#F4E6C7', borderColor: 'rgba(165,142,116,0.25)' }}>
              <h3 className="font-serif text-lg font-bold text-fern mb-4 flex items-center gap-2">
                <Users size={16} />
                Seller Statistics
              </h3>
              <div className="divide-y divide-stone-500/10 space-y-3.5">
                <div className="flex items-center justify-between text-xs font-semibold pt-3.5">
                  <span className="text-natural uppercase tracking-wider">Total Platform Sellers</span>
                  <span className="text-fern font-bold text-sm">{stats.totalSellers}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold pt-3.5">
                  <span className="text-natural uppercase tracking-wider font-semibold">Active Sellers</span>
                  <span className="text-fern font-bold text-sm">{stats.activeSellers}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold pt-3.5">
                  <span className="text-natural uppercase tracking-wider">New Merchants Today</span>
                  <span className="text-apricot font-bold text-sm">{stats.newSellersToday}</span>
                </div>
              </div>
            </div>

            {/* Box 2: Customer & Order Metrics */}
            <div className="border rounded-3xl p-6 shadow-sm" style={{ backgroundColor: '#F4E6C7', borderColor: 'rgba(165,142,116,0.25)' }}>
              <h3 className="font-serif text-lg font-bold text-fern mb-4 flex items-center gap-2">
                <ShoppingBag size={16} />
                Customers & Orders
              </h3>
              <div className="divide-y divide-stone-500/10 space-y-3.5">
                <div className="flex items-center justify-between text-xs font-semibold pt-3.5">
                  <span className="text-natural uppercase tracking-wider">Customers Registered</span>
                  <span className="text-fern font-bold text-sm">{stats.customers}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold pt-3.5">
                  <span className="text-natural uppercase tracking-wider">Orders Dispatched Today</span>
                  <span className="text-fern font-bold text-sm">{stats.ordersToday}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold pt-3.5">
                  <span className="text-natural uppercase tracking-wider">Active Guest Sessions</span>
                  <span className="text-fern font-bold text-sm">{stats.activeSessions}</span>
                </div>
              </div>
            </div>

            {/* Box 3: Verification & Alerts */}
            <div className="border rounded-3xl p-6 shadow-sm" style={{ backgroundColor: '#F4E6C7', borderColor: 'rgba(165,142,116,0.25)' }}>
              <h3 className="font-serif text-lg font-bold text-fern mb-4 flex items-center gap-2">
                <ShieldAlert size={16} />
                Risk & Alerts
              </h3>
              <div className="divide-y divide-stone-500/10 space-y-3.5">
                <div className="flex items-center justify-between text-xs font-semibold pt-3.5">
                  <span className="text-natural uppercase tracking-wider">Pending Verifications</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-xs ${stats.pendingVerifications > 0 ? 'bg-apricot/10 text-apricot' : 'bg-green-500/10 text-green-700'}`}>
                    {stats.pendingVerifications} Requests
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold pt-3.5">
                  <span className="text-natural uppercase tracking-wider">Active Fraud Alerts</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-xs ${stats.fraudAlerts > 0 ? 'bg-red-500/10 text-red-700 animate-pulse' : 'bg-green-500/10 text-green-700'}`}>
                    {stats.fraudAlerts} Warning
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold pt-3.5">
                  <span className="text-natural uppercase tracking-wider">Audit Security Log</span>
                  <span className="text-fern font-bold text-xs">Clear (0 Events)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure Health Status */}
          <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6" style={{ borderColor: 'rgba(165,142,116,0.2)' }}>
            <h3 className="font-serif text-lg font-bold text-fern flex items-center gap-2.5">
              <Server size={18} className="text-[#E09132]" />
              Infrastructure Monitoring & Traffic
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500/10 text-green-700">
                  <Activity size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-natural uppercase">Platform Traffic</p>
                  <span className="text-xs font-bold text-fern">142 Active Connections</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500/10 text-green-700">
                  <CheckCircle size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-natural uppercase">Server Status</p>
                  <span className="text-xs font-bold text-green-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-700 animate-ping" />
                    All Systems Operational
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F4E6C7] text-fern">
                  <HelpCircle size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-natural uppercase">API Endpoint Uptime</p>
                  <span className="text-xs font-bold text-fern">99.98% (Last 30 Days)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Seller Operations ──────────────────────────────────── */}
      {activeTab === "sellers" && (
        <div id="sellers" className="space-y-6 animate-fade-in">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white border p-4 rounded-2xl" style={{ borderColor: 'rgba(165,142,116,0.15)' }}>
            {/* Search */}
            <div className="relative w-full md:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-natural">
                <Search size={14} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search merchant name/email..."
                className="w-full h-10 pl-10 pr-3.5 text-xs font-medium rounded-xl border bg-transparent outline-none focus:border-fern"
                style={{ borderColor: 'rgba(66,69,48,0.2)' }}
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1 bg-[#F4E6C7]/30 border p-1 rounded-xl w-full md:w-auto overflow-x-auto" style={{ borderColor: 'rgba(165,142,116,0.2)' }}>
              {["ALL", "PENDING", "ACTIVE", "SUSPENDED", "BLACKLISTED"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap"
                  style={{
                    backgroundColor: statusFilter === s ? '#424530' : 'transparent',
                    color: statusFilter === s ? '#F4E6C7' : '#424530'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Seller Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSellers.map((seller) => (
              <div
                key={seller.id}
                className="bg-white border rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden"
                style={{ borderColor: 'rgba(165,142,116,0.2)' }}
              >
                {/* Status colored accent ribbon */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{
                    backgroundColor: 
                      seller.status === "ACTIVE" ? '#34A853' :
                      seller.status === "PENDING" ? '#E09132' :
                      seller.status === "SUSPENDED" ? '#FBBC05' : '#EA4335'
                  }}
                />

                <div className="space-y-4">
                  {/* Seller Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-fern">{seller.name}</h3>
                      <p className="text-[10px] text-natural font-semibold truncate max-w-[200px]">{seller.email}</p>
                    </div>

                    {/* Status Badge */}
                    <span 
                      className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded shadow-sm"
                      style={{
                        backgroundColor: 
                          seller.status === "ACTIVE" ? 'rgba(52,168,83,0.15)' :
                          seller.status === "PENDING" ? 'rgba(224,145,50,0.15)' :
                          seller.status === "SUSPENDED" ? 'rgba(251,188,5,0.15)' : 'rgba(234,67,53,0.15)',
                        color: 
                          seller.status === "ACTIVE" ? '#34A853' :
                          seller.status === "PENDING" ? '#E09132' :
                          seller.status === "SUSPENDED" ? '#C08D00' : '#EA4335'
                      }}
                    >
                      {seller.status}
                    </span>
                  </div>

                  {/* Operational indicators */}
                  <div className="grid grid-cols-2 gap-4 py-3.5 border-t border-b" style={{ borderColor: 'rgba(165,142,116,0.1)' }}>
                    <div>
                      <p className="text-[9px] font-bold text-natural uppercase tracking-wider">Rating</p>
                      <span className="text-xs font-bold text-fern">{seller.rating > 0 ? `★ ${seller.rating}` : "N/A"}</span>
                    </div>

                    <div>
                      <p className="text-[9px] font-bold text-natural uppercase tracking-wider">Performance</p>
                      <span className="text-xs font-bold text-fern">{seller.performanceScore}%</span>
                    </div>

                    <div>
                      <p className="text-[9px] font-bold text-natural uppercase tracking-wider">Commission Rate</p>
                      {editingCommissionId === seller.id ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <input
                            type="number"
                            value={newCommissionRate}
                            onChange={e => setNewCommissionRate(e.target.value)}
                            className="w-12 h-6 px-1 text-xs border rounded outline-none"
                          />
                          <button
                            onClick={() => handleSaveCommission(seller.id)}
                            className="p-1 rounded bg-green-500/10 text-green-700 hover:bg-green-500/20 cursor-pointer"
                          >
                            <Check size={10} />
                          </button>
                        </div>
                      ) : (
                        <span 
                          onClick={() => {
                            setEditingCommissionId(seller.id);
                            setNewCommissionRate(seller.commissionRate.toString());
                          }}
                          className="text-xs font-bold text-fern hover:text-apricot cursor-pointer underline decoration-dotted"
                          title="Click to Edit Commission Rate"
                        >
                          {seller.commissionRate}%
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="text-[9px] font-bold text-natural uppercase tracking-wider">Warning Log</p>
                      <span className={`text-xs font-bold ${seller.warnings > 0 ? 'text-red-600' : 'text-fern'}`}>
                        {seller.warnings} {seller.warnings === 1 ? 'warning' : 'warnings'}
                      </span>
                    </div>
                  </div>

                  {/* Documents & Profile View triggers */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedSellerDocs(seller)}
                      className="flex-1 h-8.5 rounded-xl border flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-wider cursor-pointer hover:bg-stone-50"
                      style={{ borderColor: 'rgba(165,142,116,0.3)', color: '#424530' }}
                    >
                      <FileText size={11} />
                      Docs
                    </button>
                    <button
                      onClick={() => setSelectedSellerProfile(seller)}
                      className="flex-1 h-8.5 rounded-xl border flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-wider cursor-pointer hover:bg-stone-50"
                      style={{ borderColor: 'rgba(165,142,116,0.3)', color: '#424530' }}
                    >
                      <Users size={11} />
                      Profile
                    </button>
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex flex-wrap gap-1.5 mt-5 pt-4 border-t" style={{ borderColor: 'rgba(165,142,116,0.1)' }}>
                  {seller.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleApprove(seller.id)}
                        className="flex-1 h-9 rounded-xl bg-green-600 text-white flex items-center justify-center gap-1 text-[10px] font-bold uppercase cursor-pointer hover:bg-green-700"
                      >
                        <Check size={11} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(seller.id)}
                        className="flex-1 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center gap-1 text-[10px] font-bold uppercase cursor-pointer hover:bg-red-700"
                      >
                        <X size={11} />
                        Reject
                      </button>
                    </>
                  )}

                  {seller.status !== "PENDING" && (
                    <>
                      {seller.status !== "SUSPENDED" && (
                        <button
                          onClick={() => handleSuspend(seller.id)}
                          className="flex-1 h-9 rounded-xl border hover:bg-yellow-50 text-yellow-700 flex items-center justify-center gap-1 text-[9px] font-bold uppercase cursor-pointer"
                          style={{ borderColor: 'rgba(251,188,5,0.4)' }}
                        >
                          <AlertTriangle size={11} />
                          Suspend
                        </button>
                      )}

                      {seller.status !== "BANNED" && (
                        <button
                          onClick={() => handleBan(seller.id)}
                          className="flex-1 h-9 rounded-xl border hover:bg-red-50 text-red-700 flex items-center justify-center gap-1 text-[9px] font-bold uppercase cursor-pointer"
                          style={{ borderColor: 'rgba(234,67,53,0.3)' }}
                        >
                          <Ban size={11} />
                          Ban
                        </button>
                      )}

                      {seller.status !== "BLACKLISTED" && (
                        <button
                          onClick={() => handleBlacklist(seller.id)}
                          className="flex-1 h-9 rounded-xl bg-stone-800 text-white flex items-center justify-center gap-1 text-[9px] font-bold uppercase cursor-pointer hover:bg-stone-900"
                        >
                          <Trash2 size={11} />
                          Blacklist
                        </button>
                      )}
                      
                      {(seller.status === "SUSPENDED" || seller.status === "BANNED" || seller.status === "BLACKLISTED") && (
                        <button
                          onClick={() => handleApprove(seller.id)}
                          className="w-full h-9 rounded-xl bg-fern text-[#F4E6C7] flex items-center justify-center gap-1 text-[9px] font-bold uppercase cursor-pointer hover:bg-stone-900"
                        >
                          <CheckCircle size={11} />
                          Restore Active Status
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredSellers.length === 0 && (
            <div className="border border-dashed rounded-3xl p-16 text-center" style={{ borderColor: 'rgba(165,142,116,0.3)', backgroundColor: 'rgba(244,230,199,0.2)' }}>
              <Users size={36} className="mx-auto text-natural mb-3 opacity-60" />
              <h3 className="font-serif text-lg font-semibold text-fern mb-1">No merchants found</h3>
              <p className="text-xs text-natural font-medium max-w-sm mx-auto leading-relaxed">
                We couldn't find any sellers matching your current query and status filter constraint.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 3: Vouchers & Promotions ────────────────────────────────── */}
      {activeTab === "vouchers" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
          {/* Left: Create Voucher Form */}
          <div className="lg:col-span-1 border rounded-3xl p-6 shadow-sm" style={{ backgroundColor: '#F4E6C7', borderColor: 'rgba(165,142,116,0.25)' }}>
            <div className="flex items-center gap-2 mb-6 text-fern">
              <Plus size={18} className="stroke-[2.5px]" />
              <h2 className="font-serif text-xl font-bold">Create Promo Voucher</h2>
            </div>

            <form onSubmit={handleAddVoucher} className="space-y-4">
              {vError && (
                <p className="text-xs font-bold text-apricot animate-fade-in">
                  ⚠️ {vError}
                </p>
              )}

              {/* Code */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold tracking-wider uppercase text-fern">
                  Voucher Code
                </label>
                <input
                  type="text"
                  value={vCode}
                  onChange={(e) => setVCode(e.target.value)}
                  placeholder="e.g. SUMMER20"
                  className="w-full h-10 px-3.5 text-xs font-medium rounded-xl border bg-transparent outline-none uppercase"
                  style={{ borderColor: 'rgba(66,69,48,0.2)', color: '#424530' }}
                  required
                />
              </div>

              {/* Discount Type */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold tracking-wider uppercase text-fern">
                  Discount Type
                </label>
                <select
                  value={vType}
                  onChange={(e) => setVType(e.target.value as "PERCENT" | "FIXED")}
                  className="w-full h-10 px-2 text-xs font-semibold rounded-xl border bg-transparent outline-none cursor-pointer"
                  style={{ borderColor: 'rgba(66,69,48,0.2)', color: '#424530' }}
                >
                  <option value="PERCENT" className="bg-[#F4E6C7]">Percentage (%)</option>
                  <option value="FIXED" className="bg-[#F4E6C7]">Fixed Amount (₹)</option>
                </select>
              </div>

              {/* Discount Value */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold tracking-wider uppercase text-fern">
                  Discount Value
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={vValue}
                  onChange={(e) => setVValue(e.target.value)}
                  placeholder={vType === "PERCENT" ? "10" : "15.00"}
                  className="w-full h-10 px-3.5 text-xs font-medium rounded-xl border bg-transparent outline-none"
                  style={{ borderColor: 'rgba(66,69,48,0.2)', color: '#424530' }}
                  required
                />
              </div>

              {/* Minimum Purchase Constraint */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold tracking-wider uppercase text-fern">
                  Minimum Order Value (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={vMinOrder}
                  onChange={(e) => setVMinOrder(e.target.value)}
                  placeholder="30.00"
                  className="w-full h-10 px-3.5 text-xs font-medium rounded-xl border bg-transparent outline-none"
                  style={{ borderColor: 'rgba(66,69,48,0.2)', color: '#424530' }}
                  required
                />
              </div>

              {/* Expiry Date */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold tracking-wider uppercase text-fern">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={vExpiry}
                  onChange={(e) => setVExpiry(e.target.value)}
                  className="w-full h-10 px-3.5 text-xs font-medium rounded-xl border bg-transparent outline-none"
                  style={{ borderColor: 'rgba(66,69,48,0.2)', color: '#424530' }}
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full h-11 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer text-[#F4E6C7] transition-all duration-200 mt-2 shadow-sm"
                style={{ backgroundColor: '#424530' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2c2e20'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#424530'}
              >
                Create Voucher
              </button>
            </form>
          </div>

          {/* Right: Active Vouchers List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-fern">
                <Package size={20} />
                <h2 className="font-serif text-xl font-bold">Active System Vouchers</h2>
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full text-fern" style={{ backgroundColor: 'rgba(165,142,116,0.15)' }}>
                {vouchers.length} Vouchers
              </span>
            </div>

            {vouchers.length === 0 ? (
              <div className="border border-dashed rounded-3xl p-12 text-center" style={{ borderColor: 'rgba(165,142,116,0.3)', backgroundColor: 'rgba(244,230,199,0.2)' }}>
                <Percent size={36} className="mx-auto text-natural mb-3 opacity-60" />
                <h3 className="font-serif text-lg font-semibold text-fern mb-1">No vouchers created</h3>
                <p className="text-xs text-natural font-medium max-w-sm mx-auto leading-relaxed">
                  There are currently no active vouchers or discount codes available on the checkout page. Use the builder form to create one.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vouchers.map((v) => (
                  <div
                    key={v.code}
                    className="border bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                    style={{ borderColor: 'rgba(165,142,116,0.2)' }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-bold bg-[#F4E6C7] text-fern px-2.5 py-1 rounded-lg select-all">
                          {v.code}
                        </span>
                        <span className="text-xs font-bold text-apricot">
                          {v.type === "PERCENT" ? `${v.value}% OFF` : `₹${v.value.toFixed(2)} OFF`}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs font-semibold text-natural">
                        <div className="flex justify-between">
                          <span>Constraint:</span>
                          <span className="text-fern">Min. Order ₹{v.minOrder.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expires:</span>
                          <span className="text-fern">{v.expiry}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteVoucher(v.code)}
                      className="w-full h-8.5 mt-4 rounded-xl border hover:bg-red-50 text-red-600 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      style={{ borderColor: 'rgba(234,67,53,0.2)' }}
                    >
                      <Trash2 size={12} />
                      Delete Voucher
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Document Viewer Modal ──────────────────────────────────────── */}
      {selectedSellerDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FAF6EE] border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6" style={{ borderColor: 'rgba(165,142,116,0.3)' }}>
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'rgba(165,142,116,0.15)' }}>
              <div>
                <span className="text-[10px] font-bold text-apricot tracking-widest uppercase">Verification Documents</span>
                <h3 className="font-serif text-xl font-bold text-fern mt-0.5">{selectedSellerDocs.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedSellerDocs(null)}
                className="p-1.5 rounded-lg hover:bg-stone-200/50 cursor-pointer"
              >
                <X size={18} className="text-fern" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-natural leading-relaxed">
                Review the documents provided by this merchant for platform onboarding compliance.
              </p>
              
              <div className="space-y-2">
                {selectedSellerDocs.documents.map((doc, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-xl border bg-white"
                    style={{ borderColor: 'rgba(165,142,116,0.15)' }}
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-apricot" />
                      <div>
                        <p className="text-xs font-bold text-fern">{doc.type}</p>
                        <span className="text-[10px] text-natural font-medium">{doc.name}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => alert(`Reviewing simulated document file: ${doc.name}`)}
                      className="h-7 px-3 border border-natural/20 rounded-lg text-[9px] font-bold uppercase hover:bg-stone-50 cursor-pointer text-fern"
                    >
                      View File
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end gap-2" style={{ borderColor: 'rgba(165,142,116,0.15)' }}>
              <button
                onClick={() => setSelectedSellerDocs(null)}
                className="h-9 px-4 rounded-xl border text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                style={{ borderColor: 'rgba(165,142,116,0.3)', color: '#424530' }}
              >
                Close Compliance View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Merchant Profile Modal ──────────────────────────────────────── */}
      {selectedSellerProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-[#FAF6EE] border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6" style={{ borderColor: 'rgba(165,142,116,0.3)' }}>
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'rgba(165,142,116,0.15)' }}>
              <div>
                <span className="text-[10px] font-bold text-apricot tracking-widest uppercase">Merchant Profile</span>
                <h3 className="font-serif text-xl font-bold text-fern mt-0.5">{selectedSellerProfile.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedSellerProfile(null)}
                className="p-1.5 rounded-lg hover:bg-stone-200/50 cursor-pointer"
              >
                <X size={18} className="text-fern" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-natural">
              <div className="grid grid-cols-2 gap-4 border-b pb-4" style={{ borderColor: 'rgba(165,142,116,0.15)' }}>
                <div>
                  <p className="text-[9px] font-bold text-natural uppercase tracking-wider">Business Type</p>
                  <span className="text-fern font-bold text-xs">{selectedSellerProfile.businessType}</span>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-natural uppercase tracking-wider">Joined Date</p>
                  <span className="text-fern font-bold text-xs">{selectedSellerProfile.joinDate}</span>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-natural uppercase tracking-wider">Contact Phone</p>
                  <span className="text-fern font-bold text-xs">{selectedSellerProfile.phone}</span>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-natural uppercase tracking-wider">Contact Email</p>
                  <span className="text-fern font-bold text-xs truncate block max-w-[150px]">{selectedSellerProfile.email}</span>
                </div>
              </div>

              <div className="border-b pb-4" style={{ borderColor: 'rgba(165,142,116,0.15)' }}>
                <p className="text-[9px] font-bold text-natural uppercase tracking-wider mb-1">Registered Address</p>
                <span className="text-fern font-bold text-xs leading-relaxed">{selectedSellerProfile.address}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-bold text-natural uppercase tracking-wider">Listed Products</p>
                  <span className="text-fern font-bold text-xs">{selectedSellerProfile.listedCount} Items</span>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-natural uppercase tracking-wider">Estimated Revenue</p>
                  <span className="text-green-700 font-extrabold text-xs">₹{selectedSellerProfile.totalSales.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end gap-2" style={{ borderColor: 'rgba(165,142,116,0.15)' }}>
              <button
                onClick={() => setSelectedSellerProfile(null)}
                className="h-9 px-4 rounded-xl border text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                style={{ borderColor: 'rgba(165,142,116,0.3)', color: '#424530' }}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
