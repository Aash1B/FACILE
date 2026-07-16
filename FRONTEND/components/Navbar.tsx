"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  Menu,
  Heart,
  ShoppingCart,
  User,
  Search,
  ChevronDown,
  ChevronRight,
  LogOut,
  X,
  Home,
  Store,
  LayoutGrid,
  Sparkles,
  TrendingUp,
  Package,
  MapPin,
  Info,
  Mail,
  HelpCircle
} from "lucide-react";

const SUBCATEGORIES: Record<string, string[]> = {
  "Jewelry & Accessories": ["Necklaces", "Earrings", "Rings", "Bracelets", "Watches"],
  "Home Decor": ["Candles", "Wall Art", "Cushions", "Rugs", "Planters"],
  "Ceramics & Pottery": ["Mugs", "Bowls", "Vases", "Plates", "Figurines"],
  "Beauty & Skincare": ["Face Care", "Body Care", "Hair Care", "Serums", "Natural Oils"],
  "Bags & Wallets": ["Tote Bags", "Clutches", "Backpacks", "Wallets", "Sling Bags"],
};

// Fallback products for search suggestions when backend is unavailable
const FALLBACK_PRODUCTS = [
  { id: "bs1", title: "Smart Watch Series 5", sellingPrice: 8999, image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400" },
  { id: "bs2", title: "Wireless Headphones", sellingPrice: 5999, image: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=400" },
  { id: "bs3", title: "Travel Backpack", sellingPrice: 3999, image: "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?q=80&w=400" },
  { id: "bs4", title: "Running Shoes", sellingPrice: 4999, image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=400" },
  { id: "bs5", title: "Luxury Perfume", sellingPrice: 2999, image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=400" },
  { id: "bs6", title: "Portable Bluetooth Speaker", sellingPrice: 2499, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=400" },
  { id: "bs7", title: "Classic Sunglasses", sellingPrice: 1499, image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=400" },
  { id: "bs8", title: "Ceramic Coffee Set", sellingPrice: 1899, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=400" },
  { id: "bs9", title: "Premium Yoga Mat", sellingPrice: 1299, image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=400" },
  { id: "bs10", title: "Minimal Desk Lamp", sellingPrice: 2199, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=400" },
];

export default function Navbar() {
  const { cart, favorites, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams ? searchParams.get("search") || "" : "";
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [allProducts, setAllProducts] = useState<any[]>(FALLBACK_PRODUCTS);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLFormElement>(null);
  const mobileSearchContainerRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setSearchQuery(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAllProducts(data);
          }
        }
      } catch (err) {
        // Backend not available — fallback products already set
        console.warn("Product service unavailable, using local fallback for search suggestions.");
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    function handleClickOutsideSearch(event: MouseEvent) {
      const target = event.target as Node;
      if (
        searchContainerRef.current && !searchContainerRef.current.contains(target) &&
        mobileSearchContainerRef.current && !mobileSearchContainerRef.current.contains(target)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideSearch);
    return () => document.removeEventListener("mousedown", handleClickOutsideSearch);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/");
    }
  };

  const searchSuggestions = searchQuery.trim()
    ? allProducts.filter((product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5)
    : [];

  // Helper: avoid double "bs" prefix for fallback products vs backend numeric IDs
  const getProductHref = (id: string | number) => {
    const idStr = String(id);
    return idStr.startsWith("bs") ? `/product/${idStr}` : `/product/bs${idStr}`;
  };
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavHeartFilled, setIsNavHeartFilled] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent SSR/client hydration mismatch: badge counts come from localStorage
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target) &&
        mobileButtonRef.current && !mobileButtonRef.current.contains(target)
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
    <>
      <header className="fixed top-0 left-0 right-0 z-40 w-full shadow-sm bg-[#F4F4F0]/90 backdrop-blur-md border-b border-natural/25">
        {/* Tier 1: Main Header Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-16">

            {/* Hamburger Menu (Left) */}
            <div className="flex items-center">
              <button
                onClick={() => {
                  console.log("Hamburger button clicked! Setting isMobileMenuOpen to true.");
                  setIsMobileMenuOpen(true);
                }}
                className="p-2 -ml-2 rounded-full text-black select-none hover:bg-[#DDE0F0] focus:outline-none cursor-pointer"
                aria-label="Open Menu"
              >
                <Menu size={22} className="stroke-[2px]" />
              </button>
            </div>

            {/* Logo "facile" (Center) */}
            <div className="absolute left-1/2 -translate-x-1/2 flex justify-center">
              <Link
                href="/"
                className="font-serif text-3xl font-bold tracking-[0.08em] text-[#4a556a] select-none"
              >
                facile
              </Link>
            </div>

            {/* Right Links & Icons */}
            <div className="flex items-center gap-2 sm:gap-4 font-sans text-sm font-medium z-10 ml-auto">

              {/* Favorite Icon */}
              <Link
                href="/wishlist"
                className="p-2 rounded-full text-black hover:bg-[#DDE0F0] transition-all duration-200 relative group focus:outline-none cursor-pointer"
                aria-label="Favorites"
              >
                <Heart
                  size={22}
                  className={`stroke-[2px] transition-transform group-hover:scale-110`}
                  style={{ fill: '#870339', color: '#870339', stroke: '#870339' }}
                />
                {isMounted && totalFavorites > 0 && (
                  <span className="absolute top-0 right-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#E8437F] text-[9px] font-bold text-warm-ivory ring-2 ring-warm-ivory">
                    {totalFavorites}
                  </span>
                )}
              </Link>

              {/* Shopping Cart Icon */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 rounded-full text-black hover:bg-[#DDE0F0] transition-all duration-200 relative group focus:outline-none cursor-pointer"
                aria-label="Shopping Cart"
              >
                <ShoppingCart size={22} className="stroke-[2px] transition-transform group-hover:scale-110" />
                {isMounted && totalCartItems > 0 && (
                  <span className="absolute top-0 right-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#E8437F] text-[9px] font-bold text-warm-ivory ring-2 ring-warm-ivory">
                    {totalCartItems}
                  </span>
                )}
              </button>

              {/* User Profile Icon / Dropdown */}
              <div className="relative">
                {isMounted && user ? (
                  <>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="p-2 rounded-full text-black hover:bg-[#DDE0F0] transition-all duration-200 group flex items-center gap-1 focus:outline-none cursor-pointer"
                      aria-label="Profile Menu"
                    >
                      <User size={22} className="stroke-[2px] transition-transform group-hover:scale-110 text-[#E8437F]" />
                      <span className="hidden lg:inline text-xs font-bold truncate max-w-[80px]">
                        {user.name}
                      </span>
                    </button>

                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-natural/20 rounded-xl shadow-lg p-3.5 z-50 animate-fade-in text-black">
                        <div className="border-b border-natural/10 pb-2 mb-2 text-xs">
                          <p className="font-bold text-natural uppercase tracking-wider text-[9px]">Logged in as</p>
                          <p className="font-bold truncate">{user.name}</p>
                          <p className="text-natural/80 truncate text-[10px]">{user.email}</p>
                        </div>
                        <Link
                          href="/profile?tab=profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full py-1.5 px-2 hover:bg-warm-ivory text-black rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer text-left mb-1 flex"
                        >
                          <User size={13} />
                          My Account
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setIsProfileOpen(false);
                          }}
                          className="w-full py-1.5 px-2 hover:bg-warm-ivory text-apricot rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer text-left"
                        >
                          <LogOut size={13} />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="p-2 rounded-full text-black hover:bg-natural/10 transition-all duration-200 group flex items-center gap-1 focus:outline-none cursor-pointer"
                    aria-label="Profile"
                  >
                    <User size={22} className="stroke-[2px] transition-transform group-hover:scale-110" />
                    <span className="hidden lg:inline text-xs font-bold text-black">
                      Guest
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tier 2: Pills & Search */}
        <div className="bg-[#F4F4F0]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

            {/* Desktop Layout: Single Row */}
            <div className="hidden md:flex items-center justify-between gap-4 py-2">

              {/* Left Pills */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* All Categories Dropdown Trigger */}
                <div className="relative">
                  <button
                    ref={buttonRef}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-1 px-4 py-1.5 bg-[#dde0f0] border border-[#dde0f0] hover:border-[#4A5568] hover:bg-[#4A5568] hover:text-white text-black text-xs font-semibold rounded-full shadow-sm transition-all duration-200 focus:outline-none cursor-pointer"
                  >
                    All Categories
                    <ChevronDown
                      size={14}
                      className={`text-current transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                {/* New Arrivals */}
                <a
                  href="#best-sellers"
                  className="px-4 py-1.5 bg-[#dde0f0] border border-[#dde0f0] hover:border-[#4A5568] hover:bg-[#4A5568] hover:text-white text-black text-xs font-semibold rounded-full shadow-sm transition-all duration-200"
                >
                  New Arrivals
                </a>

                {/* Trending Pill */}
                <a
                  href="#special-offer"
                  className="px-4 py-1.5 bg-[#dde0f0] border border-[#dde0f0] hover:border-[#4A5568] hover:bg-[#4A5568] hover:text-white text-black text-xs font-semibold rounded-full shadow-sm transition-all duration-200 flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 bg-apricot rounded-full animate-ping" />
                  Trending
                </a>
              </div>

              {/* Center Search Pill */}
              <div className="flex-1 max-w-md min-w-[200px]">
                <form ref={searchContainerRef} onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Search brands, ceramics, slow fashion..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full h-8.5 pl-4 pr-10 bg-white border border-black/25 focus:border-black focus:ring-1 focus:ring-black text-xs text-black rounded-full shadow-inner transition-all duration-200 placeholder:text-black/50 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black hover:text-apricot transition-colors"
                    aria-label="Submit Search"
                  >
                    <Search size={15} />
                  </button>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-black/15 rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto py-2 text-left">
                      {searchSuggestions.map((product) => (
                        <Link
                          key={product.id}
                          href={getProductHref(product.id)}
                          onClick={() => setShowSuggestions(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-neutral-50 transition-colors cursor-pointer"
                        >
                          <img src={product.image} alt={product.title} className="w-8 h-8 object-contain bg-neutral-50 rounded" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-[#4a556a] truncate">{product.title}</h4>
                            <span className="text-[10px] text-black/45 font-semibold block mt-0.5">₹{product.sellingPrice.toLocaleString("en-IN")}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </form>
              </div>

              {/* Right Pills */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href="#best-sellers"
                  className="px-4 py-1.5 bg-[#dde0f0] border border-[#dde0f0] hover:border-[#4A5568] hover:bg-[#4A5568] hover:text-white text-black text-xs font-semibold rounded-full shadow-sm transition-all duration-200"
                >
                  Best Sellers
                </a>
                <a
                  href="#special-offer"
                  className="px-4 py-1.5 bg-[#dde0f0] border border-[#dde0f0] hover:border-[#4A5568] hover:bg-[#4A5568] hover:text-white text-black text-xs font-semibold rounded-full shadow-sm transition-all duration-200"
                >
                  Deals
                </a>
                <a
                  href="#best-sellers"
                  className="px-4 py-1.5 bg-[#dde0f0] border border-[#dde0f0] hover:border-[#4A5568] hover:bg-[#4A5568] hover:text-white text-black text-xs font-semibold rounded-full shadow-sm transition-all duration-200"
                >
                  Brands
                </a>
              </div>

            </div>

            {/* Mobile Layout: Stacked (Search Bar first, then horizontally scrollable Category Pills) */}
            <div className="flex flex-col md:hidden py-1.5">
              {/* Search Input (Full Width - Not Pushed/Not Scrollable) */}
              <form ref={mobileSearchContainerRef} onSubmit={handleSearchSubmit} className="relative w-full mb-1.5 px-1">
                <input
                  type="text"
                  placeholder="Search brands, ceramics, slow fashion..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full h-8.5 pl-4 pr-10 bg-white border border-black/25 focus:border-black focus:ring-1 focus:ring-black text-xs text-black rounded-full shadow-inner transition-all duration-200 placeholder:text-black/50 focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-apricot transition-colors"
                  aria-label="Submit Search"
                >
                  <Search size={14} />
                </button>

                {/* Suggestions Dropdown */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute left-1 right-1 top-full mt-1.5 bg-white border border-black/15 rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto py-2 text-left">
                    {searchSuggestions.map((product) => (
                      <Link
                        key={product.id}
                        href={getProductHref(product.id)}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-neutral-50 transition-colors cursor-pointer"
                      >
                        <img src={product.image} alt={product.title} className="w-8 h-8 object-contain bg-neutral-50 rounded" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-[#4a556a] truncate">{product.title}</h4>
                          <span className="text-[10px] text-black/45 font-semibold block mt-0.5">₹{product.sellingPrice.toLocaleString("en-IN")}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </form>

              {/* Scrollable Category Pills (Not pushed by Search) */}
              <div className="flex items-center gap-1.5 overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth py-1 px-1">
                {/* All Categories Trigger */}
                <div className="relative flex-shrink-0">
                  <button
                    ref={mobileButtonRef}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-1 px-3.5 py-1 bg-[#dde0f0] border border-[#dde0f0] hover:border-[#4A5568] hover:bg-[#4A5568] hover:text-white text-black text-[11px] font-semibold rounded-full shadow-sm transition-all duration-200 focus:outline-none cursor-pointer"
                  >
                    All Categories
                    <ChevronDown
                      size={12}
                      className={`text-current transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                <a
                  href="#best-sellers"
                  className="px-3.5 py-1 bg-[#dde0f0] border border-[#dde0f0] hover:border-[#4A5568] hover:bg-[#4A5568] hover:text-white text-black text-[11px] font-semibold rounded-full shadow-sm transition-all duration-200 flex-shrink-0"
                >
                  New Arrivals
                </a>

                <a
                  href="#special-offer"
                  className="px-3.5 py-1 bg-[#dde0f0] border border-[#dde0f0] hover:border-[#4A5568] hover:bg-[#4A5568] hover:text-white text-black text-[11px] font-semibold rounded-full shadow-sm transition-all duration-200 flex items-center gap-1 flex-shrink-0"
                >
                  <span className="w-1.5 h-1.5 bg-apricot rounded-full animate-ping" />
                  Trending
                </a>

                <a
                  href="#best-sellers"
                  className="px-3.5 py-1 bg-[#dde0f0] border border-[#dde0f0] hover:border-[#4A5568] hover:bg-[#4A5568] hover:text-white text-black text-[11px] font-semibold rounded-full shadow-sm transition-all duration-200 flex-shrink-0"
                >
                  Men
                </a>
                <a
                  href="#best-sellers"
                  className="px-3.5 py-1 bg-[#dde0f0] border border-[#dde0f0] hover:border-[#4A5568] hover:bg-[#4A5568] hover:text-white text-black text-[11px] font-semibold rounded-full shadow-sm transition-all duration-200 flex-shrink-0"
                >
                  Women
                </a>
                <a
                  href="#best-sellers"
                  className="px-3.5 py-1 bg-[#dde0f0] border border-[#dde0f0] hover:border-[#4A5568] hover:bg-[#4A5568] hover:text-white text-black text-[11px] font-semibold rounded-full shadow-sm transition-all duration-200 flex-shrink-0"
                >
                  Children
                </a>
                <a
                  href="#best-sellers"
                  className="px-3.5 py-1 bg-[#dde0f0] border border-[#dde0f0] hover:border-[#4A5568] hover:bg-[#4A5568] hover:text-white text-black text-[11px] font-semibold rounded-full shadow-sm transition-all duration-200 flex-shrink-0"
                >
                  Brands
                </a>
              </div>

            </div>

            {/* Dropdown Overlay — main list + wide sub-panel */}
            <div
              ref={dropdownRef}
              className={`absolute left-4 sm:left-6 lg:left-8 top-full mt-1 flex transition-all duration-200 z-50 ${isDropdownOpen
                ? "opacity-100 visible translate-y-0"
                : "opacity-0 invisible -translate-y-2 pointer-events-none"
                }`}
              onMouseLeave={() => setActiveCategory(null)}
            >
              {/* Left — Main Categories (narrow, original style) */}
              <div className="w-52 bg-white border border-natural/20 rounded-xl shadow-lg py-1 text-xs text-black font-medium flex-shrink-0">
                {Object.keys(SUBCATEGORIES).map((cat) => (
                  <button
                    key={cat}
                    onMouseEnter={() => setActiveCategory(cat)}
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 transition-colors text-left ${activeCategory === cat
                      ? "bg-warm-ivory text-apricot"
                      : "hover:bg-warm-ivory hover:text-apricot"
                      }`}
                  >
                    <span>{cat}</span>
                    <ChevronRight size={13} className="opacity-50 flex-shrink-0" />
                  </button>
                ))}
              </div>

              {/* Right — Sub-categories (wider panel) */}
              {activeCategory && SUBCATEGORIES[activeCategory] && (
                <div className="w-72 bg-white border border-natural/20 rounded-xl shadow-lg py-1 text-xs text-black font-medium ml-1">
                  <p className="px-4 py-2 text-[10px] font-bold text-apricot uppercase tracking-wider border-b border-natural/10">
                    {activeCategory}
                  </p>
                  <div className="grid grid-cols-2 gap-x-2 px-3 py-2">
                    {SUBCATEGORIES[activeCategory].map((sub) => (
                      <a
                        key={sub}
                        href="#categories"
                        onClick={() => { setIsDropdownOpen(false); setActiveCategory(null); }}
                        className="block px-2 py-2 hover:bg-warm-ivory hover:text-apricot rounded-lg transition-colors"
                      >
                        {sub}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => {
              console.log("Backdrop clicked! Setting isMobileMenuOpen to false.");
              setIsMobileMenuOpen(false);
            }}
            className="fixed inset-0 bg-black/40"
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-xs bg-[#F4F4F0] text-black flex flex-col shadow-2xl h-full border-r border-natural/20 p-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-natural/20 mb-6">
              <span className="font-serif text-3xl font-bold tracking-[0.08em] text-[#4a556a] select-none">
                facile
              </span>
              <button
                onClick={() => {
                  console.log("Close button clicked! Setting isMobileMenuOpen to false.");
                  setIsMobileMenuOpen(false);
                }}
                className="p-2 -mr-2 rounded-full text-black hover:bg-[#DDE0F0] transition-colors focus:outline-none cursor-pointer"
                aria-label="Close Menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 space-y-1 overflow-y-auto pr-2 no-scrollbar text-xs font-bold text-black">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 py-2 px-3 hover:bg-[#DDE0F0] rounded-xl transition-all"
              >
                <Home size={15} className="text-black/70 flex-shrink-0" /> Home
              </Link>

              <Link
                href="/categories"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 py-2 px-3 bg-[#DDE0F0] rounded-xl transition-all"
              >
                <LayoutGrid size={15} className="text-[#4a556a] flex-shrink-0" /> Categories
              </Link>
              <a
                href="#best-sellers"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 py-2 px-3 hover:bg-[#DDE0F0] rounded-xl transition-all"
              >
                <Sparkles size={15} className="text-black/70 flex-shrink-0" /> New Arrivals
              </a>

              <Link
                href="/wishlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 py-2 px-3 hover:bg-[#DDE0F0] rounded-xl transition-all"
              >
                <Heart size={15} className="text-black/70 flex-shrink-0" /> Wishlist
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full flex items-center gap-3 py-2 px-3 hover:bg-[#DDE0F0] rounded-xl transition-all text-left font-bold cursor-pointer"
              >
                <ShoppingCart size={15} className="text-black/70 flex-shrink-0" /> Cart
              </button>

              <hr className="border-t border-natural/20 my-3" />

              <Link
                href="/profile?tab=profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 py-2 px-3 hover:bg-[#DDE0F0] rounded-xl transition-all"
              >
                <User size={15} className="text-black/70 flex-shrink-0" /> My Profile
              </Link>
              <Link
                href="/profile?tab=orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 py-2 px-3 hover:bg-[#DDE0F0] rounded-xl transition-all"
              >
                <Package size={15} className="text-black/70 flex-shrink-0" /> My Orders
              </Link>
              <Link
                href="/profile?tab=addresses"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 py-2 px-3 hover:bg-[#DDE0F0] rounded-xl transition-all"
              >
                <MapPin size={15} className="text-black/70 flex-shrink-0" /> Addresses
              </Link>

              <hr className="border-t border-natural/20 my-3" />

              <a
                href="#testimonials"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 py-2 px-3 hover:bg-[#DDE0F0] rounded-xl transition-all"
              >
                <Info size={15} className="text-black/70 flex-shrink-0" /> About Us
              </a>
              <a
                href="#testimonials"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 py-2 px-3 hover:bg-[#DDE0F0] rounded-xl transition-all"
              >
                <Mail size={15} className="text-black/70 flex-shrink-0" /> Contact
              </a>
              <a
                href="#testimonials"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 py-2 px-3 hover:bg-[#DDE0F0] rounded-xl transition-all"
              >
                <HelpCircle size={15} className="text-black/70 flex-shrink-0" /> Help
              </a>
            </nav>

            {/* User Auth Info at bottom */}
            <div className="border-t border-natural/20 pt-4 mt-auto">
              {user ? (
                <div className="flex items-center justify-between text-xs">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-bold truncate text-black">{user.name}</p>
                    <p className="text-natural/80 truncate text-[10px]">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="py-1.5 px-3 bg-apricot/10 hover:bg-apricot/20 text-apricot rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2 px-3 bg-black hover:bg-black/90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}


