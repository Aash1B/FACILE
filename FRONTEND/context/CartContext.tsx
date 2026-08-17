"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { getApiResponseErrorMessage } from "@/lib/apiError";
import { ORDER_BASE_URL, productApiUrl } from "@/lib/serviceUrls";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  brand: string;
  image: string;
  maxOrderQuantity?: number;
  quantity: number;
  selectedSize?: string | null;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantityToAdd?: number) => Promise<boolean>;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const recentAddClicks = useRef<Map<string, number>>(new Map());

  // Sync cart from backend or local storage when user state changes
  useEffect(() => {
    const syncCart = async () => {
      if (user && user.email) {
        // Logged-in user: merge local guest cart into backend database
        try {
          // Fetch existing db cart
          const dbRes = await fetch(`${ORDER_BASE_URL}/api/cart/${user.email}`);
          if (dbRes.ok) {
            const dbCart = await dbRes.json();
            const localCartStr = localStorage.getItem("facile_cart");
            if (localCartStr) {
              const localCart: CartItem[] = JSON.parse(localCartStr);
              if (localCart.length > 0) {
                // Perform client-side merge: check and add missing/larger quantities to DB
                for (const localItem of localCart) {
                  const dbItem = (dbCart.items || []).find((i: any) => i.productId === localItem.id);
                  if (!dbItem) {
                    // Add item to backend
                    await fetch(`${ORDER_BASE_URL}/api/cart/${user.email}/add`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        productId: localItem.id,
                        productName: localItem.name,
                        image: localItem.image,
                        maxOrderQuantity: localItem.maxOrderQuantity || 10,
                        price: localItem.price,
                        quantity: localItem.quantity,
                        selectedSize: localItem.selectedSize || null,
                      }),
                    });
                  } else if (localItem.quantity > dbItem.quantity) {
                    // Add the difference
                    const diff = localItem.quantity - dbItem.quantity;
                    await fetch(`${ORDER_BASE_URL}/api/cart/${user.email}/add`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        productId: localItem.id,
                        productName: localItem.name,
                        image: localItem.image,
                        maxOrderQuantity: localItem.maxOrderQuantity || 10,
                        price: localItem.price,
                        quantity: diff,
                        selectedSize: localItem.selectedSize || null,
                      }),
                    });
                  }
                }
              }
            }

            // Fetch final synchronized cart
            const finalRes = await fetch(`${ORDER_BASE_URL}/api/cart/${user.email}`);
            if (finalRes.ok) {
              const finalCart = await finalRes.json();
              // Map backend cart structure back to frontend CartItem
              const mappedCart: CartItem[] = await Promise.all((finalCart.items || []).map(async (i: any) => {
                let image = i.image;
                if (!image) {
                  const numericProductId = String(i.productId).replace(/\D+/g, "");
                  if (numericProductId) {
                    try {
                      const productRes = await fetch(productApiUrl(`/api/products/${numericProductId}`));
                      if (productRes.ok) image = (await productRes.json()).image;
                    } catch {
                      // Use fallback when product lookup fails
                    }
                  }
                }

                return {
                  id: i.productId,
                  name: i.productName,
                  price: i.price,
                  brand: "Facile",
                  image: image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300",
                  maxOrderQuantity: i.maxOrderQuantity || 10,
                  quantity: i.quantity,
                  selectedSize: i.selectedSize || null,
                };
              }));
              saveCartState(mappedCart);
              return;
            }
          }
        } catch (e) {
          console.error("Failed to sync cart with backend:", e);
        }

        // Fallback to local storage if backend is unreachable or returns non-ok
        const savedCart = localStorage.getItem("facile_cart");
        if (savedCart) {
          try {
            setCart(JSON.parse(savedCart));
          } catch (e) {
            console.error("Error parsing cart data", e);
          }
        }
      } else {
        // Guest user: load from local storage
        const savedCart = localStorage.getItem("facile_cart");
        if (savedCart) {
          try {
            setCart(JSON.parse(savedCart));
          } catch (e) {
            console.error("Error parsing cart data", e);
          }
        } else {
          setCart([]);
        }
      }
    };

    syncCart();
  }, [user]);

  // Load favorites on mount
  useEffect(() => {
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

  const saveCartState = (newCart: CartItem[]) => {
    setCart(newCart);
    if (typeof window !== "undefined") {
      localStorage.setItem("facile_cart", JSON.stringify(newCart));
    }
  };

  const saveFavorites = (newFavs: string[]) => {
    setFavorites(newFavs);
    if (typeof window !== "undefined") {
      localStorage.setItem("facile_favorites", JSON.stringify(newFavs));
    }
  };

  const addToCart = async (item: Omit<CartItem, "quantity">, quantityToAdd = 1): Promise<boolean> => {
    const now = Date.now();
    const lastClick = recentAddClicks.current.get(item.id) ?? 0;
    if (now - lastClick < 300) return false;
    recentAddClicks.current.set(item.id, now);

    const existingIndex = cart.findIndex(
      (cartItem) => cartItem.id === item.id && cartItem.selectedSize === item.selectedSize
    );
    const maxQuantity = item.maxOrderQuantity || 10;
    const safeQuantityToAdd = Math.min(maxQuantity, Math.max(1, quantityToAdd));

    // Optimistically update client state immediately
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex] = {
        ...newCart[existingIndex],
        quantity: Math.min(maxQuantity, newCart[existingIndex].quantity + safeQuantityToAdd),
      };
      saveCartState(newCart);
    } else {
      saveCartState([...cart, { ...item, maxOrderQuantity: maxQuantity, quantity: safeQuantityToAdd }]);
    }

    if (user && user.email) {
      // Sync with database in background
      try {
        const response = await fetch(`${ORDER_BASE_URL}/api/cart/${user.email}/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": crypto.randomUUID(),
          },
          body: JSON.stringify({
            productId: item.id,
            productName: item.name,
            image: item.image,
            maxOrderQuantity: maxQuantity,
            price: item.price,
            quantity: safeQuantityToAdd,
            selectedSize: item.selectedSize || null,
          }),
        });
        if (!response.ok) {
          const errMsg = await getApiResponseErrorMessage(response, "Unable to add item to remote cart.");
          console.warn("Backend sync notice:", errMsg);
        }
      } catch (e) {
        console.error("Failed to add item to db cart:", e);
      }
    }

    return true;
  };

  const removeFromCart = async (id: string) => {
    saveCartState(cart.filter((item) => item.id !== id));

    if (user && user.email) {
      try {
        await fetch(`${ORDER_BASE_URL}/api/cart/${user.email}/remove/${id}`, {
          method: "DELETE",
        });
      } catch (e) {
        console.error("Failed to remove item from db cart:", e);
      }
    }
  };

  const updateQuantity = async (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }

    const currentItem = cart.find((item) => item.id === id);
    if (!currentItem) return;
    qty = Math.min(currentItem.maxOrderQuantity || 10, qty);
    const oldQty = currentItem.quantity;

    saveCartState(cart.map((item) =>
      item.id === id ? { ...item, quantity: qty } : item
    ));

    if (user && user.email) {
      try {
        if (qty > oldQty) {
          await fetch(`${ORDER_BASE_URL}/api/cart/${user.email}/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: id,
              productName: currentItem.name,
              image: currentItem.image,
              maxOrderQuantity: currentItem.maxOrderQuantity || 10,
              price: currentItem.price,
              quantity: qty - oldQty,
            }),
          });
        } else if (qty < oldQty) {
          await fetch(`${ORDER_BASE_URL}/api/cart/${user.email}/remove/${id}`, {
            method: "DELETE",
          });
          await fetch(`${ORDER_BASE_URL}/api/cart/${user.email}/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: id,
              productName: currentItem.name,
              image: currentItem.image,
              maxOrderQuantity: currentItem.maxOrderQuantity || 10,
              price: currentItem.price,
              quantity: qty,
            }),
          });
        }
      } catch (e) {
        console.error("Failed to update item quantity in db cart:", e);
      }
    }
  };

  const clearCart = async () => {
    const prevCart = [...cart];
    saveCartState([]);

    if (user && user.email) {
      try {
        for (const item of prevCart) {
          await fetch(`${ORDER_BASE_URL}/api/cart/${user.email}/remove/${item.id}`, {
            method: "DELETE",
          });
        }
      } catch (e) {
        console.error("Failed to clear db cart:", e);
      }
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
        setIsCartOpen,
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
