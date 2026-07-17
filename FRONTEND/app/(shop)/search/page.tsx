"use client";

import React, { useState, useEffect, Suspense, useMemo, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Product, FALLBACK_PRODUCTS } from "@/lib/fallbackData";
import {
  Heart,
  ShoppingCart,
  Star,
  SlidersHorizontal,
  X,
  ChevronDown,
  ArrowLeft,
  Check,
  Search,
  Zap,
  Tag,
  Clock,
  Palette,
  Ruler,
  Store,
} from "lucide-react";



// ─── Filter Constants ─────────────────────────────────────────────────────────
const PRICE_RANGES = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 – ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 – ₹2,500", min: 1000, max: 2500 },
  { label: "₹2,500 – ₹5,000", min: 2500, max: 5000 },
  { label: "Above ₹5,000", min: 5000, max: Infinity },
];

const DISCOUNT_RANGES = [
  { label: "10% and above", min: 10 },
  { label: "20% and above", min: 20 },
  { label: "30% and above", min: 30 },
  { label: "50% and above", min: 50 },
];

const DELIVERY_OPTIONS = [
  { label: "1–2 Days", maxDays: 2 },
  { label: "3–5 Days", maxDays: 5 },
  { label: "7+ Days", maxDays: 999 },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Avg. Customer Rating" },
  { value: "rating-reviews", label: "Ratings & Reviews" },
  { value: "discount", label: "Biggest Discount" },
];

// ─── Custom Sort Dropdown ────────────────────────────────────────────────────
function SortDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const selected = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm ${
          open
            ? "bg-[#4a556a] text-white border-[#4a556a] shadow-md"
            : "bg-white text-[#4a556a] border-natural/20 hover:border-[#4a556a]/40 hover:shadow-md"
        }`}
      >
        <span className={`text-[10px] font-semibold mr-0.5 ${ open ? "text-white/60" : "text-[#4a556a]/45" }`}>
          Sort
        </span>
        <span className="truncate max-w-[110px]">{selected.label}</span>
        <ChevronDown
          size={13}
          className={`flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-180 text-white/70" : "text-[#4a556a]/40"
          }`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-xl border border-natural/10 overflow-hidden"
          style={{ minWidth: "190px", animation: "fadeSlideDown 0.15s ease" }}
        >
          {/* Header strip */}
          <div className="px-4 py-2 bg-[#4a556a]/5 border-b border-natural/8">
            <p className="text-[9px] font-bold text-[#4a556a]/50 uppercase tracking-widest">Sort by</p>
          </div>

          {SORT_OPTIONS.map((opt, idx) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-[11px] font-semibold transition-all duration-150 cursor-pointer group ${
                opt.value === value
                  ? "bg-apricot/8 text-apricot"
                  : "text-[#4a556a]/75 hover:bg-[#4a556a] hover:text-white"
              } ${idx !== SORT_OPTIONS.length - 1 ? "border-b border-natural/6" : ""}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all ${
                  opt.value === value
                    ? "bg-apricot scale-110"
                    : "bg-[#4a556a]/20 group-hover:bg-white/60"
                }`}
              />
              {opt.label}
              {opt.value === value && (
                <Check size={11} className="ml-auto text-apricot flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}



// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcDiscount(price: number, original: number) {
  if (original <= 0) return 0;
  return Math.round(((original - price) / original) * 100);
}

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
    <label
      className="flex items-center gap-3 py-3 border-b border-natural/8 cursor-pointer group last:border-b-0"
      onClick={onToggle}
    >
      <div
        className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-all ${
          checked
            ? "bg-apricot border-apricot"
            : "border-natural/30 group-hover:border-apricot"
        }`}
      >
        {checked && <Check size={10} className="text-white stroke-[3px]" />}
      </div>
      <span className="text-[12px] font-medium text-[#4a556a]/80 group-hover:text-[#4a556a] leading-tight flex-1">
        {children}
      </span>
    </label>
  );
}

// ─── Two-panel FilterPanel (reference-image style) ────────────────────────────
interface FilterPanelProps {
  products: Product[];
  // brand
  selectedBrands: string[];
  toggleBrand: (b: string) => void;
  // color
  selectedColors: string[];
  toggleColor: (c: string) => void;
  // size
  selectedSizes: string[];
  toggleSize: (s: string) => void;
  // price
  priceLimit: number | null;
  setPriceLimit: (p: number | null) => void;
  priceLimits: { min: number; max: number };
  // discount
  selectedDiscounts: number[];
  toggleDiscount: (i: number) => void;
  // rating
  selectedRating: number | null;
  setSelectedRating: (r: number | null) => void;
  // delivery
  selectedDelivery: number | null;
  setSelectedDelivery: (d: number | null) => void;
  // clear
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
  query?: string;
}

function PriceSlider({
  priceLimit,
  setPriceLimit,
  min,
  max,
}: {
  priceLimit: number | null;
  setPriceLimit: (p: number | null) => void;
  min: number;
  max: number;
}) {
  const [localVal, setLocalVal] = useState(priceLimit !== null ? priceLimit : max);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalVal(priceLimit !== null ? priceLimit : max);
  }, [priceLimit, max]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleChange = (val: number) => {
    setLocalVal(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setPriceLimit(val);
    }, 150);
  };

  return (
    <div className="pt-2 pb-1 px-1 space-y-2">
      <input
        type="range"
        min={min}
        max={max}
        value={localVal}
        onChange={(e) => handleChange(Number(e.target.value))}
        onMouseUp={() => setPriceLimit(localVal)}
        onTouchEnd={() => setPriceLimit(localVal)}
        className="w-full h-1 bg-[#4a556a]/10 rounded-lg appearance-none cursor-pointer accent-apricot"
      />
      <div className="flex items-center justify-between text-[10px] font-semibold text-[#4a556a]/60">
        <span>₹{min}</span>
        <span className="text-apricot font-bold text-xs bg-apricot/5 px-2.5 py-0.5 rounded-full border border-apricot/15">
          Up to ₹{localVal.toLocaleString("en-IN")}
        </span>
        <span>₹{max}</span>
      </div>
    </div>
  );
}

function FilterPanel({
  products,
  selectedBrands, toggleBrand,
  selectedColors, toggleColor,
  selectedSizes, toggleSize,
  priceLimit, setPriceLimit, priceLimits,
  selectedDiscounts, toggleDiscount,
  selectedRating, setSelectedRating,
  selectedDelivery, setSelectedDelivery,
  hasActiveFilters, clearAllFilters,
  query = "",
}: FilterPanelProps) {

  // Accordion open state — multiple sections can be open at once
  const [openSections, setOpenSections] = useState<string[]>(["brand"]);
  const toggleSection = (id: string) =>
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  // Derive unique values from product data
  const brands = useMemo(() => {
    const lq = query.toLowerCase();
    const isFootwearQuery = lq.includes("shoe") || lq.includes("sneaker") || lq.includes("footwear");
    const hasFootwearProducts = products.some((p) => (p.category || "").toLowerCase() === "footwear");
    
    if (isFootwearQuery || hasFootwearProducts) {
      return ["Adidas", "Nike", "FILA", "HRX", "Puma", "Superdry"];
    }

    const s = new Set(products.map((p) => p.brand).filter(Boolean) as string[]);
    return Array.from(s).sort();
  }, [products, query]);

  const colors = useMemo(() => {
    const s = new Set(products.map((p) => p.color).filter(Boolean) as string[]);
    return Array.from(s).sort();
  }, [products]);

  const sizes = useMemo(() => {
    const ORDER = ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "One Size", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];
    const s = new Set(products.map((p) => p.size).filter(Boolean) as string[]);
    const arr = Array.from(s);
    return arr.sort((a, b) => {
      const ai = ORDER.indexOf(a), bi = ORDER.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [products]);

  // Determine if we should show the size filter (fashion or footwear searches/products)
  const showSizeFilter = useMemo(() => {
    const lq = query.toLowerCase();
    const isFashionOrFootwearQuery =
      lq.includes("shoe") ||
      lq.includes("sneaker") ||
      lq.includes("footwear") ||
      lq.includes("clothing") ||
      lq.includes("dress") ||
      lq.includes("wear") ||
      lq.includes("shirt") ||
      lq.includes("jeans") ||
      lq.includes("fashion");
      
    const hasFashionOrFootwearProducts = products.some((p) => {
      const cat = (p.category || "").toLowerCase();
      return cat === "fashion" || cat === "footwear" || cat === "clothing" || cat === "shoes";
    });

    return isFashionOrFootwearQuery || hasFashionOrFootwearProducts;
  }, [products, query]);

  // Reusable accordion section
  const Section = ({
    id, icon, label, badge, children,
  }: {
    id: string;
    icon: React.ReactNode;
    label: string;
    badge: number;
    children: React.ReactNode;
  }) => {
    const open = openSections.includes(id);
    return (
      <div className="border-b border-natural/10 last:border-b-0">
        <button
          type="button"
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between px-4 py-3 text-[11px] font-bold text-[#4a556a] hover:bg-warm-ivory/60 transition-colors cursor-pointer group"
        >
          <span className="flex items-center gap-2">
            <span className={`transition-colors ${open ? "text-apricot" : "text-[#4a556a]/40 group-hover:text-[#4a556a]/60"}`}>
              {icon}
            </span>
            {label}
          </span>
          <span className="flex items-center gap-1.5">
            {badge > 0 && (
              <span className="w-4 h-4 bg-apricot text-white rounded-full text-[8px] flex items-center justify-center font-bold">
                {badge}
              </span>
            )}
            <ChevronDown
              size={13}
              className={`text-[#4a556a]/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </span>
        </button>
        {open && (
          <div className="px-4 pb-3 space-y-0.5">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-natural/10">
        <h2 className="text-sm font-bold text-[#4a556a]">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-[10px] font-bold text-apricot hover:underline cursor-pointer uppercase tracking-wide"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Brand */}
      <Section id="brand" icon={<Store size={12} />} label="Brand" badge={selectedBrands.length}>
        {brands.map((b) => (
          <FilterCheckbox key={b} checked={selectedBrands.includes(b)} onToggle={() => toggleBrand(b)}>
            {b}
          </FilterCheckbox>
        ))}
      </Section>

      {/* Color */}
      <Section id="color" icon={<Palette size={12} />} label="Color" badge={selectedColors.length}>
        {colors.map((c) => (
          <FilterCheckbox key={c} checked={selectedColors.includes(c)} onToggle={() => toggleColor(c)}>
            <span className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full border border-natural/20 flex-shrink-0"
                style={{ background: COLOR_MAP[c] || "#ccc" }}
              />
              {c}
            </span>
          </FilterCheckbox>
        ))}
      </Section>

      {/* Size */}
      {showSizeFilter && sizes.length > 0 && (
        <Section id="size" icon={<Ruler size={12} />} label="Size" badge={selectedSizes.length}>
          {sizes.map((s) => (
            <FilterCheckbox key={s} checked={selectedSizes.includes(s)} onToggle={() => toggleSize(s)}>
              {s}
            </FilterCheckbox>
          ))}
        </Section>
      )}

      {/* Price Range */}
      <Section id="price" icon={<Tag size={12} />} label="Price Range" badge={0}>
        <PriceSlider
          priceLimit={priceLimit}
          setPriceLimit={setPriceLimit}
          min={priceLimits.min}
          max={priceLimits.max}
        />
      </Section>


      {/* Discount */}
      <Section id="discount" icon={<Zap size={12} />} label="Discount" badge={selectedDiscounts.length}>
        {DISCOUNT_RANGES.map((d, i) => (
          <FilterCheckbox key={i} checked={selectedDiscounts.includes(i)} onToggle={() => toggleDiscount(i)}>
            {d.label}
          </FilterCheckbox>
        ))}
      </Section>

      {/* Rating */}
      <Section id="rating" icon={<Star size={12} />} label="Rating" badge={selectedRating ? 1 : 0}>
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
                    size={11}
                    className={i < stars ? "text-amber-400 fill-amber-400" : "text-natural/20 fill-natural/10"}
                  />
                ))}
              </span>
              <span className="text-[#4a556a]/60">& up</span>
            </span>
          </FilterCheckbox>
        ))}
      </Section>

      {/* Delivery Time */}
      <Section id="delivery" icon={<Clock size={12} />} label="Delivery Time" badge={selectedDelivery != null ? 1 : 0}>
        {DELIVERY_OPTIONS.map((opt) => (
          <FilterCheckbox
            key={opt.maxDays}
            checked={selectedDelivery === opt.maxDays}
            onToggle={() => setSelectedDelivery(selectedDelivery === opt.maxDays ? null : opt.maxDays)}
          >
            <span className="flex items-center gap-1.5">
              <Clock size={11} className="text-apricot" />
              {opt.label}
            </span>
          </FilterCheckbox>
        ))}
      </Section>
    </div>
  );
}

// ─── Color map for swatches ───────────────────────────────────────────────────
const COLOR_MAP: Record<string, string> = {
  Black: "#111827",
  White: "#f9fafb",
  Red: "#ef4444",
  Blue: "#3b82f6",
  Green: "#22c55e",
  Yellow: "#eab308",
  Orange: "#f97316",
  Purple: "#a855f7",
  Pink: "#ec4899",
  Brown: "#92400e",
  Grey: "#6b7280",
  Silver: "#9ca3af",
  Gold: "#ca8a04",
  Beige: "#d4b896",
  Charcoal: "#374151",
  Clear: "#e5e7eb",
  Multicolor: "linear-gradient(135deg, #ef4444, #3b82f6, #22c55e, #eab308)",
  "Rose Gold": "#be9b8f",
  "8 UK": "#60a5fa",
  "Free Size": "#a3e635",
};

// ─── Desktop sidebar wrapper ──────────────────────────────────────────────────
function FilterSidebar(props: FilterPanelProps) {
  return (
    <div className="bg-white border border-natural/10 rounded-2xl overflow-hidden shadow-xs">
      <FilterPanel {...props} />
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
  const discount = calcDiscount(product.price, product.originalPrice);

  return (
    <div className="group bg-white hover:bg-[#4A5568] border border-natural/10 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-natural/25 hover:-translate-y-0.5 transition-all duration-300 flex flex-col relative">
      {discount > 0 && (
        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-apricot text-white text-xs sm:text-sm font-bold rounded-full shadow-md">
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
            {product.brand && (
              <p className="text-[9px] font-semibold text-[#4a556a]/50 group-hover:text-warm-ivory/60 transition-colors">
                {product.brand}
              </p>
            )}
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

          <div className="pt-3 border-t border-natural/8 mt-3 space-y-2">
            {/* Delivery badge */}
            {product.deliveryDays != null && (
              <div className="flex items-center gap-1 text-[9px] font-semibold text-fern/80 group-hover:text-warm-ivory/70 transition-colors">
                <Clock size={9} />
                {product.deliveryDays <= 2 ? "Express " : ""}Delivery in {product.deliveryDays} day{product.deliveryDays !== 1 ? "s" : ""}
              </div>
            )}
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

  useEffect(() => {
    const qLower = query.trim().toLowerCase();
    if (qLower === "shoes" || qLower === "shoe") {
      router.replace("/category/8?filter=shoes");
    }
  }, [query, router]);

  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState("featured");

  // Filter state
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceLimit, setPriceLimit] = useState<number | null>(null);
  const [selectedDiscounts, setSelectedDiscounts] = useState<number[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<number | null>(null);
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
              rating: Number(p.rating ?? 0),
              reviews: Number(p.reviews ?? 0),
              category: p.category?.name || "General",
              brand: p.brand || undefined,
              color: p.color || undefined,
              size: p.size || undefined,
              deliveryDays: p.deliveryDays || undefined,
              maxOrderQuantity: p.maxOrderQuantity || 10,
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
      brand: product.brand || "facile Store",
      image: product.image,
      maxOrderQuantity: product.maxOrderQuantity || 10,
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

  // ── Toggles ─────────────────────────────────────────────────────────────────
  const toggleBrand = (b: string) =>
    setSelectedBrands((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]);

  const toggleColor = (c: string) =>
    setSelectedColors((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const toggleSize = (s: string) =>
    setSelectedSizes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const togglePriceRange = (idx: number) => {}; // unused now

  const toggleDiscount = (idx: number) =>
    setSelectedDiscounts((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]);

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceLimit(null);
    setSelectedDiscounts([]);
    setSelectedRating(null);
    setSelectedDelivery(null);
    setSortBy("featured");
  };

  // ── Filtering Pipeline ──────────────────────────────────────────────────────
  const queryFiltered = products.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.brand || "").toLowerCase().includes(q)
    );
  });

  // Derive min and max price limits dynamically from queryFiltered products
  const priceLimits = useMemo(() => {
    if (!queryFiltered || queryFiltered.length === 0) return { min: 0, max: 10000 };
    const prices = queryFiltered.map((p) => Number(p.price));
    let min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) {
      min = 0;
    }
    return { min, max };
  }, [queryFiltered]);

  const brandFiltered =
    selectedBrands.length === 0
      ? queryFiltered
      : queryFiltered.filter((p) => p.brand && selectedBrands.includes(p.brand));

  const colorFiltered =
    selectedColors.length === 0
      ? brandFiltered
      : brandFiltered.filter((p) => p.color && selectedColors.includes(p.color));

  const sizeFiltered =
    selectedSizes.length === 0
      ? colorFiltered
      : colorFiltered.filter((p) => p.size && selectedSizes.includes(p.size));

  const priceFiltered =
    priceLimit === null
      ? sizeFiltered
      : sizeFiltered.filter((p) => p.price <= priceLimit);

  const discountFiltered =
    selectedDiscounts.length === 0
      ? priceFiltered
      : priceFiltered.filter((p) => {
          const disc = calcDiscount(p.price, p.originalPrice);
          return selectedDiscounts.some((idx) => disc >= DISCOUNT_RANGES[idx].min);
        });

  const ratingFiltered = selectedRating
    ? discountFiltered.filter((p) => p.rating >= selectedRating)
    : discountFiltered;

  const deliveryFiltered =
    selectedDelivery == null
      ? ratingFiltered
      : ratingFiltered.filter(
          (p) => p.deliveryDays != null && p.deliveryDays <= selectedDelivery
        );

  const sortedProducts = [...deliveryFiltered].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "discount")
      return calcDiscount(b.price, b.originalPrice) - calcDiscount(a.price, a.originalPrice);
    
    // Default ("featured") and "rating-reviews" sort: Rating (desc) then reviews (desc)
    const ratA = Number(a.rating || 0);
    const ratB = Number(b.rating || 0);
    if (ratB !== ratA) return ratB - ratA;
    return Number(b.reviews || 0) - Number(a.reviews || 0);
  });

  const totalActiveFilters =
    selectedBrands.length +
    selectedColors.length +
    selectedSizes.length +
    (priceLimit !== null ? 1 : 0) +
    selectedDiscounts.length +
    (selectedRating ? 1 : 0) +
    (selectedDelivery != null ? 1 : 0);

  const hasActiveFilters = totalActiveFilters > 0;

  const filterPanelProps: FilterPanelProps = {
    products: queryFiltered,
    selectedBrands, toggleBrand,
    selectedColors, toggleColor,
    selectedSizes, toggleSize,
    priceLimit, setPriceLimit, priceLimits,
    selectedDiscounts, toggleDiscount,
    selectedRating, setSelectedRating,
    selectedDelivery, setSelectedDelivery,
    hasActiveFilters, clearAllFilters,
    query,
  };

  return (
    <div className="bg-[#F4F4F0] min-h-screen relative pb-16">

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
          <div className="relative ml-auto w-72 bg-white h-full shadow-2xl flex flex-col animate-slide-in">
            {/* Scrollable accordion body */}
            <div className="flex-1 overflow-y-auto">
              <FilterPanel {...filterPanelProps} />
            </div>

            {/* Footer */}
            <div className="flex border-t border-natural/10">
              <button
                onClick={() => { clearAllFilters(); setIsMobileFilterOpen(false); }}
                className="flex-1 py-3.5 text-xs font-bold text-[#4a556a]/60 hover:text-[#4a556a] transition-colors cursor-pointer"
              >
                CLOSE
              </button>
              <div className="w-px bg-natural/10" />
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3.5 text-xs font-bold text-apricot hover:text-apricot/80 transition-colors cursor-pointer"
              >
                APPLY ({sortedProducts.length})
              </button>
            </div>
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
                  {totalActiveFilters}
                </span>
              )}
            </button>

            {/* Sort dropdown */}
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        {/* Active filter pills */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-5 ml-11 sm:ml-0">
            {selectedBrands.map((b) => (
              <button key={b} onClick={() => toggleBrand(b)} className="flex items-center gap-1 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer">
                <Store size={8} />{b}<X size={9} />
              </button>
            ))}
            {selectedColors.map((c) => (
              <button key={c} onClick={() => toggleColor(c)} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer">
                <span className="w-2.5 h-2.5 rounded-full border border-natural/20 flex-shrink-0" style={{ background: COLOR_MAP[c] || "#ccc" }} />
                {c}<X size={9} />
              </button>
            ))}
            {selectedSizes.map((s) => (
              <button key={s} onClick={() => toggleSize(s)} className="flex items-center gap-1 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer">
                <Ruler size={8} />{s}<X size={9} />
              </button>
            ))}
            {priceLimit !== null && (
              <button type="button" onClick={() => setPriceLimit(null)} className="flex items-center gap-1 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer">
                Up to ₹{priceLimit.toLocaleString("en-IN")}<X size={9} />
              </button>
            )}
            {selectedDiscounts.map((idx) => (
              <button key={idx} onClick={() => toggleDiscount(idx)} className="flex items-center gap-1 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer">
                <Zap size={8} />{DISCOUNT_RANGES[idx].label}<X size={9} />
              </button>
            ))}
            {selectedRating && (
              <button onClick={() => setSelectedRating(null)} className="flex items-center gap-1 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer">
                {selectedRating}★ & up<X size={9} />
              </button>
            )}
            {selectedDelivery != null && (
              <button onClick={() => setSelectedDelivery(null)} className="flex items-center gap-1 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer">
                <Clock size={8} />
                {DELIVERY_OPTIONS.find((o) => o.maxDays === selectedDelivery)?.label}
                <X size={9} />
              </button>
            )}
          </div>
        )}

        {/* Two-column layout */}
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar {...filterPanelProps} />
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
                  We couldn&apos;t find anything matching your filters.
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
