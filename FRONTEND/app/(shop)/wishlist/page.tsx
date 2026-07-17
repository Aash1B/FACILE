"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, ShoppingCart, Heart, Trash2, Sparkles, Star } from "lucide-react";

// Mock Fallback Database in case the API is offline (same as page.tsx)
const MOCK_PRODUCTS = [
  {
    id: "bs1",
    name: "Smart Watch Series 5",
    price: 8999,
    originalPrice: 12999,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400",
    rating: 4.5,
    reviews: 128
  },
  {
    id: "bs2",
    name: "Wireless Headphones",
    price: 5999,
    originalPrice: 8999,
    image: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=400",
    rating: 4.7,
    reviews: 98
  },
  {
    id: "bs3",
    name: "Travel Backpack",
    price: 3999,
    originalPrice: 5999,
    image: "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?q=80&w=400",
    rating: 4.6,
    reviews: 156
  },
  {
    id: "bs4",
    name: "Running Shoes",
    price: 4999,
    originalPrice: 7999,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=400",
    rating: 4.4,
    reviews: 78
  },
  {
    id: "bs5",
    name: "Luxury Perfume",
    price: 2999,
    originalPrice: 4999,
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=400",
    rating: 4.8,
    reviews: 64
  },
  {
    id: "bs6",
    name: "Hydrating Lip Balm Set",
    price: 599,
    originalPrice: 999,
    image: "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=400",
    rating: 4.5,
    reviews: 112
  },
  {
    id: "bs7",
    name: "Herbal Sunscreen SPF 50",
    price: 499,
    originalPrice: 799,
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=400",
    rating: 4.3,
    reviews: 89
  },
  {
    id: "bs8",
    name: "Badminton Racket Pack",
    price: 1999,
    originalPrice: 2999,
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=400",
    rating: 4.6,
    reviews: 210
  },
  {
    id: "bs9",
    name: "Tennis Balls Pack",
    price: 299,
    originalPrice: 499,
    image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=400",
    rating: 4.2,
    reviews: 45
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

type ApiProduct = {
  id: number | string;
  title: string;
  sellingPrice: number;
  mrp: number;
  image?: string;
  rating: number;
  reviews: number;
  maxOrderQuantity?: number;
};

export default function WishlistPage() {
  const { addToCart, toggleFavorite, favorites } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped = (data as ApiProduct[]).map((p) => ({
              id: "bs" + p.id,
              name: p.title,
              price: p.sellingPrice,
              originalPrice: p.mrp,
              image: p.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400",
              rating: Number(p.rating ?? 0),
              reviews: Number(p.reviews ?? 0),
              maxOrderQuantity: p.maxOrderQuantity || 10
            }));
            setProducts(mapped);
          }
        }
      } catch (err) {
        console.warn("Failed to load products from API, using fallback data.", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const wishlistItems = products.filter((p) => favorites.includes(p.id));

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
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
    triggerToast(`Added ${product.name} to your bag! 🛍️`);
  };

  const handleRemoveFavorite = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
    triggerToast(`Removed ${product.name} from Wishlist.`);
  };

  return (
    <div className="bg-[#F4F4F0] text-[#4a556a] font-sans min-h-screen py-8 px-4 sm:px-6 lg:px-8 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#4a556a] text-warm-ivory py-3 px-5 rounded-2xl shadow-xl flex items-center gap-2 border border-natural/30 animate-slide-in text-xs font-semibold">
          <Trash2 size={16} className="text-[#E8437F]" />
          {toastMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#4a556a] hover:text-[#4a556a]/80 transition-colors">
            <ArrowLeft size={16} /> Back to Shop
          </Link>
          <h1 className="text-xl font-extrabold font-serif text-[#4a556a]">My Wishlist</h1>
          <div className="text-xs font-bold bg-[#E8437F]/10 text-[#E8437F] px-3 py-1 rounded-full border border-[#E8437F]/20 shadow-xs">
            {wishlistItems.length} {wishlistItems.length === 1 ? "Item" : "Items"}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-[#4a556a] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold mt-4 text-[#4a556a]/70">Loading wishlist items...</p>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border border-natural/15 rounded-3xl text-center max-w-md mx-auto shadow-sm">
            <Heart size={44} className="text-[#E8437F] mb-4 animate-pulse fill-[#E8437F]/10" />
            <h2 className="text-md font-extrabold text-[#4a556a] mb-2 font-serif">Your Wishlist is Empty</h2>
            <p className="text-xs text-[#4a556a]/70 mb-6 leading-relaxed max-w-xs">
              Save items you love here to find them easily later. Add some products and they will appear here!
            </p>
            <Link
              href="/"
              className="text-xs font-bold px-6 py-2.5 bg-[#4a556a] hover:bg-[#4a556a]/90 text-warm-ivory rounded-xl transition-all shadow-md active:scale-98"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((product) => {
              const discount = product.originalPrice > product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
              return (
                <div
                  key={product.id}
                  className="group bg-white hover:bg-[#4A5568] border border-natural/15 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-natural/30 transition-all duration-300 flex flex-col relative"
                >
                  {/* Remove Button */}
                  <button
                    onClick={(e) => handleRemoveFavorite(product, e)}
                    className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-[#FAF3E3]/95 text-[#870339] hover:bg-red-50 hover:scale-105 active:scale-95 transition-all border border-natural/10 focus:outline-none cursor-pointer"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={13} />
                  </button>

                  <Link href={`/product/${product.id}`} className="flex flex-col flex-1">
                    {/* Product Image */}
                    <div className="aspect-square bg-neutral-100/30 relative overflow-hidden flex-shrink-0">
                      {discount > 0 && (
                        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-apricot text-white text-xs sm:text-sm font-bold rounded-full shadow-md">
                          -{discount}%
                        </div>
                      )}
                      <img
                        src={product.image}
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
                        <Star size={11} className="text-amber-400 fill-amber-400" />
                        <span className="text-[#4a556a] group-hover:text-warm-ivory font-bold">{product.rating}</span>
                        <span>({product.reviews})</span>
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

                {/* Add to Cart Button */}
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
        )}
      </div>
    </div>
  );
}
