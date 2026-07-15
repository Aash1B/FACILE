"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, ShoppingCart, Heart, Star, ShieldCheck, RefreshCw, Truck } from "lucide-react";

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
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  
  const { addToCart, toggleFavorite, favorites } = useCart();
  
  const [product, setProduct] = useState<any>(null);
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
          setProduct({
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
          });
          
          if (dataInventory && typeof dataInventory.stock === "number") {
            setStock(dataInventory.stock);
          }
        }
      } catch (err) {
        console.warn("Using fallback local data due to error: ", err);
        // Fallback to local mock data
        const localMock = MOCK_PRODUCTS[productId] || MOCK_PRODUCTS["bs1"];
        setProduct(localMock);
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
          <Link href="/" className="inline-flex items-center gap-2 text-apricot hover:underline font-semibold text-sm">
            <ArrowLeft size={16} /> Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const isFav = favorites.includes(product.id);
  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="bg-[#FAF3E3] text-[#4a556a] font-sans min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-fern text-warm-ivory py-3 px-5 rounded-2xl shadow-xl flex items-center gap-2 border border-natural/30 animate-slide-in text-xs font-semibold">
          <span className="text-apricot">✓</span>
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

        {/* Main Details Panel */}
        <div className="bg-warm-ivory border border-natural/15 rounded-[32px] overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8 lg:p-10">
          
          {/* Left Column: Image Container */}
          <div className="aspect-square bg-neutral-100/50 rounded-2xl border border-natural/10 flex items-center justify-center p-8 relative overflow-hidden">
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-apricot text-warm-ivory text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm tracking-wider">
                {discountPercent}% OFF
              </span>
            )}
            <img
              src={product.image}
              alt={product.name}
              className="max-w-full max-h-full object-contain mix-blend-multiply"
            />
          </div>

          {/* Right Column: Specification Area */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#4a556a] leading-tight">
                  {product.name}
                </h1>
                
                {/* Rating & Reviews */}
                <div className="flex items-center gap-2 text-xs font-semibold text-natural">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={star <= Math.round(product.rating) ? "text-amber-400 fill-amber-400" : "text-neutral-200"}
                      />
                    ))}
                  </div>
                  <span className="text-fern font-bold text-sm ml-1">{product.rating}</span>
                  <span>•</span>
                  <span>{product.reviews} customer reviews</span>
                </div>
              </div>

              {/* Price Tags */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-[#4a556a]">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                <span className="text-sm text-natural line-through font-bold">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Stock Status Badge */}
              <div className="pt-2">
                {stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                    In Stock ({stock} units available)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-200">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Product description */}
              <div className="border-t border-natural/10 pt-4 space-y-2">
                <h3 className="text-xs font-extrabold text-natural uppercase tracking-wider">Overview</h3>
                <p className="text-xs text-natural leading-relaxed font-medium">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Actions Form */}
            <div className="border-t border-natural/10 pt-6 space-y-4">
              {stock > 0 && (
                <div className="flex items-center gap-4">
                  <span className="text-xs font-extrabold text-natural uppercase tracking-wider">Quantity:</span>
                  <div className="flex items-center border border-natural/20 rounded-xl overflow-hidden bg-warm-ivory">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-10 h-10 font-bold hover:bg-neutral-100/50 transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-xs font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                      className="w-10 h-10 font-bold hover:bg-neutral-100/50 transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={stock <= 0}
                  className="flex-1 h-12 bg-[#4a556a] hover:bg-[#4a556a]/90 disabled:bg-neutral-200 disabled:text-natural disabled:cursor-not-allowed text-warm-ivory text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 focus:outline-none cursor-pointer active:scale-98"
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </button>

                <button
                  onClick={handleToggleFavorite}
                  className="w-12 h-12 border border-natural/35 rounded-xl hover:border-apricot transition-all flex items-center justify-center cursor-pointer active:scale-98 hover:bg-neutral-50/50"
                  aria-label="Toggle wishlist"
                >
                  <Heart
                    size={18}
                    className={isFav ? "text-[#870339] fill-[#870339]" : "text-fern"}
                  />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Brand Promises */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="bg-warm-ivory/60 border border-natural/10 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-fern/10 rounded-full flex items-center justify-center text-fern">
              <Truck size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#4a556a]">Free Shipping</h4>
              <p className="text-[10px] text-natural font-medium">On orders over ₹15,000</p>
            </div>
          </div>
          <div className="bg-warm-ivory/60 border border-natural/10 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-fern/10 rounded-full flex items-center justify-center text-fern">
              <RefreshCw size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#4a556a]">Easy Returns</h4>
              <p className="text-[10px] text-natural font-medium">30-day return policy</p>
            </div>
          </div>
          <div className="bg-warm-ivory/60 border border-natural/10 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-fern/10 rounded-full flex items-center justify-center text-fern">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#4a556a]">Secure Payment</h4>
              <p className="text-[10px] text-natural font-medium">100% secure checkout</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
