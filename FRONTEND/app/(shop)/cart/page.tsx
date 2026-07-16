"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Bookmark,
  RotateCcw,
  AlertTriangle
} from "lucide-react";

const USER_ID = "user123"; // TODO: replace once real auth/JWT is wired in
const API_BASE = "http://localhost:8081";
const SAVED_KEY = "facile_saved_for_later";

interface CartItem {
  productId: string;
  productName: string;
  image?: string;
  price: number;
  quantity: number;
}

interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
}

const formatPrice = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/cart/${USER_ID}`);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setCart(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setError("Couldn't load your cart. Make sure the backend is running on port 8081.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SAVED_KEY);
      if (saved) {
        try {
          setSavedItems(JSON.parse(saved));
        } catch (e) {
          console.error("Error parsing saved-for-later data", e);
        }
      }
    }
  }, []);

  const persistSaved = (items: CartItem[]) => {
    setSavedItems(items);
    if (typeof window !== "undefined") {
      localStorage.setItem(SAVED_KEY, JSON.stringify(items));
    }
  };

  const handleIncrease = async (item: CartItem) => {
    setPendingProductId(item.productId);
    try {
      const res = await fetch(`${API_BASE}/api/cart/${USER_ID}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: 1
        })
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setCart(data);
    } catch (err) {
      console.error("Failed to increase quantity:", err);
      setError("Couldn't update quantity. Try again.");
    } finally {
      setPendingProductId(null);
    }
  };

  const handleDecrease = async (item: CartItem) => {
    setPendingProductId(item.productId);
    try {
      // No decrement endpoint exists yet — remove then re-add with lower quantity.
      // Not atomic; fine for now, should be replaced with a real PATCH endpoint later.
      const removeRes = await fetch(
        `${API_BASE}/api/cart/${USER_ID}/remove/${item.productId}`,
        { method: "DELETE" }
      );
      if (!removeRes.ok) throw new Error(`Server responded with ${removeRes.status}`);

      if (item.quantity > 1) {
        const addRes = await fetch(`${API_BASE}/api/cart/${USER_ID}/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity - 1
          })
        });
        if (!addRes.ok) throw new Error(`Server responded with ${addRes.status}`);
        const data = await addRes.json();
        setCart(data);
      } else {
        const data = await removeRes.json();
        setCart(data);
      }
    } catch (err) {
      console.error("Failed to decrease quantity:", err);
      setError("Couldn't update quantity. Try again.");
    } finally {
      setPendingProductId(null);
    }
  };

  const handleRemove = async (productId: string) => {
    setPendingProductId(productId);
    try {
      const res = await fetch(`${API_BASE}/api/cart/${USER_ID}/remove/${productId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setCart(data);
    } catch (err) {
      console.error("Failed to remove item:", err);
      setError("Couldn't remove item. Try again.");
    } finally {
      setPendingProductId(null);
    }
  };

  const handleSaveForLater = async (item: CartItem) => {
    setPendingProductId(item.productId);
    try {
      const res = await fetch(`${API_BASE}/api/cart/${USER_ID}/remove/${item.productId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setCart(data);
      persistSaved([...savedItems, item]);
    } catch (err) {
      console.error("Failed to save item for later:", err);
      setError("Couldn't save item for later. Try again.");
    } finally {
      setPendingProductId(null);
    }
  };

  const handleMoveToCart = async (item: CartItem) => {
    setPendingProductId(item.productId);
    try {
      const res = await fetch(`${API_BASE}/api/cart/${USER_ID}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity
        })
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setCart(data);
      persistSaved(savedItems.filter((s) => s.productId !== item.productId));
    } catch (err) {
      console.error("Failed to move item to cart:", err);
      setError("Couldn't move item to cart. Try again.");
    } finally {
      setPendingProductId(null);
    }
  };

  const handleRemoveSaved = (productId: string) => {
    persistSaved(savedItems.filter((s) => s.productId !== productId));
  };

  const subtotal = cart?.totalAmount ?? 0;
  const shipping = subtotal >= 1500 || subtotal === 0 ? 0 : 99;
  const grandTotal = subtotal + shipping;
  const totalItems = cart?.items.reduce((acc, i) => acc + i.quantity, 0) ?? 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#faf3e3" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-apricot border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-fern">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      {cart.items.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="space-y-3">
          {cart.items.map((item) => (
            <div
              key={item.productId}
              className="flex justify-between border-b pb-2"
            >
              <span>
                {item.productName} × {item.quantity}
              </span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
