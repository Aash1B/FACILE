"use client";

import React, { useEffect, useState } from "react";
import { useCart, CartItem } from "@/context/CartContext";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Bookmark,
  RotateCcw
} from "lucide-react";

const SAVED_KEY = "facile_saved_for_later";

const formatPrice = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, addToCart } = useCart();
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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
  }, []);

  const persistSaved = (items: CartItem[]) => {
    setSavedItems(items);
    if (typeof window !== "undefined") {
      localStorage.setItem(SAVED_KEY, JSON.stringify(items));
    }
  };

  const handleIncrease = (item: CartItem) => {
    const maxQty = item.maxOrderQuantity || 10;
    if (item.quantity < maxQty) {
      updateQuantity(item.id, item.quantity + 1);
    }
  };

  const handleDecrease = (item: CartItem) => {
    if (item.quantity === 1) {
      removeFromCart(item.id);
    } else {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
  };

  const handleSaveForLater = (item: CartItem) => {
    removeFromCart(item.id);
    persistSaved([...savedItems.filter(s => s.id !== item.id), item]);
  };

  const handleMoveToCart = async (item: CartItem) => {
    await addToCart(item, item.quantity);
    persistSaved(savedItems.filter((s) => s.id !== item.id));
  };

  const handleRemoveSaved = (productId: string) => {
    persistSaved(savedItems.filter((s) => s.id !== productId));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const grandTotal = subtotal + shipping;
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-apricot border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-fern">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 font-sans animate-fade-in bg-sand">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">

        <h1 className="text-3xl sm:text-4xl lg:text-4xl font-extrabold text-[#4A5568] tracking-tight mt-8 mb-8">
          Your Shopping Bag {totalItems > 0 && `(${totalItems})`}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          <div className="lg:col-span-2 space-y-8">

            <div className="bg-[#DDE0F0] border border-natural/20 rounded-[24px] p-6 shadow-sm">
              <h2 className="font-serif text-lg font-extrabold text-fern flex items-center gap-2 mb-5">
                <ShoppingBag size={18} className="text-apricot" />
                Cart Items
              </h2>

              {cart.length === 0 ? (
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
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="py-4.5 flex flex-col sm:flex-row gap-4 first:pt-0 last:pb-0 sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300"}
                          alt={item.name}
                          className="h-14 w-14 flex-shrink-0 rounded-xl object-cover bg-natural/10"
                        />
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold text-natural uppercase tracking-wider block">
                            {item.brand || "Facile"}
                          </span>
                          <h4 className="text-sm font-bold text-fern leading-snug">{item.name}</h4>
                          {item.selectedSize && (
                            <p className="text-[10px] font-bold text-blue-600 mt-0.5 opacity-90">
                              Size: {item.selectedSize}
                            </p>
                          )}
                          <p className="text-xs font-bold text-apricot mt-1">{formatPrice(item.price)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="flex items-center border border-natural/25 rounded-full bg-white p-0.5">
                          <button
                            onClick={() => handleDecrease(item)}
                            className="p-1.5 hover:bg-natural/20 rounded-full transition-colors text-fern disabled:cursor-not-allowed cursor-pointer"
                            aria-label={item.quantity === 1 ? "Remove item" : "Decrease quantity"}
                          >
                            {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-fern">{item.quantity}</span>
                          <button
                            onClick={() => handleIncrease(item)}
                            className="p-1.5 hover:bg-natural/20 rounded-full transition-colors text-fern disabled:cursor-not-allowed cursor-pointer"
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
                            className="flex items-center gap-1 text-[10px] font-bold text-natural hover:text-fern transition-colors disabled:cursor-not-allowed uppercase tracking-wide cursor-pointer"
                          >
                            <Bookmark size={13} />
                            Save for Later
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {savedItems.length > 0 && (
              <div className="bg-[#DDE0F0] border border-natural/20 rounded-[24px] p-6 shadow-sm">
                <h2 className="font-serif text-lg font-extrabold text-fern flex items-center gap-2 mb-1">
                  <Bookmark size={18} className="text-apricot" />
                  Saved for Later ({savedItems.length})
                </h2>
                <p className="text-[10px] text-natural font-medium mb-5">
                  Saved on this device only — won&apos;t appear on other devices.
                </p>

                <div className="divide-y divide-natural/15">
                  {savedItems.map((item) => (
                    <div
                      key={item.id}
                      className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-fern leading-snug">{item.name}</h4>
                        <p className="text-xs font-bold text-apricot mt-1">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleMoveToCart(item)}
                          className="flex items-center gap-1.5 h-8 px-3 bg-fern hover:bg-fern/90 text-warm-ivory text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                        >
                          <RotateCcw size={12} />
                          Move to Cart
                        </button>
                        <button
                          onClick={() => handleRemoveSaved(item.id)}
                          className="p-1.5 text-natural hover:text-red-500 transition-colors cursor-pointer"
                          aria-label="Remove from saved"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
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
                  cart.length > 0
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
