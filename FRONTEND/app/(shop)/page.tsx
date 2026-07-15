"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  Heart,
  ShoppingCart,
  Star,
  ArrowRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  Headset,
  Headphones,
  Shirt,
  Armchair,
  Sparkles,
  Flame,
  Watch,
  Check,
  ChevronLeft,
  ChevronRight,
  Quote
} from "lucide-react";

// Mock Database of Best Selling Products
const BEST_SELLERS = [
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
  }
];

// Mock Categories
const CATEGORIES = [
  { id: "c1", label: "Electronics", image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=250", bgColor: "bg-blue-50/55 border border-blue-100/40" },
  { id: "c2", label: "Fashion", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=250", bgColor: "bg-green-50/55 border border-green-100/40" },
  { id: "c3", label: "Home & Kitchen", image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=250", bgColor: "bg-orange-50/55 border border-orange-100/40" },
  { id: "c4", label: "Beauty", image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=250", bgColor: "bg-purple-50/55 border border-purple-100/40" },
  { id: "c5", label: "Sports", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=250", bgColor: "bg-teal-50/55 border border-teal-100/40" },
  { id: "c6", label: "Toys & Baby", image: "https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=250", bgColor: "bg-rose-50/55 border border-rose-100/40" }
];

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
  }
];

function HomeContent() {
  const { addToCart, toggleFavorite, favorites } = useCart();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [products, setProducts] = useState<typeof BEST_SELLERS>(BEST_SELLERS);
  
  const searchParams = useSearchParams();
  const searchQuery = searchParams ? searchParams.get("search") || "" : "";

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map((p: any) => ({
              id: "bs" + p.id,
              name: p.title,
              description: p.description || "",
              price: p.sellingPrice,
              originalPrice: p.mrp,
              image: p.image,
              rating: p.rating,
              reviews: p.reviews
            }));
            setProducts(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to load products from backend API, using local fallback.", err);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = products.filter((p: any) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query))
    );
  });

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleAddToCart = (product: typeof BEST_SELLERS[0], e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      brand: "facile Store",
      image: product.image
    });
    triggerToast(`Added ${product.name} to your bag! 🛍️`);
  };

  const handleToggleFavorite = (id: string, name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id);
    const isNowFav = !favorites.includes(id);
    triggerToast(isNowFav ? `Added ${name} to Wishlist! ❤️` : `Removed ${name} from Wishlist.`);
  };

  return (
    <div className="bg-[#FAF3E3] text-fern font-sans min-h-screen relative pb-16">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-fern text-warm-ivory py-3 px-5 rounded-2xl shadow-xl flex items-center gap-2 border border-natural/30 animate-slide-in text-xs font-semibold">
          <Check size={16} className="text-apricot stroke-[3px]" />
          {toastMessage}
        </div>
      )}

      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-warm-ivory border border-natural/15 rounded-[24px] sm:rounded-[32px] relative overflow-hidden shadow-xs min-h-[380px] sm:min-h-[480px] flex items-center">
          
          {/* Background Image positioned on the right */}
          <img
            src="/hero_product_composition.png"
            alt="Hero Background"
            className="absolute right-0 top-0 bottom-0 w-full sm:w-[58%] h-full object-cover object-right select-none z-0"
          />
          
          {/* Mobile Overlay: Blend image with #FAF3E3 */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF3E3] via-[#FAF3E3] via-35% to-transparent z-10 pointer-events-none sm:hidden" />
          {/* Desktop Overlay: Solid #FAF3E3 panel, with smooth gradient blending the image */}
          <div 
            className="absolute inset-0 z-10 pointer-events-none hidden sm:block" 
            style={{ background: 'linear-gradient(to right, #FAF3E3 0%, #FAF3E3 42%, transparent 52%)' }}
          />

          {/* Hero Content Area */}
          <div className="relative z-20 max-w-xl px-6 py-10 sm:py-16 sm:pl-12 lg:pl-16 space-y-5 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-fern/10 rounded-full text-xs font-bold text-fern mx-auto sm:mx-0">
              <span className="w-1.5 h-1.5 bg-fern rounded-full" />
              <span>NEW ARRIVALS</span>
            </div>

            <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#dde0f0] leading-[1.15] tracking-tight">
              Discover The Best Products for You
            </h1>

            <p className="text-xs sm:text-sm text-[#dde0f0] leading-relaxed max-w-md mx-auto sm:mx-0 font-semibold">
              Explore our wide range of high-quality products at affordable prices. Shop now and enjoy the best deals!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4">
              <a
                href="#best-sellers"
                className="w-full sm:w-auto h-11 px-6 bg-[#dde0f0] hover:bg-[#dde0f0]/90 text-black active:scale-98 transition-all font-bold text-xs tracking-wider rounded-lg shadow-md flex items-center justify-center gap-2"
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
              <p className="text-[11px] font-bold text-[#dde0f0] tracking-wide">
                Trusted by 10,000+ Happy Customers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Feature Highlights Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-natural/15 rounded-2xl p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 shadow-xs">

          <div className="flex items-center gap-4">
            <div className="p-3 bg-warm-ivory/45 rounded-xl text-apricot flex-shrink-0">
              <Truck size={22} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#4a556a]">Free Shipping</h3>
              <p className="text-[10px] text-[#4a556a] font-medium mt-0.5">On orders over $50</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-warm-ivory/45 rounded-xl text-apricot flex-shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#4a556a]">Secure Payment</h3>
              <p className="text-[10px] text-[#4a556a] font-medium mt-0.5">100% secure payment</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-warm-ivory/45 rounded-xl text-apricot flex-shrink-0">
              <RefreshCw size={22} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#4a556a]">Easy Returns</h3>
              <p className="text-[10px] text-[#4a556a] font-medium mt-0.5">30 days return policy</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-warm-ivory/45 rounded-xl text-apricot flex-shrink-0">
              <Headset size={22} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#4a556a]">24/7 Support</h3>
              <p className="text-[10px] text-[#4a556a] font-medium mt-0.5">Dedicated support</p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Shop by Categories */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#4a556a] tracking-tight">Shop by Categories</h2>
          <a 
            href="#all-categories" 
            className="text-xs font-bold text-[#4a556a] hover:text-[#4a556a] hover:scale-105 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 transform flex items-center gap-1 cursor-pointer"
          >
            View All Categories
            <ArrowRight size={12} />
          </a>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-6 sm:gap-4">
          {CATEGORIES.map((category) => {
            return (
              <a
                key={category.id}
                href={`#${category.label.toLowerCase()}`}
                className="flex flex-col items-center gap-3 group"
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex items-center justify-center shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:shadow-md ${category.bgColor}`}>
                  <img
                    src={category.image}
                    alt={category.label}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="text-xs font-bold text-[#4a556a] group-hover:text-apricot transition-colors text-center">
                  {category.label}
                </span>
              </a>
            );
          })}
        </div>
      </section>

      {/* 4. Best Selling Products */}
      <section id="best-sellers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#4a556a] tracking-tight">
            {searchQuery ? `Search Results for "${searchQuery}"` : "Best Selling Products"}
          </h2>
          {searchQuery ? (
            <Link 
              href="/" 
              className="text-xs font-bold px-3 py-1.5 bg-[#4a556a] hover:bg-[#4a556a]/90 text-warm-ivory rounded-full transition-all shadow-sm cursor-pointer"
            >
              Clear Search
            </Link>
          ) : (
            <a 
              href="#all-products" 
              className="text-xs font-bold text-[#4a556a] hover:text-[#4a556a] hover:scale-105 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 transform flex items-center gap-1 cursor-pointer"
            >
              View All Products
              <ArrowRight size={12} />
            </a>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-warm-ivory border border-natural/15 rounded-3xl text-center max-w-md mx-auto shadow-xs">
            <Sparkles size={32} className="text-apricot mb-3 animate-bounce" />
            <h3 className="text-xs font-bold text-[#4a556a] mb-1">No matching products found</h3>
            <p className="text-[11px] text-black/60 mb-5 leading-normal">
              We couldn't find any products matching "{searchQuery}" on the home page. Try checking your spelling or search term.
            </p>
            <Link 
              href="/" 
              className="text-[11px] font-bold px-3.5 py-1.5 bg-[#4a556a] hover:bg-[#4a556a]/90 text-warm-ivory rounded-full transition-all shadow-sm"
            >
              Show All Products
            </Link>
          </div>
        ) : (
          /* 5-Column Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {filteredProducts.map((product: any) => {
              const isFav = favorites.includes(product.id);
              return (
                <div
                  key={product.id}
                  className="group bg-warm-ivory border border-natural/15 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-natural/30 transition-all duration-300 flex flex-col relative"
                >
                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => handleToggleFavorite(product.id, product.name, e)}
                    className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-warm-ivory/95 text-fern hover:text-apricot shadow-xs hover:scale-105 active:scale-95 transition-all border border-natural/10 focus:outline-none cursor-pointer"
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
                    <div className="aspect-square bg-neutral-100/50 relative overflow-hidden flex-shrink-0 p-4 flex items-center justify-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h3 className="text-xs font-bold text-[#4a556a] leading-snug truncate transition-colors duration-200">
                          {product.name}
                        </h3>

                        {/* Stars and reviews */}
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-natural">
                          <Star size={11} className="text-amber-400 fill-amber-400" />
                          <span className="text-[#4a556a] font-bold">{product.rating}</span>
                          <span>({product.reviews})</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="space-y-3 pt-3 border-t border-natural/10 mt-3">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-extrabold text-[#4a556a]">₹{product.price.toLocaleString("en-IN")}</span>
                          <span className="text-[10px] text-natural line-through font-medium">₹{product.originalPrice.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Action Button */}
                  <div className="px-4 pb-4">
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="w-full h-8.5 bg-[#4a556a] hover:bg-[#4a556a]/90 active:scale-98 text-warm-ivory text-[11px] font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1 focus:outline-none cursor-pointer"
                    >
                      <ShoppingCart size={12} className="stroke-[2.5px]" />
                      Add to Cart
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Special Offer Banner */}
      <section id="special-offer" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-apricot/10 border border-natural/20 rounded-2xl overflow-hidden shadow-xs relative">

          {/* Subtle Leaf Shadow Graphic overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-natural/5 via-transparent to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-8 sm:p-12">

            {/* Banner Left Details */}
            <div className="md:col-span-7 space-y-4 text-center md:text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-apricot">
                Special Offer
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#4a556a] leading-tight">
                Up to 50% Off
              </h2>
              <p className="text-xs sm:text-sm text-[#dde0f0] max-w-md leading-relaxed font-medium">
                Limited time offer on selected items. Hurry up and grab the best deals!
              </p>
              <button className="h-11 px-6 bg-[#dde0f0] hover:bg-[#dde0f0]/90 active:scale-98 text-black font-bold text-xs tracking-wider rounded-lg transition-all flex items-center gap-2 mx-auto md:mx-0 shadow-sm cursor-pointer">
                Shop the Sale
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Banner Right Image */}
            <div className="md:col-span-5 flex justify-center relative">
              <img
                src="/special_offer.png"
                alt="Special Offer Sale Kraft Bag"
                className="w-full max-w-[340px] h-auto object-contain hover:scale-[1.02] transition-transform duration-500 drop-shadow-xl select-none"
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
            <button className="w-8 h-8 rounded-full border border-natural/25 flex items-center justify-center text-[#4a556a] hover:border-[#4a556a] hover:bg-white/50 active:scale-95 transition-all focus:outline-none cursor-pointer">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 rounded-full border border-natural/25 flex items-center justify-center text-[#4a556a] hover:border-[#4a556a] hover:bg-white/50 active:scale-95 transition-all focus:outline-none cursor-pointer">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white border border-natural/15 p-6 rounded-2xl shadow-xs flex flex-col justify-between space-y-6 hover:shadow-sm transition-all duration-300"
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
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF3E3] flex items-center justify-center text-xs text-[#4a556a]/60 font-bold">Loading products...</div>}>
      <HomeContent />
    </Suspense>
  );
}
