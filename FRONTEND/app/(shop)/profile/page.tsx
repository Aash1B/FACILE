"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  User, 
  Mail, 
  ShoppingBag, 
  MapPin, 
  Lock, 
  Camera, 
  Check, 
  ChevronRight, 
  ChevronDown, 
  Calendar, 
  Plus, 
  Trash2, 
  Smartphone,
  Globe
} from "lucide-react";

// Mock Order History Data
const MOCK_ORDERS = [
  {
    id: "FC-84920",
    date: "July 08, 2026",
    total: "₹2,900.00",
    status: "Delivered",
    items: [
      { name: "Handcrafted Ceramic Pitcher", price: "₹1,200.00", qty: 1, category: "Ceramics" },
      { name: "Organic Linen Bedspread", price: "₹1,700.00", qty: 1, category: "Home Decor" }
    ]
  },
  {
    id: "FC-73819",
    date: "June 24, 2026",
    total: "₹850.00",
    status: "In Transit",
    items: [
      { name: "Minimalist Soy Candle Set", price: "₹450.00", qty: 1, category: "Aromatherapy" },
      { name: "Woven Palm Leaf Coasters", price: "₹400.00", qty: 1, category: "Kitchen" }
    ]
  },
  {
    id: "FC-62910",
    date: "May 12, 2026",
    total: "₹1,500.00",
    status: "Processing",
    items: [
      { name: "Earthy Ceramic Coffee Mugs (Set of 2)", price: "₹600.00", qty: 1, category: "Ceramics" },
      { name: "Pure Cotton Tote Bag", price: "₹900.00", qty: 1, category: "Bags" }
    ]
  }
];

// Mock Address Data
const MOCK_ADDRESSES = [
  {
    id: 1,
    label: "Home (Default)",
    name: "Aashish Bharti",
    street: "124 Warm Ivory Lane, Sector 4",
    city: "New Delhi, Delhi - 110001",
    phone: "+91 98765 43210"
  },
  {
    id: 2,
    label: "Design Studio",
    name: "Aashish Bharti",
    street: "Studio 8B, Fern Creative Hub",
    city: "Gurugram, Haryana - 122002",
    phone: "+91 98765 43211"
  }
];

function ProfileContent() {
  const { user, logout, isLoading, setupMfa, enableMfa, disableMfa, getSessions, revokeSession, getAuditLogs } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses" | "security">("profile");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams) {
      const tab = searchParams.get("tab");
      if (tab === "profile" || tab === "orders" || tab === "addresses" || tab === "security") {
        setActiveTab(tab as any);
      }
    }
  }, [searchParams]);

  // Security Tab state variables
  const [sessionsList, setSessionsList] = useState<any[]>([]);
  const [auditLogsList, setAuditLogsList] = useState<any[]>([]);
  const [mfaSecretData, setMfaSecretData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
  const [mfaSetupCode, setMfaSetupCode] = useState("");
  const [mfaErrorMsg, setMfaErrorMsg] = useState("");
  const [mfaSuccessMsg, setMfaSuccessMsg] = useState("");
  const [showMfaSetup, setShowMfaSetup] = useState(false);

  useEffect(() => {
    if (activeTab === "security" && user) {
      loadSessionsAndLogs();
    }
  }, [activeTab, user]);

  const loadSessionsAndLogs = async () => {
    try {
      const sess = await getSessions();
      setSessionsList(sess);
      const logs = await getAuditLogs();
      setAuditLogsList(logs);
    } catch (e) {
      console.error("Failed to load security details:", e);
    }
  };

  const handleSetupMfa = async () => {
    try {
      const data = await setupMfa();
      setMfaSecretData(data);
      setShowMfaSetup(true);
      setMfaErrorMsg("");
      setMfaSuccessMsg("");
    } catch (e: any) {
      setMfaErrorMsg(e.message || "Failed to initiate MFA setup.");
    }
  };

  const handleVerifyEnableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await enableMfa(mfaSetupCode);
      setMfaSuccessMsg("MFA successfully enabled!");
      setMfaSecretData(null);
      setShowMfaSetup(false);
      setMfaSetupCode("");
      loadSessionsAndLogs();
    } catch (e: any) {
      setMfaErrorMsg(e.message || "Invalid code. Please try again.");
    }
  };

  const handleDisableMfa = async () => {
    if (confirm("Are you sure you want to disable 2FA? This will decrease your account security.")) {
      try {
        await disableMfa();
        alert("MFA has been disabled.");
        loadSessionsAndLogs();
      } catch (e: any) {
        alert(e.message || "Failed to disable MFA.");
      }
    }
  };

  const handleRevokeSession = async (id: number) => {
    try {
      await revokeSession(id);
      loadSessionsAndLogs();
    } catch (e: any) {
      alert(e.message || "Failed to revoke session.");
    }
  };
  
  // Profile Form State
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("+91 98765 43210");
  const [profileBio, setProfileBio] = useState("Architect & design enthusiast. Passionate about slow living, ceramics, and sustainable craftsmanship.");
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  // Load saved photo from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('facile_profile_photo');
    if (saved) setProfilePhoto(saved);
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setProfilePhoto(dataUrl);
      localStorage.setItem('facile_profile_photo', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Address Form State
  const [addresses, setAddresses] = useState(MOCK_ADDRESSES);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: "", name: "", street: "", city: "", phone: "" });

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    } else if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="auth-palette min-h-[60vh] flex items-center justify-center" style={{ backgroundColor: '#faf3e3' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-apricot border-t-transparent rounded-full animate-spin" style={{ borderColor: '#4A5568', borderTopColor: 'transparent' }} />
          <p className="text-sm font-semibold text-fern" style={{ color: '#4a5568' }}>Loading secure dashboard...</p>
        </div>
      </div>
    );
  }

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 4000);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAddr.label && newAddr.name && newAddr.street && newAddr.city) {
      setAddresses([...addresses, { id: Date.now(), ...newAddr }]);
      setNewAddr({ label: "", name: "", street: "", city: "", phone: "" });
      setShowAddAddress(false);
    }
  };

  const handleDeleteAddress = (id: number) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword === confirmPassword) {
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 4000);
    }
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans animate-fade-in" style={{ backgroundColor: '#F4F4F0' }}>
      <div className="max-w-6xl mx-auto">
        
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold tracking-wide text-fern">
            My Account
          </h1>
          <p className="text-xs text-natural font-medium mt-1">
            Manage your profile, view orders, and update shipping details.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Navigation Sidebar (Vertical on Desktop, Scrollable Row on Mobile) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* User Short Info Card */}
            <div className="bg-[#F4F4F0] border border-natural/20 rounded-2xl p-5 shadow-sm text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#4A5568]" />
              <div className="relative inline-block mt-2">
                  <div className="w-16 h-16 bg-[#F4F4F0] text-fern border border-natural/20 rounded-full flex items-center justify-center font-serif text-2xl font-bold uppercase shadow-inner overflow-hidden">
                    {profilePhoto
                      ? <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      : (profileName ? profileName.slice(0, 2) : "US")
                    }
                  </div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-1.5 bg-[#4A5568] text-warm-ivory rounded-full shadow hover:bg-[#4A5568]/90 transition-colors duration-200 cursor-pointer"
                    aria-label="Change photo"
                  >
                    <Camera size={12} />
                  </button>
                </div>
              <h3 className="text-sm font-bold text-fern mt-3 truncate">{profileName}</h3>
              <p className="text-[10px] font-bold text-natural uppercase tracking-wider">{user ? "Member Since 2026" : "Guest Account"}</p>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-[#F4F4F0] border border-natural/20 rounded-2xl p-2 shadow-sm flex lg:flex-col overflow-x-auto lg:overflow-x-visible no-scrollbar gap-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex-shrink-0 lg:w-full text-left ${
                  activeTab === "profile" 
                    ? "bg-fern text-warm-ivory shadow-sm" 
                    : "text-natural hover:bg-warm-ivory/30 hover:text-fern"
                }`}
              >
                <User size={15} />
                Profile Settings
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex-shrink-0 lg:w-full text-left ${
                  activeTab === "orders" 
                    ? "bg-fern text-warm-ivory shadow-sm" 
                    : "text-natural hover:bg-warm-ivory/30 hover:text-fern"
                }`}
              >
                <ShoppingBag size={15} />
                Order History
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex-shrink-0 lg:w-full text-left ${
                  activeTab === "addresses" 
                    ? "bg-fern text-warm-ivory shadow-sm" 
                    : "text-natural hover:bg-warm-ivory/30 hover:text-fern"
                }`}
              >
                <MapPin size={15} />
                Shipping Addresses
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex-shrink-0 lg:w-full text-left ${
                  activeTab === "security" 
                    ? "bg-fern text-warm-ivory shadow-sm" 
                    : "text-natural hover:bg-warm-ivory/30 hover:text-fern"
                }`}
              >
                <Lock size={15} />
                Security
              </button>

              <div className="h-px bg-natural/10 my-2 hidden lg:block" />

              <button
                onClick={logout}
                className="flex lg:hidden items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl text-[#4A5568] hover:bg-warm-ivory/30 transition-all duration-200 cursor-pointer flex-shrink-0"
              >
                Sign Out
              </button>
            </div>
            
            <button
              onClick={logout}
              className="hidden lg:flex items-center justify-center gap-2 w-full py-3 bg-[#4A5568] hover:bg-[#4A5568]/90 text-[#FAF3E3] text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm border border-transparent"
            >
              Sign Out
            </button>

          </div>

          {/* Main Dashboard Section (Tabs Content) */}
          <div className="lg:col-span-3">
            <div className="bg-[#F4F4F0] border border-natural/20 rounded-3xl p-6 sm:p-8 shadow-sm min-h-[480px]">
              
              {/* Tab 1: Profile Settings */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-fern">Profile Information</h2>
                    <p className="text-[11px] text-natural font-medium mt-0.5">Update your personal account details and public bio.</p>
                  </div>
                  
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-natural">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-natural" size={14} />
                          <input 
                            type="text" 
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            required
                            className="w-full h-10 pl-9 pr-4 bg-warm-ivory/20 border border-natural/25 focus:border-fern focus:ring-1 focus:ring-fern text-xs font-medium text-fern rounded-xl focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-natural">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-natural" size={14} />
                          <input 
                            type="email" 
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            required
                            className="w-full h-10 pl-9 pr-4 bg-warm-ivory/20 border border-natural/25 focus:border-fern focus:ring-1 focus:ring-fern text-xs font-medium text-fern rounded-xl focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-natural">Phone Number</label>
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-natural" size={14} />
                          <input 
                            type="text" 
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            className="w-full h-10 pl-9 pr-4 bg-warm-ivory/20 border border-natural/25 focus:border-fern focus:ring-1 focus:ring-fern text-xs font-medium text-fern rounded-xl focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-natural">Preferred Region</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-natural" size={14} />
                          <select 
                            className="w-full h-10 pl-9 pr-4 bg-warm-ivory/20 border border-natural/25 focus:border-fern focus:ring-1 focus:ring-fern text-xs font-medium text-fern rounded-xl focus:outline-none transition-all appearance-none cursor-pointer"
                            defaultValue="India"
                          >
                            <option value="India">India (INR)</option>
                            <option value="US">United States (USD)</option>
                            <option value="UK">United Kingdom (GBP)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-natural">Personal Bio</label>
                      <textarea 
                        rows={3} 
                        value={profileBio}
                        onChange={(e) => setProfileBio(e.target.value)}
                        className="w-full p-4 bg-warm-ivory/20 border border-natural/25 focus:border-fern focus:ring-1 focus:ring-fern text-xs font-medium text-fern rounded-xl focus:outline-none transition-all resize-none leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="h-10 px-8 bg-[#4A5568] hover:bg-[#4A5568]/90 text-[#FAF3E3] text-xs font-bold tracking-wide rounded-xl cursor-pointer transition-all active:scale-97 shadow hover:shadow-md border border-transparent"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                  
                  {/* Toast Alert */}
                  {showSaveToast && (
                    <div className="flex items-center gap-3 bg-fern text-warm-ivory p-4 rounded-xl shadow-md animate-fade-in border border-apricot/20">
                      <div className="w-5 h-5 bg-[#4A5568] rounded-full flex items-center justify-center text-[#FAF3E3]">
                        <Check size={11} className="stroke-[3px]" />
                      </div>
                      <p className="text-xs font-semibold">Changes saved successfully! Profile details updated locally.</p>
                    </div>
                  )}

                </div>
              )}

              {/* Tab 2: Order History */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-fern">Your Orders</h2>
                    <p className="text-[11px] text-natural font-medium mt-0.5">Track shipping details and history of previous orders.</p>
                  </div>

                  <div className="space-y-4">
                    {MOCK_ORDERS.map((order) => {
                      const isExpanded = expandedOrder === order.id;
                      return (
                        <div 
                          key={order.id}
                          className="border border-natural/20 rounded-2xl overflow-hidden shadow-sm transition-all hover:border-natural/40 bg-warm-ivory/5"
                        >
                          {/* Order Header Summary */}
                          <div 
                            onClick={() => toggleOrder(order.id)}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4.5 gap-3 sm:gap-6 cursor-pointer bg-white"
                          >
                            <div className="grid grid-cols-2 sm:flex items-center gap-4 sm:gap-8 w-full sm:w-auto">
                              <div>
                                <p className="text-[9px] font-bold text-natural uppercase tracking-wider">Order ID</p>
                                <p className="text-xs font-bold text-fern mt-0.5">{order.id}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-bold text-natural uppercase tracking-wider">Placed On</p>
                                <p className="text-xs font-semibold text-fern mt-0.5">{order.date}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-bold text-natural uppercase tracking-wider">Total Amount</p>
                                <p className="text-xs font-bold text-apricot mt-0.5">{order.total}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-bold text-natural uppercase tracking-wider">Status</p>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold mt-1 tracking-wide uppercase ${
                                  order.status === "Delivered" 
                                    ? "bg-green-100 text-green-800" 
                                    : order.status === "In Transit" 
                                      ? "bg-blue-100 text-blue-800" 
                                      : "bg-amber-100 text-amber-800"
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    order.status === "Delivered" 
                                      ? "bg-green-600" 
                                      : order.status === "In Transit" 
                                        ? "bg-blue-600" 
                                        : "bg-amber-600"
                                  }`} />
                                  {order.status}
                                </span>
                              </div>
                            </div>

                            <button className="text-natural hover:text-fern transition-colors self-end sm:self-center" aria-label="Toggle details">
                              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </button>
                          </div>

                          {/* Order Expanded Details */}
                          {isExpanded && (
                            <div className="border-t border-natural/15 p-4.5 bg-warm-ivory/10 space-y-4 animate-fade-in">
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-natural">Items in Order</h4>
                              <div className="divide-y divide-natural/10">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between py-3 first:pt-0 last:pb-0 text-xs">
                                    <div className="space-y-1">
                                      <p className="font-bold text-fern">{item.name}</p>
                                      <p className="text-[10px] font-semibold text-natural">{item.category} • Qty: {item.qty}</p>
                                    </div>
                                    <p className="font-bold text-fern">{item.price}</p>
                                  </div>
                                ))}
                              </div>

                              <div className="border-t border-natural/10 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                                <div className="space-y-1 font-semibold text-natural">
                                  <p>Payment Method: <span className="text-fern font-bold">Credit Card (**** 4820)</span></p>
                                  <p>Shipment Carrier: <span className="text-fern font-bold">BlueDart Express</span></p>
                                </div>
                                <div className="flex gap-2.5 w-full sm:w-auto">
                                  <button className="flex-1 sm:flex-none h-8 px-4 border border-natural/25 hover:border-fern text-fern font-bold text-[10px] rounded-lg transition-colors cursor-pointer bg-white">
                                    Invoice PDF
                                  </button>
                                  <button className="flex-1 sm:flex-none h-8 px-4 bg-fern hover:bg-apricot text-warm-ivory font-bold text-[10px] rounded-lg transition-colors cursor-pointer">
                                    Track Package
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 3: Shipping Addresses */}
              {activeTab === "addresses" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="font-serif text-xl font-bold text-fern">Shipping Addresses</h2>
                      <p className="text-[11px] text-natural font-medium mt-0.5">Manage delivery destinations for rapid checkout.</p>
                    </div>
                    
                    {!showAddAddress && (
                      <button 
                        onClick={() => setShowAddAddress(true)}
                        className="h-8.5 px-4 bg-fern hover:bg-apricot text-warm-ivory text-[10px] font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        <Plus size={14} />
                        Add Address
                      </button>
                    )}
                  </div>

                  {/* Add Address Form */}
                  {showAddAddress && (
                    <form onSubmit={handleAddAddress} className="border border-natural/20 rounded-2xl p-5 bg-warm-ivory/10 space-y-3.5 animate-fade-in">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-fern">New Delivery Destination</h3>
                        <button 
                          type="button" 
                          onClick={() => setShowAddAddress(false)}
                          className="text-[10px] font-bold text-natural hover:text-apricot transition-colors uppercase tracking-wider"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-natural">Label (e.g. Home/Work)</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Home, Office, Studio"
                            value={newAddr.label}
                            onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                            className="w-full h-8.5 px-3 bg-white border border-natural/25 focus:border-fern text-xs font-medium text-fern rounded-lg focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-natural">Contact Name</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Recipient's Name"
                            value={newAddr.name}
                            onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                            className="w-full h-8.5 px-3 bg-white border border-natural/25 focus:border-fern text-xs font-medium text-fern rounded-lg focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-natural">Street Address</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Building, street, block info"
                          value={newAddr.street}
                          onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                          className="w-full h-8.5 px-3 bg-white border border-natural/25 focus:border-fern text-xs font-medium text-fern rounded-lg focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-natural">City, State - PIN</label>
                          <input 
                            type="text" 
                            required
                            placeholder="City, State - Zip Code"
                            value={newAddr.city}
                            onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                            className="w-full h-8.5 px-3 bg-white border border-natural/25 focus:border-fern text-xs font-medium text-fern rounded-lg focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-natural">Phone Number</label>
                          <input 
                            type="text" 
                            placeholder="+91 99999 99999"
                            value={newAddr.phone}
                            onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                            className="w-full h-8.5 px-3 bg-white border border-natural/25 focus:border-fern text-xs font-medium text-fern rounded-lg focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full h-9 bg-fern hover:bg-apricot text-warm-ivory text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Save Shipping Destination
                      </button>
                    </form>
                  )}

                  {/* Address List Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div 
                        key={addr.id}
                        className="border border-natural/20 rounded-2xl p-4.5 relative bg-warm-ivory/5 shadow-sm space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="px-2.5 py-0.5 bg-fern/10 text-fern font-bold text-[9px] uppercase tracking-wider rounded-full">
                              {addr.label}
                            </span>
                            <button 
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-natural hover:text-apricot transition-colors p-1" 
                              aria-label="Delete Address"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <div className="text-xs font-semibold text-fern space-y-0.5">
                            <p className="font-bold">{addr.name}</p>
                            <p className="text-natural/90 leading-relaxed font-medium">{addr.street}</p>
                            <p className="text-natural/90 leading-relaxed font-medium">{addr.city}</p>
                          </div>
                        </div>

                        <div className="border-t border-natural/10 pt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-natural uppercase">
                          <Calendar size={11} className="text-natural/60" />
                          <span>Contact: {addr.phone || "Not Provided"}</span>
                        </div>
                      </div>
                    ))}

                    {addresses.length === 0 && (
                      <div className="sm:col-span-2 py-12 text-center text-xs font-semibold text-natural border border-dashed border-natural/30 rounded-2xl">
                        No addresses saved yet. Click 'Add Address' to set up a destination.
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* Tab 4: Security */}
              {activeTab === "security" && (
                <div className="space-y-8">
                  {/* Password Change Form */}
                  <div>
                    <h2 className="font-serif text-xl font-bold text-fern">Account Credentials</h2>
                    <p className="text-[11px] text-natural font-medium mt-0.5">Update password credentials.</p>
                  </div>

                  <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-natural">Current Password</label>
                      <input 
                        type="password" 
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-10 px-4 bg-warm-ivory/20 border border-natural/25 focus:border-fern focus:ring-1 focus:ring-fern text-xs font-medium text-fern rounded-xl focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-natural">New Password</label>
                      <input 
                        type="password" 
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className="w-full h-10 px-4 bg-warm-ivory/20 border border-natural/25 focus:border-fern focus:ring-1 focus:ring-fern text-xs font-medium text-fern rounded-xl focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-natural">Confirm New Password</label>
                      <input 
                        type="password" 
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Match new password"
                        className="w-full h-10 px-4 bg-warm-ivory/20 border border-natural/25 focus:border-fern focus:ring-1 focus:ring-fern text-xs font-medium text-fern rounded-xl focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="h-10 px-6 bg-fern hover:bg-apricot text-warm-ivory text-xs font-bold tracking-wide rounded-xl cursor-pointer transition-colors shadow"
                    >
                      Update Password
                    </button>
                  </form>

                  {passwordSuccess && (
                    <div className="flex items-center gap-3 bg-fern text-warm-ivory p-4 rounded-xl shadow-md max-w-md border border-apricot/20 animate-fade-in">
                      <div className="w-5 h-5 bg-apricot rounded-full flex items-center justify-center text-warm-ivory">
                        <Check size={11} className="stroke-[3px]" />
                      </div>
                      <p className="text-xs font-semibold font-sans">Password updated successfully!</p>
                    </div>
                  )}

                  <div className="h-px bg-natural/10 my-6" />

                  {/* Two-Factor Authentication (2FA) Setup */}
                  <div>
                    <h2 className="font-serif text-xl font-bold text-fern">Two-Factor Authentication (2FA)</h2>
                    <p className="text-[11px] text-natural font-medium mt-0.5">Secure your account with multi-factor passcodes.</p>
                  </div>

                  {user?.mfaEnabled ? (
                    <div className="border border-natural/20 rounded-2xl p-5 bg-green-50/50 flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-fern flex items-center gap-1.5">
                          2FA is currently ENABLED
                          <span className="px-2 py-0.5 bg-fern text-warm-ivory font-bold text-[8px] uppercase tracking-wider rounded-md">Active</span>
                        </h4>
                        <p className="text-[11px] text-natural font-semibold">
                          Your account is protected by TOTP code validation during sign in.
                        </p>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleDisableMfa}
                        className="h-8.5 px-4 bg-apricot hover:bg-apricot/90 text-warm-ivory text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm self-center"
                      >
                        Disable 2FA
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="border border-natural/20 rounded-2xl p-5 bg-warm-ivory/5 flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="space-y-1 max-w-lg">
                          <h4 className="text-xs font-bold text-fern flex items-center gap-1.5">
                            2FA is currently DISABLED
                            <span className="px-2 py-0.5 bg-apricot/15 text-apricot font-bold text-[8px] uppercase tracking-wider rounded-md font-sans">Recommended</span>
                          </h4>
                          <p className="text-[11px] text-natural/95 leading-relaxed font-semibold">
                            Add an extra layer of protection by requiring a code from your authenticator app on login.
                          </p>
                        </div>
                        {!showMfaSetup && (
                          <button 
                            type="button" 
                            onClick={handleSetupMfa}
                            className="h-8.5 px-4 border border-natural/25 hover:border-fern text-fern text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer bg-white self-center"
                          >
                            Enable 2FA
                          </button>
                        )}
                      </div>

                      {showMfaSetup && mfaSecretData && (
                        <div className="border border-natural/25 rounded-2xl p-5 bg-warm-ivory/10 space-y-4 animate-fade-in max-w-md">
                          <h4 className="text-xs font-bold text-fern uppercase tracking-wider">MFA Setup instructions</h4>
                          
                          <div className="flex flex-col items-center gap-3 py-2 bg-white rounded-xl border border-natural/15">
                            {/* QR Code using Google Charts API */}
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mfaSecretData.qrCodeUrl)}`}
                              alt="Scan this TOTP QR Code"
                              className="w-40 h-40 border border-natural/10"
                            />
                            <div className="text-center px-4">
                              <p className="text-[10px] text-natural uppercase font-bold">Setup Key</p>
                              <code className="text-xs font-mono font-bold text-fern bg-warm-ivory/40 px-2.5 py-1 rounded-md block mt-1 select-all">
                                {mfaSecretData.secret}
                              </code>
                            </div>
                          </div>

                          <form onSubmit={handleVerifyEnableMfa} className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-natural block">Enter Authenticator Code</label>
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                maxLength={6}
                                required
                                placeholder="123456"
                                value={mfaSetupCode}
                                onChange={(e) => setMfaSetupCode(e.target.value.replace(/\D/g, ""))}
                                className="w-full h-8.5 px-3 bg-white border border-natural/25 text-xs font-medium text-fern rounded-lg focus:outline-none"
                              />
                              <button 
                                type="submit"
                                className="h-8.5 px-4 bg-fern hover:bg-apricot text-warm-ivory text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex-shrink-0"
                              >
                                Enable
                              </button>
                            </div>
                          </form>

                          {mfaErrorMsg && (
                            <p className="text-[10px] font-bold text-apricot">{mfaErrorMsg}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="h-px bg-natural/10 my-6" />

                  {/* Active Device Sessions */}
                  <div>
                    <h2 className="font-serif text-xl font-bold text-fern">Active Device Sessions</h2>
                    <p className="text-[11px] text-natural font-medium mt-0.5">Manage and revoke active logins on your account.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sessionsList.map((session) => (
                      <div 
                        key={session.id}
                        className="border border-natural/20 rounded-2xl p-4.5 bg-warm-ivory/5 flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <p className="text-[10px] font-mono font-semibold text-fern truncate max-w-full" title={session.userAgent}>
                            {session.userAgent || "Unknown Device"}
                          </p>
                          <div className="text-[10px] font-bold text-natural uppercase tracking-wider space-y-0.5">
                            <p>IP Address: <span className="text-fern font-medium">{session.ipAddress || "Unknown"}</span></p>
                            <p>Last Active: <span className="text-fern font-medium">{new Date(session.lastActiveAt).toLocaleString()}</span></p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRevokeSession(session.id)}
                          className="h-7 w-full border border-apricot/30 hover:bg-apricot/5 text-apricot text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                        >
                          Revoke Access
                        </button>
                      </div>
                    ))}
                    {sessionsList.length === 0 && (
                      <div className="sm:col-span-2 py-8 text-center text-xs font-semibold text-natural border border-dashed border-natural/30 rounded-2xl">
                        No active login sessions tracked.
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-natural/10 my-6" />

                  {/* Security Audit Logs */}
                  <div>
                    <h2 className="font-serif text-xl font-bold text-fern">Security Audit Trail</h2>
                    <p className="text-[11px] text-natural font-medium mt-0.5">Historical log of security activities for verification.</p>
                  </div>

                  <div className="border border-natural/20 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse bg-white">
                      <thead>
                        <tr className="bg-warm-ivory/40 text-[9px] font-bold uppercase tracking-wider text-natural border-b border-natural/15">
                          <th className="p-3">Action</th>
                          <th className="p-3">IP Address</th>
                          <th className="p-3">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-natural/10 text-xs">
                        {auditLogsList.map((log) => (
                          <tr key={log.id} className="hover:bg-warm-ivory/10">
                            <td className="p-3 font-semibold text-fern">{log.action}</td>
                            <td className="p-3 text-natural font-medium">{log.ipAddress || "N/A"}</td>
                            <td className="p-3 text-natural font-medium">{new Date(log.timestamp).toLocaleString()}</td>
                          </tr>
                        ))}
                        {auditLogsList.length === 0 && (
                          <tr>
                            <td colSpan={3} className="p-4 text-center text-natural font-semibold">
                              No security audit logs available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF3E3] flex items-center justify-center text-fern font-semibold">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-fern border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">Loading profile...</p>
        </div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
