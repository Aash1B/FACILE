"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  Globe,
  CreditCard,
  Gift,
  WalletCards,
  Box,
  Star,
  Truck
} from "lucide-react";
interface TrackingEvent {
  status: string;
  message: string;
  occurredAt?: string | number[] | null;
  completed: boolean;
}
interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: string | number[];
  shippingAddress: string;
  trackingHistory?: TrackingEvent[];
}

const formatPrice = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

const formatOrderDate = (raw: string | number[]) => {
  try {
    const date = Array.isArray(raw)
      ? new Date(raw[0], (raw[1] ?? 1) - 1, raw[2] ?? 1, raw[3] ?? 0, raw[4] ?? 0)
      : new Date(raw);
    if (isNaN(date.getTime())) return "Date unavailable";
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "Date unavailable";
  }
};

const ORDER_STATUS_STYLES: Record<Order["status"], { bg: string; text: string; dot: string; label: string }> = {
  PENDING:   { bg: "bg-amber-100",  text: "text-amber-800",  dot: "bg-amber-600",  label: "Pending" },
  CONFIRMED: { bg: "bg-blue-100",   text: "text-blue-800",   dot: "bg-blue-600",   label: "Confirmed" },
  SHIPPED:   { bg: "bg-indigo-100", text: "text-indigo-800", dot: "bg-indigo-600", label: "Shipped" },
  DELIVERED: { bg: "bg-green-100",  text: "text-green-800",  dot: "bg-green-600",  label: "Delivered" },
  CANCELLED: { bg: "bg-red-100",    text: "text-red-800",    dot: "bg-red-600",    label: "Cancelled" },
};

// Mock Address Data
const MOCK_ADDRESSES: any[] = [];

function ProfileContent() {
  const { user, logout, isLoading, forgotPassword, setupMfa, enableMfa, disableMfa, getSessions, revokeSession, getAuditLogs, deleteAccount } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "tracking" | "addresses" | "gift_cards" | "saved_cards" | "security" | "reviews" | "saved_upi">("profile");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Reviews State
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  useEffect(() => {
    if (activeTab === "reviews" && user?.email) {
      fetchUserReviews();
    }
  }, [activeTab, user]);

  const fetchUserReviews = async () => {
    if (!user?.email) return;
    setIsLoadingReviews(true);
    try {
      const PRODUCT_SERVICE_URL = process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || "http://localhost:8083/api";
      const res = await fetch(`${PRODUCT_SERVICE_URL}/user/reviews?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        setUserReviews(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch user reviews:", e);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Gift Card State
  const [giftCardValue, setGiftCardValue] = useState(0);
  const [giftCardQty, setGiftCardQty] = useState(1);
  const [receiverEmail, setReceiverEmail] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [gifterName, setGifterName] = useState("");
  const [personalGiftMessage, setPersonalGiftMessage] = useState("");
  const [isPurchasingGiftCard, setIsPurchasingGiftCard] = useState(false);
  const [showAddGiftCard, setShowAddGiftCard] = useState(false);

  const handleBuyGiftCard = async () => {
    if (!receiverEmail || !receiverName || giftCardValue === 0 || giftCardQty === 0) {
      alert("Please fill in all required fields (Email, Name, Card Value).");
      return;
    }
    
    if (!user?.email) return;
    const amount = giftCardValue * giftCardQty;
    if (!Number.isFinite(amount) || amount < 100 || amount > 100000) { 
      alert("Choose a total amount from ₹100 to ₹1,00,000."); 
      return; 
    }
    
    setIsPurchasingGiftCard(true); 
    try {
      const PAYMENT_SERVICE_URL = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || "/api/payments";
      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => { const script = document.createElement("script"); script.src = "https://checkout.razorpay.com/v1/checkout.js"; script.onload = () => resolve(); script.onerror = () => reject(new Error("Could not load Razorpay.")); document.body.appendChild(script); });
      }
      const orderResponse = await fetch(`${PAYMENT_SERVICE_URL}/payments/create-order?amount=${amount}`, { method: "POST" });
      if (!orderResponse.ok) throw new Error("Could not start payment.");
      const order = await orderResponse.json();
      new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TDPsCfDkwT5N6j", amount: order.amount, currency: "INR", order_id: order.id,
        name: "Facile", description: `₹${amount.toLocaleString("en-IN")} Gift Card for ${receiverName}`, prefill: { email: user.email },
        handler: async (payment: any) => {
          const verification = await fetch(`${PAYMENT_SERVICE_URL}/payments/verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
            razorpay_order_id: payment.razorpay_order_id, razorpay_payment_id: payment.razorpay_payment_id,
            razorpay_signature: payment.razorpay_signature, userId: receiverEmail, amount, currency: "INR", purpose: "GIFT_CARD"
          }) });
          setIsPurchasingGiftCard(false);
          if (verification.ok) {
            alert(`Payment confirmed! Your 16-digit gift card and 3-digit PIN were emailed to ${receiverEmail}.`);
            setReceiverEmail("");
            setReceiverName("");
            setGiftCardValue(0);
            setGiftCardQty(1);
            setGifterName("");
            setPersonalGiftMessage("");
          } else {
            alert("Payment could not be verified. No gift card was issued.");
          }
        }, modal: { ondismiss: () => { setIsPurchasingGiftCard(false); alert("Gift-card purchase cancelled."); } }
      }).open();
    } catch (error) { 
      setIsPurchasingGiftCard(false); 
      alert(error instanceof Error ? error.message : "Could not buy gift card."); 
    }
  };


  const [savedCards, setSavedCards] = useState<any[]>([]);

  const handleAddCard = () => {
    if (savedCards.length >= 5) {
      alert("You cannot save more than 5 cards. Please remove an existing card first.");
      return;
    }
    const newCard = { id: Date.now(), type: "MASTERCARD", name: "New Bank Card", last4: Math.floor(1000 + Math.random() * 9000).toString() };
    setSavedCards([...savedCards, newCard]);
  };

  const handleRemoveCard = (id: number) => {
    setSavedCards(savedCards.filter(c => c.id !== id));
  };

  useEffect(() => {
    if (searchParams) {
      const tab = searchParams.get("tab");
      if (tab === "profile" || tab === "orders" || tab === "tracking" || tab === "addresses" || tab === "gift_cards" || tab === "saved_cards" || tab === "security" || tab === "reviews") {
        setActiveTab(tab as any);
      }
    }
  }, [searchParams]);

  const PAYMENT_SERVICE_URL = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || "/api/payments";
  const [walletBalance, setWalletBalance] = useState(0);
  const [giftAmount, setGiftAmount] = useState("1000");
  const [giftCode, setGiftCode] = useState("");
  const [giftPin, setGiftPin] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [giftBusy, setGiftBusy] = useState(false);

  const loadWallet = async () => {
    if (!user?.email) return;
    const response = await fetch(`${PAYMENT_SERVICE_URL}/payments/wallet?email=${encodeURIComponent(user.email)}`, { cache: "no-store" });
    if (response.ok) setWalletBalance(Number((await response.json()).balance || 0));
  };

  useEffect(() => { if (user?.email) loadWallet(); }, [user?.email]);

  const redeemGiftCard = async () => {
    if (!user?.email) return;
    setGiftBusy(true); setGiftMessage("");
    try {
      const response = await fetch(`${PAYMENT_SERVICE_URL}/payments/gift-cards/redeem`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, code: giftCode, pin: giftPin })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not add gift card.");
      setWalletBalance(Number(data.balance)); setGiftCode(""); setGiftPin("");
      alert(`Gift card added. ₹${Number(data.credited).toLocaleString("en-IN")} credited.`);
      setShowAddGiftCard(false);
    } catch (error) { alert(error instanceof Error ? error.message : "Could not add gift card."); }
    finally { setGiftBusy(false); }
  };

  const buyGiftCard = async () => {
    if (!user?.email) return;
    const amount = Number(giftAmount);
    if (!Number.isFinite(amount) || amount < 100 || amount > 100000) { setGiftMessage("Choose an amount from ₹100 to ₹1,00,000."); return; }
    setGiftBusy(true); setGiftMessage("");
    try {
      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => { const script = document.createElement("script"); script.src = "https://checkout.razorpay.com/v1/checkout.js"; script.onload = () => resolve(); script.onerror = () => reject(new Error("Could not load Razorpay.")); document.body.appendChild(script); });
      }
      const orderResponse = await fetch(`${PAYMENT_SERVICE_URL}/payments/create-order?amount=${amount}`, { method: "POST" });
      if (!orderResponse.ok) throw new Error("Could not start payment.");
      const order = await orderResponse.json();
      new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TDPsCfDkwT5N6j", amount: order.amount, currency: "INR", order_id: order.id,
        name: "Facile", description: `₹${amount.toLocaleString("en-IN")} Gift Card`, prefill: { email: user.email },
        handler: async (payment: any) => {
          const verification = await fetch(`${PAYMENT_SERVICE_URL}/payments/verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
            razorpay_order_id: payment.razorpay_order_id, razorpay_payment_id: payment.razorpay_payment_id,
            razorpay_signature: payment.razorpay_signature, userId: user.email, amount, currency: "INR", purpose: "GIFT_CARD"
          }) });
          setGiftBusy(false);
          if (verification.ok) setGiftMessage("Payment confirmed. Your 16-digit gift card and 3-digit PIN were emailed to you.");
          else setGiftMessage("Payment could not be verified. No gift card was issued.");
        }, modal: { ondismiss: () => { setGiftBusy(false); setGiftMessage("Gift-card purchase cancelled."); } }
      }).open();
    } catch (error) { setGiftBusy(false); setGiftMessage(error instanceof Error ? error.message : "Could not buy gift card."); }
  };

  // Payment History state variables
  const [paymentsHistory, setPaymentsHistory] = useState<any[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

  useEffect(() => {
    if ((activeTab === "orders" || activeTab === "tracking") && user?.email) {
      fetchPaymentHistory();
    }
  }, [activeTab, user]);

  const fetchPaymentHistory = async () => {
    if (!user?.email) return;
    setIsLoadingPayments(true);
    try {
      const PAYMENT_SERVICE_URL = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || "/api/payments";
      const res = await fetch(`${PAYMENT_SERVICE_URL}/payments/history?userId=${user.email}`);
      if (res.ok) {
        const data = await res.json();
        setPaymentsHistory(data);
      }
    } catch (e) {
      console.error("Failed to fetch payment history:", e);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  // Order History state variables
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [trackingNotices, setTrackingNotices] = useState<Record<string, string>>({});

  useEffect(() => {
    if ((activeTab === "orders" || activeTab === "tracking") && user?.email) {
      fetchOrders();
    }
  }, [activeTab, user]);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(user?.email || "")}`);
      if (res.ok) {
        const data = await res.json();
        setOrdersList(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Failed to fetch order history:", e);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleTrackOrder = async (orderId: string) => {
    if (!user?.email || trackingOrderId) return;
    setTrackingOrderId(orderId);
    setTrackingNotices((current) => ({ ...current, [orderId]: "Preparing the latest tracking history..." }));
    try {
      const response = await fetch(`/api/orders/${orderId}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.email }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Tracking could not be requested.");
      setOrdersList((current) => current.map((order) => order.id === orderId
        ? { ...order, trackingHistory: result.history || result.order?.trackingHistory || [] }
        : order));
      setTrackingNotices((current) => ({ ...current, [orderId]: result.message || "Tracking history is ready." }));
    } catch (error) {
      setTrackingNotices((current) => ({ ...current, [orderId]: error instanceof Error ? error.message : "Tracking is temporarily unavailable." }));
    } finally {
      setTrackingOrderId(null);
    }
  };
  
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
  const [profilePhone, setProfilePhone] = useState("+91 98765 43210");
  const [profileGender, setProfileGender] = useState("Prefer not to say");
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

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.email) {
      await forgotPassword(user.email);
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 4000);
    }
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="min-h-screen py-10 font-sans bg-[#F4F4F0]">
      <div className="max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Modern Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-10"
        >
          <h1 className="font-serif text-4xl font-bold tracking-tight text-fern">
            Manage Profile
          </h1>
          <p className="text-sm text-natural font-medium mt-3">
            Manage your profile, orders, and account settings.
          </p>
        </motion.div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Navigation Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-3 space-y-6"
          >
            
            {/* Premium Account Summary Card */}
            <div className="bg-[#E6E6FA] rounded-3xl p-6 shadow-sm border border-natural/10 flex flex-col items-center relative overflow-hidden transition-all duration-300 hover:shadow-md">
              <div className="relative inline-block mt-4 mb-4">
                  <div className="w-24 h-24 bg-warm-ivory text-fern rounded-full flex items-center justify-center font-serif text-3xl font-bold uppercase shadow-sm overflow-hidden">
                    {profilePhoto
                      ? <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      : (user.name ? user.name.slice(0, 2) : "US")
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
                    className="absolute bottom-0 right-0 p-2 bg-fern text-white rounded-full shadow-md hover:bg-apricot transition-colors duration-200 cursor-pointer"
                    aria-label="Change photo"
                  >
                    <Camera size={14} />
                  </button>
                </div>
              <h3 className="text-lg font-bold text-fern truncate w-full text-center">{user.name}</h3>
              <p className="text-xs text-natural/80 font-medium truncate w-full text-center mb-1">{user?.email}</p>
              <p className="text-[10px] font-bold text-fern/70 uppercase tracking-widest mb-6">
                {user ? "Member Since 2026" : "Guest Account"}
              </p>
              
              <div className="w-full rounded-2xl bg-[#F4F4F0] p-4 flex flex-col items-center justify-center border border-natural/10">
                <span className="text-[10px] text-natural font-bold uppercase tracking-widest mb-1">Wallet Balance</span>
                <span className="text-xl font-bold text-fern">₹{walletBalance.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex flex-col gap-1 lg:pl-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-3 px-5 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-300 cursor-pointer text-left ${
                  activeTab === "profile" 
                    ? "bg-[#E6E6FA] text-fern shadow-sm border border-natural/10 scale-[1.02]" 
                    : "text-natural hover:bg-[#E6E6FA]/60 hover:text-fern"
                }`}
              >
                <User size={18} strokeWidth={activeTab === "profile" ? 2.5 : 2} />
                Profile Settings
              </button>
              
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-3 px-5 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-300 cursor-pointer text-left ${
                  activeTab === "orders" 
                    ? "bg-[#E6E6FA] text-fern shadow-sm border border-natural/10 scale-[1.02]" 
                    : "text-natural hover:bg-[#E6E6FA]/60 hover:text-fern"
                }`}
              >
                <ShoppingBag size={18} strokeWidth={activeTab === "orders" ? 2.5 : 2} />
                Order History
              </button>

              <button
                onClick={() => setActiveTab("tracking")}
                className={`flex items-center gap-3 px-5 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-300 cursor-pointer text-left ${
                  activeTab === "tracking"
                    ? "bg-white text-fern shadow-sm border border-natural/10 scale-[1.02]"
                    : "text-natural hover:bg-white/60 hover:text-fern"
                }`}
              >
                <Truck size={18} strokeWidth={activeTab === "tracking" ? 2.5 : 2} />
                Track Order
              </button>

              <button
                onClick={() => setActiveTab("addresses")}
                className={`flex items-center gap-3 px-5 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-300 cursor-pointer text-left ${
                  activeTab === "addresses" 
                    ? "bg-[#E6E6FA] text-fern shadow-sm border border-natural/10 scale-[1.02]" 
                    : "text-natural hover:bg-[#E6E6FA]/60 hover:text-fern"
                }`}
              >
                <MapPin size={18} strokeWidth={activeTab === "addresses" ? 2.5 : 2} />
                Manage Address
              </button>

              <div className="pt-4 pb-2 px-5 text-[10px] font-bold text-natural uppercase tracking-widest">
                Payments
              </div>

              <button
                onClick={() => setActiveTab("gift_cards")}
                className={`flex justify-between items-center px-5 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-300 cursor-pointer text-left ${
                  activeTab === "gift_cards" 
                    ? "bg-[#E6E6FA] text-fern shadow-sm border border-natural/10 scale-[1.02]" 
                    : "text-natural hover:bg-[#E6E6FA]/60 hover:text-fern"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Gift size={18} strokeWidth={activeTab === "gift_cards" ? 2.5 : 2} />
                  Gift Cards
                </div>
                <span className="text-fern/60 text-xs font-bold">₹{giftCardValue * giftCardQty}</span>
              </button>

              <button
                onClick={() => setActiveTab("saved_cards")}
                className={`flex items-center gap-3 px-5 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-300 cursor-pointer text-left ${
                  activeTab === "saved_cards" 
                    ? "bg-[#E6E6FA] text-fern shadow-sm border border-natural/10 scale-[1.02]" 
                    : "text-natural hover:bg-[#E6E6FA]/60 hover:text-fern"
                }`}
              >
                <WalletCards size={18} strokeWidth={activeTab === "saved_cards" ? 2.5 : 2} />
                Saved Cards
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`flex items-center gap-3 px-5 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-300 cursor-pointer text-left ${
                  activeTab === "security" 
                    ? "bg-[#E6E6FA] text-fern shadow-sm border border-natural/10 scale-[1.02]" 
                    : "text-natural hover:bg-[#E6E6FA]/60 hover:text-fern"
                }`}
              >
                <Lock size={18} strokeWidth={activeTab === "security" ? 2.5 : 2} />
                Security
              </button>

              <div className="pt-4 pb-2 px-5 text-[10px] font-bold text-natural uppercase tracking-widest">
                My Stuff
              </div>

              <button
                onClick={() => setActiveTab("reviews")}
                className={`flex items-center gap-3 px-5 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-300 cursor-pointer text-left ${
                  activeTab === "reviews" 
                    ? "bg-[#E6E6FA] text-fern shadow-sm border border-natural/10 scale-[1.02]" 
                    : "text-natural hover:bg-[#E6E6FA]/60 hover:text-fern"
                }`}
              >
                <Star size={18} strokeWidth={activeTab === "reviews" ? 2.5 : 2} />
                My Reviews & Ratings
              </button>

              <div className="h-px bg-natural/10 my-4 hidden lg:block mx-5" />

              <button
                onClick={logout}
                className="flex lg:hidden items-center gap-3 px-5 py-3.5 text-sm font-semibold rounded-2xl text-apricot hover:bg-apricot/10 transition-all duration-300 cursor-pointer"
              >
                Logout
              </button>
              
              <button
                onClick={logout}
                className="hidden lg:flex items-center justify-center gap-2 w-full py-4 bg-[#4A5568] hover:bg-[#E6E6FA] text-white hover:text-[#4A5568] text-xs font-bold rounded-2xl transition-all duration-300 cursor-pointer shadow-sm hover:shadow border border-transparent hover:border-[#4A5568]"
              >
                Logout
              </button>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Main Content */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-9"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="min-h-[600px]"
              >
                {/* Tab 1: Profile Settings */}
                {activeTab === "profile" && (
<div className="bg-[#DDE0F0] rounded-3xl p-6 sm:p-8 shadow-sm border border-natural/10 space-y-8">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-fern">Personal Information</h2>
                    <p className="text-xs text-natural font-medium mt-1">Update your personal account details and public bio.</p>
                  </div>
                  
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      
                      {/* Floating Label Input for Full Name */}
                      <div className="relative group">
                        <input 
                          type="text" 
                          id="fullName"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          required
className="peer w-full h-14 px-4 bg-transparent border-2 border-natural/20 text-sm font-medium text-fern rounded-2xl outline-none transition-all focus:border-fern focus:bg-[#DDE0F0] focus:shadow-sm placeholder-transparent"
                          placeholder="Full Name"
                        />
                        <label 
                          htmlFor="fullName" 
className="absolute left-4 top-4 text-xs font-bold text-natural/70 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-fern peer-focus:bg-[#DDE0F0] peer-focus:px-1 peer-valid:-top-2 peer-valid:text-[10px] peer-valid:text-fern peer-valid:bg-[#DDE0F0] peer-valid:px-1 pointer-events-none"
                        >
                          FULL NAME
                        </label>
                      </div>

                      {/* Floating Label Input for Email Address */}
                      <div className="relative group">
                        <input 
                          type="email" 
                          id="emailAddress"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          required
className="peer w-full h-14 px-4 bg-transparent border-2 border-natural/20 text-sm font-medium text-fern rounded-2xl outline-none transition-all focus:border-fern focus:bg-[#DDE0F0] focus:shadow-sm placeholder-transparent"
                          placeholder="Email Address"
                        />
                        <label 
                          htmlFor="emailAddress" 
className="absolute left-4 top-4 text-xs font-bold text-natural/70 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-fern peer-focus:bg-[#DDE0F0] peer-focus:px-1 peer-valid:-top-2 peer-valid:text-[10px] peer-valid:text-fern peer-valid:bg-[#DDE0F0] peer-valid:px-1 pointer-events-none"
                        >
                          EMAIL ADDRESS
                        </label>
                      </div>
                  <div className="bg-[#DDE0F0] rounded-3xl p-6 sm:p-8 shadow-sm border border-natural/10 space-y-8">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-fern">Personal Information</h2>
                      <p className="text-xs text-natural font-medium mt-1">Update your personal account details and public bio.</p>
                    </div>
                    
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        
                        {/* Account identity is fixed after registration. */}
                        <div className="relative flex h-14 items-center rounded-2xl border-2 border-natural/20 px-4">
                          <span className="absolute left-4 -top-2 bg-[#DDE0F0] px-1 text-[10px] font-bold text-fern">
                            FULL NAME
                          </span>
                          <p className="truncate text-sm font-medium text-fern">{user.name}</p>
                        </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      
                      {/* Floating Label Input for Phone Number */}
                      <div className="relative group">
                        <input 
                          type="text" 
                          id="phoneNumber"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
className="peer w-full h-14 px-4 bg-transparent border-2 border-natural/20 text-sm font-medium text-fern rounded-2xl outline-none transition-all focus:border-fern focus:bg-[#DDE0F0] focus:shadow-sm placeholder-transparent"
                          placeholder="Phone Number"
                        />
                        <label 
                          htmlFor="phoneNumber" 
className="absolute left-4 top-4 text-xs font-bold text-natural/70 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-fern peer-focus:bg-[#DDE0F0] peer-focus:px-1 peer-valid:-top-2 peer-valid:text-[10px] peer-valid:text-fern peer-valid:bg-[#DDE0F0] peer-valid:px-1 pointer-events-none"
                        >
                          PHONE NUMBER
                        </label>
                      </div>

                      {/* Premium Select for Region */}
                      <div className="relative group">
                        <select 
className="w-full h-14 px-4 bg-transparent border-2 border-natural/20 text-sm font-medium text-fern rounded-2xl outline-none transition-all focus:border-fern focus:bg-[#DDE0F0] focus:shadow-sm appearance-none cursor-pointer"
                          defaultValue="India"
                        >
                          <option value="India">India (INR)</option>
                          <option value="US">United States (USD)</option>
                          <option value="UK">United Kingdom (GBP)</option>
                        </select>
<label className="absolute left-4 -top-2 text-[10px] font-bold text-fern bg-[#DDE0F0] px-1 pointer-events-none">
                          PREFERRED REGION
                        </label>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-natural pointer-events-none" size={16} />
                        <div className="relative flex h-14 items-center rounded-2xl border-2 border-natural/20 px-4">
                          <span className="absolute left-4 -top-2 bg-[#DDE0F0] px-1 text-[10px] font-bold text-fern">
                            EMAIL ADDRESS
                          </span>
                          <p className="truncate text-sm font-medium text-fern">{user.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        
                        {/* Floating Label Input for Phone Number */}
                        <div className="relative group">
                          <input 
                            type="text" 
                            id="phoneNumber"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            className="peer w-full h-14 px-4 bg-transparent border-2 border-natural/20 text-sm font-medium text-fern rounded-2xl outline-none transition-all focus:border-fern focus:bg-[#DDE0F0] focus:shadow-sm placeholder-transparent"
                            placeholder="Phone Number"
                          />
                          <label 
                            htmlFor="phoneNumber" 
                            className="absolute left-4 top-4 text-xs font-bold text-natural/70 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-fern peer-focus:bg-[#DDE0F0] peer-focus:px-1 peer-valid:-top-2 peer-valid:text-[10px] peer-valid:text-fern peer-valid:bg-[#DDE0F0] peer-valid:px-1 pointer-events-none"
                          >
                            PHONE NUMBER
                          </label>
                        </div>

                        {/* Premium Select for Region */}
                        <div className="relative group">
                          <select 
                            className="w-full h-14 px-4 bg-transparent border-2 border-natural/20 text-sm font-medium text-fern rounded-2xl outline-none transition-all focus:border-fern focus:bg-[#DDE0F0] focus:shadow-sm appearance-none cursor-pointer"
                            defaultValue="India"
                          >
                            <option value="India">India (INR)</option>
                            <option value="US">United States (USD)</option>
                            <option value="UK">United Kingdom (GBP)</option>
                          </select>
                          <label className="absolute left-4 -top-2 text-[10px] font-bold text-fern bg-[#DDE0F0] px-1 pointer-events-none">
                            PREFERRED REGION
                          </label>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-natural pointer-events-none" size={16} />
                        </div>
                      </div>

                    {/* Modern Segmented Control for Gender */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-fern ml-1">Gender</label>
                      <div className="flex flex-wrap gap-3">
                        {["Male", "Female", "Other", "Prefer not to say"].map((genderOption) => (
                          <button
                            key={genderOption}
                            type="button"
                            onClick={() => setProfileGender(genderOption)}
                            className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all duration-300 border-2 ${
                              profileGender === genderOption
                                ? "border-fern bg-fern text-white shadow-md scale-[1.02]"
                                : "border-natural/20 text-natural hover:border-fern/50 hover:text-fern"
                            }`}
                          >
                            {genderOption}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-natural/10 gap-4">
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                            try {
                              await deleteAccount();
                              alert("Your account has been deleted.");
                            } catch(e: any) {
                              alert(e.message || "Failed to delete account");
                            }
                          }
                        }}
                        className="w-full sm:w-auto h-12 px-6 text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-widest rounded-2xl cursor-pointer transition-all hover:bg-red-50"
                      >
                        Delete Account
                      </button>
                      <button
                        type="submit"
                        className="w-full sm:w-auto h-12 px-10 bg-fern hover:bg-apricot text-white text-xs font-bold uppercase tracking-widest rounded-2xl cursor-pointer transition-all shadow-md hover:shadow-lg active:scale-95"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                  
                  {/* Toast Alert */}
                  <AnimatePresence>
                    {showSaveToast && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed bottom-8 right-8 flex items-center gap-3 bg-fern text-white p-4 rounded-2xl shadow-xl z-50"
                      >
                        <div className="w-6 h-6 bg-[#E6E6FA]/20 rounded-full flex items-center justify-center">
                          <Check size={12} className="stroke-[3px]" />
                        </div>
                        <p className="text-sm font-semibold pr-2">Profile details updated successfully.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {activeTab === "tracking" && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-natural/10 space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-fern">Track Your Orders</h2>
                    <p className="text-xs text-natural font-medium mt-1">Select any order to view its progress and email the tracking history to {user?.email}.</p>
                  </div>
                  {isLoadingOrders ? (
                    <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-fern border-t-transparent rounded-full animate-spin" /></div>
                  ) : ordersList.length === 0 ? (
                    <div className="text-center py-14 border border-dashed border-natural/30 rounded-3xl text-sm text-natural">No orders are available to track.</div>
                  ) : (
                    <div className="space-y-5">
                      {ordersList.map((order) => {
                        const history = order.trackingHistory || [];
                        const statusStyle = ORDER_STATUS_STYLES[order.status] ?? ORDER_STATUS_STYLES.PENDING;
                        return (
                          <article key={order.id} className="rounded-3xl border-2 border-natural/10 p-5 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-natural">Order #{order.id.slice(-8).toUpperCase()}</p>
                                <p className="mt-1 text-sm font-bold text-fern">{formatOrderDate(order.createdAt)} · {formatPrice(order.totalAmount)}</p>
                              </div>
                              <span className={`self-start inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${statusStyle.bg} ${statusStyle.text}`}><span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />{statusStyle.label}</span>
                            </div>
                            {history.length > 0 && (
                              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {history.map((event) => (
                                  <div key={event.status} className={`rounded-2xl border p-4 ${event.completed ? "border-green-200 bg-green-50" : "border-natural/10 bg-[#F4F4F0]/60"}`}>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-fern">{event.status}</p>
                                    <p className="mt-1 text-xs font-medium text-natural">{event.message}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <p className="text-[11px] font-semibold text-natural">{trackingNotices[order.id] || "Click Track & Email to request the latest history."}</p>
                              <button onClick={() => void handleTrackOrder(order.id)} disabled={trackingOrderId === order.id} className="shrink-0 rounded-xl bg-fern px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-apricot disabled:cursor-wait disabled:opacity-60">
                                {trackingOrderId === order.id ? "Preparing..." : "Track & Email"}
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Order History */}
              {activeTab === "orders" && (
                <div className="bg-[#E6E6FA] rounded-3xl p-6 sm:p-8 shadow-sm border border-natural/10 space-y-8">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-fern">Your Orders</h2>
                    <p className="text-xs text-natural font-medium mt-1">Track shipping details and history of previous orders.</p>
                  </div>

                  {isLoadingOrders ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="w-8 h-8 border-4 border-fern border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : ordersList.length === 0 ? (
                    <div className="text-center py-16 bg-[#F4F4F0]/50 border border-dashed border-natural/30 rounded-3xl text-sm text-natural font-medium">
                      <ShoppingBag size={48} className="mx-auto text-natural/30 mb-4" />
                      No orders yet. Start exploring our collections!
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {ordersList.map((order) => {
                        const isExpanded = expandedOrder === order.id;
                        const statusStyle = ORDER_STATUS_STYLES[order.status] ?? ORDER_STATUS_STYLES.PENDING;
                        return (
                          <div
                            key={order.id}
                            className="bg-[#E6E6FA] border-2 border-natural/10 rounded-3xl overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-fern/20 group"
                          >
                            <div
                              onClick={() => toggleOrder(order.id)}
                              className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-6 gap-6 cursor-pointer"
                            >
                              <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-natural uppercase tracking-widest">Order Number</p>
                                  <p className="text-sm font-bold text-fern font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-natural uppercase tracking-widest">Date</p>
                                  <p className="text-sm font-semibold text-fern">{formatOrderDate(order.createdAt)}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-natural uppercase tracking-widest">Total Amount</p>
                                  <p className="text-sm font-bold text-fern">{formatPrice(order.totalAmount)}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-natural uppercase tracking-widest">Status</p>
                                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${statusStyle.bg} ${statusStyle.text}`}>
                                    <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
                                    {statusStyle.label}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 self-end lg:self-center">
                                <span className="text-xs font-bold text-natural group-hover:text-fern transition-colors">
                                  {isExpanded ? "Hide Details" : "View Details"}
                                </span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isExpanded ? "bg-fern text-white" : "bg-[#F4F4F0] text-natural group-hover:bg-fern/10 group-hover:text-fern"}`}>
                                  <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                                </div>
                              </div>
                            </div>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-natural/10 bg-[#F4F4F0]/50"
                                >
                                  <div className="p-6 space-y-6">
                                    <div>
                                      <h4 className="text-xs font-bold uppercase tracking-widest text-fern mb-4">Order Items</h4>
                                      <div className="space-y-4">
                                        {order.items.map((item, idx) => (
                                          <div key={idx} className="flex justify-between items-center bg-[#E6E6FA] p-4 rounded-2xl border border-natural/10 shadow-sm">
                                            <div className="flex items-center gap-4">
                                              <div className="w-16 h-16 bg-[#F4F4F0] rounded-xl flex items-center justify-center text-natural/40">
                                                <ShoppingBag size={20} />
                                              </div>
                                              <div>
                                                <p className="text-sm font-bold text-fern mb-1">{item.productName}</p>
                                                <p className="text-xs font-semibold text-natural">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                                              </div>
                                            </div>
                                            <p className="text-sm font-bold text-fern">{formatPrice(item.price * item.quantity)}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="pt-4 border-t border-natural/10 flex flex-col sm:flex-row justify-between gap-4">
                                      <div>
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-natural mb-2">Delivery Address</h4>
                                        <p className="text-sm font-semibold text-fern">{order.shippingAddress}</p>
                                      </div>
                                      <div className="flex gap-3">
                                        <button className="px-5 py-2.5 bg-[#E6E6FA] border-2 border-natural/20 text-fern text-xs font-bold uppercase tracking-widest rounded-xl hover:border-fern transition-colors">
                                          Invoice
                                        </button>
                                        <button onClick={() => void handleTrackOrder(order.id)} disabled={trackingOrderId === order.id} className="px-5 py-2.5 bg-fern text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-apricot transition-colors shadow-sm disabled:cursor-wait disabled:opacity-60">
                                          {trackingOrderId === order.id ? "Sending..." : "Track Order"}
                                        </button>
                                      </div>
                                    </div>
                                    {trackingNotices[order.id] && (
                                      <p className="rounded-xl bg-white px-4 py-3 text-xs font-semibold text-fern border border-natural/10" role="status">{trackingNotices[order.id]}</p>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Digital Transactions / Payment History section */}
                  <div className="pt-10">
                    <h3 className="font-serif text-xl font-bold text-fern mb-6">Digital Payment History</h3>
                    <div className="space-y-4">
                      {isLoadingPayments ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="w-6 h-6 border-4 border-fern border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : paymentsHistory.length === 0 ? (
                        <div className="text-center py-8 text-xs text-natural font-medium border border-dashed border-natural/20 rounded-2xl">
                          No online payment transactions found.
                        </div>
                      ) : (
                        paymentsHistory.map((payment) => (
                          <div key={payment.id} className="bg-[#E6E6FA] border border-natural/10 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow transition-shadow">
                            <div className="flex items-center gap-6">
                              <div className="w-12 h-12 bg-[#F4F4F0] rounded-full flex items-center justify-center text-fern">
                                <CreditCard size={18} />
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-fern">{payment.paymentId}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-natural">{new Date(payment.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="text-sm font-bold text-apricot">₹{payment.amount.toLocaleString("en-IN")}</p>
                              <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                                payment.status === "SUCCESS" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                              }`}>
                                {payment.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Shipping Addresses */}
              {activeTab === "addresses" && (
                <div className="bg-[#E6E6FA] rounded-3xl p-6 sm:p-8 shadow-sm border border-natural/10 space-y-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-fern">Manage Address</h2>
                      <p className="text-xs text-natural font-medium mt-1">Manage delivery destinations for rapid checkout.</p>
                    </div>
                    
                    {!showAddAddress && (
                      <button 
                        onClick={() => setShowAddAddress(true)}
                        className="h-10 px-6 bg-fern hover:bg-apricot text-white text-xs font-bold uppercase tracking-widest rounded-2xl cursor-pointer transition-all shadow-sm hover:shadow flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Add Address
                      </button>
                    )}
                  </div>

                  {/* Add Address Form */}
                  <AnimatePresence>
                    {showAddAddress && (
                      <motion.form 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleAddAddress} 
                        className="border border-natural/20 rounded-3xl p-6 sm:p-8 bg-warm-ivory/30 space-y-6 overflow-hidden"
                      >
                        <div className="flex justify-between items-center border-b border-natural/10 pb-4">
                          <h3 className="text-sm font-bold uppercase tracking-widest text-fern">New Delivery Destination</h3>
                          <button 
                            type="button" 
                            onClick={() => setShowAddAddress(false)}
                            className="text-xs font-bold text-natural hover:text-apricot transition-colors uppercase tracking-widest"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="relative group">
                            <input 
                              type="text" 
                              required
                              placeholder="Label (e.g. Home, Office)"
                              value={newAddr.label}
                              onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                              className="peer w-full h-14 px-4 bg-[#E6E6FA] border-2 border-natural/10 text-sm font-medium text-fern rounded-2xl outline-none transition-all focus:border-fern focus:shadow-sm"
                            />
                            <label className="absolute left-4 -top-2 text-[10px] font-bold text-fern bg-[#FAF3E3] px-1">LABEL</label>
                          </div>
                          <div className="relative group">
                            <input 
                              type="text" 
                              required
                              placeholder="Recipient's Name"
                              value={newAddr.name}
                              onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                              className="peer w-full h-14 px-4 bg-[#E6E6FA] border-2 border-natural/10 text-sm font-medium text-fern rounded-2xl outline-none transition-all focus:border-fern focus:shadow-sm"
                            />
                            <label className="absolute left-4 -top-2 text-[10px] font-bold text-fern bg-[#FAF3E3] px-1">CONTACT NAME</label>
                          </div>
                        </div>

                        <div className="relative group">
                          <input 
                            type="text" 
                            required
                            placeholder="Building, street, apartment"
                            value={newAddr.street}
                            onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                            className="peer w-full h-14 px-4 bg-[#E6E6FA] border-2 border-natural/10 text-sm font-medium text-fern rounded-2xl outline-none transition-all focus:border-fern focus:shadow-sm"
                          />
                          <label className="absolute left-4 -top-2 text-[10px] font-bold text-fern bg-[#FAF3E3] px-1">STREET ADDRESS</label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="relative group">
                            <input 
                              type="text" 
                              required
                              placeholder="City, State, ZIP"
                              value={newAddr.city}
                              onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                              className="peer w-full h-14 px-4 bg-[#E6E6FA] border-2 border-natural/10 text-sm font-medium text-fern rounded-2xl outline-none transition-all focus:border-fern focus:shadow-sm"
                            />
                            <label className="absolute left-4 -top-2 text-[10px] font-bold text-fern bg-[#FAF3E3] px-1">CITY, STATE - ZIP</label>
                          </div>
                          <div className="relative group">
                            <input 
                              type="text" 
                              placeholder="Phone Number"
                              value={newAddr.phone}
                              onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                              className="peer w-full h-14 px-4 bg-[#E6E6FA] border-2 border-natural/10 text-sm font-medium text-fern rounded-2xl outline-none transition-all focus:border-fern focus:shadow-sm"
                            />
                            <label className="absolute left-4 -top-2 text-[10px] font-bold text-fern bg-[#FAF3E3] px-1">PHONE NUMBER</label>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full h-12 bg-fern hover:bg-apricot text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all cursor-pointer shadow-sm hover:shadow"
                        >
                          Save Address
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Address List Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {addresses.map((addr, index) => (
                      <div 
                        key={addr.id}
                        className="bg-[#E6E6FA] border-2 border-natural/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 group flex flex-col justify-between"
                      >
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#F4F4F0] flex items-center justify-center text-fern">
                                {addr.label.toLowerCase().includes('office') || addr.label.toLowerCase().includes('work') ? (
                                  <MapPin size={18} />
                                ) : (
                                  <MapPin size={18} />
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-sm text-fern uppercase tracking-widest block">
                                  {addr.label}
                                </span>
                                {index === 0 && (
                                  <span className="text-[9px] font-bold text-apricot uppercase tracking-widest">Default</span>
                                )}
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-natural hover:bg-red-50 hover:text-red-500 transition-colors" 
                              aria-label="Delete Address"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          <div className="pt-2 border-t border-natural/10 text-sm font-medium text-natural/90 space-y-1">
                            <p className="font-bold text-fern">{addr.name}</p>
                            <p className="leading-relaxed">{addr.street}</p>
                            <p className="leading-relaxed">{addr.city}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-natural uppercase tracking-widest">
                            <Smartphone size={14} className="text-natural/60" />
                            <span>{addr.phone || "No Phone"}</span>
                          </div>
                          <button className="text-xs font-bold text-fern hover:text-apricot transition-colors underline underline-offset-4 decoration-2 decoration-fern/30 hover:decoration-apricot">
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}

                    {addresses.length === 0 && (
                      <div className="sm:col-span-2 py-16 text-center bg-[#F4F4F0]/50 border-2 border-dashed border-natural/20 rounded-3xl">
                        <MapPin size={40} className="mx-auto text-natural/30 mb-4" />
                        <p className="text-sm font-semibold text-natural">No addresses saved yet.</p>
                        <p className="text-xs font-medium text-natural/70 mt-1">Add a destination for faster checkout.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Gift Cards */}
              {activeTab === "gift_cards" && (
                <div className="bg-[#F4F4F0] rounded-3xl p-6 sm:p-8 shadow-sm border border-natural/10 space-y-8 animate-fade-in">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-fern">Gift Cards</h2>
                    <p className="text-xs text-natural font-medium mt-1">Manage and purchase FACILE gift cards.</p>
                  </div>

                  <div className="border border-natural/20 rounded-3xl overflow-hidden bg-[#E6E6FA] shadow-sm transition-all hover:shadow-md">
                    <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-natural/10 gap-4">
                      <div>
                        <h3 className="font-bold text-sm text-fern uppercase tracking-widest">FACILE Gift Card</h3>
                        <p className="text-xs text-natural font-medium mt-1">Add a digital gift card to your wallet.</p>
                      </div>
                      <div className="flex gap-4 text-xs font-bold text-fern">
                        <span className="text-apricot uppercase tracking-widest font-serif font-bold bg-[#F4F4F0] px-4 py-2 rounded-xl">Wallet Balance: ₹{walletBalance.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                    
                    <div className="p-6 sm:p-8 bg-[#F4F4F0]/50 border-b border-natural/10 flex flex-col gap-6">
                      <button 
                        onClick={() => setShowAddGiftCard(!showAddGiftCard)}
                        className="h-10 px-6 bg-[#E6E6FA] border-2 border-natural/10 text-fern text-xs font-bold uppercase tracking-widest rounded-2xl cursor-pointer transition-all hover:border-fern shadow-sm hover:shadow flex items-center justify-center gap-2 max-w-xs"
                      >
                        <Plus size={16} className={showAddGiftCard ? "rotate-45 transition-transform" : "transition-transform"} /> 
                        {showAddGiftCard ? "Cancel" : "Add A Gift Card"}
                      </button>
                      
                      <AnimatePresence>
                        {showAddGiftCard && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 overflow-hidden"
                          >
                            <div className="relative group md:col-span-1">
                              <input 
                                inputMode="numeric" 
                                maxLength={16} 
                                value={giftCode} 
                                onChange={(event) => setGiftCode(event.target.value.replace(/\D/g, "").slice(0,16))} 
                                placeholder="16-digit card number" 
                                className="peer w-full h-14 px-4 bg-[#E6E6FA] border-2 border-natural/10 focus:border-fern text-sm font-medium tracking-widest text-fern rounded-2xl outline-none transition-all focus:shadow-sm" 
                              />
                              <label className="absolute left-4 -top-2 text-[10px] font-bold text-fern bg-[#F4F4F0] px-1 group-focus-within:bg-[#E6E6FA] transition-colors">CARD NUMBER</label>
                            </div>
                            <div className="relative group md:col-span-1">
                              <input 
                                type="password" 
                                inputMode="numeric" 
                                maxLength={3} 
                                value={giftPin} 
                                onChange={(event) => setGiftPin(event.target.value.replace(/\D/g, "").slice(0,3))} 
                                placeholder="3-digit PIN" 
                                className="peer w-full h-14 px-4 bg-[#E6E6FA] border-2 border-natural/10 focus:border-fern text-sm font-medium tracking-widest text-fern rounded-2xl outline-none transition-all focus:shadow-sm" 
                              />
                              <label className="absolute left-4 -top-2 text-[10px] font-bold text-fern bg-[#F4F4F0] px-1 group-focus-within:bg-[#E6E6FA] transition-colors">PIN</label>
                            </div>
                            <button 
                              disabled={giftBusy || giftCode.length !== 16 || giftPin.length !== 3} 
                              onClick={redeemGiftCard} 
                              className="h-14 px-8 bg-fern hover:bg-apricot text-white text-xs font-bold uppercase tracking-widest rounded-2xl cursor-pointer transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                            >
                              Add to Wallet
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="p-6 sm:p-8">
                      <div className="flex justify-between items-center mb-8">
                        <h3 className="font-bold text-sm text-fern uppercase tracking-widest">Buy a FACILE Gift Card</h3>
                      </div>
                      
                      <div className="flex gap-8 border-b-2 border-natural/10 mb-8 text-xs font-bold uppercase tracking-widest">
                        <button className="pb-4 border-b-2 border-fern text-fern -mb-0.5">Personal Gift Cards</button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                        {/* Form */}
                        <div className="space-y-6">
                          <div className="relative group">
                            <input 
                              type="email" 
                              placeholder="Receiver's Email ID *" 
                              value={receiverEmail}
                              onChange={(e) => setReceiverEmail(e.target.value)}
                              className="w-full h-14 px-4 bg-[#E6E6FA] border-2 border-natural/10 text-sm font-medium text-fern rounded-2xl focus:outline-none focus:border-fern transition-all" 
                            />
                            <label className="absolute left-4 -top-2 text-[10px] font-bold text-fern bg-[#E6E6FA] px-1">RECEIVER'S EMAIL</label>
                          </div>
                          <div className="relative group">
                            <input 
                              type="text" 
                              placeholder="Receiver's Name *" 
                              value={receiverName}
                              onChange={(e) => setReceiverName(e.target.value)}
                              className="w-full h-14 px-4 bg-[#E6E6FA] border-2 border-natural/10 text-sm font-medium text-fern rounded-2xl focus:outline-none focus:border-fern transition-all" 
                            />
                            <label className="absolute left-4 -top-2 text-[10px] font-bold text-fern bg-[#E6E6FA] px-1">RECEIVER'S NAME</label>
                          </div>
                          
                          <div className="flex gap-4">
                            <div className="flex-1 relative group">
                              <input 
                                type="number"
                                list="gift-card-values"
                                placeholder="Enter value"
                                value={giftCardValue || ""}
                                onChange={(e) => setGiftCardValue(Number(e.target.value))}
                                className="w-full h-14 px-4 bg-[#E6E6FA] border-2 border-natural/10 text-sm font-medium text-fern rounded-2xl focus:outline-none focus:border-fern transition-all"
                              />
                              <datalist id="gift-card-values">
                                <option value="500">₹ 500</option>
                                <option value="1000">₹ 1,000</option>
                                <option value="5000">₹ 5,000</option>
                                <option value="10000">₹ 10,000</option>
                              </datalist>
                              <label className="absolute left-4 -top-2 text-[10px] font-bold text-fern bg-[#E6E6FA] px-1">CARD VALUE (₹)</label>
                            </div>
                            <div className="w-28 relative group">
                              <input 
                                type="number" 
                                min="1"
                                max="5"
                                value={giftCardQty}
                                onChange={(e) => setGiftCardQty(Math.min(5, Math.max(1, Number(e.target.value))))}
                                className="w-full h-14 px-4 bg-[#E6E6FA] border-2 border-natural/10 text-sm font-medium text-fern rounded-2xl focus:outline-none focus:border-fern transition-all" 
                              />
                              <label className="absolute left-4 -top-2 text-[10px] font-bold text-fern bg-[#E6E6FA] px-1">QUANTITY</label>
                            </div>
                          </div>

                          <div className="relative group">
                            <input 
                              type="text" 
                              placeholder="Gifter's Name (Optional)" 
                              value={gifterName}
                              onChange={(e) => setGifterName(e.target.value)}
                              className="w-full h-14 px-4 bg-[#E6E6FA] border-2 border-natural/10 text-sm font-medium text-fern rounded-2xl focus:outline-none focus:border-fern transition-all" 
                            />
                            <label className="absolute left-4 -top-2 text-[10px] font-bold text-fern bg-[#E6E6FA] px-1">GIFTER'S NAME</label>
                          </div>
                          
                          <div className="relative group">
                            <textarea 
                              rows={3} 
                              placeholder="Write a personalized message... (Optional, 100 characters)" 
                              value={personalGiftMessage}
                              onChange={(e) => setPersonalGiftMessage(e.target.value)}
                              maxLength={100}
                              className="w-full p-4 bg-[#E6E6FA] border-2 border-natural/10 text-sm font-medium text-fern rounded-2xl focus:outline-none focus:border-fern transition-all resize-none min-h-[100px]" 
                            />
                            <label className="absolute left-4 -top-2 text-[10px] font-bold text-fern bg-[#E6E6FA] px-1">GIFT MESSAGE</label>
                          </div>
                          
                          <button 
                            onClick={handleBuyGiftCard}
                            disabled={isPurchasingGiftCard}
                            className="w-full h-14 bg-fern hover:bg-apricot text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all cursor-pointer shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-wait"
                          >
                            {isPurchasingGiftCard ? (
                              <span className="flex items-center justify-center gap-3">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processing...
                              </span>
                            ) : (
                              "Buy Gift Card Now"
                            )}
                          </button>
                        </div>

                        {/* Gift Card Preview */}
                        <div className="bg-gradient-to-br from-fern to-[#2C3B29] rounded-3xl p-8 h-72 flex flex-col justify-between text-warm-ivory shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                          {/* Pattern overlay */}
                          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-50" />
                          
                          <div className="flex justify-between items-start relative z-10">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Gift Card Value</p>
                              <p className="text-4xl font-serif">₹{(giftCardValue * giftCardQty).toLocaleString("en-IN")}</p>
                            </div>
                            <div className="flex items-center gap-3 font-serif text-2xl font-bold tracking-tight">
                              FACILE <Gift size={24} className="text-yellow-400" />
                            </div>
                          </div>
                          
                          {/* Decorative Elements */}
                          <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-center gap-2 opacity-90 pb-6 px-8 z-10 group-hover:gap-4 transition-all duration-500">
                            <div className="w-12 h-16 bg-gradient-to-t from-green-600 to-green-400 rounded-lg shadow-lg relative overflow-hidden group-hover:-translate-y-2 transition-transform duration-500 delay-75">
                              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-2 bg-yellow-400/50" />
                              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 bg-yellow-400/50" />
                            </div>
                            <div className="w-16 h-20 bg-gradient-to-t from-orange-600 to-orange-400 rounded-lg shadow-lg relative overflow-hidden flex justify-center group-hover:-translate-y-4 transition-transform duration-500 delay-100">
                              <div className="w-3 h-full bg-yellow-300" />
                              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3 bg-yellow-300" />
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-t from-red-600 to-red-400 rounded-lg shadow-lg relative overflow-hidden flex justify-center items-center group-hover:-translate-y-1 transition-transform duration-500 delay-150">
                              <div className="w-full h-3 bg-red-200" />
                              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-3 bg-red-200" />
                            </div>
                            <div className="w-10 h-18 bg-gradient-to-t from-teal-500 to-teal-300 rounded-lg shadow-lg relative overflow-hidden group-hover:-translate-y-3 transition-transform duration-500 delay-200">
                              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-2 bg-[#E6E6FA]/40" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Saved Cards */}
              {activeTab === "saved_cards" && (
                <div className="bg-[#E6E6FA] rounded-3xl p-6 sm:p-8 shadow-sm border border-natural/10 space-y-8 animate-fade-in">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-fern">Saved Cards</h2>
                    <p className="text-xs text-natural font-medium mt-1">Manage your saved credit and debit cards for faster checkout.</p>
                  </div>

                  <div className="border border-natural/20 rounded-3xl overflow-hidden bg-[#E6E6FA] shadow-sm">
                    <div className="p-6 flex justify-between items-center border-b border-natural/10 bg-[#F4F4F0]/50">
                      <h3 className="font-bold text-sm text-fern uppercase tracking-widest">Payment Methods</h3>
                      <span className="text-[10px] font-bold text-natural uppercase tracking-widest">{savedCards.length}/5 Cards Saved</span>
                    </div>
                    <div className="p-6 sm:p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {savedCards.map(card => (
                          <div key={card.id} className="border-2 border-natural/10 rounded-2xl p-6 flex justify-between items-start hover:border-fern/30 hover:shadow-md transition-all cursor-pointer bg-[#E6E6FA] group">
                            <div className="space-y-4">
                              <div className="w-14 h-9 bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg flex items-center justify-center text-white text-[10px] font-bold italic shadow-sm">
                                {card.type}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-fern">{card.name}</p>
                                <p className="text-xs font-mono font-medium text-natural mt-1">•••• •••• •••• {card.last4}</p>
                              </div>
                            </div>
                            <button onClick={() => handleRemoveCard(card.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-natural hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <button 
                        onClick={handleAddCard}
                        disabled={savedCards.length >= 5}
                        className="h-12 px-8 bg-[#E6E6FA] border-2 border-natural/10 text-fern text-xs font-bold uppercase tracking-widest rounded-2xl transition-all cursor-pointer hover:border-fern shadow-sm hover:shadow flex items-center justify-center gap-2 max-w-sm w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={16} /> Add New Card
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Saved UPI */}
              {activeTab === "saved_upi" && (
                <div className="bg-[#E6E6FA] rounded-3xl p-6 sm:p-8 shadow-sm border border-natural/10 space-y-8 animate-fade-in">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-fern">Saved UPI</h2>
                    <p className="text-xs text-natural font-medium mt-1">Manage your saved UPI IDs.</p>
                  </div>
                  <div className="border-2 border-dashed border-natural/20 rounded-3xl overflow-hidden bg-[#F4F4F0]/50 p-12 text-center flex flex-col items-center justify-center">
                    <WalletCards size={48} className="text-natural/30 mb-4" />
                    <p className="text-sm font-semibold text-natural">No saved UPI IDs found.</p>
                    <p className="text-xs text-natural/70 mt-1">Add a UPI ID during checkout to save it here.</p>
                  </div>
                </div>
              )}

              {/* Tab 5: Security */}
              {activeTab === "security" && (
                <div className="bg-[#E6E6FA] rounded-3xl p-6 sm:p-8 shadow-sm border border-natural/10 space-y-10 animate-fade-in">
                  {/* Password Change Form */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-fern">Account Credentials</h2>
                      <p className="text-xs text-natural font-medium mt-1">Update your password securely.</p>
                    </div>

                    <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-xl">
                      <div className="relative group">
                        <input type="email" readOnly value={user.email} className="peer w-full h-14 px-4 bg-[#F4F4F0] border-2 border-natural/5 text-sm font-medium text-fern rounded-2xl cursor-not-allowed text-opacity-70 outline-none" />
                        <label className="absolute left-4 -top-2 text-[10px] font-bold text-fern bg-[#E6E6FA] px-1">EMAIL ADDRESS</label>
                      </div>

                      <button
                        type="submit"
                        className="h-14 px-10 bg-fern hover:bg-apricot text-white text-xs font-bold uppercase tracking-widest rounded-2xl cursor-pointer transition-all shadow-sm hover:shadow active:scale-95 w-full sm:w-auto"
                      >
                        Send Reset Link
                      </button>
                    </form>

                    <AnimatePresence>
                      {passwordSuccess && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-3 bg-fern text-white p-4 rounded-2xl shadow-md max-w-xl"
                        >
                          <div className="w-6 h-6 bg-[#E6E6FA]/20 rounded-full flex items-center justify-center">
                            <Check size={12} className="stroke-[3px]" />
                          </div>
                          <p className="text-sm font-semibold">Password updated successfully!</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="h-px bg-natural/10" />

                  {/* Two-Factor Authentication (2FA) Setup */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-fern">Two-Factor Authentication (2FA)</h2>
                      <p className="text-xs text-natural font-medium mt-1">Secure your account with multi-factor passcodes.</p>
                    </div>

                    {user?.mfaEnabled ? (
                      <div className="border-2 border-green-500/20 rounded-3xl p-6 sm:p-8 bg-green-50/30 flex flex-col sm:flex-row items-start justify-between gap-6">
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-fern flex items-center gap-2 uppercase tracking-widest">
                            2FA is currently ENABLED
                            <span className="px-2.5 py-1 bg-green-500 text-white font-bold text-[9px] uppercase tracking-widest rounded-lg shadow-sm">Active</span>
                          </h4>
                          <p className="text-xs text-natural font-medium">
                            Your account is protected by TOTP code validation during sign in.
                          </p>
                        </div>
                        <button 
                          type="button" 
                          onClick={handleDisableMfa}
                          className="h-12 px-6 bg-[#E6E6FA] border-2 border-apricot/30 text-apricot hover:border-apricot hover:bg-apricot/5 text-xs font-bold uppercase tracking-widest rounded-2xl transition-all cursor-pointer shadow-sm self-start sm:self-center w-full sm:w-auto"
                        >
                          Disable 2FA
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="border-2 border-natural/10 rounded-3xl p-6 sm:p-8 bg-[#F4F4F0]/30 flex flex-col sm:flex-row items-start justify-between gap-6">
                          <div className="space-y-2 max-w-xl">
                            <h4 className="text-sm font-bold text-fern flex items-center gap-2 uppercase tracking-widest">
                              2FA is currently DISABLED
                              <span className="px-2.5 py-1 bg-apricot/10 text-apricot border border-apricot/20 font-bold text-[9px] uppercase tracking-widest rounded-lg">Recommended</span>
                            </h4>
                            <p className="text-xs text-natural font-medium leading-relaxed">
                              Add an extra layer of protection by requiring a code from your authenticator app on login.
                            </p>
                          </div>
                          {!showMfaSetup && (
                            <button 
                              type="button" 
                              onClick={handleSetupMfa}
                              className="h-12 px-8 bg-fern hover:bg-apricot text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all cursor-pointer shadow-sm hover:shadow self-start sm:self-center w-full sm:w-auto"
                            >
                              Enable 2FA
                            </button>
                          )}
                        </div>

                        <AnimatePresence>
                          {showMfaSetup && mfaSecretData && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="border-2 border-natural/10 rounded-3xl p-6 sm:p-8 bg-[#E6E6FA] shadow-sm space-y-6 max-w-2xl overflow-hidden"
                            >
                              <h4 className="text-sm font-bold text-fern uppercase tracking-widest">MFA Setup instructions</h4>
                              
                              <div className="flex flex-col sm:flex-row items-center gap-8 py-6 px-8 bg-[#F4F4F0]/50 rounded-2xl border border-natural/5">
                                {/* QR Code using Google Charts API */}
                                <div className="p-4 bg-[#E6E6FA] rounded-2xl shadow-sm">
                                  <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mfaSecretData.qrCodeUrl)}`}
                                    alt="Scan this TOTP QR Code"
                                    className="w-40 h-40"
                                  />
                                </div>
                                <div className="space-y-3 text-center sm:text-left">
                                  <p className="text-[10px] text-natural uppercase tracking-widest font-bold">Manual Setup Key</p>
                                  <code className="text-sm font-mono font-bold text-fern bg-[#E6E6FA] border border-natural/10 px-4 py-3 rounded-xl block shadow-sm select-all">
                                    {mfaSecretData.secret}
                                  </code>
                                  <p className="text-[10px] text-natural/70 font-medium max-w-[200px]">Scan the QR code or enter this key in your authenticator app.</p>
                                </div>
                              </div>

                              <form onSubmit={handleVerifyEnableMfa} className="space-y-3 max-w-md pt-4">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-natural block">Enter Authenticator Code</label>
                                <div className="flex gap-4">
                                  <input 
                                    type="text"
                                    maxLength={6}
                                    required
                                    placeholder="123456"
                                    value={mfaSetupCode}
                                    onChange={(e) => setMfaSetupCode(e.target.value.replace(/\D/g, ""))}
                                    className="w-full h-14 px-4 bg-[#E6E6FA] border-2 border-natural/10 focus:border-fern text-sm font-medium tracking-[0.2em] text-fern text-center rounded-2xl focus:outline-none focus:shadow-sm transition-all"
                                  />
                                  <button 
                                    type="submit"
                                    className="h-14 px-8 bg-fern hover:bg-apricot text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all cursor-pointer shadow-sm hover:shadow flex-shrink-0"
                                  >
                                    Verify
                                  </button>
                                </div>
                              </form>

                              {mfaErrorMsg && (
                                <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl inline-block">{mfaErrorMsg}</p>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-natural/10" />

                  {/* Active Device Sessions */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-fern">Active Sessions</h2>
                      <p className="text-xs text-natural font-medium mt-1">Manage and revoke active logins on your account.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {sessionsList.map((session) => (
                        <div 
                          key={session.id}
                          className="border-2 border-natural/10 rounded-3xl p-6 bg-[#E6E6FA] shadow-sm flex flex-col justify-between gap-6 hover:shadow-md transition-shadow group"
                        >
                          <div className="space-y-4">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-full bg-[#F4F4F0] flex items-center justify-center text-fern shrink-0">
                                <Smartphone size={18} />
                              </div>
                              <p className="text-sm font-bold text-fern line-clamp-2 leading-snug" title={session.userAgent}>
                                {session.userAgent || "Unknown Device"}
                              </p>
                            </div>
                            <div className="bg-[#F4F4F0]/50 p-4 rounded-2xl space-y-2">
                              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                <span className="text-natural">IP Address</span>
                                <span className="text-fern font-mono">{session.ipAddress || "Unknown"}</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                <span className="text-natural">Last Active</span>
                                <span className="text-fern">{new Date(session.lastActiveAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRevokeSession(session.id)}
                            className="h-12 w-full bg-[#E6E6FA] border-2 border-apricot/20 text-apricot hover:border-apricot hover:bg-apricot/5 text-xs font-bold uppercase tracking-widest rounded-2xl transition-all cursor-pointer"
                          >
                            Revoke Access
                          </button>
                        </div>
                      ))}
                      {sessionsList.length === 0 && (
                        <div className="md:col-span-2 py-12 text-center text-sm font-semibold text-natural bg-[#F4F4F0]/50 border-2 border-dashed border-natural/20 rounded-3xl">
                          No active login sessions tracked.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-natural/10" />

                  {/* Security Audit Logs */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-fern">Audit Trail</h2>
                      <p className="text-xs text-natural font-medium mt-1">Historical log of security activities for verification.</p>
                    </div>

                    <div className="border-2 border-natural/10 rounded-3xl overflow-hidden shadow-sm bg-[#E6E6FA]">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#F4F4F0]/50 text-[10px] font-bold uppercase tracking-widest text-natural border-b border-natural/10">
                              <th className="p-6">Action</th>
                              <th className="p-6">IP Address</th>
                              <th className="p-6">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-natural/10 text-sm">
                            {auditLogsList.map((log) => (
                              <tr key={log.id} className="hover:bg-[#F4F4F0]/30 transition-colors">
                                <td className="p-6 font-bold text-fern">{log.action}</td>
                                <td className="p-6 text-natural font-mono font-medium">{log.ipAddress || "N/A"}</td>
                                <td className="p-6 text-natural font-medium">{new Date(log.timestamp).toLocaleString()}</td>
                              </tr>
                            ))}
                            {auditLogsList.length === 0 && (
                              <tr>
                                <td colSpan={3} className="p-8 text-center text-natural font-semibold">
                                  No security audit logs available.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Reviews */}
              {activeTab === "reviews" && (
                <div className="bg-[#E6E6FA] rounded-3xl p-6 sm:p-8 shadow-sm border border-natural/10 space-y-8 animate-fade-in">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-fern">My Reviews & Ratings</h2>
                    <p className="text-xs text-natural font-medium mt-1">Manage the feedback you've left on products you purchased.</p>
                  </div>

                  {isLoadingReviews ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="w-8 h-8 border-4 border-fern border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : userReviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userReviews.map((review) => (
                        <div key={review.id} className="bg-[#E6E6FA] border-2 border-natural/10 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group">
                          <div className="space-y-4">
                            <div className="flex justify-between items-start gap-4 border-b border-natural/10 pb-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-1 bg-[#F4F4F0] px-3 py-1.5 rounded-full w-max">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-natural/30"} />
                                  ))}
                                </div>
                                <h3 className="font-bold text-sm text-fern line-clamp-1">{review.title || "Review"}</h3>
                              </div>
                              <span className="text-[10px] font-bold text-natural uppercase tracking-widest shrink-0 bg-[#F4F4F0]/50 px-2.5 py-1 rounded-lg">
                                {new Date(review.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-natural leading-relaxed font-medium line-clamp-3">
                              "{review.comment}"
                            </p>
                          </div>
                          
                          {review.product && (
                            <div className="mt-6 pt-4 border-t border-natural/10 flex items-center gap-4 bg-[#F4F4F0]/50 p-3 rounded-2xl group-hover:bg-[#F4F4F0] transition-colors">
                              <div className="w-14 h-14 bg-[#E6E6FA] rounded-xl overflow-hidden shrink-0 shadow-sm border border-natural/10 flex items-center justify-center">
                                {review.product.imageUrl ? (
                                  <img src={review.product.imageUrl} alt={review.product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <ShoppingBag size={20} className="text-natural/30" />
                                )}
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] font-bold text-natural uppercase tracking-widest">Reviewed Product</p>
                                <p className="text-xs font-bold text-fern leading-tight line-clamp-2">{review.product.name}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center bg-[#F4F4F0]/50 border-2 border-dashed border-natural/20 rounded-3xl">
                      <Star size={40} className="mx-auto text-natural/30 mb-4" />
                      <p className="text-sm font-semibold text-natural">You haven't reviewed any products yet.</p>
                      <p className="text-xs font-medium text-natural/70 mt-1">Share your thoughts on recent purchases.</p>
                    </div>
                  )}
                </div>
              )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

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
