"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart, CartItem } from "@/context/CartContext";
import { ShoppingBag, X, Plus, Minus, ArrowRight, Trash2, ChevronRight, ChevronLeft } from "lucide-react";

const HIDDEN_ROUTES = ["/checkout", "/login", "/register", "/admin", "/cart", "/success", "/profile"];

export default function FloatingCartSummary() {
  const { cart, updateQuantity, removeFromCart, setIsCartOpen } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  
  const [isVisible, setIsVisible] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(0);

  // Check if we should hide based on current route
  const isHiddenRoute = HIDDEN_ROUTES.some(route => pathname?.startsWith(route)) || pathname === "/";

  // Determine visibility based on route and cart contents
  useEffect(() => {
    if (isHiddenRoute) {
      setIsVisible(false);
    } else {
      setIsVisible(cart.length > 0);
    }
  }, [cart.length, isHiddenRoute, pathname]);

  // Adjust bottom position dynamically when footer enters viewport
  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        if (footerRect.top < windowHeight) {
          // Footer is entering the viewport
          const overlap = windowHeight - footerRect.top;
          setBottomOffset(overlap);
        } else {
          setBottomOffset(0);
        }
      }
    };

    if (isVisible) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Initial check
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible]);

  // Prevent overlap by adding padding to the main element when cart is visible
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        if (isVisible) {
          document.body.classList.add('cart-expanded');
        } else {
          document.body.classList.remove('cart-expanded');
        }
      } else {
        document.body.classList.remove('cart-expanded');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.classList.remove('cart-expanded');
    };
  }, [isVisible]);

  if (!isVisible || cart.length === 0) return null;

  // Calculate totals
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleOpenCart = () => {
    router.push("/cart");
  };

  return (
    <>
      {/* DESKTOP (Right panel) */}
      <div 
        className="hidden md:flex fixed right-0 top-[104px] z-[35] transition-all duration-300 ease-in-out w-[180px]"
        style={{ bottom: `${bottomOffset}px` }}
      >
        <div className="bg-[#F4F4F0] w-full shadow-[-4px_0_15px_rgba(0,0,0,0.05)] border-l border-gray-200 flex flex-col h-full relative">
              <div className="px-4 pb-4 pt-7 border-b border-natural/10 flex flex-col items-center text-center">
                <h3 className="text-xs font-semibold text-[#5271FF] mb-0.5">Subtotal</h3>
                <span className="text-lg font-extrabold text-[#5271FF] mb-3">₹{subtotal.toLocaleString("en-IN")}</span>
                <button 
                  onClick={handleOpenCart}
                  className="w-full h-9 bg-[#5271FF] hover:bg-[#3A56D4] text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  Go to Cart <ArrowRight size={13} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin p-0 space-y-0 pb-24">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex flex-col items-center gap-1 pb-6 pt-5 border-b border-gray-200 last:border-0 relative group">
                    <div 
                      className="w-full flex flex-col items-center justify-between cursor-pointer hover:opacity-80 transition-all gap-1"
                      onClick={() => router.push(`/product/${item.id}`)}
                      title={item.name}
                    >
                      <div className="w-full h-28 flex items-center justify-center">
                        <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                      </div>
                      <span className="text-[15px] font-bold text-black leading-tight text-center">₹{item.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                    
                    <div className="flex items-center justify-between w-[110px] h-[34px] rounded-full border-2 border-[#5271FF] bg-white px-2 mt-1">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (item.quantity === 1) {
                            removeFromCart(item.id);
                          } else {
                            updateQuantity(item.id, item.quantity - 1); 
                          }
                        }} 
                        className="flex h-full w-8 items-center justify-center text-black transition-colors hover:text-gray-700 active:scale-95"
                      >
                        {item.quantity === 1 ? <Trash2 size={15} /> : <Minus size={16} strokeWidth={2.5} />}
                      </button>
                      
                      <span className="flex-1 text-center text-sm font-bold text-black">{item.quantity}</span>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity + 1); }} 
                        disabled={item.quantity >= (item.maxOrderQuantity || 10)} 
                        className="flex h-full w-8 items-center justify-center text-black disabled:opacity-35 transition-colors hover:text-gray-700 active:scale-95"
                      >
                        <Plus size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>

      {/* MOBILE (Sticky Bottom Bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[40] bg-[#F4F4F0] border-t border-natural/20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-3 animate-slide-up pb-safe">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-natural uppercase tracking-wider">Subtotal ({totalItems} items)</span>
              <span className="text-sm font-extrabold text-[#5271FF]">₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
          </div>
          <button 
            onClick={handleOpenCart}
            className="h-10 px-5 bg-[#5271FF] hover:bg-[#3A56D4] text-white rounded-xl text-[13px] font-bold flex items-center justify-center shadow-sm"
          >
            Go to Cart
          </button>
        </div>
      </div>
    </>
  );
}
