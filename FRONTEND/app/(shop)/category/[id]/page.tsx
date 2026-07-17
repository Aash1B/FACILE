"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Star,
  ShoppingCart,
  Heart,
  Loader2,
  ChevronDown,
  ChevronRight,
  Store,
  Palette,
  Ruler,
  Tag,
  Zap,
  Clock,
  SlidersHorizontal,
  X,
  Wifi,
  Search,
  Check
} from "lucide-react";
import { useCart } from "@/context/CartContext";

import { CATEGORY_DETAILS, FALLBACK_PRODUCTS_MAP } from "@/lib/fallbackData";

const FALLBACK_SUBCATEGORIES: Record<string, string[]> = {
  "1": ["Mobile Accessories", "Audio Devices", "Smart Watches", "Laptop Accessories", "Gaming Accessories", "Smart Home Devices", "Power Banks", "Cables & Chargers"],
  "2": ["Tops & T-Shirts", "Dresses", "Bottom Wear", "Ethnic Wear", "Winter Wear", "Activewear", "Loungewear", "Co-ord Sets"],
  "3": ["Home Decor", "Kitchen Essentials", "Dining", "Bedding", "Storage & Organization", "Lighting", "Furniture", "Bath Essentials"],
  "4": ["Skincare", "Makeup", "Hair Care", "Fragrances", "Bath & Body", "Nail Care", "Beauty Tools", "Men's Grooming"],
  "5": ["Cricket", "Football", "Badminton", "Gym Equipment", "Cycling", "Running Gear", "Outdoor Games", "Sports Accessories"],
  "6": ["Baby Clothing", "Kids Clothing", "Toys", "Baby Care", "School Essentials", "Feeding Essentials", "Baby Bedding", "Kids Footwear"],
  "7": ["Earrings", "Necklaces", "Bracelets", "Rings", "Watches", "Bags", "Hair Accessories", "Sunglasses"],
  "8": ["Sneakers", "Flats", "Heels", "Sandals", "Boots", "Loafers", "Slippers", "Sports Shoes"],
  "9": ["Notebooks", "Pens & Pencils", "Art Supplies", "Desk Organizers", "Journals", "Planners", "Sticky Notes", "Office Supplies"],
  "10": ["Vitamins & Supplements", "Fitness Equipment", "Personal Care", "Yoga Essentials", "Healthy Snacks", "Massagers", "Health Monitors", "Wellness Kits"],
  "11": ["Dog Supplies", "Cat Supplies", "Pet Food", "Treats", "Toys", "Grooming", "Beds & Mats", "Bowls & Feeders"],
};

const CATEGORY_BRANDS: Record<string, string[]> = {
  "8": ["Adidas", "Nike", "FILA", "HRX", "Puma", "Superdry"],
};

const CARD_STYLES = [
  { surface: "from-[#DDE0F0] to-[#eef0f9]", icon: "bg-[#4a556a]", accent: "bg-[#aeb7d8]" },
  { surface: "from-[#f9dbe8] to-[#fff0f6]", icon: "bg-[#E8437F]", accent: "bg-[#f2a9c7]" },
  { surface: "from-[#eadfcf] to-[#fff8ec]", icon: "bg-[#A58E74]", accent: "bg-[#d9c3a6]" },
];

type SubCategory = { id: number | string; name: string };

// ─── Filter Constants ─────────────────────────────────────────────────────────
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
  { value: "discount", label: "Biggest Discount" },
];

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
  "Free Size": "#a3e635",
};

export default function CategoryPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const categoryId = params.id;
  const subcategoryId = searchParams?.get("subcategory") || null;

  const details = CATEGORY_DETAILS[categoryId] ?? CATEGORY_DETAILS["1"];
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Cart & Favorites integration
  const { addToCart, toggleFavorite, favorites } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter States
  const [priceLimit, setPriceLimit] = useState<number | null>(null);
  const [selectedDiscounts, setSelectedDiscounts] = useState<number[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<number | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedConnectivity, setSelectedConnectivity] = useState<string[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  // Derive min and max price limits dynamically from loaded products
  const priceLimits = useMemo(() => {
    if (!products || products.length === 0) return { min: 0, max: 10000 };
    const prices = products.map((p) => Number(p.sellingPrice));
    let min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) {
      min = 0;
    }
    return { min, max };
  }, [products]);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const price = Number(p.sellingPrice);
      const mrp = Number(p.mrp);
      const discount = mrp > price ? ((mrp - price) / mrp) * 100 : 0;

      // Price limit filter
      if (priceLimit !== null && price > priceLimit) return false;

      // Discount filter
      if (selectedDiscounts.length > 0) {
        const matchesAnyDiscount = selectedDiscounts.some((idx) => {
          const minD = DISCOUNT_RANGES[idx].min;
          return discount >= minD;
        });
        if (!matchesAnyDiscount) return false;
      }

      // Delivery days filter
      if (selectedDelivery !== null) {
        const pDays = Number(p.deliveryDays || 3);
        if (pDays > selectedDelivery) return false;
      }

      // Color filter
      if (selectedColors.length > 0) {
        if (!p.color || !selectedColors.includes(p.color)) return false;
      }

      // Rating filter
      if (selectedRating !== null) {
        const pRating = Number(p.rating || 0);
        if (pRating < selectedRating) return false;
      }

      // Brand filter
      if (selectedBrands.length > 0) {
        if (!p.brand || !selectedBrands.includes(p.brand)) return false;
      }

      // Size filter
      if (selectedSizes.length > 0) {
        if (!p.size || !selectedSizes.includes(p.size)) return false;
      }

      // Connectivity filter (specifically for Audio Devices subcategory)
      if (selectedConnectivity.length > 0) {
        const titleAndDesc = `${p.title} ${p.description || ""}`.toLowerCase();
        const matchesAny = selectedConnectivity.some((c) => {
          if (c === "Wireless") return titleAndDesc.includes("wireless") || titleAndDesc.includes("bluetooth");
          if (c === "Bluetooth") return titleAndDesc.includes("bluetooth");
          if (c === "Wired") return titleAndDesc.includes("wired");
          return false;
        });
        if (!matchesAny) return false;
      }

      return true;
    });
  }, [
    products,
    priceLimit,
    selectedDiscounts,
    selectedDelivery,
    selectedColors,
    selectedRating,
    selectedBrands,
    selectedSizes,
    selectedConnectivity,
  ]);

  // Sorting Logic
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === "price-asc") {
      list.sort((a, b) => Number(a.sellingPrice) - Number(b.sellingPrice));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => Number(b.sellingPrice) - Number(a.sellingPrice));
    } else if (sortBy === "rating") {
      list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (sortBy === "discount") {
      list.sort((a, b) => {
        const discA = Number(a.mrp) > Number(a.sellingPrice) ? ((Number(a.mrp) - Number(a.sellingPrice)) / Number(a.mrp)) : 0;
        const discB = Number(b.mrp) > Number(b.sellingPrice) ? ((Number(b.mrp) - Number(b.sellingPrice)) / Number(b.mrp)) : 0;
        return discB - discA;
      });
    }
    return list;
  }, [filteredProducts, sortBy]);

  const clearAllFilters = () => {
    setPriceLimit(null);
    setSelectedDiscounts([]);
    setSelectedDelivery(null);
    setSelectedColors([]);
    setSelectedRating(null);
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSelectedConnectivity([]);
  };

  const totalActiveFilters =
    (priceLimit !== null ? 1 : 0) +
    selectedDiscounts.length +
    (selectedDelivery !== null ? 1 : 0) +
    selectedColors.length +
    (selectedRating !== null ? 1 : 0) +
    selectedBrands.length +
    selectedSizes.length +
    selectedConnectivity.length;

  const hasActiveFilters = totalActiveFilters > 0;

  const toggleBrand = (b: string) =>
    setSelectedBrands((prev) =>
      prev.includes(b) ? prev.filter((item) => item !== b) : [...prev, b]
    );

  const toggleColor = (c: string) =>
    setSelectedColors((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );

  const toggleSize = (s: string) =>
    setSelectedSizes((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );

  const toggleDiscount = (idx: number) =>
    setSelectedDiscounts((prev) =>
      prev.includes(idx) ? prev.filter((item) => item !== idx) : [...prev, idx]
    );

  const toggleConnectivity = (c: string) =>
    setSelectedConnectivity((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const fallback = (FALLBACK_SUBCATEGORIES[categoryId] ?? []).map((name, index) => ({ id: `fallback-${index}`, name }));

    fetch(`/api/categories/${categoryId}/subcategories`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setSubcategories(Array.isArray(data) && data.length ? data : fallback))
      .catch(() => setSubcategories(fallback))
      .finally(() => setLoading(false));
  }, [categoryId]);

  useEffect(() => {
    if (!subcategoryId) {
      setProducts([]);
      return;
    }
    setProductsLoading(true);

    let url = `/api/products`;
    if (String(subcategoryId).startsWith("fallback-")) {
      url = `/api/products?categoryId=${categoryId}`;
    } else {
      url = `/api/products?subCategoryId=${subcategoryId}`;
    }

    fetch(url)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        let loadedProducts: any[] = [];
        if (Array.isArray(data) && data.length > 0) {
          if (String(subcategoryId).startsWith("fallback-")) {
            const fallbackList = FALLBACK_SUBCATEGORIES[categoryId] ?? [];
            const index = parseInt(String(subcategoryId).replace("fallback-", ""), 10);
            const fallbackName = fallbackList[index];
            loadedProducts = data.filter(p => p.subCategory?.name?.toLowerCase() === fallbackName.toLowerCase());
          } else {
            loadedProducts = data;
          }
        }

        setProducts(loadedProducts);
      })
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
  }, [subcategoryId, categoryId, subcategories]);

  const selectedSub = subcategories.find(s => String(s.id) === String(subcategoryId));
  const subcategoryName = selectedSub ? selectedSub.name : (
    String(subcategoryId).startsWith("fallback-") ? (
      FALLBACK_SUBCATEGORIES[categoryId]?.[parseInt(String(subcategoryId).replace("fallback-", ""), 10)] || "Subcategory"
    ) : "Subcategory"
  );

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: "bs" + product.id,
      name: product.title,
      price: product.sellingPrice,
      brand: product.brand || "facile Store",
      image: product.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300",
    });
    triggerToast(`Added ${product.title} to your bag! 🛍️`);
  };

  const handleToggleFavorite = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite("bs" + product.id);
    const isNow = !favorites.includes("bs" + product.id);
    triggerToast(isNow ? `Added ${product.title} to Wishlist! ❤️` : `Removed ${product.title} from Wishlist.`);
  };

  const filterPanelProps: FilterPanelProps = {
    categoryId,
    subcategoryName,
    products,
    selectedBrands, toggleBrand,
    selectedColors, toggleColor,
    selectedSizes, toggleSize,
    priceLimit, setPriceLimit, priceLimits,
    selectedDiscounts, toggleDiscount,
    selectedRating, setSelectedRating,
    selectedDelivery, setSelectedDelivery,
    selectedConnectivity, toggleConnectivity,
    hasActiveFilters, clearAllFilters,
  };

  return (
    <main className="min-h-screen bg-[#FAF3E3] pb-20 text-[#4a556a] relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#4a556a] text-[#FAF3E3] py-3 px-5 rounded-2xl shadow-xl transition-all duration-300 font-semibold text-xs border border-white/10">
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
                type="button"
                onClick={() => { clearAllFilters(); setIsMobileFilterOpen(false); }}
                className="flex-1 py-3.5 text-xs font-bold text-[#4a556a]/60 hover:text-[#4a556a] transition-colors cursor-pointer"
              >
                CLOSE
              </button>
              <div className="w-px bg-natural/10" />
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3.5 text-xs font-bold text-apricot hover:text-apricot/80 transition-colors cursor-pointer"
              >
                APPLY ({sortedProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {!subcategoryId ? (
          <Link href="/#categories" className="inline-flex items-center gap-2 text-xs font-bold hover:text-apricot transition-colors mb-6">
            <ArrowLeft size={15} /> Back to categories
          </Link>
        ) : (
          <Link href={`/category/${categoryId}`} className="inline-flex items-center gap-2 text-xs font-bold hover:text-apricot transition-colors mb-6">
            <ArrowLeft size={15} /> Back to all {details.name} subcategories
          </Link>
        )}

        <div className="relative min-h-[220px] sm:min-h-[300px] overflow-hidden rounded-[32px] shadow-sm flex items-end">
          <img src={details.image} alt={details.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#303746]/90 via-[#303746]/35 to-transparent" />
          <div className="relative z-10 max-w-2xl p-8 sm:p-12 text-white">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#FAF3E3]/80 mb-3">Shop category</p>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              {subcategoryId ? `${details.name} › ${subcategoryName}` : details.name}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/85 leading-relaxed">{details.description}</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {!subcategoryId ? (
          /* Render grid of subcategories */
          loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2].map((item) => <div key={item} className="h-52 rounded-[28px] bg-white/60 animate-pulse" />)}
            </div>
          ) : subcategories.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subcategories.map((subcategory, index) => {
                const style = CARD_STYLES[index % CARD_STYLES.length];
                return (
                  <Link
                    key={subcategory.id}
                    href={`/category/${categoryId}?subcategory=${subcategory.id}`}
                    className={`group relative min-h-52 overflow-hidden rounded-[28px] border border-white/70 bg-gradient-to-br ${style.surface} p-7 shadow-[0_8px_30px_rgba(74,85,106,0.08)] hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(74,85,106,0.16)] transition-all duration-300`}
                  >
                    <span className={`absolute -right-9 -top-10 w-32 h-32 rounded-full ${style.accent} opacity-30 transition-transform duration-500 group-hover:scale-125`} />
                    <span className="absolute -right-2 bottom-4 text-[72px] leading-none font-black text-white/35 select-none">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="relative z-10 h-full flex flex-col items-start justify-between gap-7">
                      <span className={`w-14 h-14 rounded-2xl ${style.icon} text-white flex items-center justify-center shadow-md transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105`}>
                        <Boxes size={25} strokeWidth={1.8} />
                      </span>

                      <div className="w-full">
                        <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#3f485a]">{subcategory.name}</h3>
                        <span className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[#4a556a]/70 group-hover:text-[#4a556a] transition-colors">
                          Browse products
                          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-white/70 border border-[#4a556a]/10 p-10 text-center">
              <Boxes className="mx-auto mb-3 opacity-50" />
              <p className="font-bold">No subcategories are available yet.</p>
            </div>
          )
        ) : (
          /* Render grid of products for the selected subcategory */
          productsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin text-apricot" size={32} />
              <p className="text-xs font-semibold text-[#4a556a]/60">Loading products...</p>
            </div>
          ) : products.length ? (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#4a556a]/10 pb-4">
                <div className="flex items-center gap-3">
                  <p className="text-xs text-[#4a556a]/65 font-medium">
                    {sortedProducts.length === 0 ? (
                      "No results matching filters"
                    ) : (
                      <>
                        Showing <span className="font-bold text-[#4a556a]">1–{sortedProducts.length}</span> of{" "}
                        <span className="font-bold text-[#4a556a]">{products.length}</span> product{products.length !== 1 ? "s" : ""}
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                  {/* Mobile Filters button */}
                  <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#4a556a]/20 rounded-full text-xs font-bold text-[#4a556a] hover:border-[#4a556a]/40 transition-all cursor-pointer shadow-xs"
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
                <div className="flex flex-wrap gap-2 mb-4">
                  {priceLimit !== null && (
                    <button
                      type="button"
                      onClick={() => setPriceLimit(null)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer"
                    >
                      Up to ₹{priceLimit.toLocaleString("en-IN")}<X size={9} />
                    </button>
                  )}
                  {selectedBrands.map((b) => (
                    <button
                      type="button"
                      key={b}
                      onClick={() => toggleBrand(b)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer"
                    >
                      <Store size={8} />{b}<X size={9} />
                    </button>
                  ))}
                  {selectedColors.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => toggleColor(c)}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-natural/20 flex-shrink-0"
                        style={{ background: COLOR_MAP[c] || "#ccc" }}
                      />
                      {c}<X size={9} />
                    </button>
                  ))}
                  {selectedSizes.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggleSize(s)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer"
                    >
                      <Ruler size={8} />{s}<X size={9} />
                    </button>
                  ))}
                  {selectedConnectivity.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => toggleConnectivity(c)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer"
                    >
                      <Wifi size={8} />{c}<X size={9} />
                    </button>
                  ))}
                  {selectedDiscounts.map((idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => toggleDiscount(idx)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer"
                    >
                      <Zap size={8} />{DISCOUNT_RANGES[idx].label}<X size={9} />
                    </button>
                  ))}
                  {selectedRating !== null && (
                    <button
                      type="button"
                      onClick={() => setSelectedRating(null)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer"
                    >
                      {selectedRating}★ & up<X size={9} />
                    </button>
                  )}
                  {selectedDelivery !== null && (
                    <button
                      type="button"
                      onClick={() => setSelectedDelivery(null)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer"
                    >
                      <Clock size={8} />
                      {DELIVERY_OPTIONS.find((o) => o.maxDays === selectedDelivery)?.label}
                      <X size={9} />
                    </button>
                  )}
                </div>
              )}

              {/* Two-column layout for sidebar + grid */}
              <div className="flex gap-6 items-start">
                {/* Desktop Sticky Sidebar */}
                <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24">
                  <FilterSidebar {...filterPanelProps} />
                </aside>

                {/* Product Grid */}
                <div className="flex-1 min-w-0">
                  {sortedProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/70 border border-[#4a556a]/10 rounded-[28px]">
                      <div className="w-16 h-16 bg-white border border-natural/15 rounded-2xl flex items-center justify-center mb-5 shadow-xs">
                        <Search size={24} className="text-[#4a556a]/25" />
                      </div>
                      <h2 className="text-base font-bold text-[#4a556a] mb-1">No products found</h2>
                      <p className="text-xs text-[#4a556a]/55 max-w-xs leading-relaxed mb-6">
                        We couldn't find any products matching your current filters.
                        Try adjusting or clearing your filters.
                      </p>
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="px-5 py-2.5 bg-[#4a556a] hover:bg-apricot hover:text-white text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {sortedProducts.map((product) => {
                        const isFav = favorites.includes("bs" + product.id);
                        const mrp = Number(product.mrp);
                        const price = Number(product.sellingPrice);
                        const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

                        return (
                          <div
                            key={product.id}
                            className="group bg-white hover:bg-[#4a556a] border border-natural/10 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col relative"
                          >
                            {discount > 0 && (
                              <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-apricot text-white text-xs sm:text-sm font-bold rounded-full shadow-md">
                                -{discount}%
                              </div>
                            )}
                            <button
                              onClick={(e) => handleToggleFavorite(product, e)}
                              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/95 text-[#4a556a] hover:text-apricot shadow-xs hover:scale-105 active:scale-95 transition-all border border-natural/10 focus:outline-none cursor-pointer"
                              aria-label="Add to wishlist"
                            >
                              <Heart size={13} style={isFav ? { fill: "#870339", color: "#870339" } : {}} />
                            </button>

                            <Link href={`/product/bs${product.id}`} className="flex flex-col flex-1">
                              <div className="aspect-square bg-neutral-50 overflow-hidden flex-shrink-0 relative">
                                <img
                                  src={product.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300"}
                                  alt={product.title}
                                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                />
                              </div>

                              <div className="p-4 flex-1 flex flex-col justify-between">
                                <div className="space-y-1">
                                  {product.brand && (
                                    <p className="text-[9px] font-semibold text-[#4a556a]/50 group-hover:text-white/60 transition-colors">
                                      {product.brand}
                                    </p>
                                  )}
                                  <h3 className="text-xs font-bold text-[#4a556a] group-hover:text-white leading-snug line-clamp-2 transition-colors">
                                    {product.title}
                                  </h3>
                                  <div className="flex items-center gap-1">
                                    <Star size={10} className={(product.reviews ?? 0) > 0 ? "text-amber-400 fill-amber-400" : "text-neutral-300"} />
                                    {(product.reviews ?? 0) > 0 ? (
                                      <>
                                        <span className="text-[10px] font-bold text-[#4a556a] group-hover:text-white transition-colors">
                                          {Number(product.rating ?? 0).toFixed(1)}
                                        </span>
                                        <span className="text-[10px] text-natural/50 group-hover:text-white/60 transition-colors">
                                          ({product.reviews})
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-[10px] text-natural/60 group-hover:text-white/70 transition-colors">No reviews</span>
                                    )}
                                  </div>
                                </div>

                                <div className="pt-3 border-t border-natural/8 mt-3">
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-sm font-extrabold text-[#4a556a] group-hover:text-white transition-colors">
                                      ₹{price.toLocaleString("en-IN")}
                                    </span>
                                    {mrp > price && (
                                      <span className="text-[10px] text-natural/45 group-hover:text-white/50 line-through font-medium transition-colors">
                                        ₹{mrp.toLocaleString("en-IN")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Link>

                            <div className="px-4 pb-4">
                              <button
                                onClick={(e) => handleAddToCart(product, e)}
                                className="w-full h-8 bg-[#4a556a] group-hover:bg-white group-hover:text-[#4a556a] hover:scale-[1.02] active:scale-[0.98] text-white text-[10px] font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
                              >
                                <ShoppingCart size={11} className="stroke-[2.5px]" />
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[28px] bg-white/70 border border-[#4a556a]/10 p-16 text-center">
              <Boxes className="mx-auto mb-3 opacity-50 text-apricot" size={32} />
              <p className="font-bold text-[#4a556a]">No products available in this subcategory.</p>
              <p className="text-xs text-[#4a556a]/60 mt-1">Please check back later or explore other sections.</p>
            </div>
          )
        )}
      </section>
    </main>
  );
}

// ─── Filter Panel Components ──────────────────────────────────────────────────

interface FilterPanelProps {
  categoryId: string;
  subcategoryName: string;
  products: any[];
  // Brand
  selectedBrands: string[];
  toggleBrand: (b: string) => void;
  // Color
  selectedColors: string[];
  toggleColor: (c: string) => void;
  // Size
  selectedSizes: string[];
  toggleSize: (s: string) => void;
  // Price Range
  priceLimit: number | null;
  setPriceLimit: (p: number | null) => void;
  priceLimits: { min: number; max: number };
  // Discount
  selectedDiscounts: number[];
  toggleDiscount: (idx: number) => void;
  // Rating
  selectedRating: number | null;
  setSelectedRating: (r: number | null) => void;
  // Delivery
  selectedDelivery: number | null;
  setSelectedDelivery: (d: number | null) => void;
  // Connectivity
  selectedConnectivity: string[];
  toggleConnectivity: (c: string) => void;
  // clear
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
}

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
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-2.5 py-1.5 text-left text-[11px] font-semibold text-[#4a556a]/80 hover:text-[#4a556a] transition-colors focus:outline-none cursor-pointer"
    >
      <span
        className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
          checked
            ? "bg-apricot border-apricot text-white"
            : "border-[#4a556a]/20 bg-white hover:border-[#4a556a]/40"
        }`}
      >
        {checked && <Check size={10} strokeWidth={3} />}
      </span>
      <span className="truncate">{children}</span>
    </button>
  );
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
  categoryId,
  subcategoryName,
  products,
  selectedBrands, toggleBrand,
  selectedColors, toggleColor,
  selectedSizes, toggleSize,
  priceLimit, setPriceLimit, priceLimits,
  selectedDiscounts, toggleDiscount,
  selectedRating, setSelectedRating,
  selectedDelivery, setSelectedDelivery,
  selectedConnectivity, toggleConnectivity,
  hasActiveFilters, clearAllFilters,
}: FilterPanelProps) {
  const [openSections, setOpenSections] = useState<string[]>(["price"]);
  const toggleSection = (id: string) =>
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const brands = useMemo(() => {
    if (CATEGORY_BRANDS[categoryId]) {
      return CATEGORY_BRANDS[categoryId];
    }
    const s = new Set(products.map((p) => p.brand).filter(Boolean) as string[]);
    return Array.from(s).sort();
  }, [products, categoryId]);

  const colors = useMemo(() => {
    const s = new Set(products.map((p) => p.color).filter(Boolean) as string[]);
    return Array.from(s).sort();
  }, [products]);

  const sizes = useMemo(() => {
    const ORDER = ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "One Size", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];
    const s = new Set(products.map((p) => p.size).filter(Boolean) as string[]);
    return Array.from(s).sort((a, b) => {
      const ai = ORDER.indexOf(a), bi = ORDER.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [products]);

  const showSizeFilter = categoryId === "2" || categoryId === "8";
  const showConnectivityFilter = categoryId === "1" && subcategoryName === "Audio Devices";

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
      <div className="border-b border-[#4a556a]/10 last:border-b-0">
        <button
          type="button"
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between px-4 py-3 text-[11px] font-bold text-[#4a556a] hover:bg-[#FAF3E3]/60 transition-colors cursor-pointer group"
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
          <div className="px-4 pb-3 space-y-1.5">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#4a556a]/10">
        <h2 className="text-sm font-bold text-[#4a556a]">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-[10px] font-bold text-apricot hover:underline cursor-pointer uppercase tracking-wide"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Price Range Slider */}
      <Section id="price" icon={<Tag size={12} />} label="Price Range" badge={0}>
        <PriceSlider
          priceLimit={priceLimit}
          setPriceLimit={setPriceLimit}
          min={priceLimits.min}
          max={priceLimits.max}
        />
      </Section>

      {/* Brand */}
      {brands.length > 0 && (
        <Section id="brand" icon={<Store size={12} />} label="Brand" badge={selectedBrands.length}>
          {brands.map((b) => (
            <FilterCheckbox key={b} checked={selectedBrands.includes(b)} onToggle={() => toggleBrand(b)}>
              {b}
            </FilterCheckbox>
          ))}
        </Section>
      )}

      {/* Size (Category Specific) */}
      {showSizeFilter && sizes.length > 0 && (
        <Section id="size" icon={<Ruler size={12} />} label="Size" badge={selectedSizes.length}>
          {sizes.map((s) => (
            <FilterCheckbox key={s} checked={selectedSizes.includes(s)} onToggle={() => toggleSize(s)}>
              {s}
            </FilterCheckbox>
          ))}
        </Section>
      )}

      {/* Connectivity (Subcategory Specific for Audio Devices) */}
      {showConnectivityFilter && (
        <Section id="connectivity" icon={<Wifi size={12} />} label="Connectivity" badge={selectedConnectivity.length}>
          {["Bluetooth", "Wireless", "Wired"].map((c) => (
            <FilterCheckbox key={c} checked={selectedConnectivity.includes(c)} onToggle={() => toggleConnectivity(c)}>
              {c}
            </FilterCheckbox>
          ))}
        </Section>
      )}

      {/* Color */}
      {colors.length > 0 && (
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
      )}

      {/* Discount */}
      <Section id="discount" icon={<Zap size={12} />} label="Discount" badge={selectedDiscounts.length}>
        {DISCOUNT_RANGES.map((d, i) => (
          <FilterCheckbox key={i} checked={selectedDiscounts.includes(i)} onToggle={() => toggleDiscount(i)}>
            {d.label}
          </FilterCheckbox>
        ))}
      </Section>

      {/* Customer Rating */}
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
                    className={i < stars ? "text-amber-400 fill-amber-400" : "text-[#4a556a]/20 fill-[#4a556a]/10"}
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

function FilterSidebar(props: FilterPanelProps) {
  return (
    <div className="bg-white border border-[#4a556a]/10 rounded-2xl overflow-hidden shadow-xs">
      <FilterPanel {...props} />
    </div>
  );
}

function SortDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm ${
          open
            ? "bg-[#4a556a] text-white border-[#4a556a] shadow-md"
            : "bg-white text-[#4a556a] border-[#4a556a]/15 hover:border-[#4a556a]/40 hover:shadow-md"
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

      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-xl border border-[#4a556a]/10 overflow-hidden"
          style={{ minWidth: "190px", animation: "fadeSlideDown 0.15s ease" }}
        >
          <div className="px-4 py-2 bg-[#4a556a]/5 border-b border-[#4a556a]/8">
            <p className="text-[9px] font-bold text-[#4a556a]/50 uppercase tracking-widest">Sort by</p>
          </div>

          {SORT_OPTIONS.map((opt, idx) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-[11px] font-semibold transition-all duration-150 cursor-pointer group ${
                opt.value === value
                  ? "bg-apricot/8 text-apricot"
                  : "text-[#4a556a]/75 hover:bg-[#4a556a] hover:text-white"
              } ${idx !== SORT_OPTIONS.length - 1 ? "border-b border-[#4a556a]/6" : ""}`}
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
