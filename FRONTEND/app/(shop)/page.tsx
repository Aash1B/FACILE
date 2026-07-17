"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import {
  getRecentlyViewed,
  recordRecentlyViewed,
  RECENT_PRODUCTS_CHANGED,
  type RecentProduct,
} from "@/lib/recentlyViewed";
import {
  Heart,
  ShoppingCart,
  Star,
  ArrowRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  Headset,
  Check,
  ChevronLeft,
  ChevronRight,
  Quote,
} from "lucide-react";

type ProductCard = {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviews: number;
  description?: string;
  maxOrderQuantity?: number;
};

// Mock Database of Best Selling Products
const BEST_SELLERS: ProductCard[] = [
  {
    id: "bs1",
    name: "Smart Watch Series 5",
    price: 89.99,
    originalPrice: 129.99,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400",
    rating: 4.5,
    reviews: 128
  },
  {
    id: "bs2",
    name: "Wireless Headphones",
    price: 59.99,
    originalPrice: 89.99,
    image: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=400",
    rating: 4.7,
    reviews: 98
  },
  {
    id: "bs3",
    name: "Travel Backpack",
    price: 39.99,
    originalPrice: 59.99,
    image: "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?q=80&w=400",
    rating: 4.6,
    reviews: 156
  },
  {
    id: "bs4",
    name: "Running Shoes",
    price: 49.99,
    originalPrice: 79.99,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=400",
    rating: 4.4,
    reviews: 78
  },
  {
    id: "bs5",
    name: "Luxury Perfume",
    price: 29.99,
    originalPrice: 49.99,
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=400",
    rating: 4.8,
    reviews: 64
  },
  {
    id: "bs6",
    name: "Portable Bluetooth Speaker",
    price: 2499,
    originalPrice: 3499,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=400",
    rating: 4.6,
    reviews: 112
  },
  {
    id: "bs7",
    name: "Classic Sunglasses",
    price: 1499,
    originalPrice: 2299,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=400",
    rating: 4.5,
    reviews: 87
  },
  {
    id: "bs8",
    name: "Ceramic Coffee Set",
    price: 1899,
    originalPrice: 2799,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=400",
    rating: 4.7,
    reviews: 73
  },
  {
    id: "bs9",
    name: "Premium Yoga Mat",
    price: 1299,
    originalPrice: 1999,
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=400",
    rating: 4.8,
    reviews: 145
  },
  {
    id: "bs10",
    name: "Minimal Desk Lamp",
    price: 2199,
    originalPrice: 3199,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=400",
    rating: 4.4,
    reviews: 59
  }
];

// Mock Categories
const CATEGORIES = [
  { id: "c2", label: "Fashion", image: "/fashion-circle.png", bgColor: "bg-green-50/55 border border-green-100/40" },
  { id: "c4", label: "Beauty", image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=250", bgColor: "bg-purple-50/55 border border-purple-100/40" },
  { id: "c3", label: "Home & Living", image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=250", bgColor: "bg-orange-50/55 border border-orange-100/40" },
  { id: "c7", label: "Jewellery & Accessories", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=250", bgColor: "bg-amber-50/55 border border-amber-100/40" },
  { id: "c8", label: "Footwear", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=250", bgColor: "bg-cyan-50/55 border border-cyan-100/40" },
  { id: "c1", label: "Electronics", image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=250", bgColor: "bg-blue-50/55 border border-blue-100/40" },
  { id: "c9", label: "Stationery", image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=250", bgColor: "bg-indigo-50/55 border border-indigo-100/40" },
  { id: "c6", label: "Kids & Baby", image: "https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=250", bgColor: "bg-rose-50/55 border border-rose-100/40" },
  { id: "c10", label: "Health & Wellness", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=250", bgColor: "bg-lime-50/55 border border-lime-100/40" },
  { id: "c5", label: "Sports", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=250", bgColor: "bg-teal-50/55 border border-teal-100/40" },
  { id: "c11", label: "Pets", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=250", bgColor: "bg-emerald-50/55 border border-emerald-100/40" }
];

type ApiProduct = {
  id: number | string;
  title: string;
  sellingPrice: number;
  mrp: number;
  image?: string;
  rating: number;
  reviews: number;
  maxOrderQuantity?: number;
  description?: string;
};

// Mock Testimonials
const TESTIMONIALS = [
  {
    id: "t1",
    name: "John D.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150",
    feedback: "Amazing products and fast delivery! facile is my go-to store for all my needs.",
    rating: 5
  },
  {
    id: "t2",
    name: "Sarah M.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150",
    feedback: "Great quality at affordable prices. The customer support is also very responsive.",
    rating: 5
  },
  {
    id: "t3",
    name: "Michael T.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150",
    feedback: "Very happy with my purchase. Highly recommend facile to everyone!",
    rating: 5
  },
  {
    id: "t4",
    name: "Emily R.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150",
    feedback: "The design aesthetics are amazing. The customer service helped me track my order immediately.",
    rating: 5
  },
  {
    id: "t5",
    name: "David K.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150",
    feedback: "Super fast delivery and the packaging was eco-friendly. Very satisfied with the overall experience.",
    rating: 4
  },
  {
    id: "t6",
    name: "Jessica P.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150",
    feedback: "I am in love with the Hydrating Lip Balm Set! It keeps my lips smooth and hydrated all day long.",
    rating: 5
  },
  {
    id: "t7",
    name: "Alex B.",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=150",
    feedback: "The badminton rackets are outstandingly durable and lightweight. Excellent value for money.",
    rating: 5
  }
];

function HomeContent() {
  const { addToCart, toggleFavorite, favorites } = useCart();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [productPage, setProductPage] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCategoriesLeft = () => {
    setActiveCategoryIndex((current) => (current === 0 ? CATEGORIES.length - 1 : current - 1));
  };
  const scrollCategoriesRight = () => {
    setActiveCategoryIndex((current) => (current === CATEGORIES.length - 1 ? 0 : current + 1));
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveCategoryIndex((current) => (current === CATEGORIES.length - 1 ? 0 : current + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    if (carouselRef.current) {
      const activeEl = carouselRef.current.querySelector(".active-category") as HTMLElement;
      if (activeEl) {
        const container = carouselRef.current;
        const containerWidth = container.clientWidth;
        const activeWidth = activeEl.clientWidth;
        const activeLeft = activeEl.offsetLeft;

        // Calculate target scrollLeft to center the active category item
        const targetScrollLeft = activeLeft - (containerWidth / 2) + (activeWidth / 2);

        container.scrollTo({
          left: targetScrollLeft,
          behavior: "smooth"
        });
      }
    }
  }, [activeCategoryIndex]);

  useEffect(() => {
    const loadRecentProducts = () => setRecentProducts(getRecentlyViewed());
    const initialLoad = window.setTimeout(loadRecentProducts, 0);
    window.addEventListener(RECENT_PRODUCTS_CHANGED, loadRecentProducts);
    window.addEventListener("storage", loadRecentProducts);
    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener(RECENT_PRODUCTS_CHANGED, loadRecentProducts);
      window.removeEventListener("storage", loadRecentProducts);
    };
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped = (data as ApiProduct[]).map((p) => ({
              id: "bs" + p.id,
              name: p.title,
              description: p.description || "",
              price: p.sellingPrice,
              originalPrice: p.mrp,
              image: p.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400",
              rating: Number(p.rating ?? 0),
              reviews: Number(p.reviews ?? 0),
              maxOrderQuantity: p.maxOrderQuantity || 10
            }));
            setProducts(mapped);
            setProductPage(0);
          }
        }
      } catch (err) {
        console.error("Failed to load products from backend API, using local fallback.", err);
      }
    };
    loadProducts();
  }, []);

  const productsPerPage = 5;
  const productPageCount = Math.max(1, Math.ceil(products.length / productsPerPage));
  const visibleProducts = products.slice(
    productPage * productsPerPage,
    productPage * productsPerPage + productsPerPage
  );

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleAddToCart = (product: ProductCard, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      brand: "facile Store",
      image: product.image,
      maxOrderQuantity: product.maxOrderQuantity || 10
    });
    recordRecentlyViewed(product);
    triggerToast(`Added ${product.name} to your bag! 🛍️`);
  };

  const handleAddRecentToCart = (product: RecentProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ id: product.id, name: product.name, price: product.price, brand: "facile Store", image: product.image, maxOrderQuantity: product.maxOrderQuantity || 10 });
    recordRecentlyViewed(product);
    triggerToast(`Added ${product.name} to your bag!`);
  };

  const handleToggleFavorite = (id: string, name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id);
    const isNowFav = !favorites.includes(id);
    triggerToast(isNowFav ? `Added ${name} to Wishlist! ❤️` : `Removed ${name} from Wishlist.`);
  };

  return (
    <div className="bg-[#F4F4F0] text-fern font-sans min-h-screen relative pb-16">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-fern text-warm-ivory py-3 px-5 rounded-2xl shadow-xl flex items-center gap-2 border border-natural/30 animate-slide-in text-xs font-semibold">
          <Check size={16} className="text-[#E8A1C4] stroke-[3px]" />
          {toastMessage}
        </div>
      )}

      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-warm-ivory border border-natural/15 rounded-[24px] sm:rounded-[32px] relative overflow-hidden min-h-[380px] sm:min-h-[480px] flex items-center" style={{ boxShadow: '0 4px 6px rgba(74,85,104,0.03), 0 10px 25px rgba(74,85,104,0.06), 0 20px 48px rgba(74,85,104,0.04)' }}>

          {/* Background Image positioned on the right */}
          <img
            src="/hero_product_composition.png"
            alt="Hero Background"
            className="absolute right-0 top-0 bottom-0 w-full sm:w-[58%] h-full object-cover object-right select-none z-0"
          />

          {/* Mobile Overlay: Blend image with #FAF3E3 */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F4F4F0] via-[#F4F4F0] via-35% to-transparent z-10 pointer-events-none sm:hidden" />
          {/* Desktop Overlay: Solid #FAF3E3 panel, with smooth gradient blending the image */}
          <div
            className="absolute inset-0 z-10 pointer-events-none hidden sm:block"
            style={{ background: 'linear-gradient(to right, #F4F4F0 0%, #F4F4F0 42%, transparent 52%)' }}
          />

          {/* Hero Content Area */}
          <div className="relative z-20 max-w-xl px-6 py-10 sm:py-16 sm:pl-12 lg:pl-16 space-y-5 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-fern/10 rounded-full text-xs font-bold text-fern mx-auto sm:mx-0">
              <span className="w-1.5 h-1.5 bg-fern rounded-full" />
              <span>NEW ARRIVALS</span>
            </div>

            <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#4A5568] leading-[1.15] tracking-tight">
              Discover The Best Products for You
            </h1>

            <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed max-w-md mx-auto sm:mx-0 font-semibold">
              Explore our wide range of high-quality products at affordable prices. Shop now and enjoy the best deals!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4">
              <a
                href="#best-sellers"
                className="w-full sm:w-auto h-11 px-6 bg-[#dde0f0] border border-[#dde0f0] hover:border-[#4A5568] hover:bg-[#4A5568] hover:text-white text-black active:scale-98 transition-all font-bold text-xs tracking-wider rounded-lg shadow-md flex items-center justify-center gap-2"
              >
                Shop Now
                <ArrowRight size={14} />
              </a>
              <a
                href="#special-offer"
                className="w-full sm:w-auto h-11 px-6 bg-white border border-natural/20 hover:border-fern text-fern font-bold text-xs tracking-wider rounded-lg shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                Explore Deals
              </a>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 pt-5 border-t border-natural/15 max-w-md mx-auto sm:mx-0">
              <div className="flex -space-x-2">
                <img className="inline-block h-7 w-7 rounded-full ring-2 ring-warm-ivory object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100" alt="avatar" />
                <img className="inline-block h-7 w-7 rounded-full ring-2 ring-warm-ivory object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100" alt="avatar" />
                <img className="inline-block h-7 w-7 rounded-full ring-2 ring-warm-ivory object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100" alt="avatar" />
                <img className="inline-block h-7 w-7 rounded-full ring-2 ring-warm-ivory object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100" alt="avatar" />
              </div>
              <p className="text-[11px] font-bold text-[#4A5568] tracking-wide">
                Trusted by 10,000+ Happy Customers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Feature Highlights Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-3">
        <div className="bg-white border border-natural/15 hover:border-[#4A5568] rounded-2xl p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 transition-all duration-300" style={{ boxShadow: '0 4px 6px rgba(74,85,104,0.03), 0 10px 25px rgba(74,85,104,0.06), 0 20px 48px rgba(74,85,104,0.04)' }}>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-warm-ivory/45 rounded-xl text-[#E8A1C4] flex-shrink-0">
              <Truck size={22} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#4a556a]">Free Shipping</h3>
              <p className="text-[10px] text-[#4a556a] font-medium mt-0.5">On orders over $50</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-warm-ivory/45 rounded-xl text-[#E8A1C4] flex-shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#4a556a]">Secure Payment</h3>
              <p className="text-[10px] text-[#4a556a] font-medium mt-0.5">100% secure payment</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-warm-ivory/45 rounded-xl text-[#E8A1C4] flex-shrink-0">
              <RefreshCw size={22} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#4a556a]">Easy Returns</h3>
              <p className="text-[10px] text-[#4a556a] font-medium mt-0.5">30 days return policy</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-warm-ivory/45 rounded-xl text-[#E8A1C4] flex-shrink-0">
              <Headset size={22} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#4a556a]">24/7 Support</h3>
              <p className="text-[10px] text-[#4a556a] font-medium mt-0.5">Dedicated support</p>
            </div>
          </div>

        </div>
      </section>

      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-1 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#4a556a] tracking-tight">Shop by Categories</h2>
          </div>
        </div>

        <div className="relative" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={scrollCategoriesLeft}
            aria-label="Scroll categories left"
            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-[#4a556a]/25 bg-white/90 hover:bg-white flex items-center justify-center text-[#4a556a] shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer z-10"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Categories Carousel */}
          <div
            ref={carouselRef}
            className="flex items-center overflow-x-auto justify-start gap-2 sm:gap-3 no-scrollbar pt-3 pb-5 px-12 sm:px-16 select-none"
          >
            {CATEGORIES.map((category, index) => {
              const isActive = index === activeCategoryIndex;
              return (
                <Link
                  key={category.id}
                  href={`/category/${category.id.replace("c", "")}`}
                  className={`flex w-52 sm:w-56 flex-col items-center justify-start pt-1 gap-3 rounded-[36px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A1C4] flex-shrink-0 ${isActive ? "active-category" : ""}`}
                >
                  <div className={`${isActive ? "w-56 h-56 sm:w-60 sm:h-60 shadow-[0_16px_40px_rgba(74,85,104,0.35)] ring-4 ring-[#E8437F]/30 scale-105" : "w-48 h-48 sm:w-52 sm:h-52 shadow-sm ring-1 ring-white/70 hover:scale-[1.02]"} aspect-square shrink-0 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 ${category.bgColor}`}>
                    <img
                      src={category.image}
                      alt={category.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className={`text-sm sm:text-base font-extrabold text-center transition-colors duration-300 ${isActive ? "text-[#E8437F]" : "text-[#4a556a] hover:text-[#1A202C]"}`}>
                    {category.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={scrollCategoriesRight}
            aria-label="Scroll categories right"
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-[#4a556a]/25 bg-white/90 hover:bg-white flex items-center justify-center text-[#4a556a] shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer z-10"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="mt-2 flex justify-center">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 rounded-full bg-[#E8437F] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#d93670] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8437F] focus-visible:ring-offset-2"
          >
            View All Categories
          </Link>
        </div>
      </section>

      {/* 4. Best Selling Products */}
      <section id="best-sellers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-1 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#4a556a] tracking-tight">
            Best Selling Products
          </h2>
          <div className="flex items-center gap-4 self-end sm:self-auto">
            {productPageCount > 1 && (
              <div className="flex items-center gap-2">
                <span className="hidden sm:block text-[11px] font-semibold text-[#4a556a]/70 mr-1">
                  {productPage + 1} / {productPageCount}
                </span>
                <button
                  type="button"
                  onClick={() => setProductPage((page) => Math.max(0, page - 1))}
                  disabled={productPage === 0}
                  aria-label="Show previous products"
                  className="w-9 h-9 rounded-full border border-[#4a556a]/25 flex items-center justify-center text-[#4a556a] hover:bg-white disabled:opacity-35 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setProductPage((page) => Math.min(productPageCount - 1, page + 1))}
                  disabled={productPage >= productPageCount - 1}
                  aria-label="Show more products"
                  className="w-9 h-9 rounded-full border border-[#4a556a]/25 flex items-center justify-center text-[#4a556a] hover:bg-white disabled:opacity-35 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 5-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {visibleProducts.map((product) => {
            const isFav = favorites.includes(product.id);
            const discount = product.originalPrice > product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
            return (
              <div
                key={product.id}
                className="group bg-[#F4F4F0] hover:bg-[#4A5568] border border-natural/15 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-natural/30 transition-all duration-300 flex flex-col relative"
              >
                {/* Wishlist Button */}
                <button
                  onClick={(e) => handleToggleFavorite(product.id, product.name, e)}
                  className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-[#F4F4F0]/95 text-fern hover:text-[#E8A1C4] shadow-xs hover:scale-105 active:scale-95 transition-all border border-natural/10 focus:outline-none cursor-pointer"
                  aria-label="Add to wishlist"
                >
                  <Heart
                    size={14}
                    className={`transition-colors`}
                    style={isFav ? { fill: '#870339', color: '#870339', stroke: '#870339' } : {}}
                  />
                </button>

                <Link href={`/product/${product.id}`} className="flex flex-col flex-1">
                  {/* Product Image */}
                  <div className="aspect-square bg-neutral-100/50 relative overflow-hidden flex-shrink-0">
                    {discount > 0 && (
                      <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-apricot text-white text-xs sm:text-sm font-bold rounded-full shadow-md">
                        -{discount}%
                      </div>
                    )}
                    <img
                      src={product.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <h3 className="text-xs font-bold text-[#4a556a] group-hover:text-warm-ivory leading-snug truncate transition-colors duration-200">
                        {product.name}
                      </h3>

                      {/* Stars and reviews */}
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-natural group-hover:text-warm-ivory/80 transition-colors">
                        <Star size={11} className={product.reviews > 0 ? "text-amber-400 fill-amber-400" : "text-neutral-300"} />
                        {product.reviews > 0 ? (
                          <>
                            <span className="text-[#4a556a] group-hover:text-warm-ivory font-bold">{product.rating.toFixed(1)}</span>
                            <span>({product.reviews})</span>
                          </>
                        ) : (
                          <span className="text-natural group-hover:text-warm-ivory/80">No reviews</span>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-3 pt-3 border-t border-natural/10 mt-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-extrabold text-[#4a556a] group-hover:text-warm-ivory transition-colors">₹{product.price.toLocaleString("en-IN")}</span>
                        <span className="text-[10px] text-natural group-hover:text-warm-ivory/60 line-through font-medium transition-colors">₹{product.originalPrice.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Action Button */}
                <div className="px-4 pb-4">
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="w-full h-8.5 bg-[#4a556a] group-hover:bg-[#DDE0F0] group-hover:text-[#4a556a] hover:scale-[1.02] active:scale-98 text-warm-ivory text-[11px] font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1 focus:outline-none cursor-pointer"
                  >
                    <ShoppingCart size={12} className="stroke-[2.5px]" />
                    Add to Cart
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {recentProducts.length > 0 && (
        <section id="recently-viewed" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#4a556a] tracking-tight">Recently Viewed Products</h2>
          </div>
          <div className="flex gap-5 overflow-x-auto no-scrollbar pb-3">
            {recentProducts.map((product) => (
              <article key={product.id} className="w-52 sm:w-56 flex-shrink-0 overflow-hidden rounded-2xl border border-natural/15 bg-[#F4F4F0] shadow-xs">
                <Link href={`/product/${product.id}`} className="block">
                  <div className="aspect-square overflow-hidden bg-neutral-100/50">
                    <img src={product.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300"} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-2 p-4">
                    <h3 className="truncate text-xs font-bold text-[#4a556a]">{product.name}</h3>
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-natural">
                      <Star size={11} className={(product.reviews ?? 0) > 0 ? "fill-amber-400 text-amber-400" : "text-neutral-300"} />
                      {(product.reviews ?? 0) > 0 ? <><span>{Number(product.rating).toFixed(1)}</span><span>({product.reviews})</span></> : <span>No reviews</span>}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-extrabold text-[#4a556a]">&#8377;{product.price.toLocaleString("en-IN")}</span>
                      {product.originalPrice != null && product.originalPrice > product.price && (
                        <span className="text-[10px] font-medium text-natural line-through">&#8377;{product.originalPrice.toLocaleString("en-IN")}</span>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="px-4 pb-4">
                  <button type="button" onClick={(event) => handleAddRecentToCart(product, event)} className="flex h-9 w-full items-center justify-center gap-1 rounded-lg bg-[#4a556a] text-[11px] font-bold text-warm-ivory shadow-sm">
                    <ShoppingCart size={12} className="stroke-[2.5px]" /> Add to Cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 5. Special Offer Banner */}
      <section id="special-offer" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="group bg-[#F4F4F0] hover:bg-[#DDE0F0] border border-natural/20 rounded-2xl overflow-hidden shadow-xs relative cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(74,85,104,0.22)] hover:border-[#4A5568]/30">

          {/* Shimmer overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none translate-x-[-100%] group-hover:translate-x-[100%] ease-in-out" style={{ transition: 'opacity 0.4s ease, transform 0.8s ease' }} />

          {/* Subtle Leaf Shadow Graphic overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-natural/5 via-transparent to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-8 sm:p-12">

            {/* Banner Left Details */}
            <div className="md:col-span-7 space-y-4 text-center md:text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#E8437F]">
                Special Offer
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#4a556a] group-hover:text-[#2d3748] leading-tight transition-colors duration-300">
                Up to 50% Off
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5568] max-w-md leading-relaxed font-medium">
                Limited time offer on selected items. Hurry up and grab the best deals!
              </p>
              <button className="h-11 px-6 bg-[#DDE0F0] group-hover:bg-[#4A5568] group-hover:text-white border border-transparent active:scale-98 text-[#4A5568] font-bold text-xs tracking-wider rounded-lg transition-all flex items-center gap-2 mx-auto md:mx-0 shadow-sm cursor-pointer hover:scale-[1.02]">
                Shop the Sale
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Banner Right Image */}
            <div className="md:col-span-5 flex justify-center relative">
              <img
                src="/special_offer.png"
                alt="Special Offer Sale Kraft Bag"
                className="w-full max-w-[340px] h-auto object-contain transition-all duration-500 group-hover:scale-[1.06] group-hover:drop-shadow-2xl select-none"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=400";
                }}
              />
            </div>

          </div>
        </div>
      </section>

      {/* 6. Customer Testimonials */}
      <section id="testimonials" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-[#4a556a] tracking-tight">What Our Customers Say</h2>

          {/* Navigation Arrows */}
          <div className="flex gap-2">
            <button
              onClick={() => setTestimonialIndex((prev) => Math.max(0, prev - 1))}
              disabled={testimonialIndex === 0}
              className="w-8 h-8 rounded-full border border-natural/25 flex items-center justify-center text-[#4a556a] hover:border-[#4a556a] hover:bg-white/50 disabled:opacity-35 disabled:cursor-not-allowed active:scale-95 transition-all focus:outline-none cursor-pointer"
              aria-label="Previous testimonials"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setTestimonialIndex((prev) => Math.min(TESTIMONIALS.length - 3, prev + 1))}
              disabled={testimonialIndex >= TESTIMONIALS.length - 3}
              className="w-8 h-8 rounded-full border border-natural/25 flex items-center justify-center text-[#4a556a] hover:border-[#4a556a] hover:bg-white/50 disabled:opacity-35 disabled:cursor-not-allowed active:scale-95 transition-all focus:outline-none cursor-pointer"
              aria-label="Next testimonials"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.slice(testimonialIndex, testimonialIndex + 3).map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white hover:bg-[#DDE0F0] border border-natural/15 p-6 rounded-2xl shadow-xs flex flex-col justify-between space-y-6 hover:shadow-sm transition-all duration-300"
            >
              <div className="space-y-4">
                <Quote size={28} className="text-green-200 fill-green-500/10 stroke-[1.5px]" />
                <p className="text-xs text-natural leading-relaxed italic font-medium">
                  &quot;{testimonial.feedback}&quot;
                </p>
              </div>

              {/* User Identity */}
              <div className="flex items-center gap-3 pt-4 border-t border-natural/10">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover border border-natural/10"
                />
                <div>
                  <h4 className="text-xs font-bold text-fern">{testimonial.name}</h4>
                  <div className="flex items-center gap-0.5 mt-0.5 text-amber-400">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={10} className="fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default function Home() {
  return <HomeContent />;
}
