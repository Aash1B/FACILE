"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Mic,
  Send,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Square,
  UserRound,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { LocalVoiceRecording, startLocalVoiceRecording } from "@/lib/localVoiceRecorder";

type Product = {
  id: number | string;
  title: string;
  brand?: string;
  sellingPrice: number;
  mrp?: number;
  rating?: number;
  image?: string;
  description?: string;
  category?: { name?: string };
  subCategory?: { name?: string };
  maxOrderQuantity?: number;
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  products?: Product[];
  action?: { label: string; href: string };
};

const STARTERS = [
  "Find products under ₹1,000",
  "Show top-rated products",
  "Help with my order",
  "What is in my cart?",
];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=300";

const normalize = (value: unknown) => String(value ?? "").toLowerCase();

const normalizeProductSearch = (value: unknown) =>
  normalize(value)
    .replace(/jewelry/g, "jewellery")
    .replace(/\bsmart[\s-]*phones?\b/g, "smartphone")
    .replace(/\bcell[\s-]*phones?\b/g, "smartphone")
    .replace(/\bmobile[\s-]*phones?\b/g, "smartphone")
    .replace(/\b(?:tshit|thsit|tshrit|tshrt)\b/g, "tshirt")
    .replace(/t[\s-]*shirts?/g, "tshirt")
    .replace(/tee[\s-]*shirts?/g, "tshirt")
    .replace(/[^a-z0-9&\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export default function FacileChatbot() {
  const { cart, favorites, addToCart, removeFromCart, clearCart, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [typing, setTyping] = useState(false);
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "transcribing">("idle");
  const [voiceError, setVoiceError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! I’m Fia, your FACILE shopping assistant. I can find products by category, budget or rating, explain offers, and help with your cart and orders.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const voiceRecordingRef = useRef<LocalVoiceRecording | null>(null);
  const voiceTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("facile:open-chat", openChat);
    return () => window.removeEventListener("facile:open-chat", openChat);
  }, []);

  useEffect(() => {
    if (!open || catalogLoaded || loadingProducts) return;
    setLoadingProducts(true);
    fetch("/api/products")
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => {
        setCatalogLoaded(true);
        setLoadingProducts(false);
      });
  }, [open, catalogLoaded, loadingProducts]);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  useEffect(() => () => {
    if (voiceTimeoutRef.current) window.clearTimeout(voiceTimeoutRef.current);
    if (voiceRecordingRef.current) void voiceRecordingRef.current.stop().catch(() => undefined);
  }, []);

  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart]
  );

  const findProducts = (query: string, limit = 3) => {
    const text = normalizeProductSearch(query);
    const budgetMatch = text.match(/(?:under|below|less than|upto|up to)\s*₹?\s*([\d,]+)/i);
    const budget = budgetMatch ? Number(budgetMatch[1].replace(/,/g, "")) : null;
    const stopWords = new Set([
      "show", "find", "me", "products", "product", "best", "top", "rated", "rating",
      "under", "below", "less", "than", "upto", "up", "to", "please", "want", "need",
      "some", "for", "with", "facile", "buy", "shop",
      "add", "put", "cart", "bag", "get", "one", "two", "three", "first", "second", "third",
      "mujhe", "dikhao", "dikhana", "chahiye", "karo", "wala", "wali",
      "budget", "affordable", "cheap", "cheapest", "inexpensive", "lowest", "price",
    ]);
    const terms = text
      .replace(/[₹,\d]/g, " ")
      .split(/\s+/)
      .filter((term) => term.length > 2 && !stopWords.has(term));

    let matches = products.filter((product) => {
      if (budget !== null && Number(product.sellingPrice) > budget) return false;
      if (!terms.length) return true;
      const haystack = normalizeProductSearch([
        product.title,
        product.brand,
        product.description,
        product.category?.name,
        product.subCategory?.name,
      ].join(" "));
      const compactHaystack = haystack.replace(/\s+/g, "");
      return terms.every((term) =>
        haystack.includes(term) || compactHaystack.includes(term.replace(/\s+/g, ""))
      );
    });

    return matches
      .sort((a, b) => {
        if (
          text.includes("cheap") ||
          text.includes("budget") ||
          text.includes("affordable") ||
          text.includes("inexpensive") ||
          text.includes("lowest price")
        ) {
          return Number(a.sellingPrice) - Number(b.sellingPrice);
        }
        return Number(b.rating ?? 0) - Number(a.rating ?? 0);
      })
      .slice(0, limit);
  };

  const websiteAnswer = (query: string): ChatMessage | null => {
    const text = normalize(query);
    const id = crypto.randomUUID();
    const accountRoute = (route: string) => user ? route : "/login";

    if (/\b(what can you do|how can you help|help me|your features|capabilities)\b/.test(text)) {
      return { id, role: "assistant", text: "I can find and compare catalogue products, search by budget or rating, summarize your cart and wishlist, guide checkout and payments, open orders and tracking, help with returns, addresses, account security, reviews, gift cards, and seller onboarding.", action: { label: "Browse FACILE", href: "/categories" } };
    }
    if (/\b(wishlist|wish list|favourites|favorites|favourite|favorite|saved items)\b/.test(text)) {
      return { id, role: "assistant", text: favorites.length ? `You have ${favorites.length} saved item${favorites.length === 1 ? "" : "s"} in your wishlist.` : "Your wishlist is empty. Tap the heart on any product to save it for later.", action: { label: "Open wishlist", href: "/wishlist" } };
    }
    if (/\b(cart|basket)\b/.test(text)) {
      const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
      return cart.length
        ? { id, role: "assistant", text: `You have ${itemCount} item${itemCount === 1 ? "" : "s"} in your cart, worth Rs ${cartTotal.toLocaleString("en-IN")}.`, action: { label: "Open cart", href: "/cart" } }
        : { id, role: "assistant", text: "Your cart is empty. Tell me a category or budget and I will help you find something useful.", action: { label: "Explore products", href: "/categories" } };
    }
    if (/\b(checkout|payment|pay now|razorpay|gift card wallet|saved card|saved cards)\b/.test(text)) {
      if (!cart.length && /\b(checkout|pay now)\b/.test(text)) {
        return { id, role: "assistant", text: "Your cart is empty, so there is nothing to check out yet. Add a product first and I can bring you back to checkout.", action: { label: "Browse products", href: "/categories" } };
      }
      return { id, role: "assistant", text: "FACILE checkout requires a delivery address and supports secure Razorpay payment or an available gift-card wallet balance. Payment history and saved payment details are in your account.", action: { label: cart.length ? "Continue to checkout" : "Payment settings", href: cart.length ? "/checkout" : accountRoute("/profile?tab=saved_cards") } };
    }
    if (/\b(address|addresses|shipping address|delivery address)\b/.test(text)) {
      return { id, role: "assistant", text: user ? "You can add, edit, and select delivery addresses from your account." : "Sign in to securely add or manage your delivery addresses.", action: { label: user ? "Manage addresses" : "Sign in", href: accountRoute("/profile?tab=addresses") } };
    }
    if (/\b(track|tracking|shipment|where is my order|where's my order|my orders?|order status|delivery status)\b/.test(text)) {
      return { id, role: "assistant", text: user ? "Open Track Order to see every order. Choose Track & Email and FACILE will send the latest tracking history to your account email." : "Sign in first to securely track your FACILE orders and receive tracking history by email.", action: { label: user ? "Track my orders" : "Sign in", href: accountRoute("/profile?tab=tracking") } };
    }
    if (/\b(return|refund|cancel|cancellation)\b/.test(text)) {
      return { id, role: "assistant", text: "Open the relevant purchase in My Orders to review its current status and any available cancellation or return options.", action: { label: user ? "Go to orders" : "Sign in", href: accountRoute("/profile?tab=orders") } };
    }
    if (/\b(delivery charge|delivery fee|shipping fee|how long.*delivery|delivery time|when.*deliver)\b/.test(text)) {
      return { id, role: "assistant", text: "Delivery availability, charges, and timing can depend on the product and address. Add the item to your cart and select a delivery address at checkout to see the applicable details.", action: { label: cart.length ? "Check at checkout" : "Browse products", href: cart.length ? "/checkout" : "/categories" } };
    }
    if (/\b(gift card|gift cards|wallet balance|redeem)\b/.test(text)) {
      return { id, role: "assistant", text: user ? "You can view your balance, buy a gift card, or redeem one from the Gift Cards section of your account." : "Sign in to buy, redeem, or view FACILE gift cards.", action: { label: user ? "Open gift cards" : "Sign in", href: accountRoute("/profile?tab=gift_cards") } };
    }
    if (/\b(review|reviews|rating|rate (?:a |my )?product)\b/.test(text) && !/\b(top|best|show|find|under|below)\b/.test(text)) {
      return { id, role: "assistant", text: "Ratings and verified reviews appear on each product page. Customers who purchased a product can write a review there, and existing reviews can be viewed in your account.", action: { label: user ? "My reviews" : "Browse products", href: user ? "/profile?tab=reviews" : "/categories" } };
    }
    if (/\b(password|security|change password|account security)\b/.test(text)) {
      return { id, role: "assistant", text: user ? "You can update your password and account security from your profile." : "Use password recovery if you cannot access your account.", action: { label: user ? "Security settings" : "Reset password", href: user ? "/profile?tab=security" : "/forgot-password" } };
    }
    if (/\b(profile|my account|account details|edit account|personal details)\b/.test(text)) {
      return { id, role: "assistant", text: user ? "Your profile contains personal details, orders, addresses, payments, gift cards, security, and reviews." : "Sign in to access your FACILE account, orders, addresses, and saved details.", action: { label: user ? "Open my profile" : "Sign in", href: accountRoute("/profile?tab=profile") } };
    }
    if (/\b(forgot password|reset password|can't sign in|cannot sign in)\b/.test(text)) {
      return { id, role: "assistant", text: "Use the password recovery page to regain access to your customer account.", action: { label: "Reset password", href: "/forgot-password" } };
    }
    if (/\b(sign in|log in|login|create account|register|sign up)\b/.test(text) && !/\bseller\b/.test(text)) {
      const registering = /\b(create account|register|sign up)\b/.test(text);
      return { id, role: "assistant", text: registering ? "Create a FACILE customer account to save addresses, track orders, and manage purchases." : "Sign in to access your orders, addresses, reviews, and account settings.", action: { label: registering ? "Create account" : "Sign in", href: registering ? "/register" : "/login" } };
    }
    if (/\b(seller|sell on facile|become a seller|list (?:a |my )?product|seller dashboard)\b/.test(text)) {
      const sellerLogin = /\b(login|log in|dashboard|existing)\b/.test(text);
      return { id, role: "assistant", text: sellerLogin ? "Existing sellers can sign in to manage products and their seller account." : "Register as a FACILE seller, then use the seller dashboard to list and manage products.", action: { label: sellerLogin ? "Seller sign in" : "Become a seller", href: sellerLogin ? "/seller/login" : "/seller/register" } };
    }
    if (/\b(deals?|offers?|discounts?|best sellers?|new arrivals?|trending)\b/.test(text) && !/\b(show|find|under|below)\b/.test(text)) {
      const offers = /\b(deal|offer|discount|trending)\b/.test(text);
      return { id, role: "assistant", text: offers ? "You can see FACILE's current highlighted offers on the home page." : "The home page highlights current best sellers and new arrivals.", action: { label: offers ? "View offers" : "View best sellers", href: offers ? "/#special-offer" : "/#best-sellers" } };
    }
    if (/\b(category|categories|browse departments)\b/.test(text)) {
      return { id, role: "assistant", text: "FACILE has Fashion, Electronics, Beauty, Footwear, Home & Living, Jewellery, Sports, Kids & Baby, Wellness, Stationery, and Pet supplies.", action: { label: "Browse categories", href: "/categories" } };
    }
    if (/\b(home page|homepage|go home)\b/.test(text)) {
      return { id, role: "assistant", text: "I can take you back to the FACILE home page.", action: { label: "Go home", href: "/" } };
    }
    return null;
  };

  const answer = (query: string): ChatMessage => {
    const text = normalize(query);
    const id = crypto.randomUUID();

    const siteHelp = websiteAnswer(query);
    if (siteHelp) return siteHelp;

    if (/\b(hi|hello|hey|namaste)\b/.test(text)) {
      return {
        id,
        role: "assistant",
        text: `Hello${user?.name ? ` ${user.name.split(" ")[0]}` : ""}! Tell me what you’re shopping for, your budget, or a category and I’ll narrow it down.`,
      };
    }

    if (/\b(cart|basket)\b/.test(text)) {
      return cart.length
        ? {
            id,
            role: "assistant",
            text: `You have ${cart.reduce((sum, item) => sum + item.quantity, 0)} item${cart.length === 1 ? "" : "s"} in your cart, worth ₹${cartTotal.toLocaleString("en-IN")}.`,
            action: { label: "Open cart", href: "/cart" },
          }
        : {
            id,
            role: "assistant",
            text: "Your cart is empty. Tell me a category or budget and I’ll help you find something useful.",
            action: { label: "Explore products", href: "/categories" },
          };
    }

    if (/\b(order|delivery|track|shipment)\b/.test(text)) {
      return {
        id,
        role: "assistant",
        text: user
          ? "You can view order status, delivery details and previous purchases from My Orders."
          : "Sign in first to securely view and track your FACILE orders.",
        action: { label: user ? "View my orders" : "Sign in", href: user ? "/profile?tab=orders" : "/login" },
      };
    }

    if (/\b(return|refund|cancel)\b/.test(text)) {
      return {
        id,
        role: "assistant",
        text: "Open the relevant purchase in My Orders to review its status and available cancellation or return options.",
        action: { label: "Go to orders", href: user ? "/profile?tab=orders" : "/login" },
      };
    }

    if (/\b(category|categories|browse)\b/.test(text)) {
      return {
        id,
        role: "assistant",
        text: "FACILE has Fashion, Electronics, Beauty, Footwear, Home & Living, Jewellery, Sports, Kids & Baby, Wellness, Stationery and Pet supplies.",
        action: { label: "Browse categories", href: "/categories" },
      };
    }

    const recommendations = findProducts(query);
    if (loadingProducts) {
      return { id, role: "assistant", text: "I’m loading the latest FACILE catalogue. Please try that request once more in a moment." };
    }
    if (recommendations.length) {
      return {
        id,
        role: "assistant",
        text: `Here are ${recommendations.length} strong match${recommendations.length === 1 ? "" : "es"} from the FACILE catalogue:`,
        products: recommendations,
        action: { label: "See all search results", href: `/search?q=${encodeURIComponent(query)}` },
      };
    }

    return {
      id,
      role: "assistant",
      text: "I couldn’t find an exact match. Try a request like “running shoes under ₹3,000”, “best skincare”, or “show electronics”.",
      action: { label: "Browse all categories", href: "/categories" },
    };
  };

  const quantityFromQuery = (query: string) => {
    const numeric = query.match(/\b(?:add|put|get|buy)\s+(\d{1,2})\b/i);
    if (numeric) return Math.max(1, Number(numeric[1]));
    const words: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5 };
    const word = query.match(/\b(one|two|three|four|five)\b/i)?.[1].toLowerCase();
    return word ? words[word] : 1;
  };

  const latestShownProducts = () =>
    [...messages].reverse().find((message) => message.products?.length)?.products || [];

  const resolveProductForCart = (query: string) => {
    const shown = latestShownProducts();
    const text = normalize(query);
    if (shown.length) {
      if (/\b(first|1st|number one)\b/.test(text)) return shown[0];
      if (/\b(second|2nd|number two)\b/.test(text)) return shown[1];
      if (/\b(third|3rd|number three)\b/.test(text)) return shown[2];
      if (/\b(it|this|that|this one)\b/.test(text) && shown.length === 1) return shown[0];
    }
    const productQuery = query
      .replace(/\b(add|put|get|buy|please|to|into|in|my|the|cart|bag|basket|one|two|three|four|five|\d+)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    return findProducts(productQuery || query, 1)[0];
  };

  const send = async (raw: string) => {
    const query = raw.trim();
    if (!query || typing) return;
    const history = messages
      .filter((message) => message.id !== "welcome")
      .slice(-6)
      .map((message) => ({ role: message.role, text: message.text }));
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", text: query },
    ]);
    setInput("");
    setTyping(true);

    if (/\b(clear|empty|remove everything from)\b.*\b(cart|bag|basket)\b/i.test(query)) {
      await clearCart();
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", text: "Your cart is now empty.", action: { label: "Browse products", href: "/categories" } }]);
      setTyping(false);
      return;
    }

    if (/\b(remove|delete|take out)\b/i.test(query) && /\b(cart|bag|basket)\b/i.test(query)) {
      const searchText = normalizeProductSearch(query.replace(/\b(remove|delete|take|out|from|my|the|cart|bag|basket)\b/gi, " "));
      const item = searchText ? cart.find((cartItem) => normalizeProductSearch(cartItem.name).includes(searchText)) : undefined;
      if (item) {
        await removeFromCart(item.id);
        setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", text: `${item.name} was removed from your cart.`, action: { label: "Open cart", href: "/cart" } }]);
      } else {
        setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", text: "I could not identify that item in your cart. Open the cart to choose the item you want to remove.", action: { label: "Open cart", href: "/cart" } }]);
      }
      setTyping(false);
      return;
    }

    if (/^\s*(add|put)\b/i.test(query) || (/\b(add|put|get|buy)\b/i.test(query) && /\b(cart|bag|basket)\b/i.test(query))) {
      if (loadingProducts) {
        setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", text: "The catalogue is still loading. Please try that once more in a moment." }]);
      } else {
        const product = resolveProductForCart(query);
        if (product) {
          addProduct(product, quantityFromQuery(query));
        } else {
          setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", text: "I could not find that product in the live catalogue. Try its full name, brand, or ask me to show matching products first.", action: { label: "Browse categories", href: "/categories" } }]);
        }
      }
      setTyping(false);
      return;
    }

    const siteHelp = websiteAnswer(query);
    if (siteHelp) {
      window.setTimeout(() => {
        setMessages((current) => [...current, siteHelp]);
        setTyping(false);
      }, 250);
      return;
    }
    try {
      const candidates = findProducts(query, 8);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history,
          candidates: candidates.map((product) => ({
            id: product.id,
            title: product.title,
            brand: product.brand,
            sellingPrice: product.sellingPrice,
            mrp: product.mrp,
            rating: product.rating,
            category: product.category?.name,
            subcategory: product.subCategory?.name,
          })),
          cart: {
            itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
            total: cartTotal,
          },
          user: {
            signedIn: Boolean(user),
            firstName: user?.name?.split(" ")[0] || "",
          },
        }),
      });
      const result = await response.json();
      if (!response.ok || typeof result.reply !== "string") throw new Error(result.error || "AI request failed");

      const selectedIds = new Set((result.productIds || []).map(String));
      const aiSelectedProducts = candidates.filter((product) => selectedIds.has(String(product.id))).slice(0, 3);
      // Some compact models describe the correct candidates but omit their IDs.
      // Candidate selection is already deterministic and catalog-safe, so keep
      // the UI useful by showing the top real matches in that case.
      const selectedProducts = aiSelectedProducts.length ? aiSelectedProducts : candidates.slice(0, 3);
      const text = normalize(query);
      const action = /\b(cart|basket)\b/.test(text)
        ? { label: "Open cart", href: "/cart" }
        : /\b(order|delivery|track|shipment|return|refund|cancel)\b/.test(text)
          ? { label: user ? "View my orders" : "Sign in", href: user ? "/profile?tab=orders" : "/login" }
          : result.suggestedSearch
            ? { label: "Search FACILE", href: `/search?q=${encodeURIComponent(result.suggestedSearch)}` }
            : undefined;
      setMessages((current) => [...current, {
        id: crypto.randomUUID(),
        role: "assistant",
        text: result.reply,
        products: selectedProducts.length ? selectedProducts : undefined,
        action,
      }]);
    } catch {
      setMessages((current) => [...current, answer(query)]);
    } finally {
      setTyping(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void send(input);
  };

  const addProduct = (product: Product, quantity = 1) => {
    const safeQuantity = Math.min(product.maxOrderQuantity || 10, Math.max(1, quantity));
    addToCart({
      id: String(product.id),
      name: product.title,
      price: Number(product.sellingPrice),
      brand: product.brand || "FACILE",
      image: product.image || FALLBACK_IMAGE,
      maxOrderQuantity: product.maxOrderQuantity || 10,
    }, safeQuantity);
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "assistant", text: `${safeQuantity > 1 ? `${safeQuantity} x ` : ""}${product.title} ${safeQuantity > 1 ? "have" : "has"} been added to your cart.`, action: { label: "Open cart", href: "/cart" } },
    ]);
  };

  const stopVoiceInput = async () => {
    const recording = voiceRecordingRef.current;
    if (!recording) return;
    voiceRecordingRef.current = null;
    if (voiceTimeoutRef.current) window.clearTimeout(voiceTimeoutRef.current);
    voiceTimeoutRef.current = null;
    setVoiceState("transcribing");
    setVoiceError("");
    try {
      const audio = await recording.stop();
      const form = new FormData();
      form.append("audio", audio, "fia-voice.wav");
      const response = await fetch("/api/voice-search", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok || !result.transcript) throw new Error(result.error || "I could not understand that recording.");
      const transcript = String(result.transcript).trim();
      setInput(transcript);
      inputRef.current?.focus();
      await send(transcript);
    } catch (error) {
      setVoiceError(error instanceof Error ? error.message : "Voice input failed. Please try again.");
    } finally {
      setVoiceState("idle");
    }
  };

  const toggleVoiceInput = async () => {
    if (voiceState === "listening") {
      await stopVoiceInput();
      return;
    }
    if (voiceState !== "idle" || typing) return;
    setVoiceError("");
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setVoiceError("Voice input needs HTTPS or localhost and microphone permission.");
      return;
    }
    try {
      voiceRecordingRef.current = await startLocalVoiceRecording();
      setVoiceState("listening");
      voiceTimeoutRef.current = window.setTimeout(() => void stopVoiceInput(), 10_000);
    } catch (error) {
      setVoiceError(error instanceof Error ? error.message : "Microphone access was blocked.");
      setVoiceState("idle");
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 hidden items-center gap-3 rounded-full bg-[#5271FF] px-6 py-4 text-sm font-bold text-white shadow-[0_12px_35px_rgba(74,85,106,0.35)] transition hover:-translate-y-0.5 hover:bg-[#3b4455] md:flex"
          aria-label="Open FACILE shopping assistant"
        >
          <MessageCircle size={24} />
          Ask Fia
        </button>
      )}

      {open && <button className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[1px] md:bg-transparent md:backdrop-blur-none" onClick={() => setOpen(false)} aria-label="Close chat backdrop" />}

      <aside
        className={`fixed z-[60] flex flex-col overflow-hidden bg-[#f8f8f5] shadow-[0_24px_80px_rgba(33,39,51,0.3)] transition-all duration-300 bottom-0 left-0 right-0 h-[82vh] rounded-t-[28px] md:left-auto md:bottom-5 md:right-5 md:h-[min(680px,calc(100vh-40px))] md:w-[390px] md:rounded-[28px] ${open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-8 opacity-0 md:translate-y-4"}`}
        aria-hidden={!open}
        aria-label="FACILE shopping assistant"
      >
        <header className="flex items-center gap-3 bg-[#5271FF] px-5 py-4 text-white">
          <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-white/15">
            <Bot size={24} />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#4a556a] bg-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-bold tracking-wide">Fia</h2>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest">FACILE assistant</span>
            </div>
            <p className="text-[11px] text-white/70">Product discovery, cart and order help</p>
          </div>
          <button onClick={() => setOpen(false)} className="rounded-full p-2 transition hover:bg-white/10" aria-label="Close shopping assistant"><X size={19} /></button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-2.5 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && <div className="mt-1 grid h-7 w-7 flex-none place-items-center rounded-xl bg-[#DDE0F0] text-[#4a556a]"><Sparkles size={14} /></div>}
              <div className={`max-w-[84%] ${message.role === "user" ? "rounded-[20px_20px_5px_20px] bg-[#5271FF] text-white" : "rounded-[5px_20px_20px_20px] border border-[#4a556a]/10 bg-white text-[#384152] shadow-sm"} px-4 py-3`}>
                <p className="text-[12px] leading-relaxed">{message.text}</p>
                {message.products?.map((product) => (
                  <div key={product.id} className="mt-3 overflow-hidden rounded-2xl border border-[#4a556a]/10 bg-[#f8f8f5]">
                    <div className="flex gap-3 p-2.5">
                      <img src={product.image || FALLBACK_IMAGE} alt="" className="h-16 w-16 flex-none rounded-xl bg-[#DDE0F0] object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-bold text-[#384152]">{product.title}</p>
                        <p className="mt-0.5 text-[9px] text-[#4a556a]/60">{product.brand || "FACILE"}{product.rating ? ` · ★ ${product.rating}` : ""}</p>
                        <p className="mt-1 text-xs font-extrabold text-[#870339]">₹{Number(product.sellingPrice).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 border-t border-[#4a556a]/10">
                      <Link href={`/product/${product.id}`} onClick={() => setOpen(false)} className="flex items-center justify-center gap-1 border-r border-[#4a556a]/10 py-2 text-[10px] font-bold text-[#4a556a] hover:bg-[#DDE0F0]/50">View <ExternalLink size={10} /></Link>
                      <button onClick={() => addProduct(product)} className="flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-[#870339] hover:bg-[#870339]/5"><ShoppingCart size={11} /> Add</button>
                    </div>
                  </div>
                ))}
                {message.action && (
                  <Link href={message.action.href} onClick={() => setOpen(false)} className="mt-3 flex items-center justify-between rounded-xl bg-[#DDE0F0]/65 px-3 py-2 text-[10px] font-bold text-[#4a556a] hover:bg-[#DDE0F0]">
                    {message.action.label}<ChevronRight size={13} />
                  </Link>
                )}
              </div>
              {message.role === "user" && <div className="mt-1 grid h-7 w-7 flex-none place-items-center rounded-xl bg-[#870339]/10 text-[#870339]"><UserRound size={14} /></div>}
            </div>
          ))}
          {typing && <div className="flex items-center gap-2.5"><div className="grid h-7 w-7 place-items-center rounded-xl bg-[#DDE0F0] text-[#4a556a]"><Bot size={14} /></div><div className="flex gap-1 rounded-2xl bg-white px-4 py-3 shadow-sm"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5271FF]/50" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5271FF]/50 [animation-delay:120ms]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5271FF]/50 [animation-delay:240ms]" /></div></div>}
        </div>

        {messages.length < 3 && (
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
            {STARTERS.map((starter) => <button key={starter} onClick={() => send(starter)} className="flex-none rounded-full border border-[#4a556a]/15 bg-white px-3 py-2 text-[10px] font-semibold text-[#4a556a] hover:border-[#4a556a]/35 hover:bg-[#DDE0F0]/40">{starter}</button>)}
          </div>
        )}

        <form onSubmit={submit} className="border-t border-[#4a556a]/10 bg-white p-3.5">
          {voiceState !== "idle" && (
            <div className="mb-2 flex items-center justify-center gap-2 rounded-xl bg-[#DDE0F0]/60 px-3 py-2 text-[10px] font-semibold text-[#4a556a]" role="status">
              <span className={`h-2 w-2 animate-pulse rounded-full ${voiceState === "listening" ? "bg-red-500" : "bg-[#5271FF]"}`} />
              {voiceState === "listening" ? "Listening in English or Hinglish - tap stop when finished" : "Turning your voice into a message..."}
            </div>
          )}
          {voiceError && <p className="mb-2 rounded-xl bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700" role="alert">{voiceError}</p>}
          <div className="flex items-center gap-2 rounded-2xl border border-[#4a556a]/15 bg-[#f8f8f5] p-1.5 pl-4 focus-within:border-[#4a556a]/40 focus-within:ring-2 focus-within:ring-[#DDE0F0]">
            <ShoppingBag size={16} className="flex-none text-[#4a556a]/45" />
            <input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about products, cart or orders…" className="min-w-0 flex-1 bg-transparent py-2 text-xs text-[#384152] outline-none placeholder:text-[#4a556a]/40" aria-label="Message Fia" />
            <button type="button" onClick={() => void toggleVoiceInput()} disabled={voiceState === "transcribing" || typing} className={`grid h-9 w-9 flex-none place-items-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-35 ${voiceState === "listening" ? "bg-red-500 text-white hover:bg-red-600" : "text-[#4a556a] hover:bg-[#DDE0F0]"}`} aria-label={voiceState === "listening" ? "Stop listening" : "Speak to Fia"} title={voiceState === "listening" ? "Stop listening" : "Speak in English or Hinglish"}>
              {voiceState === "listening" ? <Square size={13} fill="currentColor" /> : <Mic size={16} />}
            </button>
            <button disabled={!input.trim() || typing || voiceState !== "idle"} className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-[#5271FF] text-white transition hover:bg-[#3b4455] disabled:cursor-not-allowed disabled:opacity-35" aria-label="Send message"><Send size={15} /></button>
          </div>
          <p className="mt-2 text-center text-[9px] text-[#4a556a]/40">Try: "add two Nike T-shirts to cart" or "add the first one"</p>
        </form>
      </aside>
    </>
  );
}
