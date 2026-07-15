"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, ShoppingCart, Heart, Star, ShieldCheck, RefreshCw, Truck, Sparkles } from "lucide-react";

// Mock Fallback Database in case the API is offline
const MOCK_PRODUCTS: Record<string, any> = {
  bs1: {
    id: "bs1",
    name: "Smart Watch Series 5",
    price: 89.99,
    originalPrice: 129.99,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400",
    rating: 4.5,
    reviews: 128,
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
    rating: 4.7,
    reviews: 98,
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
    rating: 4.6,
    reviews: 156,
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
    rating: 4.4,
    reviews: 78,
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
    rating: 4.8,
    reviews: 64,
    description: "Indulge in a sophisticated, long-lasting luxury fragrance. Combining fresh citrus top notes with a warm amber and woody base, this premium perfume is perfect for daily wear or special occasions. Comes in an elegantly designed glass bottle.",
    category: "Beauty",
    subCategory: "Fragrance"
  }
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  
  const { addToCart, toggleFavorite, favorites, setIsCartOpen } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [activeImage, setActiveImage] = useState<string>("");
  const [stock, setStock] = useState<number>(50); // Default placeholder stock
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

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
            rating: dataProduct.rating || 4.5,
            reviews: dataProduct.reviews || 50,
            description: dataProduct.description,
            category: dataProduct.category?.name || "Uncategorized",
            subCategory: dataProduct.subCategory?.name || "General"
          };
          setProduct(productDetails);
          setActiveImage(dataProduct.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300");
          
          if (dataInventory && typeof dataInventory.stock === "number") {
            setStock(dataInventory.stock);
          }
        }
      } catch (err) {
        console.warn("Using fallback local data due to error: ", err);
        // Fallback to local mock data
        const localMock = MOCK_PRODUCTS[productId] || MOCK_PRODUCTS["bs1"];
        setProduct(localMock);
        setActiveImage(localMock.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300");
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        brand: "facile Store",
        image: product.image
      });
    }
    triggerToast(`Added ${quantity} ${product.name} to your bag! 🛍️`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    const buyNowItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      brand: "facile Store",
      image: product.image,
      quantity: quantity
    };
    localStorage.setItem("facile_buynow", JSON.stringify([buyNowItem]));
    router.push("/checkout?buynow=true");
  };

  const handleToggleFavorite = () => {
    if (!product) return;
    toggleFavorite(product.id);
    const isNowFav = !favorites.includes(product.id);
    triggerToast(isNowFav ? `Added ${product.name} to Wishlist! ❤️` : `Removed ${product.name} from Wishlist.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF3E3] flex items-center justify-center text-fern font-semibold">
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
  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const galleryImages = product
    ? [
        product.image,
        product.image ? `${product.image}&sig=1` : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300",
        product.image ? `${product.image}&sig=2` : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300",
        product.image ? `${product.image}&sig=3` : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=300",
      ].filter(Boolean)
    : [];

  return (
    <div className="bg-[#FAF3E3] text-[#4a556a] font-sans min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-fern text-warm-ivory py-3 px-5 rounded-2xl shadow-xl flex items-center gap-2 border border-natural/30 animate-slide-in text-xs font-semibold">
          <span className="text-[#FA99C6]">✓</span>
          {toastMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-warm-ivory border border-natural/15 rounded-[32px] p-6 sm:p-8 lg:p-10 shadow-xs">
          
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
                <span className="absolute top-4 left-4 bg-[#FA99C6] text-warm-ivory text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm tracking-wider">
                  {discountPercent}% OFF
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
            
            {/* Brand Store Link, Title & Star Rating */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-natural uppercase tracking-wider block">Visit the facile Store</span>
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#4a556a] leading-tight">
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
                <span className="text-fern font-bold ml-1">{product.rating}</span>
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

            <div className="border-t border-natural/10" />

            {/* Special Offers Scrollable Deck */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-natural uppercase tracking-wider">
                <Sparkles size={14} className="text-[#FA99C6]" />
                <span>Special Offers</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                <div className="min-w-[150px] bg-warm-ivory/50 border border-natural/15 rounded-xl p-3.5 space-y-1 flex-shrink-0">
                  <p className="text-[9px] font-bold text-[#4A5568] uppercase tracking-wider">Bank Offer</p>
                  <p className="text-[10px] text-natural font-semibold leading-relaxed font-sans">Get 10% off up to ₹1,500 on HDFC Cards.</p>
                  <span className="text-[9px] font-bold text-[#FA99C6] hover:underline cursor-pointer block pt-1">1 offer &gt;</span>
                </div>
                <div className="min-w-[150px] bg-warm-ivory/50 border border-natural/15 rounded-xl p-3.5 space-y-1 flex-shrink-0">
                  <p className="text-[9px] font-bold text-[#4A5568] uppercase tracking-wider">Cashback</p>
                  <p className="text-[10px] text-natural font-semibold leading-relaxed font-sans">Up to ₹500 cashback on UPI payments.</p>
                  <span className="text-[9px] font-bold text-[#FA99C6] hover:underline cursor-pointer block pt-1">2 offers &gt;</span>
                </div>
                <div className="min-w-[150px] bg-warm-ivory/50 border border-natural/15 rounded-xl p-3.5 space-y-1 flex-shrink-0">
                  <p className="text-[9px] font-bold text-[#4A5568] uppercase tracking-wider">Partner Offer</p>
                  <p className="text-[10px] text-natural font-semibold leading-relaxed font-sans">Save up to 18% with GST business invoice.</p>
                  <span className="text-[9px] font-bold text-[#FA99C6] hover:underline cursor-pointer block pt-1">1 offer &gt;</span>
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
            <div className="bg-warm-ivory/50 border border-natural/15 rounded-3xl p-5 space-y-3.5 lg:sticky lg:top-[120px] shadow-xs">
              
              {/* Delivery and Prime branding */}
              <div className="space-y-2">
                <span className="text-xs font-serif font-black italic tracking-widest text-[#4A5568]">facile<span className="text-[#FA99C6]">plus</span></span>
                <p className="text-[11px] text-natural font-medium leading-relaxed font-sans">
                  Enjoy unlimited <span className="font-bold text-[#4A5568]">FREE Same-Day Delivery</span> on this item.
                </p>
              </div>
              
              <div className="border-t border-natural/10 pt-3.5 space-y-1.5">
                <p className="text-xs text-natural font-semibold">
                  FREE delivery <span className="font-bold text-[#4A5568]">Friday, 17 July</span>.
                </p>
                <p className="text-[10px] text-natural/80 font-medium leading-relaxed font-sans">
                  Or fastest delivery <span className="font-bold text-[#FA99C6]">Tomorrow, July 15</span>. Order within <span className="font-bold text-[#4A5568]">7 hrs 3 mins</span>.
                </p>
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
                    <select 
                      value={quantity} 
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="h-8.5 px-3 bg-white border border-natural/20 rounded-xl text-xs font-semibold text-[#4A5568] focus:outline-none focus:border-[#4A5568] cursor-pointer"
                    >
                      {[...Array(Math.min(10, stock))].map((_, index) => (
                        <option key={index + 1} value={index + 1}>{index + 1}</option>
                      ))}
                    </select>
                  </div>
                  
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
                  <span className="text-[#4A5568]">facile</span>
                </div>
                <div className="flex justify-between">
                  <span>Sold by</span>
                  <span className="text-[#4A5568]">facile Store</span>
                </div>
              </div>

              <div className="border-t border-natural/10 pt-3.5">
                {/* Wishlist Button */}
                <button
                  onClick={handleToggleFavorite}
                  className="w-full h-10 border border-natural/25 hover:border-[#FA99C6] rounded-xl text-xs font-bold text-[#4A5568] flex items-center justify-center gap-2 transition-all cursor-pointer hover:bg-white/30"
                >
                  <Heart size={14} className={isFav ? "text-[#FA99C6] fill-[#FA99C6]" : "text-[#4A5568]"} />
                  {isFav ? "Added to Wishlist" : "Add to Wishlist"}
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
