"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

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
  addToCart: (item: Omit<CartItem, "quantity">, quantityToAdd?: number) => void;
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

  // Sync cart from backend or local storage when user state changes
  useEffect(() => {
    const syncCart = async () => {
      if (user && user.email) {
        // Logged-in user: merge local guest cart into backend database
        try {
          // Fetch existing db cart
          const dbRes = await fetch(`http://localhost:8081/api/cart/${user.email}`);
          const dbCart = dbRes.ok ? await dbRes.json() : { items: [] };

          const localCartStr = localStorage.getItem("facile_cart");
          if (localCartStr) {
            const localCart: CartItem[] = JSON.parse(localCartStr);
            if (localCart.length > 0) {
              // Perform client-side merge: check and add missing/larger quantities to DB
              for (const localItem of localCart) {
                const dbItem = dbCart.items.find((i: any) => i.productId === localItem.id);
                if (!dbItem) {
                  // Add item to backend
                  await fetch(`http://localhost:8081/api/cart/${user.email}/add`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      productId: localItem.id,
                      productName: localItem.name,
                      image: localItem.image,
                      price: localItem.price,
                      quantity: localItem.quantity,
                    }),
                  });
                } else if (localItem.quantity > dbItem.quantity) {
                  // Add the difference
                  const diff = localItem.quantity - dbItem.quantity;
                  await fetch(`http://localhost:8081/api/cart/${user.email}/add`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      productId: localItem.id,
                      productName: localItem.name,
                      image: localItem.image,
                      price: localItem.price,
                      quantity: diff,
                    }),
                  });
                }
              }
              // Clear local guest cart
              localStorage.removeItem("facile_cart");
            }
          }

          // Fetch final synchronized cart
          const finalRes = await fetch(`http://localhost:8081/api/cart/${user.email}`);
          if (finalRes.ok) {
            const finalCart = await finalRes.json();
            // Map backend cart structure back to frontend CartItem
            const mappedCart: CartItem[] = await Promise.all(finalCart.items.map(async (i: any) => {
              let image = i.image;
              if (!image) {
                const numericProductId = String(i.productId).replace(/\D+/g, "");
                if (numericProductId) {
                  try {
                    const productRes = await fetch(`/api/products/${numericProductId}`);
                    if (productRes.ok) image = (await productRes.json()).image;
                  } catch {
                    // Use the fallback below only when product lookup fails.
                  }
                }
              }

              return {
                id: i.productId,
                name: i.productName,
                price: i.price,
                brand: "Facile",
                image: image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300",
                quantity: i.quantity,
              };
            }));
            setCart(mappedCart);
          }
        } catch (e) {
          console.error("Failed to sync cart with backend:", e);
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
    if (!user && typeof window !== "undefined") {
      localStorage.setItem("facile_cart", JSON.stringify(newCart));
    }
  };

  const saveFavorites = (newFavs: string[]) => {
    setFavorites(newFavs);
    if (typeof window !== "undefined") {
      localStorage.setItem("facile_favorites", JSON.stringify(newFavs));
    }
  };

  const addToCart = async (item: Omit<CartItem, "quantity">, quantityToAdd = 1) => {
    const existingIndex = cart.findIndex((cartItem) => cartItem.id === item.id);
    
    if (user && user.email) {
      // Sync with database
      try {
        await fetch(`http://localhost:8081/api/cart/${user.email}/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.id,
            productName: item.name,
            image: item.image,
            price: item.price,
            quantity: quantityToAdd,
          }),
        });

        // Update state
        if (existingIndex > -1) {
          const newCart = [...cart];
          newCart[existingIndex].quantity += quantityToAdd;
          saveCartState(newCart);
        } else {
          saveCartState([...cart, { ...item, quantity: quantityToAdd }]);
        }
      } catch (e) {
        console.error("Failed to add item to db cart:", e);
      }
    } else {
      // Guest: local storage
      if (existingIndex > -1) {
        const newCart = [...cart];
        newCart[existingIndex].quantity += quantityToAdd;
        saveCartState(newCart);
      } else {
        saveCartState([...cart, { ...item, quantity: quantityToAdd }]);
      }
    }
  };

  const removeFromCart = async (id: string) => {
    if (user && user.email) {
      try {
        await fetch(`http://localhost:8081/api/cart/${user.email}/remove/${id}`, {
          method: "DELETE",
        });
        saveCartState(cart.filter((item) => item.id !== id));
      } catch (e) {
        console.error("Failed to remove item from db cart:", e);
      }
    } else {
      saveCartState(cart.filter((item) => item.id !== id));
    }
  };

  const updateQuantity = async (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }

    const currentItem = cart.find((item) => item.id === id);
    if (!currentItem) return;

    if (user && user.email) {
      try {
        const oldQty = currentItem.quantity;
        if (qty > oldQty) {
          // Add the difference
          await fetch(`http://localhost:8081/api/cart/${user.email}/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: id,
              productName: currentItem.name,
              image: currentItem.image,
              price: currentItem.price,
              quantity: qty - oldQty,
            }),
          });
        } else if (qty < oldQty) {
          // Remove from DB first and add back the smaller quantity
          await fetch(`http://localhost:8081/api/cart/${user.email}/remove/${id}`, {
            method: "DELETE",
          });
          await fetch(`http://localhost:8081/api/cart/${user.email}/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: id,
              productName: currentItem.name,
              image: currentItem.image,
              price: currentItem.price,
              quantity: qty,
            }),
          });
        }
        
        saveCartState(cart.map((item) =>
          item.id === id ? { ...item, quantity: qty } : item
        ));
      } catch (e) {
        console.error("Failed to update item quantity in db cart:", e);
      }
    } else {
      saveCartState(cart.map((item) =>
        item.id === id ? { ...item, quantity: qty } : item
      ));
    }
  };

  const clearCart = async () => {
    if (user && user.email) {
      try {
        // Clear each item in database
        for (const item of cart) {
          await fetch(`http://localhost:8081/api/cart/${user.email}/remove/${item.id}`, {
            method: "DELETE",
          });
        }
        saveCartState([]);
      } catch (e) {
        console.error("Failed to clear db cart:", e);
      }
    } else {
      saveCartState([]);
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
