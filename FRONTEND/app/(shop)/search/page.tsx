"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  Heart,
  ShoppingCart,
  Star,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Check,
  Search,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
};

// ─── Fallback Data ────────────────────────────────────────────────────────────
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "bs1",
    name: "Smart Watch Series 5",
    description: "Stay connected with premium Smart Watch. Features heart rate monitoring, fitness tracking, GPS, and always-on display.",
    price: 8999, originalPrice: 12999,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400",
    rating: 4.5, reviews: 128, category: "Electronics",
  },
  {
    id: "bs2",
    name: "Wireless Headphones",
    description: "Premium sound with hybrid Active Noise Cancelling. 40 hours playtime, memory-foam earcups, crystal-clear calls.",
    price: 5999, originalPrice: 8999,
    image: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=400",
    rating: 4.7, reviews: 98, category: "Electronics",
  },
  {
    id: "bs3",
    name: "Travel Backpack",
    description: "Water-resistant backpack with laptop compartment, hidden pockets, USB port, and ergonomic straps.",
    price: 3999, originalPrice: 5999,
    image: "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?q=80&w=400",
    rating: 4.6, reviews: 156, category: "Fashion",
  },
  {
    id: "bs4",
    name: "Running Shoes",
    description: "High-performance running shoes with breathable mesh upper, responsive foam midsole, and rubber outsole.",
    price: 4999, originalPrice: 7999,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=400",
    rating: 4.4, reviews: 78, category: "Sports",
  },
  {
    id: "bs5",
    name: "Luxury Perfume",
    description: "Enchanting floral oriental fragrance. Long-lasting with bergamot top notes and sandalwood base.",
    price: 2999, originalPrice: 4999,
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=400",
    rating: 4.8, reviews: 64, category: "Beauty",
  },
  {
    id: "bs6",
    name: "Portable Bluetooth Speaker",
    description: "360° immersive sound with deep bass. Waterproof, 20-hour battery, and built-in mic for hands-free calls.",
    price: 2499, originalPrice: 3499,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=400",
    rating: 4.6, reviews: 112, category: "Electronics",
  },
  {
    id: "bs7",
    name: "Classic Sunglasses",
    description: "UV400 protected lenses in a timeless frame. Lightweight, durable, and stylish for all occasions.",
    price: 1499, originalPrice: 2299,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=400",
    rating: 4.5, reviews: 87, category: "Fashion",
  },
  {
    id: "bs8",
    name: "Ceramic Coffee Set",
    description: "Handcrafted ceramic coffee set with 4 cups and matching pour-over dripper. Dishwasher safe.",
    price: 1899, originalPrice: 2799,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=400",
    rating: 4.7, reviews: 73, category: "Home & Kitchen",
  },
  {
    id: "bs9",
    name: "Premium Yoga Mat",
    description: "Eco-friendly non-slip yoga mat with alignment lines, carrying strap, and 6mm cushioning.",
    price: 1299, originalPrice: 1999,
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=400",
    rating: 4.8, reviews: 145, category: "Sports",
  },
  {
    id: "bs10",
    name: "Minimal Desk Lamp",
    description: "Touch-controlled LED lamp with 3 color temps, 10 brightness levels, and USB charging port.",
    price: 2199, originalPrice: 3199,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=400",
    rating: 4.4, reviews: 59, category: "Home & Kitchen",
  },
];

// ─── Filter Constants ─────────────────────────────────────────────────────────
const PRICE_RANGES = [
  { label: "Under ₹1,000", min: 0, max: 1000 },
  { label: "₹1,000 – ₹2,500", min: 1000, max: 2500 },
  { label: "₹2,500 – ₹5,000", min: 2500, max: 5000 },
  { label: "Above ₹5,000", min: 5000, max: Infinity },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Avg. Customer Rating" },
];

// ─── FilterCheckbox ───────────────────────────────────────────────────────────
function FilterCheckbox({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group" onClick={onToggle}>
      <div
        className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-all ${checked
            ? "bg-[#4a556a] border-[#4a556a]"
            : "border-natural/30 group-hover:border-[#4a556a]"
          }`}
      >
        {checked && <Check size={10} className="text-white stroke-[3px]" />}
      </div>
      <span className="text-[11px] font-medium text-[#4a556a]/80 group-hover:text-[#4a556a] leading-tight">
        {children}
      </span>
    </label>
  );
}

// ─── FilterSidebar ────────────────────────────────────────────────────────────
function FilterSidebar({
  selectedPriceRanges,
  togglePriceRange,
  selectedRating,
  setSelectedRating,
  hasActiveFilters,
  clearAllFilters,
}: {
  selectedPriceRanges: number[];
  togglePriceRange: (idx: number) => void;
  selectedRating: number | null;
  setSelectedRating: (r: number | null) => void;
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
}) {
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isRatingOpen, setIsRatingOpen] = useState(true);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#4a556a]">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-[10px] font-bold text-apricot hover:underline cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Price Range */}
      <div className="bg-white border border-natural/10 rounded-2xl overflow-hidden shadow-xs">
        <button
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-[#4a556a] hover:bg-warm-ivory/60 transition-colors cursor-pointer"
        >
          Price Range
          {isPriceOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        {isPriceOpen && (
          <div className="px-4 pb-4 space-y-3 border-t border-natural/8">
            {PRICE_RANGES.map((range, idx) => (
              <FilterCheckbox
                key={idx}
                checked={selectedPriceRanges.includes(idx)}
                onToggle={() => togglePriceRange(idx)}
              >
                {range.label}
              </FilterCheckbox>
            ))}
          </div>
        )}
      </div>

      {/* Customer Rating */}
      <div className="bg-white border border-natural/10 rounded-2xl overflow-hidden shadow-xs">
        <button
          onClick={() => setIsRatingOpen(!isRatingOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-[#4a556a] hover:bg-warm-ivory/60 transition-colors cursor-pointer"
        >
          Customer Rating
          {isRatingOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        {isRatingOpen && (
          <div className="px-4 pb-4 space-y-3 border-t border-natural/8">
            {[4, 3, 2].map((stars) => (
              <FilterCheckbox
                key={stars}
                checked={selectedRating === stars}
                onToggle={() => setSelectedRating(selectedRating === stars ? null : stars)}
              >
                <span className="flex items-center gap-1.5">
                  <span className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={10}
                        className={
                          i < stars
                            ? "text-amber-400 fill-amber-400"
                            : "text-natural/20 fill-natural/10"
                        }
                      />
                    ))}
                  </span>
                  <span className="text-[#4a556a]/60">& up</span>
                </span>
              </FilterCheckbox>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────
function ProductCard({
  product,
  isFav,
  onAddToCart,
  onToggleFavorite,
}: {
  product: Product;
  isFav: boolean;
  onAddToCart: (e: React.MouseEvent) => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}) {
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="group bg-white hover:bg-[#4A5568] border border-natural/10 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-natural/25 hover:-translate-y-0.5 transition-all duration-300 flex flex-col relative">
      {discount > 0 && (
        <div className="absolute top-3 left-3 z-10 px-1.5 py-0.5 bg-apricot text-white text-[9px] font-bold rounded-full shadow-sm">
          -{discount}%
        </div>
      )}

      <button
        onClick={onToggleFavorite}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/95 text-[#4a556a] hover:text-apricot shadow-xs hover:scale-110 active:scale-95 transition-all border border-natural/10 focus:outline-none cursor-pointer"
        aria-label="Add to wishlist"
      >
        <Heart size={13} style={isFav ? { fill: "#870339", color: "#870339" } : {}} />
      </button>

      <Link href={`/product/${product.id}`} className="flex flex-col flex-1">
        <div className="aspect-square bg-neutral-50 overflow-hidden flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>

        <div className="p-3.5 flex-1 flex flex-col justify-between">
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-apricot group-hover:text-warm-ivory/85 uppercase tracking-wider transition-colors">
              {product.category}
            </p>
            <h3 className="text-xs font-bold text-[#4a556a] group-hover:text-warm-ivory leading-snug line-clamp-2 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={9}
                    className={
                      i < Math.floor(product.rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-natural/20"
                    }
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-[#4a556a] group-hover:text-warm-ivory transition-colors">{product.rating}</span>
              <span className="text-[10px] text-natural/50 group-hover:text-warm-ivory/60 transition-colors">({product.reviews})</span>
            </div>
          </div>

          <div className="pt-3 border-t border-natural/8 mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-extrabold text-[#4a556a] group-hover:text-warm-ivory transition-colors">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-natural/45 group-hover:text-warm-ivory/60 line-through font-medium transition-colors">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div className="px-3.5 pb-3.5">
        <button
          onClick={onAddToCart}
          className="w-full h-8 bg-[#4a556a] group-hover:bg-[#DDE0F0] group-hover:text-[#4a556a] hover:scale-[1.02] active:scale-[0.98] text-warm-ivory text-[10px] font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
        >
          <ShoppingCart size={11} className="stroke-[2.5px]" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

// ─── SearchContent ────────────────────────────────────────────────────────────
function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams?.get("q") || "";

  const { addToCart, toggleFavorite, favorites } = useCart();

  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [sortBy, setSortBy] = useState("featured");
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<number[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: Product[] = (data as any[]).map((p) => ({
              id: "bs" + p.id,
              name: p.title,
              description: p.description || "",
              price: p.sellingPrice,
              originalPrice: p.mrp,
              image: p.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400",
              rating: p.rating,
              reviews: p.reviews,
              category: p.category?.name || "General",
            }));
            setProducts(mapped);
          }
        }
      } catch {
        // fallback already loaded
      }
    };
    fetchProducts();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      brand: "facile Store",
      image: product.image,
    });
    triggerToast(`Added ${product.name} to your bag! 🛍️`);
  };

  const handleToggleFavorite = (id: string, name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id);
    const isNow = !favorites.includes(id);
    triggerToast(isNow ? `Added ${name} to Wishlist! ❤️` : `Removed ${name} from Wishlist.`);
  };

  // ── Filtering ──────────────────────────────────────────────────────────────
  const queryFiltered = products.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const priceFiltered =
    selectedPriceRanges.length === 0
      ? queryFiltered
      : queryFiltered.filter((p) =>
        selectedPriceRanges.some((idx) => {
          const r = PRICE_RANGES[idx];
          return p.price >= r.min && p.price < r.max;
        })
      );

  const ratingFiltered = selectedRating
    ? priceFiltered.filter((p) => p.rating >= selectedRating)
    : priceFiltered;

  const sortedProducts = [...ratingFiltered].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  const togglePriceRange = (idx: number) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const clearAllFilters = () => {
    setSelectedPriceRanges([]);
    setSelectedRating(null);
    setSortBy("featured");
  };

  const hasActiveFilters = selectedPriceRanges.length > 0 || selectedRating !== null;

  const filterSidebarProps = {
    selectedPriceRanges,
    togglePriceRange,
    selectedRating,
    setSelectedRating,
    hasActiveFilters,
    clearAllFilters,
  };

  return (
    <div className="bg-[#FAF3E3] min-h-screen relative pb-16">

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-fern text-warm-ivory py-3 px-5 rounded-2xl shadow-xl flex items-center gap-2 border border-natural/30 animate-slide-in text-xs font-semibold">
          <Check size={16} className="text-apricot stroke-[3px]" />
          {toastMessage}
        </div>
      )}

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-72 bg-[#FAF3E3] h-full shadow-2xl p-5 overflow-y-auto animate-slide-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-[#4a556a]">Filters</h2>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 hover:bg-natural/10 rounded-full cursor-pointer text-[#4a556a]"
              >
                <X size={18} />
              </button>
            </div>
            <FilterSidebar {...filterSidebarProps} />
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="mt-6 w-full h-10 bg-[#4a556a] text-warm-ivory text-xs font-bold rounded-xl cursor-pointer hover:bg-[#4a556a]/90 transition-all shadow-sm"
            >
              Show {sortedProducts.length} Result{sortedProducts.length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-natural/10 text-[#4a556a] transition-all cursor-pointer flex-shrink-0 border border-natural/15"
              aria-label="Go back"
            >
              <ArrowLeft size={16} />
            </button>
            <p className="text-xs text-[#4a556a]/65 font-medium">
              {sortedProducts.length === 0 ? (
                "No results"
              ) : (
                <>
                  <span className="font-bold text-[#4a556a]">1–{sortedProducts.length}</span>
                  {" "}of{" "}
                  <span className="font-bold text-[#4a556a]">{sortedProducts.length}</span> results
                </>
              )}
              {query && (
                <> for <span className="text-apricot font-bold">&ldquo;{query}&rdquo;</span></>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 ml-11 sm:ml-0 flex-shrink-0">
            {/* Mobile Filters button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white border border-natural/20 rounded-full text-xs font-bold text-[#4a556a] hover:border-[#4a556a]/40 transition-all cursor-pointer shadow-xs"
            >
              <SlidersHorizontal size={13} />
              Filters
              {hasActiveFilters && (
                <span className="w-4 h-4 bg-apricot text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                  {selectedPriceRanges.length + (selectedRating ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Sort dropdown */}
            <div className="relative flex items-center gap-1.5 bg-white border border-natural/20 rounded-full pl-3 pr-8 py-1.5 shadow-xs">
              <span className="text-[10px] text-[#4a556a]/45 font-semibold whitespace-nowrap">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-[#4a556a] font-bold text-xs focus:outline-none cursor-pointer appearance-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-3 pointer-events-none text-[#4a556a]/40" />
            </div>
          </div>
        </div>

        {/* Active filter tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-5 ml-11 sm:ml-0">
            {selectedPriceRanges.map((idx) => (
              <button
                key={idx}
                onClick={() => togglePriceRange(idx)}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer"
              >
                {PRICE_RANGES[idx].label}
                <X size={9} />
              </button>
            ))}
            {selectedRating && (
              <button
                onClick={() => setSelectedRating(null)}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer"
              >
                {selectedRating}★ & up
                <X size={9} />
              </button>
            )}
          </div>
        )}

        {/* Two-column layout */}
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <FilterSidebar {...filterSidebarProps} />
          </aside>

          {/* Product Grid */}
          <main className="flex-1 min-w-0">
            {sortedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-20 h-20 bg-white border border-natural/15 rounded-3xl flex items-center justify-center mb-5 shadow-xs">
                  <Search size={30} className="text-[#4a556a]/25" />
                </div>
                <h2 className="text-base font-bold text-[#4a556a] mb-2">No results found</h2>
                <p className="text-xs text-[#4a556a]/55 max-w-xs leading-relaxed mb-6">
                  We couldn&apos;t find anything for{" "}
                  <span className="font-bold text-apricot">&ldquo;{query}&rdquo;</span>.
                  Try a different search term or clear your filters.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="px-4 py-2 bg-[#4a556a] text-warm-ivory rounded-full text-xs font-bold hover:bg-[#4a556a]/90 transition-all cursor-pointer shadow-sm"
                    >
                      Clear Filters
                    </button>
                  )}
                  <Link
                    href="/"
                    className="px-4 py-2 bg-white border border-natural/20 text-[#4a556a] rounded-full text-xs font-bold hover:border-[#4a556a]/40 transition-all shadow-xs"
                  >
                    Browse All Products
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFav={favorites.includes(product.id)}
                    onAddToCart={(e) => handleAddToCart(product, e)}
                    onToggleFavorite={(e) => handleToggleFavorite(product.id, product.name, e)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF3E3] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#4a556a]/20 border-t-[#4a556a] rounded-full animate-spin" />
            <p className="text-xs text-[#4a556a]/50 font-semibold">Searching...</p>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
