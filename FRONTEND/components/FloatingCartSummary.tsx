"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart, CartItem } from "@/context/CartContext";
import { ShoppingBag, X, Plus, Minus, ArrowRight, Trash2, ChevronRight, ChevronLeft } from "lucide-react";

const HIDDEN_ROUTES = ["/checkout", "/login", "/register", "/admin", "/cart", "/success"];

export default function FloatingCartSummary() {
  const { cart, updateQuantity, removeFromCart, setIsCartOpen } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  
  const [isVisible, setIsVisible] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
        if (isVisible && !isCollapsed) {
          document.body.classList.add('cart-expanded');
          document.body.classList.remove('cart-collapsed');
        } else if (isVisible && isCollapsed) {
          document.body.classList.add('cart-collapsed');
          document.body.classList.remove('cart-expanded');
        } else {
          document.body.classList.remove('cart-expanded', 'cart-collapsed');
        }
      } else {
        document.body.classList.remove('cart-expanded', 'cart-collapsed');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.classList.remove('cart-expanded', 'cart-collapsed');
    };
  }, [isVisible, isCollapsed]);

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
        className={`hidden md:flex fixed right-0 top-[104px] z-[35] transition-all duration-300 ease-in-out ${isCollapsed ? 'w-[48px]' : 'w-[180px]'}`}
        style={{ bottom: `${bottomOffset}px` }}
      >
        <div className="bg-[#F4F4F0] w-full shadow-[-4px_0_15px_rgba(0,0,0,0.05)] border-l border-natural/20 flex flex-col h-full relative">
          
          {/* Toggle Button */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -left-5 top-1/2 -translate-y-1/2 bg-[#4A5568] text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform z-10 flex items-center justify-center border-2 border-[#F4F4F0]"
            title={isCollapsed ? "Expand Cart" : "Collapse Cart"}
          >
            {isCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>

          {isCollapsed ? (
            <div 
              className="flex flex-col items-center justify-center gap-3 cursor-pointer h-full hover:bg-natural/5 transition-colors pb-[15%]"
              onClick={() => setIsCollapsed(false)}
              title="View Cart Summary"
            >
              <div className="relative">
                <ShoppingBag size={20} className="text-[#4A5568]" />
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="px-4 pb-4 pt-7 border-b border-natural/10 flex flex-col items-center text-center">
                <h3 className="text-xs font-semibold text-[#4A5568] mb-0.5">Subtotal</h3>
                <span className="text-lg font-extrabold text-[#4A5568] mb-3">₹{subtotal.toLocaleString("en-IN")}</span>
                <button 
                  onClick={handleOpenCart}
                  className="w-full h-9 bg-[#4A5568] hover:bg-[#3A4354] text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  Go to Cart <ArrowRight size={13} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-3 pb-24">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex flex-col gap-2 pb-3 border-b border-natural/10 last:border-0 relative group">
                <div className="flex gap-2">
                  <div className="w-14 h-14 bg-white rounded border border-natural/15 flex-shrink-0 flex items-center justify-center p-0.5">
                    <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#4A5568] hover:text-fern cursor-pointer truncate leading-tight" onClick={() => router.push(`/product/${item.id}`)}>{item.name}</p>
                    {item.selectedSize && (
                      <p className="text-[10px] font-medium text-natural/70 mt-0.5">Size: {item.selectedSize}</p>
                    )}
                    <span className="text-xs font-extrabold text-[#4A5568] leading-tight mt-1">₹{item.price.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-1 rounded-md border border-natural/20 bg-white p-0.5 shadow-sm">
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity - 1); }} 
                      className="flex h-5 w-5 items-center justify-center rounded text-[#4A5568] hover:bg-natural/5 disabled:opacity-35 transition-colors"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="w-4 text-center text-[11px] font-bold text-[#4A5568]">{item.quantity}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity + 1); }} 
                      disabled={item.quantity >= (item.maxOrderQuantity || 10)} 
                      className="flex h-5 w-5 items-center justify-center rounded text-[#4A5568] hover:bg-natural/5 disabled:opacity-35 transition-colors"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }} 
                    className="text-natural/60 hover:text-red-500 transition-colors p-1"
                    title="Remove item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          </>
          )}
        </div>
      </div>

      {/* MOBILE (Sticky Bottom Bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[40] bg-[#F4F4F0] border-t border-natural/20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-3 animate-slide-up pb-safe">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-natural uppercase tracking-wider">Subtotal ({totalItems} items)</span>
              <span className="text-sm font-extrabold text-[#4A5568]">₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
          </div>
          <button 
            onClick={handleOpenCart}
            className="h-10 px-5 bg-[#4A5568] hover:bg-[#3A4354] text-white rounded-xl text-[13px] font-bold flex items-center justify-center shadow-sm"
          >
            Go to Cart
          </button>
        </div>
      </div>
    </>
  );
}
