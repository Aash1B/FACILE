"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  brand: string;
  image: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const USER_ID = "user123"; // TODO: replace once real auth/JWT is wired in
const API_BASE = "http://localhost:8081";
const IMAGE_CACHE_KEY = "facile_product_display_cache"; // productId -> {image, brand}, display-only

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  // Merge backend cart items with locally-cached image/brand (backend has no image/brand fields)
  const mergeWithDisplayCache = (
    backendItems: { productId: string; productName: string; price: number; quantity: number }[]
  ): CartItem[] => {
    let displayCache: Record<string, { image: string; brand: string }> = {};
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(IMAGE_CACHE_KEY);
      if (raw) {
        try {
          displayCache = JSON.parse(raw);
        } catch (e) {
          console.error("Error parsing product display cache", e);
        }
      }
    }
    return backendItems.map((item) => ({
      id: item.productId,
      name: item.productName,
      price: item.price,
      quantity: item.quantity,
      brand: displayCache[item.productId]?.brand ?? "Facile Store",
      image: displayCache[item.productId]?.image ?? "/placeholder-product.png"
    }));
  };

  const cacheDisplayInfo = (id: string, image: string, brand: string) => {
    if (typeof window === "undefined") return;
    let displayCache: Record<string, { image: string; brand: string }> = {};
    const raw = localStorage.getItem(IMAGE_CACHE_KEY);
    if (raw) {
      try {
        displayCache = JSON.parse(raw);
      } catch (e) {
        console.error("Error parsing product display cache", e);
      }
    }
    displayCache[id] = { image, brand };
    localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(displayCache));
  };

  const fetchCartFromBackend = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/cart/${USER_ID}`);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setCart(mergeWithDisplayCache(data.items ?? []));
    } catch (e) {
      console.error("Failed to fetch cart from backend:", e);
    } finally {
      setIsCartLoaded(true);
    }
  };

  useEffect(() => {
    fetchCartFromBackend();

    if (typeof window !== "undefined") {
      const savedFavs = localStorage.getItem("facile_favorites");
      if (savedFavs) {
        try {
          setFavorites(JSON.parse(savedFavs));
        } catch (e) {
          console.error("Error parsing favorites data", e);
        }
      }
    }
  }, []);

  const saveFavorites = (newFavs: string[]) => {
    setFavorites(newFavs);
    if (typeof window !== "undefined") {
      localStorage.setItem("facile_favorites", JSON.stringify(newFavs));
    }
  };

  const addToCart = async (item: Omit<CartItem, "quantity">) => {
    // Cache image/brand locally immediately — backend can't store these yet
    cacheDisplayInfo(item.id, item.image, item.brand);

    try {
      const res = await fetch(`${API_BASE}/api/cart/${USER_ID}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.id,
          productName: item.name,
          price: item.price,
          quantity: 1
        })
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setCart(mergeWithDisplayCache(data.items ?? []));
    } catch (e) {
      console.error("Failed to add item to cart:", e);
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/cart/${USER_ID}/remove/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setCart(mergeWithDisplayCache(data.items ?? []));
    } catch (e) {
      console.error("Failed to remove item from cart:", e);
    }
  };

  const updateQuantity = async (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }

    const existing = cart.find((i) => i.id === id);
    if (!existing) return;

    try {
      // No decrement/set-quantity endpoint exists yet — remove then re-add.
      // Not atomic; workaround until a real PATCH endpoint exists.
      const removeRes = await fetch(`${API_BASE}/api/cart/${USER_ID}/remove/${id}`, {
        method: "DELETE"
      });
      if (!removeRes.ok) throw new Error(`Server responded with ${removeRes.status}`);

      const addRes = await fetch(`${API_BASE}/api/cart/${USER_ID}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
          productName: existing.name,
          price: existing.price,
          quantity: qty
        })
      });
      if (!addRes.ok) throw new Error(`Server responded with ${addRes.status}`);
      const data = await addRes.json();
      setCart(mergeWithDisplayCache(data.items ?? []));
    } catch (e) {
      console.error("Failed to update quantity:", e);
    }
  };

  const clearCart = async () => {
    // No bulk-clear endpoint exists — remove items one by one
    try {
      for (const item of cart) {
        await fetch(`${API_BASE}/api/cart/${USER_ID}/remove/${item.id}`, {
          method: "DELETE"
        });
      }
      setCart([]);
    } catch (e) {
      console.error("Failed to clear cart:", e);
    }
  };

  const toggleFavorite = (id: string) => {
    const isFav = favorites.includes(id);
    const newFavs = isFav
      ? favorites.filter((favId) => favId !== id)
      : [...favorites, id];
    saveFavorites(newFavs);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        favorites,
        toggleFavorite,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}