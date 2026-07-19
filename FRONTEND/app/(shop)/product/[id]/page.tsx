"use client";

import React, { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { recordRecentlyViewed } from "@/lib/recentlyViewed";
import { ArrowLeft, ShoppingCart, Heart, Star, ShieldCheck, RefreshCw, Truck, Sparkles, Bookmark, Minus, Plus } from "lucide-react";
import { isProductSaved, removeSavedProduct, saveProductForLater } from "@/lib/savedForLater";
import { FALLBACK_PRODUCTS, FALLBACK_PRODUCTS_MAP, CATEGORY_DETAILS } from "@/lib/fallbackData";
import { getSizesForCategory } from "@/lib/sizeConfig";
import { SizeSelector } from "@/components/SizeSelector";

// Mock Fallback Database in case the API is offline
const MOCK_PRODUCTS: Record<string, any> = {
  bs1: {
    id: "bs1",
    name: "Smart Watch Series 5",
    price: 89.99,
    originalPrice: 129.99,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400",
    rating: 0,
    reviews: 0,
    description: "Stay connected, active, and healthy with this premium Smart Watch Series 5. Features real-time heart rate monitoring, fitness tracking, GPS, notifications, and an always-on Retina display. Waterproof design makes it perfect for swimming and workouts.",
    category: "Electronics",
    subCategory: "Wearables"
  },
  bs2: {
    id: "bs2",
    name: "Wireless Headphones",
    price: 59.99,
    originalPrice: 89.99,
    image: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=400",
    rating: 0,
    reviews: 0,
    description: "Experience premium sound quality with hybrid Active Noise Cancelling (ANC) technology. These wireless headphones deliver rich bass, clear mids, and crisp highs. Features 40 hours of playtime, comfortable memory-foam earcups, and crystal-clear calls.",
    category: "Electronics",
    subCategory: "Audio"
  },
  bs3: {
    id: "bs3",
    name: "Travel Backpack",
    price: 39.99,
    originalPrice: 59.99,
    image: "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?q=80&w=400",
    rating: 0,
    reviews: 0,
    description: "Designed for modern travelers and commuters. This heavy-duty, water-resistant travel backpack features a dedicated 15.6-inch laptop compartment, hidden anti-theft pockets, a USB charging port, and ergonomic padded shoulder straps for supreme comfort.",
    category: "Toys & Baby",
    subCategory: "Baby Toys"
  },
  bs4: {
    id: "bs4",
    name: "Running Shoes",
    price: 49.99,
    originalPrice: 79.99,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=400",
    rating: 0,
    reviews: 0,
    description: "Achieve your personal best with these high-performance running shoes. Engineered with a breathable mesh upper, a responsive foam midsole for ultimate shock absorption, and a durable rubber outsole for excellent grip on any surface.",
    category: "Sports",
    subCategory: "Footwear"
  },
  bs5: {
    id: "bs5",
    name: "Luxury Perfume",
    price: 29.99,
    originalPrice: 49.99,
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=400",
    rating: 0,
    reviews: 0,
    description: "Indulge in a sophisticated, long-lasting luxury fragrance. Combining fresh citrus top notes with a warm amber and woody base, this premium perfume is perfect for daily wear or special occasions. Comes in an elegantly designed glass bottle.",
    category: "Beauty",
    subCategory: "Fragrance"
  }
};

interface PageProps {
  params: Promise<{ id: string }>;
}

interface ProductReview {
  id: number;
  userName: string;
  userEmail: string;
  rating: number;
  title?: string;
  comment: string;
  updatedAt: string;
}

export default function ProductDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  
  const { addToCart, toggleFavorite, favorites, setIsCartOpen } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState<any>(null);
  const [isFacileChoice, setIsFacileChoice] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [activeImage, setActiveImage] = useState<string>("");
  const [stock, setStock] = useState<number>(50); // Default placeholder stock
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isSavedForLater, setIsSavedForLater] = useState(false);
  const [customerReviews, setCustomerReviews] = useState<ProductReview[]>([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizeValidation, setShowSizeValidation] = useState(false);

  const [deliveryInfo, setDeliveryInfo] = useState({
    freeDeliveryDate: "",
    fastestDeliveryDate: "",
    hours: 0,
    minutes: 0,
    isMounted: false
  });

  useEffect(() => {
    const updateDeliveryInfo = () => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(23, 59, 59, 999);
      let diff = cutoff.getTime() - now.getTime();
      if (diff < 0) {
        cutoff.setDate(cutoff.getDate() + 1);
        diff = cutoff.getTime() - now.getTime();
      }
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      const freeDate = new Date();
      freeDate.setDate(now.getDate() + 4);
      const freeDateStr = freeDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

      const fastestDate = new Date();
      fastestDate.setDate(now.getDate() + 1);
      const fastestDateStr = fastestDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

      setDeliveryInfo({
        freeDeliveryDate: freeDateStr,
        fastestDeliveryDate: "Tomorrow, " + fastestDateStr,
        hours: hrs,
        minutes: mins,
        isMounted: true
      });
    };
    updateDeliveryInfo();
    const interval = setInterval(updateDeliveryInfo, 60000);
    return () => clearInterval(interval);
  }, []);

  // Dynamically compile all mock products across the app to support detail pages for all categories
  const allMockProducts = useMemo(() => {
    const map: Record<string, any> = { ...MOCK_PRODUCTS };
    
    // Add from search page fallback products
    if (Array.isArray(FALLBACK_PRODUCTS)) {
      FALLBACK_PRODUCTS.forEach((p) => {
        if (p.id) {
          map[p.id] = {
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.originalPrice,
            image: p.image,
            rating: p.rating,
            reviews: p.reviews,
            description: p.description,
            category: p.category,
            subCategory: p.brand || ""
          };
        }
      });
    }

    // Add from category page fallback products
    if (FALLBACK_PRODUCTS_MAP) {
      Object.keys(FALLBACK_PRODUCTS_MAP).forEach((catId) => {
        const subCatMap = FALLBACK_PRODUCTS_MAP[catId];
        Object.keys(subCatMap).forEach((subCatName) => {
          const p = subCatMap[subCatName];
          if (p && p.id) {
            const fullId = String(p.id).startsWith("bs") ? p.id : `bs${p.id}`;
            map[fullId] = {
              id: fullId,
              name: p.title,
              price: p.sellingPrice,
              originalPrice: p.mrp,
              image: p.image,
              rating: p.rating || 4.5,
              reviews: p.reviews || 42,
              description: p.description || "",
              category: CATEGORY_DETAILS[catId]?.name || "Uncategorized",
              subCategory: subCatName || "",
              maxOrderQuantity: p.maxOrderQuantity || 10
            };
          }
        });
      });
    }

    return map;
  }, []);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const cleanId = productId.replace("bs", "");
        
        // 1. Fetch product basic details
        const resProduct = await fetch(`/api/products/${cleanId}`);
        if (!resProduct.ok) {
          throw new Error("Product not found on server");
        }
        const dataProduct = await resProduct.json();

        const catalogueResponse = await fetch("/api/products");
        if (catalogueResponse.ok) {
          const catalogue = await catalogueResponse.json();
          const categoryChoice = (Array.isArray(catalogue) ? catalogue : [])
            .filter((item: any) => String(item.category?.id) === String(dataProduct.category?.id) && Number(item.reviews ?? 0) > 0)
            .sort((a: any, b: any) => Number(b.rating ?? 0) - Number(a.rating ?? 0)
              || Number(b.reviews ?? 0) - Number(a.reviews ?? 0))[0];
          setIsFacileChoice(String(categoryChoice?.id ?? "") === String(cleanId));
          const related = (Array.isArray(catalogue) ? catalogue : [])
            .filter((item: any) => String(item.id) !== String(cleanId))
            .sort((a: any, b: any) => {
              const aSubcategory = a.subCategory?.id === dataProduct.subCategory?.id ? 1 : 0;
              const bSubcategory = b.subCategory?.id === dataProduct.subCategory?.id ? 1 : 0;
              const aCategory = a.category?.id === dataProduct.category?.id ? 1 : 0;
              const bCategory = b.category?.id === dataProduct.category?.id ? 1 : 0;
              return (bSubcategory * 2 + bCategory) - (aSubcategory * 2 + aCategory);
            })
            .slice(0, 8);
          setRecommendedProducts(related);
        }

        const resReviews = await fetch(`/api/products/${cleanId}/reviews`);
        const dataReviews = resReviews.ok ? await resReviews.json() : [];
        setCustomerReviews(dataReviews);

        // 2. Fetch product inventory stock levels
        const resInventory = await fetch(`/api/products/${cleanId}/inventory`);
        const dataInventory = resInventory.ok ? await resInventory.json() : null;

        if (dataProduct) {
          const productDetails = {
            id: productId,
            name: dataProduct.title,
            price: dataProduct.sellingPrice,
            originalPrice: dataProduct.mrp,
            image: dataProduct.image,
            images: Array.isArray(dataProduct.images) && dataProduct.images.length ? dataProduct.images : [dataProduct.image].filter(Boolean),
            rating: dataProduct.rating ?? 0,
            reviews: dataProduct.reviews ?? 0,
            description: dataProduct.description,
            category: dataProduct.category?.name || "Uncategorized",
            subCategory: dataProduct.subCategory?.name || "General",
            maxOrderQuantity: dataProduct.maxOrderQuantity || 10
          };
          setProduct(productDetails);
          recordRecentlyViewed(productDetails);
          setActiveImage(dataProduct.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300");
          
          if (dataInventory && typeof dataInventory.stock === "number") {
            setStock(dataInventory.stock);
          }
        }
      } catch (err) {
        console.warn("Using fallback local data due to error: ", err);
        // Fallback to local mock data
        const localMock = allMockProducts[productId] || allMockProducts["bs1"];
        setProduct(localMock);
        recordRecentlyViewed(localMock);
        setActiveImage(localMock?.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300");
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [productId]);

  const availableSizes = useMemo(() => {
    if (!product) return null;
    return getSizesForCategory(product.category, product.subCategory, product.name);
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    if (availableSizes && !selectedSize) {
      setShowSizeValidation(true);
      return;
    }
    setShowSizeValidation(false);
    recordRecentlyViewed(product);
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      brand: "facile Store",
      image: product.image,
      maxOrderQuantity: product.maxOrderQuantity || 10,
      selectedSize: selectedSize
    }, quantity);
    triggerToast(`Added ${quantity} ${product.name} to your bag! 🛍️`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (availableSizes && !selectedSize) {
      setShowSizeValidation(true);
      return;
    }
    setShowSizeValidation(false);
    const buyNowItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      brand: "facile Store",
      image: product.image,
      maxOrderQuantity: product.maxOrderQuantity || 10,
      quantity: quantity,
      selectedSize: selectedSize
    };
    localStorage.setItem("facile_buynow", JSON.stringify([buyNowItem]));
    router.push("/checkout?buynow=true");
  };

  const handleSaveForLater = () => {
    if (!product) return;
    if (isSavedForLater) {
      removeSavedProduct(product.id);
      setIsSavedForLater(false);
      triggerToast(`${product.name} removed from Saved for Later.`);
    } else {
      saveProductForLater({ ...product, brand: "facile Store" });
      setIsSavedForLater(true);
      triggerToast(`${product.name} saved for later!`);
    }
  };

  const handleToggleFavorite = () => {
    if (!product) return;
    toggleFavorite(product.id);
    const isNowFav = !favorites.includes(product.id);
    triggerToast(isNowFav ? `Added ${product.name} to Wishlist! ❤️` : `Removed ${product.name} from Wishlist.`);
  };

  const handleReviewSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isAuthenticated || !user) {
      router.push(`/login?redirect=/product/${productId}`);
      return;
    }
    if (reviewRating < 1) {
      setReviewError("Please select a star rating.");
      return;
    }

    setReviewSubmitting(true);
    setReviewError("");
    try {
      const cleanId = productId.replace("bs", "");
      const response = await api.post(`/api/products/${cleanId}/reviews`, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      const savedReview: ProductReview = response.data;
      const nextReviews = [
        savedReview,
        ...customerReviews.filter((review) => review.userEmail.toLowerCase() !== user.email.toLowerCase()),
      ];
      const average = nextReviews.reduce((sum, review) => sum + review.rating, 0) / nextReviews.length;
      setCustomerReviews(nextReviews);
      setProduct((current: any) => ({
        ...current,
        rating: Number(average.toFixed(1)),
        reviews: nextReviews.length,
      }));
      setReviewRating(0);
      setReviewTitle("");
      setReviewComment("");
      triggerToast("Your review has been saved.");
    } catch (error: any) {
      setReviewError(error.response?.status === 403
        ? "Only customers who purchased this product can review it."
        : error.response?.data?.message || "Could not save your review. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setIsSavedForLater(isProductSaved(productId)), 0);
    return () => window.clearTimeout(timer);
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4F0] flex items-center justify-center text-fern font-semibold">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-fern border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">Loading product details...</p>
        </div>

      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF3E3] flex items-center justify-center text-fern">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold font-serif">Product Not Found</h2>
          <Link href="/" className="inline-flex items-center gap-2 text-[#FA99C6] hover:underline font-semibold text-sm">
            <ArrowLeft size={16} /> Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const isFav = favorites.includes(product.id);
  const maxAllowedQuantity = Math.max(1, Math.min(stock, product.maxOrderQuantity || 10));
  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const galleryImages: string[] = product
    ? (Array.isArray(product.images) && product.images.length ? product.images : [product.image]).filter(Boolean)
    : [];

  return (
    <div className="bg-[#F4F4F0] text-[#4a556a] font-sans min-h-screen py-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-fern text-warm-ivory py-3 px-5 rounded-2xl shadow-xl flex items-center gap-2 border border-natural/30 animate-slide-in text-xs font-semibold">
          <span className="text-[#FA99C6]">✓</span>
          {toastMessage}
        </div>
      )}

      <div className="max-w-[2560px] mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
        {/* Navigation path & back link */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 text-fern/80 hover:text-fern font-bold text-xs group transition-all">
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Shop
          </Link>
          <div className="text-[11px] font-bold text-natural uppercase tracking-wider flex items-center gap-1.5">
            <span>Shop</span>
            <span>/</span>
            <span className="text-fern">{product.category}</span>
            <span>/</span>
            <span>{product.subCategory}</span>
          </div>
        </div>

        {/* Amazon-Style Redesigned Layout: 3 Columns on Large Screens */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-[#F4F4F0] border border-natural/15 rounded-[32px] p-6 sm:p-8 lg:p-10 shadow-xs">
          
          {/* COLUMN 1: Image Gallery & Main Image (Span 5 on Desktop) */}
          <div className="lg:col-span-5 flex flex-col md:flex-row gap-4">
            
            {/* Gallery Thumbnail List (Left of the main image on MD/LG screens) */}
            <div className="flex md:flex-col gap-2 order-2 md:order-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none flex-shrink-0">
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-14 h-14 bg-neutral-100 border-2 rounded-xl overflow-hidden p-1 transition-all cursor-pointer flex-shrink-0 flex items-center justify-center ${
                    activeImage === imgUrl ? "border-[#FA99C6] shadow-sm" : "border-natural/20 hover:border-natural/40"
                  }`}
                >
                  <img src={imgUrl || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300"} alt={`Thumbnail ${idx + 1}`} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>

            {/* Main Showcase Image (Right of the thumbnail list) */}
            <div className="flex-1 aspect-square bg-neutral-100/50 rounded-2xl border border-natural/10 flex items-center justify-center p-8 relative overflow-hidden order-1 md:order-2">
              {discountPercent > 0 && (
                <span className="absolute top-3 left-3 z-10 bg-[#FA99C6] text-warm-ivory text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm tracking-wider">
                  {discountPercent}% OFF
                </span>
              )}
              {isFacileChoice && (
                <span className={`absolute left-3 z-10 rounded-full bg-[#4a556a] px-3 py-1.5 text-[10px] font-extrabold tracking-wide text-white shadow-md ${discountPercent > 0 ? "top-11" : "top-3"}`}>
                  Facile Choice
                </span>
              )}
              <img
                src={activeImage || product.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300"}
                alt={product.name}
                className="max-w-full max-h-full object-contain mix-blend-multiply transition-all duration-300 transform hover:scale-105"
              />
            </div>

          </div>

          {/* COLUMN 2: Product Specifications & Details (Span 4 on Desktop) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Title & Star Rating */}
            <div className="space-y-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#4a556a] leading-tight mt-1">
                {product.name}
              </h1>
              
              {/* Rating & Reviews */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-natural">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={13}
                      className={star <= Math.round(product.rating) ? "text-amber-400 fill-amber-400" : "text-neutral-200"}
                    />
                  ))}
                </div>
                <span className="text-fern font-bold ml-1">{Number(product.rating).toFixed(1)}</span>
                <span>•</span>
                <span className="hover:text-[#FA99C6] cursor-pointer transition-colors">{product.reviews} reviews</span>
              </div>
            </div>

            <div className="border-t border-natural/10" />

            {/* Price tag in Amazon style */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                {discountPercent > 0 && (
                  <span className="text-3xl font-light text-[#FA99C6]">
                    -{discountPercent}%
                  </span>
                )}
                <span className="text-3xl font-extrabold text-[#4a556a]">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-[11px] text-natural font-medium">
                M.R.P.: <span className="line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
              </p>
              <p className="text-[10px] text-natural/80 font-bold tracking-wide uppercase">Inclusive of all taxes</p>
            </div>

            {availableSizes ? (
              <div className="border-t border-b border-natural/10 py-3">
                <SizeSelector
                  sizes={availableSizes}
                  selectedSize={selectedSize}
                  onSelectSize={(size) => {
                    setSelectedSize(size);
                    setShowSizeValidation(false);
                  }}
                  isShoeSize={(product.category?.toLowerCase().includes("shoe") || product.subCategory?.toLowerCase().includes("shoe"))}
                  showValidation={showSizeValidation}
                />
              </div>
            ) : (
              <div className="border-t border-natural/10" />
            )}

            {/* Special Offers Scrollable Deck */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-natural uppercase tracking-wider">
                <Sparkles size={14} className="text-[#FA99C6]" />
                <span>Special Offers</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                <div className="min-w-[150px] bg-[#F4F4F0] border border-natural/15 rounded-xl p-3.5 space-y-1 flex-shrink-0">
                  <p className="text-[9px] font-bold text-[#4A5568] uppercase tracking-wider">Coupon Code</p>
                  <p className="text-[11px] text-natural font-extrabold leading-relaxed font-sans">WELCOME10</p>
                  <span className="text-[9px] font-bold text-[#FA99C6] block pt-1">Get 10% Off First Order</span>
                </div>
                <div className="min-w-[150px] bg-[#F4F4F0] border border-natural/15 rounded-xl p-3.5 space-y-1 flex-shrink-0">
                  <p className="text-[9px] font-bold text-[#4A5568] uppercase tracking-wider">Coupon Code</p>
                  <p className="text-[11px] text-natural font-extrabold leading-relaxed font-sans">FACILE50</p>
                  <span className="text-[9px] font-bold text-[#FA99C6] block pt-1">Flat ₹50 Off</span>
                </div>
                <div className="min-w-[150px] bg-[#F4F4F0] border border-natural/15 rounded-xl p-3.5 space-y-1 flex-shrink-0">
                  <p className="text-[9px] font-bold text-[#4A5568] uppercase tracking-wider">Coupon Code</p>
                  <p className="text-[11px] text-natural font-extrabold leading-relaxed font-sans">SAVE20</p>
                  <span className="text-[9px] font-bold text-[#FA99C6] block pt-1">Get 20% Off Orders &gt; ₹5000</span>
                </div>
              </div>
            </div>

            <div className="border-t border-natural/10" />

            {/* Feature Promises Row */}
            <div className="flex justify-between gap-2 text-center">
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-9 h-9 bg-[#4A5568]/5 border border-natural/10 rounded-full flex items-center justify-center text-[#4A5568]">
                  <Truck size={15} />
                </div>
                <span className="text-[9px] text-natural font-bold uppercase tracking-wider leading-tight">Free Delivery</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-9 h-9 bg-[#4A5568]/5 border border-natural/10 rounded-full flex items-center justify-center text-[#4A5568]">
                  <RefreshCw size={14} />
                </div>
                <span className="text-[9px] text-natural font-bold uppercase tracking-wider leading-tight">30-Day Returns</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-9 h-9 bg-[#4A5568]/5 border border-natural/10 rounded-full flex items-center justify-center text-[#4A5568]">
                  <ShieldCheck size={15} />
                </div>
                <span className="text-[9px] text-natural font-bold uppercase tracking-wider leading-tight">Secure Transaction</span>
              </div>
            </div>

            <div className="border-t border-natural/10" />

            {/* Overview / Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-natural uppercase tracking-wider">Product Overview</h3>
              <p className="text-xs text-natural leading-relaxed font-medium">
                {product.description}
              </p>
            </div>

          </div>

          {/* COLUMN 3: Buy Box (Span 3 on Desktop, Sticky) */}
          <div className="lg:col-span-3">
            <div className="bg-[#F4F4F0] border border-natural/15 rounded-3xl p-5 space-y-3.5 lg:sticky lg:top-[120px] shadow-xs">
              
              {/* Delivery and Prime branding */}
              <div className="space-y-2">
                <span className="text-xs font-serif font-black italic tracking-widest text-[#4A5568]">facile<span className="text-[#FA99C6]">plus</span></span>
                <p className="text-[11px] text-natural font-medium leading-relaxed font-sans">
                  Enjoy unlimited <span className="font-bold text-[#4A5568]">FREE Same-Day Delivery</span> on this item.
                </p>
              </div>
              
              <div className="border-t border-natural/10 pt-3.5 space-y-1.5">
                {deliveryInfo.isMounted ? (
                  <>
                    <p className="text-xs text-natural font-semibold">
                      FREE delivery <span className="font-bold text-[#4A5568]">{deliveryInfo.freeDeliveryDate}</span>.
                    </p>
                    <p className="text-[10px] text-natural/80 font-medium leading-relaxed font-sans">
                      Or fastest delivery <span className="font-bold text-[#FA99C6]">{deliveryInfo.fastestDeliveryDate}</span>. Order within <span className="font-bold text-[#4A5568]">{deliveryInfo.hours} hrs {deliveryInfo.minutes} mins</span>.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-natural font-semibold">
                      FREE delivery <span className="font-bold text-[#4A5568]">...</span>
                    </p>
                    <p className="text-[10px] text-natural/80 font-medium leading-relaxed font-sans">
                      Or fastest delivery <span className="font-bold text-[#FA99C6]">...</span>
                    </p>
                  </>
                )}
              </div>
              
              {/* Stock levels */}
              <div className="border-t border-natural/10 pt-3.5">
                {stock > 0 ? (
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      In Stock
                    </span>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700">
                    Out of Stock
                  </span>
                )}
              </div>
              
              {/* Quantities & CTAs */}
              {stock > 0 && (
                <div className="space-y-3 pt-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-natural uppercase tracking-wider">Quantity:</span>
                    <div className="flex items-center rounded-full border border-natural/20 bg-white p-1">
                      <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} disabled={quantity <= 1} className="flex h-7 w-7 items-center justify-center rounded-full text-[#4A5568] hover:bg-natural/10 disabled:opacity-35" aria-label="Decrease quantity">
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-[#4A5568]">{quantity}</span>
                      <button type="button" onClick={() => setQuantity((current) => Math.min(maxAllowedQuantity, current + 1))} disabled={quantity >= maxAllowedQuantity} className="flex h-7 w-7 items-center justify-center rounded-full text-[#4A5568] hover:bg-natural/10 disabled:opacity-35" aria-label="Increase quantity">
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <p className="text-right text-[10px] font-medium text-natural/70">Maximum {maxAllowedQuantity} per order</p>
                  
                  <div className="space-y-2.5">
                    <button
                      onClick={handleAddToCart}
                      className="w-full h-11 bg-[#4A5568] hover:bg-[#3B4455] active:scale-98 text-warm-ivory text-xs font-bold tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
                    >
                      <ShoppingCart size={14} />
                      Add to Cart
                    </button>
                    
                    <button
                      onClick={handleBuyNow}
                      className="w-full h-11 bg-[#4A5568] hover:bg-[#4A5568]/95 active:scale-98 text-warm-ivory text-xs font-bold tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              )}
              
              {/* Ships and Sold details */}
              <div className="border-t border-natural/10 pt-3.5 text-[10px] text-natural/80 font-semibold space-y-1">
                <div className="flex justify-between">
                  <span>Ships from</span>
                  <span className="text-[#4A5568]">facile Warehouse</span>
                </div>
                <div className="flex justify-between">
                  <span>Sold by</span>
                  <span className="text-[#4A5568]">Facile seller</span>
                </div>
              </div>

              <div className="border-t border-natural/10 pt-3.5">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={handleToggleFavorite} className="h-12 border border-natural/25 hover:border-[#FA99C6] rounded-xl text-[9px] sm:text-[10px] font-bold text-[#4A5568] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer hover:bg-white/30 uppercase tracking-wider">
                    <Heart size={14} className={isFav ? "text-[#FA99C6] fill-[#FA99C6]" : "text-[#4A5568]"} />
                    {isFav ? "Wishlisted" : "Wishlist"}
                  </button>
                  <button onClick={handleSaveForLater} className="h-12 border border-natural/25 hover:border-[#5271FF] rounded-xl text-[9px] sm:text-[10px] font-bold text-[#4A5568] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer hover:bg-white/30 uppercase tracking-wider">
                    <Bookmark size={14} className={isSavedForLater ? "fill-[#5271FF] text-[#5271FF]" : "text-[#4A5568]"} />
                    {isSavedForLater ? "Saved" : "Save for Later"}
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
        {recommendedProducts.length > 0 && (
          <section className="rounded-[28px] border border-natural/15 bg-white/35 p-6 sm:p-8">
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FA99C6]">You may also like</p>
              <h2 className="mt-1 font-serif text-2xl font-extrabold text-[#4a556a]">Recommended products</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-3">
              {recommendedProducts.map((item) => (
                <Link key={item.id} href={`/product/bs${item.id}`} className="group w-48 flex-none overflow-hidden rounded-2xl border border-natural/15 bg-[#F4F4F0] transition-all hover:-translate-y-1 hover:shadow-md sm:w-56">
                  <div className="aspect-square overflow-hidden bg-neutral-100">
                    <img src={item.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300"} alt={item.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate text-sm font-bold text-[#4a556a]">{item.title}</h3>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-extrabold text-[#4a556a]">₹{Number(item.sellingPrice).toLocaleString("en-IN")}</span>
                        {Number(item.mrp) > Number(item.sellingPrice) && <span className="text-[10px] text-natural line-through">₹{Number(item.mrp).toLocaleString("en-IN")}</span>}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-natural shrink-0">
                        <Star size={11} className={(item.reviews ?? 0) > 0 ? "fill-amber-400 text-amber-400" : "text-neutral-300"} />
                        {(item.reviews ?? 0) > 0 ? <span>{Number(item.rating ?? 0).toFixed(1)} ({item.reviews})</span> : <span>0</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section id="customer-reviews" className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
          <div className="rounded-[28px] border border-natural/15 bg-white/40 p-6 sm:p-8">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FA99C6]">Customer feedback</p>
                <h2 className="mt-1 font-serif text-2xl font-extrabold text-[#4a556a]">Ratings & reviews</h2>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-[#4a556a]">{Number(product.rating).toFixed(1)} / 5</p>
                <p className="text-xs font-semibold text-natural">{customerReviews.length} verified {customerReviews.length === 1 ? "review" : "reviews"}</p>
              </div>
            </div>

            {customerReviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-natural/25 px-5 py-10 text-center text-sm font-medium text-natural">
                No reviews yet. Be the first to share your experience.
              </div>
            ) : (
              <div className="space-y-4">
                {customerReviews.map((review) => (
                  <article key={review.id} className="rounded-2xl border border-natural/10 bg-[#F4F4F0]/70 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-extrabold text-[#4a556a]">{review.userName}</p>
                        <div className="mt-1 flex gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} size={13} className={star <= review.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"} />
                          ))}
                        </div>
                      </div>
                      <time className="text-[10px] font-semibold text-natural/70" dateTime={review.updatedAt}>
                        {new Date(review.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </time>
                    </div>
                    {review.title && <h3 className="mt-3 text-sm font-bold text-[#4a556a]">{review.title}</h3>}
                    <p className="mt-2 whitespace-pre-wrap text-xs font-medium leading-relaxed text-natural">{review.comment}</p>
                  </article>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleReviewSubmit} className="h-fit rounded-[28px] border border-natural/15 bg-[#F4F4F0] p-6 shadow-xs lg:sticky lg:top-[120px]">
            <h2 className="font-serif text-xl font-extrabold text-[#4a556a]">Write a review</h2>
            <p className="mt-1 text-xs font-medium text-natural">
              {isAuthenticated ? `Posting as ${user?.name}` : "Sign in to rate this product."}
            </p>

            <div className="mt-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-natural">Your rating</span>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setReviewRating(star)} className="rounded-md p-1 transition-transform hover:scale-110" aria-label={`Rate ${star} stars`}>
                    <Star size={24} className={star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-neutral-300"} />
                  </button>
                ))}
              </div>
            </div>

            <label className="mt-4 block text-[10px] font-bold uppercase tracking-wider text-natural">
              Review title <span className="font-medium normal-case text-natural/60">(optional)</span>
              <input value={reviewTitle} onChange={(event) => setReviewTitle(event.target.value)} maxLength={120} className="mt-2 h-11 w-full rounded-xl border border-natural/20 bg-white/70 px-3 text-sm font-medium normal-case tracking-normal outline-none focus:border-[#FA99C6]" placeholder="What stood out?" />
            </label>

            <label className="mt-4 block text-[10px] font-bold uppercase tracking-wider text-natural">
              Your review
              <textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} required minLength={3} maxLength={2000} rows={5} className="mt-2 w-full resize-none rounded-xl border border-natural/20 bg-white/70 p-3 text-sm font-medium normal-case tracking-normal outline-none focus:border-[#FA99C6]" placeholder="Share your experience with this product" />
            </label>

            {reviewError && <p className="mt-3 text-xs font-semibold text-red-600">{reviewError}</p>}
            <button type="submit" disabled={reviewSubmitting} className="mt-5 h-11 w-full rounded-xl bg-[#4A5568] text-xs font-bold tracking-wider text-warm-ivory transition-colors hover:bg-[#3B4455] disabled:cursor-not-allowed disabled:opacity-60">
              {reviewSubmitting ? "Saving review..." : isAuthenticated ? "Submit review" : "Sign in to review"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
