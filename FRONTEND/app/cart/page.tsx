"use client";

import { useEffect, useState } from "react";

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);

  useEffect(() => {
    fetch("http://localhost:8081/api/cart/user123")
      .then((res) => res.json())
      .then((data) => setCart(data))
      .catch((err) => console.error("Failed to fetch cart:", err));
  }, []);

  if (!cart) {
    return <div className="p-8">Loading cart...</div>;
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
          ))}
        </div>
      )}

      <div className="mt-4 text-lg font-semibold">
        Total: ₹{cart.totalAmount}
      </div>
    </div>
  );
}