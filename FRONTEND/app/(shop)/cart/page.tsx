"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Bookmark,
  RotateCcw,
  AlertTriangle
} from "lucide-react";

const API_BASE = "http://localhost:8081";
const SAVED_KEY = "facile_saved_for_later";

interface CartItem {
  productId: string;
  productName: string;
  image?: string;
  price: number;
  quantity: number;
  selectedSize?: string | null;
}

interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
}

const formatPrice = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

export default function CartPage() {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);

  const getGuestCartItems = (): CartItem[] => {
    const saved = localStorage.getItem("facile_cart");
    if (!saved) return [];
    try {
      const items = JSON.parse(saved);
      return items.map((i: any) => ({
        productId: i.id || i.productId,
        productName: i.name || i.productName,
        price: i.price,
        image: i.image,
        quantity: i.quantity,
        selectedSize: i.selectedSize
      }));
    } catch {
      return [];
    }
  };

  const setGuestCartItems = (items: CartItem[]) => {
    const toSave = items.map(i => ({
      id: i.productId,
      name: i.productName,
      price: i.price,
      image: i.image,
      quantity: i.quantity,
      brand: "Facile"
    }));
    localStorage.setItem("facile_cart", JSON.stringify(toSave));
    const totalAmount = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    setCart({ id: "guest", userId: "guest", items, totalAmount });
    window.dispatchEvent(new Event('storage'));
  };

  const fetchCart = async () => {
    try {
      if (user?.email) {
        const res = await fetch(`${API_BASE}/api/cart/${user.email}`);
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const data = await res.json();
        setCart(data);
      } else {
        const items = getGuestCartItems();
        const totalAmount = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
        setCart({ id: "guest", userId: "guest", items, totalAmount });
      }
      setError(null);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setError("Couldn't load your cart. Make sure the backend is running on port 8081.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SAVED_KEY);
      if (saved) {
        try {
          setSavedItems(JSON.parse(saved));
        } catch (e) {
          console.error("Error parsing saved-for-later data", e);
        }
      }
    }
  }, [user]);

  const persistSaved = (items: CartItem[]) => {
    setSavedItems(items);
    if (typeof window !== "undefined") {
      localStorage.setItem(SAVED_KEY, JSON.stringify(items));
    }
  };

  const handleIncrease = async (item: CartItem) => {
    setPendingProductId(item.productId);
    try {
      if (user?.email) {
        const res = await fetch(`${API_BASE}/api/cart/${user.email}/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            quantity: 1
          })
        });
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const data = await res.json();
        setCart(data);
      } else {
        const items = getGuestCartItems();
        const existing = items.find(i => i.productId === item.productId);
        if (existing) {
          existing.quantity += 1;
        } else {
          items.push({ ...item, quantity: 1 });
        }
        setGuestCartItems(items);
      }
    } catch (err) {
      console.error("Failed to increase quantity:", err);
      setError("Couldn't update quantity. Try again.");
    } finally {
      setPendingProductId(null);
    }
  };

  const handleDecrease = async (item: CartItem) => {
    setPendingProductId(item.productId);
    try {
      if (user?.email) {
        const removeRes = await fetch(
          `${API_BASE}/api/cart/${user.email}/remove/${item.productId}`,
          { method: "DELETE" }
        );
        if (!removeRes.ok) throw new Error(`Server responded with ${removeRes.status}`);

        if (item.quantity > 1) {
          const addRes = await fetch(`${API_BASE}/api/cart/${user.email}/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: item.productId,
              productName: item.productName,
              price: item.price,
              quantity: item.quantity - 1
            })
          });
          if (!addRes.ok) throw new Error(`Server responded with ${addRes.status}`);
          const data = await addRes.json();
          setCart(data);
        } else {
          const data = await removeRes.json();
          setCart(data);
        }
      } else {
        let items = getGuestCartItems();
        const existing = items.find(i => i.productId === item.productId);
        if (existing) {
          existing.quantity -= 1;
          if (existing.quantity <= 0) {
            items = items.filter(i => i.productId !== item.productId);
          }
        }
        setGuestCartItems(items);
      }
    } catch (err) {
      console.error("Failed to decrease quantity:", err);
      setError("Couldn't update quantity. Try again.");
    } finally {
      setPendingProductId(null);
    }
  };

  const handleRemove = async (productId: string) => {
    setPendingProductId(productId);
    try {
      if (user?.email) {
        const res = await fetch(`${API_BASE}/api/cart/${user.email}/remove/${productId}`, {
          method: "DELETE"
        });
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const data = await res.json();
        setCart(data);
      } else {
        const items = getGuestCartItems().filter(i => i.productId !== productId);
        setGuestCartItems(items);
      }
    } catch (err) {
      console.error("Failed to remove item:", err);
      setError("Couldn't remove item. Try again.");
    } finally {
      setPendingProductId(null);
    }
  };

  const handleSaveForLater = async (item: CartItem) => {
    setPendingProductId(item.productId);
    try {
      if (user?.email) {
        const res = await fetch(`${API_BASE}/api/cart/${user.email}/remove/${item.productId}`, {
          method: "DELETE"
        });
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const data = await res.json();
        setCart(data);
      } else {
        const items = getGuestCartItems().filter(i => i.productId !== item.productId);
        setGuestCartItems(items);
      }
      persistSaved([...savedItems, item]);
    } catch (err) {
      console.error("Failed to save item for later:", err);
      setError("Couldn't save item for later. Try again.");
    } finally {
      setPendingProductId(null);
    }
  };

  const handleMoveToCart = async (item: CartItem) => {
    setPendingProductId(item.productId);
    try {
      if (user?.email) {
        const res = await fetch(`${API_BASE}/api/cart/${user.email}/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity
          })
        });
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const data = await res.json();
        setCart(data);
      } else {
        const items = getGuestCartItems();
        const existing = items.find(i => i.productId === item.productId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          items.push({ ...item });
        }
        setGuestCartItems(items);
      }
      persistSaved(savedItems.filter((s) => s.productId !== item.productId));
    } catch (err) {
      console.error("Failed to move item to cart:", err);
      setError("Couldn't move item to cart. Try again.");
    } finally {
      setPendingProductId(null);
    }
  };

  const handleRemoveSaved = (productId: string) => {
    persistSaved(savedItems.filter((s) => s.productId !== productId));
  };

  const subtotal = cart?.totalAmount ?? 0;
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const grandTotal = subtotal + shipping;
  const totalItems = cart?.items.reduce((acc, i) => acc + i.quantity, 0) ?? 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#faf3e3" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-apricot border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-fern">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 font-sans animate-fade-in" style={{ backgroundColor: "#faf3e3" }}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">

        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-fern mb-8 tracking-wide">
          Your Shopping Bag {totalItems > 0 && `(${totalItems})`}
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs font-semibold text-red-800">
            <AlertTriangle size={18} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          <div className="lg:col-span-2 space-y-8">

            <div className="bg-white border border-natural/20 rounded-[24px] p-6 shadow-sm">
              <h2 className="font-serif text-lg font-extrabold text-fern flex items-center gap-2 mb-5">
                <ShoppingBag size={18} className="text-apricot" />
                Cart Items
              </h2>

              {!cart || cart.items.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <p className="text-sm font-semibold text-natural">Your cart is empty.</p>
                  <Link
                    href="/"
                    className="inline-block px-6 py-2 bg-fern text-warm-ivory text-xs font-bold rounded-full hover:bg-fern/90 transition-all"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-natural/15">
                  {cart.items.map((item) => {
                    const isPending = pendingProductId === item.productId;
                    return (
                      <div
                        key={item.productId}
                        className={`py-4.5 flex flex-col sm:flex-row gap-4 first:pt-0 last:pb-0 sm:items-center sm:justify-between transition-opacity ${isPending ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300"}
                            alt={item.productName}
                            className="h-14 w-14 flex-shrink-0 rounded-xl object-cover bg-natural/10"
                          />
                          <div className="min-w-0">
                            <span className="text-[9px] font-bold text-natural uppercase tracking-wider block">Facile</span>
                            <h4 className="text-sm font-bold text-fern leading-snug">{item.productName}</h4>
                            {item.selectedSize && (
                              <p className="text-[10px] font-bold text-blue-600 mt-0.5 opacity-90">Size: {item.selectedSize}</p>
                            )}
                            <p className="text-xs font-bold text-apricot mt-1">{formatPrice(item.price)}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="flex items-center border border-natural/25 rounded-full bg-natural/10 p-0.5">
                            <button
                              onClick={() => item.quantity === 1 ? handleRemove(item.productId) : handleDecrease(item)}
                              disabled={isPending}
                              className="p-1.5 hover:bg-natural/20 rounded-full transition-colors text-fern disabled:cursor-not-allowed"
                              aria-label={item.quantity === 1 ? "Remove item" : "Decrease quantity"}
                            >
                              {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                            </button>
                            <span className="w-7 text-center text-xs font-bold text-fern">{item.quantity}</span>
                            <button
                              onClick={() => handleIncrease(item)}
                              disabled={isPending}
                              className="p-1.5 hover:bg-natural/20 rounded-full transition-colors text-fern disabled:cursor-not-allowed"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <p className="text-sm font-extrabold text-fern w-20 text-right">
                            {formatPrice(item.price * item.quantity)}
                          </p>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleSaveForLater(item)}
                              disabled={isPending}
                              className="flex items-center gap-1 text-[10px] font-bold text-natural hover:text-fern transition-colors disabled:cursor-not-allowed uppercase tracking-wide"
                            >
                              <Bookmark size={13} />
                              Save for Later
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {savedItems.length > 0 && (
              <div className="bg-white border border-natural/20 rounded-[24px] p-6 shadow-sm">
                <h2 className="font-serif text-lg font-extrabold text-fern flex items-center gap-2 mb-1">
                  <Bookmark size={18} className="text-apricot" />
                  Saved for Later ({savedItems.length})
                </h2>
                <p className="text-[10px] text-natural font-medium mb-5">
                  Saved on this device only — won't appear on other devices.
                </p>

                <div className="divide-y divide-natural/15">
                  {savedItems.map((item) => {
                    const isPending = pendingProductId === item.productId;
                    return (
                      <div
                        key={item.productId}
                        className={`py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0 transition-opacity ${isPending ? "opacity-50" : ""}`}
                      >
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-fern leading-snug">{item.productName}</h4>
                          <p className="text-xs font-bold text-apricot mt-1">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleMoveToCart(item)}
                            disabled={isPending}
                            className="flex items-center gap-1.5 h-8 px-3 bg-fern hover:bg-fern/90 text-warm-ivory text-[10px] font-bold rounded-lg transition-all disabled:cursor-not-allowed"
                          >
                            <RotateCcw size={12} />
                            Move to Cart
                          </button>
                          <button
                            onClick={() => handleRemoveSaved(item.productId)}
                            className="p-1.5 text-natural hover:text-red-500 transition-colors"
                            aria-label="Remove from saved"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 lg:sticky lg:top-[100px]">
            <div className="bg-white border border-natural/20 rounded-[24px] p-6 shadow-sm space-y-4">
              <h2 className="font-serif text-base font-extrabold text-fern pb-3 border-b border-natural/10">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs text-natural font-semibold">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-fern font-bold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-fern font-bold">{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                </div>
                <div className="border-t border-natural/15 pt-3 flex justify-between items-baseline text-sm font-extrabold text-[#5271FF]">
                  <span className="font-serif text-[#5271FF]">Total</span>
                  <span className="text-lg text-[#5271FF]">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className={`w-full h-12 flex items-center justify-center gap-2 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all shadow-md ${
                  cart && cart.items.length > 0
                    ? "bg-[#5271FF] hover:bg-[#3A56D4] text-white active:scale-98"
                    : "bg-natural/30 text-natural cursor-not-allowed pointer-events-none"
                }`}
              >
                Proceed to Checkout
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}