"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ShoppingBag,
  Info,
  ShieldCheck,
  Plus,
  Check,
  Truck
} from "lucide-react";

// Mock saved addresses (reused from user profile style)
const SAVED_ADDRESSES = [
  {
    id: 1,
    label: "Home (Default)",
    name: "Aashish Bharti",
    street: "124 Warm Ivory Lane, Sector 4",
    city: "New Delhi, Delhi",
    zip: "110001",
    phone: "+91 98765 43210"
  },
  {
    id: 2,
    label: "Design Studio",
    name: "Aashish Bharti",
    street: "Studio 8B, Fern Creative Hub",
    city: "Gurugram, Haryana",
    zip: "122002",
    phone: "+91 98765 43211"
  }
];

// Helper to format currency
const formatPrice = (amount: number) => {
  return `₹${amount.toLocaleString("en-IN")}`;
};

const PAYMENT_SERVICE_URL = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || "/api/payments";
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TDPsCfDkwT5N6j";

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.hasOwnProperty("Razorpay")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();

  // Address State
  const [selectedAddressId, setSelectedAddressId] = useState<number>(1);
  const [addresses, setAddresses] = useState(SAVED_ADDRESSES);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [customAddress, setCustomAddress] = useState({
    label: "Custom",
    name: "",
    street: "",
    city: "",
    zip: "",
    phone: ""
  });

  // Delivery slot states
  const [selectedDate, setSelectedDate] = useState("Tomorrow, Jul 14");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("Evening (3 PM - 6 PM)");

  // Payment popup & loading states
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("upi");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Mock checkout cart items if empty (so page can be demoed easily)
  const [checkoutItems, setCheckoutItems] = useState(cart);

  useEffect(() => {
    if (cart.length > 0) {
      setCheckoutItems(cart);
    }
  }, [cart]);

  // Demo helper: Fill cart with mock data if it's empty
  const populateDemoCart = () => {
    const mockItems = [
      {
        id: "bs1",
        name: "Smart Watch Series 5",
        price: 8999,
        brand: "facile Store",
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400",
        quantity: 1
      },
      {
        id: "bs2",
        name: "Wireless Headphones",
        price: 5999,
        brand: "facile Store",
        image: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=400",
        quantity: 2
      }
    ];
    setCheckoutItems(mockItems);
  };

  // Calculations
  const subtotal = checkoutItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Voucher Discount State
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    type: "PERCENT" | "FIXED";
    value: number;
    minOrder: number;
  } | null>(null);
  const [voucherError, setVoucherError] = useState("");
  const [voucherSuccess, setVoucherSuccess] = useState("");

  // Calculate discount
  let discountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.type === "PERCENT") {
      discountAmount = Math.round((subtotal * appliedVoucher.value) / 100);
    } else {
      discountAmount = Math.min(appliedVoucher.value, subtotal);
    }
  }

  // Free delivery for orders over ₹15,000, else ₹99 delivery charge
  const deliveryCharge = subtotal >= 15000 || subtotal === 0 ? 0 : 99;
  const platformFee = subtotal === 0 ? 0 : 5;
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryCharge + platformFee);

  const handleApplyVoucher = () => {
    setVoucherError("");
    setVoucherSuccess("");

    if (!voucherCodeInput.trim()) {
      setVoucherError("Please enter a voucher code.");
      return;
    }

    const code = voucherCodeInput.trim().toUpperCase();
    const stored = localStorage.getItem("facile_vouchers");
    const activeVouchers = stored ? JSON.parse(stored) : [];

    const found = activeVouchers.find((v: any) => v.code === code);
    if (!found) {
      setVoucherError("Invalid or expired voucher code.");
      return;
    }

    // Check expiry
    const today = new Date().toISOString().split("T")[0];
    if (found.expiry && found.expiry < today) {
      setVoucherError("This voucher code has expired.");
      return;
    }

    // Check min order constraint
    if (subtotal < found.minOrder) {
      setVoucherError(`Minimum order value of ₹${found.minOrder.toLocaleString("en-IN")} required.`);
      return;
    }

    setAppliedVoucher(found);
    setVoucherSuccess("Voucher applied successfully!");
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCodeInput("");
    setVoucherSuccess("");
    setVoucherError("");
  };

  const handleAddCustomAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAddress.name && customAddress.street && customAddress.city && customAddress.zip) {
      const newId = Date.now();
      const newAddr = { id: newId, ...customAddress };
      setAddresses([...addresses, newAddr]);
      setSelectedAddressId(newId);
      setIsAddingAddress(false);
      setCustomAddress({
        label: "Custom",
        name: "",
        street: "",
        city: "",
        zip: "",
        phone: ""
      });
    }
  };

  const handleProceedToPay = () => {
    if (checkoutItems.length === 0) {
      alert("Your cart is empty. Please add items to checkout.");
      return;
    }
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    if (selectedPaymentMethod === "cod") {
      setIsProcessing(true);
      setPaymentError(null);
      // Simulate payment transaction delay
      setTimeout(() => {
        setIsProcessing(false);
        setPaymentSuccess(true);
        clearCart();
      }, 2000);
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // 1. Call Backend to create order
      const response = await fetch(`${PAYMENT_SERVICE_URL}/payments/create-order?amount=${totalAmount}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to create Razorpay order (Status: ${response.status})`);
      }

      const orderData = await response.json();
      if (!orderData || !orderData.id) {
        throw new Error("Invalid order data received from the payment server.");
      }

      // 2. Dynamically load Razorpay SDK script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error("Failed to load Razorpay SDK. Please check your internet connection.");
      }

      // 3. Open Razorpay checkout popup
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.amount, // in paise
        currency: orderData.currency || "INR",
        name: "FACILE",
        description: `Payment for order of ${checkoutItems.reduce((acc, item) => acc + item.quantity, 0)} items`,
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=100",
        order_id: orderData.id,
        handler: function (paymentResponse: any) {
          // Payment successful!
          setIsProcessing(false);
          setPaymentSuccess(true);
          clearCart();
        },
        prefill: {
          name: activeAddress?.name || "",
          contact: activeAddress?.phone || "",
          email: user?.email || "",
        },
        theme: {
          color: "#424530", // Brand green (fern)
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      
      // If payment fails on checkout
      razorpayInstance.on("payment.failed", function (res: any) {
        setPaymentError(res.error.description || "Payment failed. Please try again.");
        setIsProcessing(false);
      });

      razorpayInstance.open();

    } catch (error: any) {
      console.error("Razorpay integration error:", error);
      setPaymentError(error.message || "An unexpected error occurred while processing payment.");
      setIsProcessing(false);
    }
  };

  // Get active address details
  const activeAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];

  if (paymentSuccess) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-sand px-4 py-16">
        <div className="max-w-md w-full bg-warm-ivory border border-natural/20 rounded-[32px] p-8 text-center shadow-xl animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-apricot via-natural to-fern" />

          <div className="w-20 h-20 bg-[#4A5568] text-natural rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border-4 border-natural">
            <CheckCircle2 size={44} className="text-[#E8A1C4] stroke-[2px] animate-bounce" />
          </div>

          <span className="text-[10px] font-extrabold tracking-wider text-apricot uppercase bg-apricot/10 px-3 py-1 rounded-full">
            Payment Completed
          </span>

          <h2 className="font-serif text-3xl font-extrabold text-slate-grey mt-4 mb-2">Order Confirmed!</h2>
          <p className="text-xs text-natural font-medium max-w-sm mx-auto mb-6 leading-relaxed">
            Thank you for shopping with us! Your payment was successful, and your order has been registered under
            <span className="text-fern font-bold block mt-1 font-mono">FC-{Math.floor(100000 + Math.random() * 900000)}</span>
          </p>

          <div className="bg-natural/40 border border-natural/15 rounded-2xl p-4.5 text-left text-xs text-slate-grey space-y-3 mb-8">
            <h4 className="font-bold border-b border-natural/10 pb-1.5 uppercase tracking-wider text-[10px] text-natural">Delivery Details</h4>
            <div className="space-y-1">
              <p className="font-bold">{activeAddress?.name}</p>
              <p className="text-natural leading-tight">{activeAddress?.street}</p>
              <p className="text-natural leading-tight">{activeAddress?.city} - {activeAddress?.zip}</p>
            </div>
            <div className="border-t border-natural/10 pt-2 flex justify-between font-bold text-natural text-[10px] uppercase">
              <span>Delivery Time</span>
              <span className="text-slate-grey">{selectedDate} • {selectedTimeSlot.split(" (")[0]}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push("/profile")}
              className="flex-1 h-11 border border-natural/35 text-slate-grey font-bold text-xs rounded-xl hover:border-[#4A5568] transition-all cursor-pointer bg-warm-ivory active:scale-98"
            >
              Order History
            </button>
            <button
              onClick={() => router.push("/")}
              className="flex-1 h-11 bg-[#4A5568] hover:bg-[#3B4455] text-natural font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-98 shadow"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand py-8 px-4 sm:px-6 lg:px-8 font-sans animate-fade-in">
      <div className="max-w-6xl mx-auto">

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-bold text-natural mb-6">
          <button onClick={() => router.back()} className="hover:text-[#4A5568] transition-colors flex items-center gap-1 font-bold cursor-pointer">
            <ArrowLeft size={13} />
            Back to Bag
          </button>
          <ChevronRight size={12} className="opacity-55" />
          <span className="text-[#4A5568]">Secure Checkout</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-grey mb-8 tracking-wide">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* LEFT 2/3 COLUMN: Address, Slots, Summary */}
          <div className="lg:col-span-2 space-y-8">

            {/* SECTION 1: Address Management */}
            <div className="border border-natural/20 rounded-[24px] p-6 shadow-xs relative overflow-hidden" style={{ backgroundColor: '#DDE0F0' }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#4A5568]" />
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-serif text-lg font-extrabold text-slate-grey flex items-center gap-2">
                  <MapPin size={18} className="text-[#E8A1C4]" />
                  1. Delivery Address
                </h2>
                {!isAddingAddress && (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="text-[11px] font-bold text-[#4A5568] hover:text-[#3B4455] transition-colors flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                  >
                    <Plus size={12} />
                    New Address
                  </button>
                )}
              </div>

              {/* Add Address Form */}
              {isAddingAddress && (
                <form onSubmit={handleAddCustomAddress} className="mb-6 p-4.5 bg-natural/15 border border-natural/20 rounded-2xl space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center mb-1 border-b border-natural/10 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-natural">Add custom shipping address</h3>
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="text-[10px] font-bold text-natural/70 hover:text-apricot uppercase tracking-wider cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-natural">Contact Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Recipient's Name"
                        value={customAddress.name}
                        onChange={(e) => setCustomAddress({ ...customAddress, name: e.target.value })}
                        className="w-full h-9 px-3 bg-warm-ivory border border-natural/25 focus:border-fern text-xs font-medium text-fern rounded-xl focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-natural">Phone Number</label>
                      <input
                        type="text"
                        required
                        placeholder="+91 XXXXX XXXXX"
                        value={customAddress.phone}
                        onChange={(e) => setCustomAddress({ ...customAddress, phone: e.target.value })}
                        className="w-full h-9 px-3 bg-warm-ivory border border-natural/25 focus:border-fern text-xs font-medium text-fern rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-natural">Street Address</label>
                    <input
                      type="text"
                      required
                      placeholder="Flat, building name, street, locality"
                      value={customAddress.street}
                      onChange={(e) => setCustomAddress({ ...customAddress, street: e.target.value })}
                      className="w-full h-9 px-3 bg-warm-ivory border border-natural/25 focus:border-fern text-xs font-medium text-fern rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-natural">City & State</label>
                      <input
                        type="text"
                        required
                        placeholder="New Delhi, Delhi"
                        value={customAddress.city}
                        onChange={(e) => setCustomAddress({ ...customAddress, city: e.target.value })}
                        className="w-full h-9 px-3 bg-warm-ivory border border-natural/25 focus:border-fern text-xs font-medium text-fern rounded-xl focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-natural">ZIP Code</label>
                      <input
                        type="text"
                        required
                        placeholder="110001"
                        value={customAddress.zip}
                        onChange={(e) => setCustomAddress({ ...customAddress, zip: e.target.value })}
                        className="w-full h-9 px-3 bg-warm-ivory border border-natural/25 focus:border-fern text-xs font-medium text-fern rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-9.5 bg-[#4A5568] hover:bg-[#3B4455] text-natural text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-[0.98] shadow-sm"
                  >
                    Confirm Custom Address
                  </button>
                </form>
              )}

              {/* Address Selection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`border p-4.5 rounded-2xl cursor-pointer relative transition-all duration-300 flex flex-col justify-between ${isSelected
                        ? "border-[#4A5568] bg-warm-ivory shadow-md text-black"
                        : "border-natural/20 hover:border-natural/40 bg-warm-ivory/80 hover:bg-warm-ivory shadow-xs text-fern/90"
                        }`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={`px-2.5 py-0.5 font-bold text-[9px] uppercase tracking-wider rounded-full text-black ${isSelected ? "bg-white border border-black/10 shadow-xs" : "bg-black/5 border border-black/5"
                            }`}>
                            {addr.label}
                          </span>
                          {isSelected && (
                            <div className="w-4 h-4 bg-[#4A5568] rounded-full flex items-center justify-center text-natural shadow-sm">
                              <Check size={10} className="stroke-[3.5px] text-[#E8A1C4]" />
                            </div>
                          )}
                        </div>
                        <div className={`text-xs font-semibold space-y-0.5 ${isSelected ? "text-black" : "text-fern/90"}`}>
                          <p className="font-bold">{addr.name}</p>
                          <p className="font-medium leading-relaxed">{addr.street}</p>
                          <p className="font-medium leading-relaxed">{addr.city} - {addr.zip}</p>
                        </div>
                      </div>

                      <div className={`border-t mt-3 pt-2 text-[10px] font-bold uppercase ${isSelected ? "border-black/10 text-black" : "border-fern/10 text-fern/80"}`}>
                        Phone: {addr.phone}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: Delivery Date & Time */}
            <div className="border border-natural/20 rounded-[24px] p-6 shadow-xs relative overflow-hidden" style={{ backgroundColor: '#DDE0F0' }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#4A5568]" />
              <h2 className="font-serif text-lg font-extrabold text-slate-grey flex items-center gap-2 mb-5">
                <Calendar size={18} className="text-[#E8A1C4]" />
                2. Delivery Schedule
              </h2>

              <div className="space-y-6">
                {/* Date Cards */}
                <div>
                  <h3 className="text-xs font-bold text-natural uppercase tracking-wider mb-3">Select Date</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Tomorrow", date: "Jul 14", value: "Tomorrow, Jul 14" },
                      { label: "Wednesday", date: "Jul 15", value: "Wed, Jul 15" },
                      { label: "Thursday", date: "Jul 16", value: "Thu, Jul 16" }
                    ].map((d) => {
                      const isSelected = selectedDate === d.value;
                      return (
                        <div
                          key={d.value}
                          onClick={() => setSelectedDate(d.value)}
                          className={`p-3 border rounded-xl text-center cursor-pointer transition-all ${isSelected
                            ? "border-[#4A5568] bg-warm-ivory font-bold shadow-xs text-black"
                            : "border-natural/20 hover:border-natural/40 bg-warm-ivory/80 hover:bg-warm-ivory text-fern/80"
                            }`}
                        >
                          <p className="text-[10px] font-bold uppercase tracking-wider opacity-85 leading-none">{d.label}</p>
                          <p className="text-sm font-extrabold mt-1">{d.date}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <h3 className="text-xs font-bold text-natural uppercase tracking-wider mb-3 flex items-center gap-1">
                    <Clock size={13} />
                    Select Preferable Time Slot
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "Morning (9 AM - 12 PM)",
                      "Afternoon (12 PM - 3 PM)",
                      "Evening (3 PM - 6 PM)",
                      "Night (6 PM - 9 PM)"
                    ].map((slot) => {
                      const isSelected = selectedTimeSlot === slot;
                      return (
                        <div
                          key={slot}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`p-3 border rounded-xl text-center text-xs cursor-pointer transition-all font-semibold ${isSelected
                            ? "border-[#4A5568] bg-warm-ivory font-bold shadow-xs text-black"
                            : "border-natural/20 hover:border-natural/40 bg-warm-ivory/80 hover:bg-warm-ivory text-fern/80"
                            }`}
                        >
                          {slot}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: Product Description / Summary */}
            <div className="border border-natural/20 rounded-[24px] p-6 shadow-xs relative overflow-hidden" style={{ backgroundColor: '#DDE0F0' }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#4A5568]" />
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-serif text-lg font-extrabold text-slate-grey flex items-center gap-2">
                  <ShoppingBag size={18} className="text-[#E8A1C4]" />
                  3. Order Summary ({checkoutItems.reduce((acc, item) => acc + item.quantity, 0)} items)
                </h2>
                {checkoutItems.length === 0 && (
                  <button
                    onClick={populateDemoCart}
                    className="text-[10px] font-bold text-[#4A5568] hover:text-apricot border border-[#4A5568]/20 hover:border-apricot px-2.5 py-1 rounded-lg bg-[#4A5568]/5 transition-all flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                  >
                    Demo Mock Items
                  </button>
                )}
              </div>

              {checkoutItems.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <p className="text-xs text-natural font-semibold">Your bag is empty on this checkout session.</p>
                  <p className="text-[10px] text-natural/80">Click the button above to load mock products and complete a test checkout.</p>
                </div>
              ) : (
                <div className="divide-y divide-natural/15">
                  {checkoutItems.map((item) => (
                    <div key={item.id} className="py-4.5 flex gap-4 first:pt-0 last:pb-0 items-center justify-between">
                      <div className="flex gap-3.5 items-center min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-xl bg-natural/30 border border-natural/15 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold text-natural uppercase tracking-wider block">{item.brand}</span>
                          <h4 className="text-xs font-bold text-warm-ivory truncate leading-snug">{item.name}</h4>
                          <span className="text-[10px] font-bold text-natural mt-1 block">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-extrabold text-warm-ivory">{formatPrice(item.price * item.quantity)}</p>
                        {item.quantity > 1 && (
                          <p className="text-[9px] text-natural font-medium mt-0.5">({formatPrice(item.price)} each)</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT 1/3 COLUMN: Bill Card & Payment */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-[120px]">

            {/* Secured Checkout Badge */}
            <div className="bg-[#4A5568] text-natural rounded-2xl p-4 flex items-center gap-3 border border-natural/20 shadow-sm">
              <ShieldCheck size={26} className="text-[#E8A1C4] stroke-[2.5px] flex-shrink-0" />
              <div>
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider">100% Secure Checkout</h4>
                <p className="text-[9px] text-natural/80 font-medium">SSL encryption protects your financial transactions.</p>
              </div>
            </div>

            {/* Bill Details */}
            <div className="border border-natural/20 rounded-[24px] p-6 shadow-sm space-y-5 relative overflow-hidden" style={{ backgroundColor: '#DDE0F0' }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#4A5568]" />
              <h2 className="font-serif text-base font-extrabold text-slate-grey pb-3 border-b border-natural/10 flex items-center justify-between">
                <span>Billing Details</span>
                <Info size={14} className="text-slate-grey" />
              </h2>

              <div className="space-y-3.5 text-xs text-natural font-semibold">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-warm-ivory font-bold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span>Delivery Charge</span>
                    {subtotal >= 15000 && (
                      <span className="text-[9px] bg-green-100 text-green-700 font-extrabold px-1.5 py-0.2 rounded-md uppercase tracking-wider">Free Option</span>
                    )}
                  </div>
                  <span className="text-warm-ivory font-bold">
                    {deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span className="text-warm-ivory font-bold">{formatPrice(platformFee)}</span>
                </div>

                {appliedVoucher && (
                  <div className="flex justify-between text-green-700 bg-green-500/10 p-2.5 rounded-xl border border-green-500/20">
                    <span className="font-bold">Discount ({appliedVoucher.code})</span>
                    <span className="font-extrabold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                {/* Promo Code Input */}
                <div className="border-t border-natural/10 pt-4 space-y-2">
                  <p className="text-[10px] font-bold text-natural uppercase tracking-wider">Promo Code / Voucher</p>
                  {appliedVoucher ? (
                    <div className="flex items-center justify-between bg-warm-ivory/40 p-3 rounded-xl border border-[#4A5568]/20">
                      <div>
                        <p className="text-xs font-bold text-black uppercase">{appliedVoucher.code}</p>
                        <p className="text-[9px] text-[#424530]/80 font-bold">Discount applied</p>
                      </div>
                      <button
                        onClick={handleRemoveVoucher}
                        className="text-[10px] font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={voucherCodeInput}
                          onChange={(e) => {
                            setVoucherCodeInput(e.target.value);
                            if (voucherError) setVoucherError("");
                            if (voucherSuccess) setVoucherSuccess("");
                          }}
                          placeholder="e.g. WELCOME10"
                          className="flex-1 h-9 px-3 text-xs font-medium rounded-xl border bg-warm-ivory outline-none focus:border-fern text-black placeholder-stone-400"
                          style={{ borderColor: 'rgba(66,69,48,0.2)' }}
                        />
                        <button
                          onClick={handleApplyVoucher}
                          className="h-9 px-4 bg-[#424530] font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer text-[#F4E6C7] transition-all hover:bg-stone-900"
                        >
                          Apply
                        </button>
                      </div>
                      {voucherError && (
                        <p className="text-[10px] font-bold text-red-600 animate-fade-in">⚠️ {voucherError}</p>
                      )}
                      {voucherSuccess && (
                        <p className="text-[10px] font-bold text-green-700 animate-fade-in">✓ {voucherSuccess}</p>
                      )}
                    </div>
                  )}
                </div>

                {subtotal < 15000 && subtotal > 0 && (
                  <div className="p-3 bg-apricot/5 border border-apricot/15 rounded-xl flex gap-2 items-start text-[10px] text-natural font-medium">
                    <Truck size={14} className="text-[#E8A1C4] flex-shrink-0 mt-0.5" />
                    <p>Add <span className="text-warm-ivory font-bold">{formatPrice(15000 - subtotal)}</span> more to qualify for <span className="text-warm-ivory font-bold">Free Delivery</span>!</p>
                  </div>
                )}

                <div className="border-t border-natural/15 pt-4 flex justify-between items-baseline text-sm font-extrabold text-natural">
                  <span className="font-serif text-slate-grey">Grand Total</span>
                  <span className="text-lg text-apricot">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Promo Code Box */}
              <div className="pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code"
                    className="flex-1 h-9 px-3 bg-natural/15 border border-natural/20 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4A5568] text-warm-ivory placeholder-natural/60"
                  />
                  <button className="h-9 px-3.5 bg-natural hover:bg-natural/90 active:scale-97 text-fern text-[10px] font-bold tracking-wider rounded-xl uppercase transition-all shadow-sm cursor-pointer">
                    Apply
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleProceedToPay}
                className="w-full h-12 bg-proceed-btn font-extrabold text-xs tracking-wider rounded-xl shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer uppercase"
              >
                Proceed to Pay
              </button>
            </div>

            {/* Powered By Razorpay */}
            <div className="flex justify-center items-center gap-2 opacity-95 py-2 text-[10px] font-bold text-natural uppercase tracking-wider select-none">
              <span>Powered by</span>
              <div className="bg-white px-2 py-1 rounded-lg flex items-center justify-center shadow-xs">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" 
                  alt="Razorpay" 
                  className="h-4 object-contain"
                />
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* SECURE PAYMENT MODAL (模拟支付网关) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">

          {/* Backdrop */}
          <div
            onClick={() => !isProcessing && setShowPaymentModal(false)}
            className="fixed inset-0 bg-[#4A5568]/50 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Modal Card */}
          <div className="relative border border-natural/20 rounded-[32px] max-w-md w-full p-6 shadow-2xl z-10 animate-fade-in text-natural" style={{ backgroundColor: '#DDE0F0' }}>

            {/* Close Button */}
            {!isProcessing && (
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentError(null);
                }}
                className="absolute top-4 right-4 text-natural hover:text-warm-ivory transition-colors p-1 cursor-pointer"
                aria-label="Close Payment Modal"
              >
                ✕
              </button>
            )}

            <div className="border-b border-natural/15 pb-4 mb-4">
              <h3 className="font-serif text-lg font-extrabold flex items-center gap-2">
                <CreditCard className="text-[#E8A1C4]" size={20} />
                Secure Checkout Payment
              </h3>
              <p className="text-[10px] text-natural font-bold uppercase tracking-wider mt-0.5">Payable Amount: {formatPrice(totalAmount)}</p>
            </div>

            {isProcessing ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-10 h-10 border-4 border-apricot border-t-transparent rounded-full animate-spin" />
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider">Processing Payment Gateway...</h4>
                  <p className="text-[10px] text-natural font-medium mt-1">Please do not refresh or click back. Directing connection to bank servers.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">

                {/* Payment Option Selector */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-natural uppercase tracking-wider">Select Mode of Payment</p>

                  {/* UPI Option */}
                  <label
                    onClick={() => setSelectedPaymentMethod("upi")}
                    className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all ${selectedPaymentMethod === "upi"
                      ? "border-[#4A5568] bg-warm-ivory font-bold shadow-xs text-black"
                      : "border-natural/20 hover:border-natural/35 bg-warm-ivory/60 text-fern/90"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={selectedPaymentMethod === "upi"}
                        onChange={() => setSelectedPaymentMethod("upi")}
                        className="accent-[#4A5568]"
                      />
                      <div className="text-left">
                        <p className="text-xs font-bold">UPI / Instant Pay</p>
                        <p className={`text-[9px] font-medium ${selectedPaymentMethod === "upi" ? "text-black/75" : "text-fern/70"}`}>Google Pay, PhonePe, Paytm, BHIM</p>
                      </div>
                    </div>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-3.5 object-contain" />
                  </label>

                  {/* Cards Option */}
                  <label
                    onClick={() => setSelectedPaymentMethod("card")}
                    className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all ${selectedPaymentMethod === "card"
                      ? "border-[#4A5568] bg-warm-ivory font-bold shadow-xs text-black"
                      : "border-natural/20 hover:border-natural/35 bg-warm-ivory/60 text-fern/90"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={selectedPaymentMethod === "card"}
                        onChange={() => setSelectedPaymentMethod("card")}
                        className="accent-[#4A5568]"
                      />
                      <div className="text-left">
                        <p className="text-xs font-bold">Credit or Debit Card</p>
                        <p className={`text-[9px] font-medium ${selectedPaymentMethod === "card" ? "text-black/75" : "text-fern/70"}`}>Visa, Mastercard, RuPay, Maestro</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-2.5 object-contain" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-3 object-contain" />
                    </div>
                  </label>

                  {/* COD Option */}
                  <label
                    onClick={() => setSelectedPaymentMethod("cod")}
                    className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all ${selectedPaymentMethod === "cod"
                      ? "border-[#4A5568] bg-warm-ivory font-bold shadow-xs text-black"
                      : "border-natural/20 hover:border-natural/35 bg-warm-ivory/60 text-fern/90"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={selectedPaymentMethod === "cod"}
                        onChange={() => setSelectedPaymentMethod("cod")}
                        className="accent-[#4A5568]"
                      />
                      <div className="text-left">
                        <p className="text-xs font-bold">Cash on Delivery (COD)</p>
                        <p className={`text-[9px] font-medium ${selectedPaymentMethod === "cod" ? "text-black/75" : "text-fern/70"}`}>Pay on delivery with Cash, Card or UPI</p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Sub-inputs based on selection */}
                {selectedPaymentMethod === "upi" && (
                  <div className="p-3.5 bg-warm-ivory border border-[#4A5568]/30 rounded-xl space-y-2 animate-fade-in text-xs text-center text-black font-bold shadow-xs">
                    <p>Secure payment via Razorpay.</p>
                    <p className="text-[10px] text-black/75 font-semibold">You can pay using Google Pay, PhonePe, Paytm, or BHIM in the next step.</p>
                  </div>
                )}

                {selectedPaymentMethod === "card" && (
                  <div className="p-3.5 bg-warm-ivory border border-[#4A5568]/30 rounded-xl space-y-2 animate-fade-in text-xs text-center text-black font-bold shadow-xs">
                    <p>Secure payment via Razorpay.</p>
                    <p className="text-[10px] text-black/75 font-semibold">Supports Visa, Mastercard, RuPay, and Maestro in the next step.</p>
                  </div>
                )}

                {/* Error Message */}
                {paymentError && (
                  <div className="p-3 bg-red-100 border border-red-200 rounded-xl text-red-700 text-xs font-semibold animate-fade-in animate-shake">
                    ⚠️ {paymentError}
                  </div>
                )}

                {/* Final Trigger Button */}
                <div className="pt-2 border-t border-natural/15">
                  <button
                    onClick={handleConfirmPayment}
                    className="w-full h-11 bg-proceed-btn font-extrabold text-xs tracking-wider rounded-xl uppercase shadow active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck size={14} className="stroke-[2.5px]" />
                    Pay {formatPrice(totalAmount)} Now
                  </button>
                  <p className="text-center text-[9px] text-natural font-medium mt-2 flex items-center justify-center gap-1">
                    🔒 SSL Secured Encryption Connection
                  </p>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
