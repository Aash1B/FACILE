"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle2 } from "lucide-react";

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, clearCart, isCartOpen, setIsCartOpen } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const router = useRouter();

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push("/cart");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-fern/45 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="absolute inset-y-0 right-0 pl-0 sm:pl-10 max-w-full flex">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md bg-[#F4F4F0] text-fern flex flex-col shadow-2xl border-l border-natural/20 animate-slide-in relative">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-natural/20 flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold tracking-wide flex items-center gap-2">
              <ShoppingBag size={20} className="text-apricot" />
              Your Shopping Bag ({totalItems})
            </h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 -mr-2 rounded-full text-fern hover:bg-natural/10 transition-colors"
              aria-label="Close drawer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Checkout Success Screen overlay */}
          {checkoutSuccess ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F4F4F0] animate-fade-in z-20">
              <div className="w-16 h-16 bg-fern text-warm-ivory rounded-full flex items-center justify-center mb-6 shadow-md">
                <CheckCircle2 size={36} className="text-apricot stroke-[2px]" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-3">Order Confirmed!</h3>
              <p className="text-sm text-natural max-w-xs mb-6">
                Thank you for supporting homegrown brands. We have notified the creators to pack your items!
              </p>
              <div className="px-4 py-2 bg-fern/5 border border-fern/10 rounded-lg text-xs text-natural font-medium max-w-xs">
                A confirmation email & SMS has been sent with tracking details from our brand partners.
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-4 bg-[#4A5568]/10 rounded-full text-[#4A5568]/70">
                      <ShoppingBag size={32} />
                    </div>
                    <div>
                      <p className="font-serif text-base font-semibold">Your bag is empty</p>
                      <p className="text-xs text-[#4A5568]/80 mt-1">Browse our featured brands to add slow crafted items!</p>
                    </div>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="px-6 py-2 bg-fern text-warm-ivory text-xs font-semibold rounded-full hover:bg-fern/90 transition-all shadow-sm"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center gap-4 p-3 bg-white border border-natural/15 rounded-xl shadow-xs hover:border-natural/40 transition-colors"
                    >
                      <img 
                        src={item.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300"} 
                        alt={item.name} 
                        className="w-16 h-16 object-cover rounded-lg bg-natural/10 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-[#4A5568]/70 uppercase tracking-wider block">
                          {item.brand}
                        </span>
                        <h4 className="text-xs font-semibold text-fern truncate mb-1">{item.name}</h4>
                        <p className="text-xs font-bold text-[#4A5568]">₹{item.price.toLocaleString("en-IN")}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end gap-2">
                        <button onClick={() => removeFromCart(item.id)} className="p-1 text-[#E8437F] hover:text-[#E8437F]/80 transition-colors" aria-label="Remove item">
                          <Trash2 size={14} />
                        </button>
                        
                        <div className="flex items-center border border-natural/20 rounded-full bg-natural/20 p-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-natural/10 rounded-full transition-colors text-[#4A5568]"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-natural/10 rounded-full transition-colors text-[#4A5568]"
                            aria-label="Increase quantity"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}

              </div>

              {/* Checkout Sticky Panel */}
              {cart.length > 0 && (
                <div className="border-t border-natural/20 bg-white p-6 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-[#4A5568]">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#4A5568]">
                      <span>Shipping</span>
                      <span>{subtotal >= 1500 ? "Free" : "₹99"}</span>
                    </div>
                    <div className="border-t border-natural/10 my-2 pt-2 flex justify-between text-sm font-bold text-fern">
                      <span>Total Amount</span>
                      <span>₹{(subtotal + (subtotal >= 1500 ? 0 : 99)).toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full h-11 bg-fern hover:bg-fern/95 active:scale-98 text-warm-ivory text-xs font-bold tracking-wider rounded-full shadow-md transition-all flex items-center justify-center gap-2 disabled:bg-fern/50"
                  >
                    {isCheckingOut ? (
                      <>
                        <div className="w-4.5 h-4.5 border-2 border-warm-ivory border-t-transparent rounded-full animate-spin" />
                        Connecting with UPI/Card...
                      </>
                    ) : (
                      <>
                        Proceed
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
