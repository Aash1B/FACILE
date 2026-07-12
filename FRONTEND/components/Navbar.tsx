"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import { 
  Menu, 
  Heart, 
  ShoppingCart, 
  User, 
  Search, 
  ChevronDown
} from "lucide-react";

export default function Navbar() {
  const { cart, favorites, setIsCartOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalFavorites = favorites.length;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full shadow-sm bg-warm-ivory/90 backdrop-blur-md border-b border-natural/25">
      {/* Tier 1: Main Header Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          
          {/* Hamburger Menu (Left) */}
          <div className="flex items-center">
            <div
              className="p-2 -ml-2 rounded-full text-fern select-none"
              aria-label="Menu"
            >
              <Menu size={22} className="stroke-[2px]" />
            </div>
          </div>

          {/* Logo "facile" (Center) */}
          <div className="absolute left-1/2 -translate-x-1/2 flex justify-center">
            <a 
              href="#" 
              className="font-serif text-3xl font-bold tracking-[0.08em] text-fern hover:text-apricot transition-colors duration-300 relative group select-none"
            >
              facile
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-apricot transition-all duration-300 group-hover:w-full"></span>
            </a>
          </div>

          {/* Right Links & Icons */}
          <div className="flex items-center gap-2 sm:gap-4 font-sans text-sm font-medium z-10">
            <a 
              href="#testimonials" 
              className="hidden md:inline-block text-fern hover:text-apricot transition-colors duration-200"
            >
              Blogs
            </a>
            <a 
              href="#testimonials" 
              className="hidden md:inline-block text-fern hover:text-apricot transition-colors duration-200 mr-2"
            >
              FAQs
            </a>

            {/* Favorite Icon */}
            <a 
              href="#favorites" 
              className="p-2 rounded-full text-fern hover:bg-natural/10 transition-all duration-200 relative group"
              aria-label="Favorites"
            >
              <Heart 
                size={22} 
                className={`stroke-[2px] transition-transform group-hover:scale-110 ${totalFavorites > 0 ? 'fill-apricot text-apricot stroke-apricot' : ''}`} 
              />
              {totalFavorites > 0 && (
                <span className="absolute top-0 right-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-apricot text-[9px] font-bold text-warm-ivory ring-2 ring-warm-ivory animate-bounce">
                  {totalFavorites}
                </span>
              )}
            </a>

            {/* Shopping Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 rounded-full text-fern hover:bg-natural/10 transition-all duration-200 relative group focus:outline-none"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={22} className="stroke-[2px] transition-transform group-hover:scale-110" />
              {totalCartItems > 0 && (
                <span className="absolute top-0 right-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-apricot text-[9px] font-bold text-warm-ivory ring-2 ring-warm-ivory">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* User Profile Icon */}
            <a 
              href="#profile" 
              className="p-2 rounded-full text-fern hover:bg-natural/10 transition-all duration-200 group"
              aria-label="Profile"
            >
              <User size={22} className="stroke-[2px] transition-transform group-hover:scale-110" />
            </a>
          </div>
        </div>
      </div>

      {/* Tier 2: Pills & Search */}
      <div className="bg-warm-ivory/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          {/* Scrollable Pills & Search Row */}
          <div className="flex items-center justify-between gap-4 overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth py-2">
            
            {/* Left Pills */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* All Categories Dropdown Trigger */}
              <div className="relative">
                <button 
                  ref={buttonRef}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1 px-4 py-1.5 bg-white border border-natural/25 hover:border-fern hover:bg-warm-ivory/30 text-fern text-xs font-semibold rounded-full shadow-sm transition-all duration-200 focus:outline-none cursor-pointer"
                >
                  All Categories
                  <ChevronDown 
                    size={14} 
                    className={`text-natural transition-transform duration-200 ${isDropdownOpen ? "rotate-180 text-fern" : ""}`} 
                  />
                </button>
              </div>

              {/* New Arrivals */}
              <a 
                href="#best-sellers" 
                className="px-4 py-1.5 bg-white border border-natural/25 hover:border-fern hover:bg-warm-ivory/30 text-fern text-xs font-semibold rounded-full shadow-sm transition-all duration-200"
              >
                New Arrivals
              </a>

              {/* Trending Pill (Apricot Highlight) */}
              <a 
                href="#special-offer" 
                className="px-4 py-1.5 bg-white border border-apricot/30 text-apricot hover:bg-apricot/10 text-xs font-bold rounded-full shadow-sm transition-all duration-200 flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 bg-apricot rounded-full animate-ping" />
                Trending
              </a>
            </div>

            {/* Center Search Pill */}
            <div className="flex-1 max-w-md min-w-[200px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search brands, ceramics, slow fashion..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8.5 pl-4 pr-10 bg-white border border-natural/25 focus:border-fern focus:ring-1 focus:ring-fern text-xs text-fern rounded-full shadow-inner transition-all duration-200 placeholder:text-natural/60 focus:outline-none"
                />
                <button 
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-natural hover:text-fern transition-colors"
                  aria-label="Submit Search"
                >
                  <Search size={15} />
                </button>
              </div>
            </div>

            {/* Right Pills */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <a 
                href="#best-sellers" 
                className="px-4 py-1.5 bg-white border border-natural/25 hover:border-fern hover:bg-warm-ivory/30 text-fern text-xs font-semibold rounded-full shadow-sm transition-all duration-200"
              >
                Men
              </a>
              <a 
                href="#best-sellers" 
                className="px-4 py-1.5 bg-white border border-natural/25 hover:border-fern hover:bg-warm-ivory/30 text-fern text-xs font-semibold rounded-full shadow-sm transition-all duration-200"
              >
                Women
              </a>
              <a 
                href="#best-sellers" 
                className="px-4 py-1.5 bg-white border border-natural/25 hover:border-fern hover:bg-warm-ivory/30 text-fern text-xs font-semibold rounded-full shadow-sm transition-all duration-200"
              >
                Children
              </a>
              <a 
                href="#best-sellers" 
                className="px-4 py-1.5 bg-white border border-natural/25 hover:border-fern hover:bg-warm-ivory/30 text-fern text-xs font-semibold rounded-full shadow-sm transition-all duration-200"
              >
                Brands
              </a>
            </div>

          </div>

          {/* Dropdown Overlay (sibling to scroll container, parent is relative max-w-7xl) */}
          <div 
            ref={dropdownRef}
            className={`absolute left-4 sm:left-6 lg:left-8 top-full mt-1 w-48 bg-white border border-natural/20 rounded-xl shadow-lg transition-all duration-200 z-50 ${
              isDropdownOpen 
                ? "opacity-100 visible translate-y-0" 
                : "opacity-0 invisible -translate-y-2 pointer-events-none"
            }`}
          >
            <div className="py-1 text-xs text-fern font-medium">
              <a 
                href="#categories" 
                onClick={() => setIsDropdownOpen(false)}
                className="block px-4 py-2 hover:bg-warm-ivory hover:text-apricot transition-colors"
              >
                Jewelry & Accessories
              </a>
              <a 
                href="#categories" 
                onClick={() => setIsDropdownOpen(false)}
                className="block px-4 py-2 hover:bg-warm-ivory hover:text-apricot transition-colors"
              >
                Home Decor
              </a>
              <a 
                href="#categories" 
                onClick={() => setIsDropdownOpen(false)}
                className="block px-4 py-2 hover:bg-warm-ivory hover:text-apricot transition-colors"
              >
                Ceramics & Pottery
              </a>
              <a 
                href="#categories" 
                onClick={() => setIsDropdownOpen(false)}
                className="block px-4 py-2 hover:bg-warm-ivory hover:text-apricot transition-colors"
              >
                Beauty & Skincare
              </a>
              <a 
                href="#categories" 
                onClick={() => setIsDropdownOpen(false)}
                className="block px-4 py-2 hover:bg-warm-ivory hover:text-apricot transition-colors"
              >
                Bags & Wallets
              </a>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
