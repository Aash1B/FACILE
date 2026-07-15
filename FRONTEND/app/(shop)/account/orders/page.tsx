"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  ShoppingBag,
  MapPin,
  Lock,
  Camera,
  ChevronRight,
  ChevronDown,
  PackageX,
  AlertTriangle
} from "lucide-react";

// TODO: replace with real logged-in user id once Member 2's auth/JWT is wired in
const USER_ID = "user123";
const API_BASE = "http://localhost:8081";

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
}

const formatPrice = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

// Handles both possible Jackson date shapes: ISO string, or [yyyy,MM,dd,HH,mm,ss] array
const formatDate = (raw: string | number[]) => {
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

const STATUS_STYLES: Record<Order["status"], { bg: string; text: string; dot: string; label: string }> = {
  PENDING:   { bg: "bg-amber-100",  text: "text-amber-800",  dot: "bg-amber-600",  label: "Pending" },
  CONFIRMED: { bg: "bg-blue-100",   text: "text-blue-800",   dot: "bg-blue-600",   label: "Confirmed" },
  SHIPPED:   { bg: "bg-indigo-100", text: "text-indigo-800", dot: "bg-indigo-600", label: "Shipped" },
  DELIVERED: { bg: "bg-green-100",  text: "text-green-800",  dot: "bg-green-600",  label: "Delivered" },
  CANCELLED: { bg: "bg-red-100",    text: "text-red-800",    dot: "bg-red-600",    label: "Cancelled" },
};

export default function OrderHistoryPage() {
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/orders/${USER_ID}`);
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch order history:", err);
        setError("Couldn't load your orders. Make sure the backend is running on port 8081.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const displayName = user ? user.name : "Guest User";

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans animate-fade-in" style={{ backgroundColor: "#F4F4F0" }}>
      <div className="max-w-6xl mx-auto">

        {!user && (
          <div className="mb-6 p-4 bg-apricot/10 border border-apricot/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-semibold text-fern">
            <p>You are currently viewing this page as a guest. Register or sign in to view your real order history.</p>
            <Link
              href="/login"
              className="px-4 py-2 bg-fern hover:bg-apricot text-warm-ivory rounded-xl transition-colors cursor-pointer flex-shrink-0 font-bold"
            >
              Sign In / Sign Up
            </Link>
          </div>
        )}

        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold tracking-wide text-fern">My Account</h1>
          <p className="text-xs text-natural font-medium mt-1">
            Manage your profile, view orders, and update shipping details.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#F4F4F0] border border-natural/20 rounded-2xl p-5 shadow-sm text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-apricot" />
              <div className="relative inline-block mt-2">
                <div className="w-16 h-16 bg-[#F4F4F0] text-fern border border-natural/20 rounded-full flex items-center justify-center font-serif text-2xl font-bold uppercase shadow-inner">
                  {displayName.slice(0, 2)}
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-fern text-warm-ivory rounded-full shadow hover:bg-apricot transition-colors duration-200" aria-label="Change photo">
                  <Camera size={12} />
                </button>
              </div>
              <h3 className="text-sm font-bold text-fern mt-3 truncate">{displayName}</h3>
              <p className="text-[10px] font-bold text-natural uppercase tracking-wider">
                {user ? "Member Since 2026" : "Guest Account"}
              </p>
            </div>

            <div className="bg-[#F4F4F0] border border-natural/20 rounded-2xl p-2 shadow-sm flex lg:flex-col overflow-x-auto lg:overflow-x-visible no-scrollbar gap-1">
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex-shrink-0 lg:w-full text-left text-natural hover:bg-warm-ivory/30 hover:text-fern"
              >
                <User size={15} />
                Profile Settings
              </Link>
              <button
                className="flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 flex-shrink-0 lg:w-full text-left bg-fern text-warm-ivory shadow-sm cursor-default"
              >
                <ShoppingBag size={15} />
                Order History
              </button>
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex-shrink-0 lg:w-full text-left text-natural hover:bg-warm-ivory/30 hover:text-fern"
              >
                <MapPin size={15} />
                Shipping Addresses
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex-shrink-0 lg:w-full text-left text-natural hover:bg-warm-ivory/30 hover:text-fern"
              >
                <Lock size={15} />
                Security
              </Link>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <div className="bg-[#F4F4F0] border border-natural/20 rounded-3xl p-6 sm:p-8 shadow-sm min-h-[480px]">
              <div className="mb-6">
                <h2 className="font-serif text-xl font-bold text-fern">Your Orders</h2>
                <p className="text-[11px] text-natural font-medium mt-0.5">
                  Track shipping details and history of previous orders.
                </p>
              </div>

              {isLoading && (
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-4 border-apricot border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-natural">Loading your orders...</p>
                </div>
              )}

              {!isLoading && error && (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-center">
                  <AlertTriangle size={28} className="text-apricot" />
                  <p className="text-xs font-semibold text-fern max-w-xs">{error}</p>
                </div>
              )}

              {!isLoading && !error && orders.length === 0 && (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-center">
                  <PackageX size={28} className="text-natural" />
                  <p className="text-xs font-semibold text-fern">No orders yet</p>
                  <p className="text-[11px] text-natural max-w-xs">
                    Items you order will show up here once checkout is complete.
                  </p>
                </div>
              )}

              {!isLoading && !error && orders.length > 0 && (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const isExpanded = expandedOrder === order.id;
                    const statusStyle = STATUS_STYLES[order.status] ?? STATUS_STYLES.PENDING;
                    return (
                      <div
                        key={order.id}
                        className="border border-natural/20 rounded-2xl overflow-hidden shadow-sm transition-all hover:border-natural/40 bg-warm-ivory/5"
                      >
                        <div
                          onClick={() => toggleOrder(order.id)}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4.5 gap-3 sm:gap-6 cursor-pointer bg-white"
                        >
                          <div className="grid grid-cols-2 sm:flex items-center gap-4 sm:gap-8 w-full sm:w-auto">
                            <div>
                              <p className="text-[9px] font-bold text-natural uppercase tracking-wider">Order ID</p>
                              <p className="text-xs font-bold text-fern mt-0.5 font-mono">{order.id.slice(-8)}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-natural uppercase tracking-wider">Placed On</p>
                              <p className="text-xs font-semibold text-fern mt-0.5">{formatDate(order.createdAt)}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-natural uppercase tracking-wider">Total Amount</p>
                              <p className="text-xs font-bold text-apricot mt-0.5">{formatPrice(order.totalAmount)}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-natural uppercase tracking-wider">Status</p>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold mt-1 tracking-wide uppercase ${statusStyle.bg} ${statusStyle.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                                {statusStyle.label}
                              </span>
                            </div>
                          </div>

                          <button className="text-natural hover:text-fern transition-colors self-end sm:self-center" aria-label="Toggle details">
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-natural/15 p-4.5 bg-warm-ivory/10 space-y-4 animate-fade-in">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-natural">Items in Order</h4>
                            <div className="divide-y divide-natural/10">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between py-3 first:pt-0 last:pb-0 text-xs">
                                  <div className="space-y-1">
                                    <p className="font-bold text-fern">{item.productName}</p>
                                    <p className="text-[10px] font-semibold text-natural">Qty: {item.quantity}</p>
                                  </div>
                                  <p className="font-bold text-fern">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                              ))}
                            </div>

                            <div className="border-t border-natural/10 pt-4 text-xs">
                              <p className="font-semibold text-natural">
                                Delivering to: <span className="text-fern font-bold">{order.shippingAddress}</span>
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}