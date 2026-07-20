"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Star,
  ShoppingCart,
  Heart,
  Loader2,
  ChevronDown,
  ChevronRight,
  Store,
  Palette,
  Ruler,
  Tag,
  Zap,
  Clock,
  SlidersHorizontal,
  X,
  Wifi,
  Search,
  Check
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import ProductImage from "@/components/ProductImage";

import { CATEGORY_DETAILS, FALLBACK_PRODUCTS_MAP } from "@/lib/fallbackData";

const FALLBACK_SUBCATEGORIES: Record<string, string[]> = {
  "1": ["Mobile Accessories", "Audio Devices", "Smart Watches", "Laptop Accessories", "Gaming Accessories", "Smart Home Devices", "Power Banks", "Cables & Chargers"],
  "2": ["Tops & T-Shirts", "Dresses", "Bottom Wear", "Ethnic Wear", "Winter Wear", "Activewear", "Loungewear", "Co-ord Sets"],
  "3": ["Home Decor", "Kitchen Essentials", "Dining", "Bedding", "Storage & Organization", "Lighting", "Furniture", "Bath Essentials"],
  "4": ["Skincare", "Makeup", "Hair Care", "Fragrances", "Bath & Body", "Nail Care", "Beauty Tools", "Men's Grooming"],
  "5": ["Cricket", "Football", "Badminton", "Gym Equipment", "Cycling", "Running Gear", "Outdoor Games", "Sports Accessories"],
  "6": ["Baby Clothing", "Kids Clothing", "Toys", "Baby Care", "School Essentials", "Feeding Essentials", "Baby Bedding", "Kids Footwear"],
  "7": ["Earrings", "Necklaces", "Bracelets", "Rings", "Watches", "Bags", "Hair Accessories", "Sunglasses"],
  "8": ["Sneakers", "Flats", "Heels", "Sandals", "Boots", "Loafers", "Slippers", "Sports Shoes"],
  "9": ["Notebooks", "Pens & Pencils", "Art Supplies", "Desk Organizers", "Journals", "Planners", "Sticky Notes", "Office Supplies"],
  "10": ["Vitamins & Supplements", "Fitness Equipment", "Personal Care", "Yoga Essentials", "Healthy Snacks", "Massagers", "Health Monitors", "Wellness Kits"],
  "11": ["Dog Supplies", "Cat Supplies", "Pet Food", "Treats", "Toys", "Grooming", "Beds & Mats", "Bowls & Feeders"],
};

const APPAREL_SUBCATEGORIES = new Set([
  "Tops & T-Shirts",
  "Dresses",
  "Bottom Wear",
  "Ethnic Wear",
  "Winter Wear",
  "Activewear",
  "Loungewear",
  "Co-ord Sets",
]);

const FASHION_RETAIL_SUBCATEGORIES = new Set([
  "Dresses",
  "Winter Wear",
  "Bottom Wear",
  "Ethnic Wear",
  "Loungewear",
  "Co-ord Sets",
]);

const JEWELRY_SUBCATEGORIES = new Set([
  "Earrings",
  "Necklaces",
  "Bracelets",
  "Rings",
]);

const CATEGORY_BRANDS: Record<string, string[]> = {
  "8": ["Adidas", "Nike", "FILA", "HRX", "Puma", "Superdry"],
};

const CARD_STYLES = [
  { surface: "from-[#DDE0F0] to-[#eef0f9]", icon: "bg-[#4a556a]", accent: "bg-[#aeb7d8]" },
  { surface: "from-[#5271FF]/20 to-[#5271FF]/10", icon: "bg-[#4a556a]", accent: "bg-[#5271FF]" },
  { surface: "from-[#eadfcf] to-[#fff8ec]", icon: "bg-[#A58E74]", accent: "bg-[#d9c3a6]" },
];

type SubCategory = { id: number | string; name: string };

// ─── Filter Constants ─────────────────────────────────────────────────────────
const DISCOUNT_RANGES = [
  { label: "10% and above", min: 10 },
  { label: "20% and above", min: 20 },
  { label: "30% and above", min: 30 },
  { label: "50% and above", min: 50 },
];

const DELIVERY_OPTIONS = [
  { label: "1–2 Days", maxDays: 2 },
  { label: "3–5 Days", maxDays: 5 },
  { label: "7+ Days", maxDays: 999 },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Avg. Customer Rating" },
  { value: "rating-reviews", label: "Ratings & Reviews" },
  { value: "discount", label: "Biggest Discount" },
];

const COLOR_MAP: Record<string, string> = {
  Black: "#111827",
  White: "#f9fafb",
  Red: "#ef4444",
  Blue: "#3b82f6",
  Green: "#22c55e",
  Yellow: "#eab308",
  Orange: "#f97316",
  Purple: "#a855f7",
  Pink: "#ec4899",
  Brown: "#92400e",
  Grey: "#6b7280",
  Silver: "#9ca3af",
  Gold: "#ca8a04",
  Beige: "#d4b896",
  Charcoal: "#374151",
  Clear: "#e5e7eb",
  Multicolor: "linear-gradient(135deg, #ef4444, #3b82f6, #22c55e, #eab308)",
  "Rose Gold": "#be9b8f",
  "Free Size": "#a3e635",
};

const SUBCATEGORY_IMAGES: Record<string, string> = {
  // Beauty Subcategories
  "Fragrance": "https://plain-apac-prod-public.komododecks.com/202607/19/g9o7IXs1E5WzshIim5uk/image.png",
  "Fragrances": "https://plain-apac-prod-public.komododecks.com/202607/19/g9o7IXs1E5WzshIim5uk/image.png",
  "Bath and body": "https://plain-apac-prod-public.komododecks.com/202607/19/GJ69vBp9E7OmY9Rz2HJu/image.png",
  "Bath & Body": "https://plain-apac-prod-public.komododecks.com/202607/19/GJ69vBp9E7OmY9Rz2HJu/image.png",
  "Bath and Body": "https://plain-apac-prod-public.komododecks.com/202607/19/GJ69vBp9E7OmY9Rz2HJu/image.png",
  "Hair care": "https://plain-apac-prod-public.komododecks.com/202607/19/CHCy7QPTVbgkYOBUYT94/image.png",
  "Hair Care": "https://plain-apac-prod-public.komododecks.com/202607/19/CHCy7QPTVbgkYOBUYT94/image.png",
  "Makeup": "https://plain-apac-prod-public.komododecks.com/202607/19/0ydzyMqZmHzVX5xsXIFP/image.png",
  "Men grooming": "https://plain-apac-prod-public.komododecks.com/202607/19/tf48FTc0opixdGU72gmF/image.png",
  "Men's Grooming": "https://plain-apac-prod-public.komododecks.com/202607/19/tf48FTc0opixdGU72gmF/image.png",
  "Men Grooming": "https://plain-apac-prod-public.komododecks.com/202607/19/tf48FTc0opixdGU72gmF/image.png",
  "Nail care": "https://plain-apac-prod-public.komododecks.com/202607/19/fnzMaboUZu7KzOO5vBrr/image.png",
  "Nail Care": "https://plain-apac-prod-public.komododecks.com/202607/19/fnzMaboUZu7KzOO5vBrr/image.png",
  "Beauty tools": "https://plain-apac-prod-public.komododecks.com/202607/19/PZZe0TKcr2knUgVwyGZu/image.png",
  "Beauty Tools": "https://plain-apac-prod-public.komododecks.com/202607/19/PZZe0TKcr2knUgVwyGZu/image.png",
  "Skincare": "https://plain-apac-prod-public.komododecks.com/202607/19/de8S73qNeiNNlqkvZAF8/image.png",

  // Sports Subcategories
  "Badminton": "https://plain-apac-prod-public.komododecks.com/202607/19/k3cgi1u3XbLRaWYQ7pnv/image.png",
  "Football": "https://plain-apac-prod-public.komododecks.com/202607/19/Hyo6gKD9cTrrROJF3Gxs/image.png",
  "Sports accessories": "/sports_accessories_vibrant.png",
  "Sports Accessories": "/sports_accessories_vibrant.png",
  "Cricket": "https://plain-apac-prod-public.komododecks.com/202607/19/318OwQgUpmL1UshHUVcI/image.png",
  "Cycling": "https://plain-apac-prod-public.komododecks.com/202607/19/zkQ7tb0PYURQLJRPQwEw/image.png",
  "Outdoor games": "https://plain-apac-prod-public.komododecks.com/202607/19/MKSNiuFcBOg8kexHVinl/image.png",
  "Outdoor Games": "https://plain-apac-prod-public.komododecks.com/202607/19/MKSNiuFcBOg8kexHVinl/image.png",
  "Gym equipments": "https://plain-apac-prod-public.komododecks.com/202607/19/zA67TmyfbKS2qYEUewIX/image.png",
  "Gym Equipment": "https://plain-apac-prod-public.komododecks.com/202607/19/zA67TmyfbKS2qYEUewIX/image.png",
  "Gym Equipments": "https://plain-apac-prod-public.komododecks.com/202607/19/zA67TmyfbKS2qYEUewIX/image.png",
  "Running gear": "/running_gear_vibrant.png",
  "Running Gear": "/running_gear_vibrant.png",

  // Stationery Subcategories
  "Notebook": "https://plain-apac-prod-public.komododecks.com/202607/19/mNC5ZydsLCgpxfQzXJ3C/image.png",
  "Notebooks": "https://plain-apac-prod-public.komododecks.com/202607/19/mNC5ZydsLCgpxfQzXJ3C/image.png",
  "Pen and pencils": "https://plain-apac-prod-public.komododecks.com/202607/19/GdYviW16u9tA21jvAglq/image.png",
  "Pens & Pencils": "https://plain-apac-prod-public.komododecks.com/202607/19/GdYviW16u9tA21jvAglq/image.png",
  "Pens and Pencils": "https://plain-apac-prod-public.komododecks.com/202607/19/GdYviW16u9tA21jvAglq/image.png",
  "Pen & Pencils": "https://plain-apac-prod-public.komododecks.com/202607/19/GdYviW16u9tA21jvAglq/image.png",
  "Art supplies": "https://plain-apac-prod-public.komododecks.com/202607/19/m6gTW2TXdN17O3E46d4R/image.png",
  "Art Supplies": "https://plain-apac-prod-public.komododecks.com/202607/19/m6gTW2TXdN17O3E46d4R/image.png",
  "Desk organizer": "https://plain-apac-prod-public.komododecks.com/202607/19/K5iDhyUNKNBbRQfCayv7/image.png",
  "Desk Organizers": "https://plain-apac-prod-public.komododecks.com/202607/19/K5iDhyUNKNBbRQfCayv7/image.png",
  "Desk Organiser": "https://plain-apac-prod-public.komododecks.com/202607/19/K5iDhyUNKNBbRQfCayv7/image.png",
  "Desk Organisers": "https://plain-apac-prod-public.komododecks.com/202607/19/K5iDhyUNKNBbRQfCayv7/image.png",
  "Jorunal": "https://plain-apac-prod-public.komododecks.com/202607/19/ST1rt8sShEecfhuNN4AS/image.png",
  "Journal": "https://plain-apac-prod-public.komododecks.com/202607/19/ST1rt8sShEecfhuNN4AS/image.png",
  "Journals": "https://plain-apac-prod-public.komododecks.com/202607/19/ST1rt8sShEecfhuNN4AS/image.png",
  "Planner": "https://plain-apac-prod-public.komododecks.com/202607/19/rYtldf1F9PapCeGKTNFC/image.png",
  "Planners": "https://plain-apac-prod-public.komododecks.com/202607/19/rYtldf1F9PapCeGKTNFC/image.png",
  "Sticky notes": "https://plain-apac-prod-public.komododecks.com/202607/19/EvPtMcs4vbqXzpb07NMs/image.png",
  "Sticky Notes": "https://plain-apac-prod-public.komododecks.com/202607/19/EvPtMcs4vbqXzpb07NMs/image.png",
  "Office supplies": "https://plain-apac-prod-public.komododecks.com/202607/19/xTyEYcUAcXDBzDBgiKoX/image.png",
  "Office Supplies": "https://plain-apac-prod-public.komododecks.com/202607/19/xTyEYcUAcXDBzDBgiKoX/image.png",
  // Home & Living Subcategories
  "Home decor": "https://plain-apac-prod-public.komododecks.com/202607/19/gW7z6PI5cx8Fp20jAS1n/image.png",
  "Home Decor": "https://plain-apac-prod-public.komododecks.com/202607/19/gW7z6PI5cx8Fp20jAS1n/image.png",
  "Lightning": "https://plain-apac-prod-public.komododecks.com/202607/19/rDCkgXwQC6RWTjKY2jPi/image.png",
  "Lighting": "https://plain-apac-prod-public.komododecks.com/202607/19/rDCkgXwQC6RWTjKY2jPi/image.png",
  "Furniture": "https://plain-apac-prod-public.komododecks.com/202607/19/PlAUSf9nyykS7cFouaB8/image.png",
  "Bath essential": "https://plain-apac-prod-public.komododecks.com/202607/19/8JJFn4asNAEZZufLhMbT/image.png",
  "Bath Essentials": "https://plain-apac-prod-public.komododecks.com/202607/19/8JJFn4asNAEZZufLhMbT/image.png",
  "Bath Essential": "https://plain-apac-prod-public.komododecks.com/202607/19/8JJFn4asNAEZZufLhMbT/image.png",
  "Kitchen essentials": "https://plain-apac-prod-public.komododecks.com/202607/19/8Qpnpv6lHNnHxNz1E0fy/image.png",
  "Kitchen Essentials": "https://plain-apac-prod-public.komododecks.com/202607/19/8Qpnpv6lHNnHxNz1E0fy/image.png",
  "Dining": "https://plain-apac-prod-public.komododecks.com/202607/19/p4eApmwWxvMzbB2Dm5Y5/image.png",
  "Bedding": "https://plain-apac-prod-public.komododecks.com/202607/19/lRUrVdCBH511BDiDPt95/image.png",
  "Storage": "https://plain-apac-prod-public.komododecks.com/202607/19/9Ft6eLnKh2Ze4BJM9TCn/image.png",
  "Storage & Organization": "https://plain-apac-prod-public.komododecks.com/202607/19/9Ft6eLnKh2Ze4BJM9TCn/image.png",
  "Storage & organization": "https://plain-apac-prod-public.komododecks.com/202607/19/9Ft6eLnKh2Ze4BJM9TCn/image.png",
  "Storage and Organization": "https://plain-apac-prod-public.komododecks.com/202607/19/9Ft6eLnKh2Ze4BJM9TCn/image.png",
  "Storage & Organisation": "https://plain-apac-prod-public.komododecks.com/202607/19/9Ft6eLnKh2Ze4BJM9TCn/image.png",
  "Storage and Organisation": "https://plain-apac-prod-public.komododecks.com/202607/19/9Ft6eLnKh2Ze4BJM9TCn/image.png",
  // Pets Subcategories
  "Bowls and feeders": "https://plain-apac-prod-public.komododecks.com/202607/19/W2eUDTR7EkpPpzksenLv/image.png",
  "Bowls & Feeders": "https://plain-apac-prod-public.komododecks.com/202607/19/W2eUDTR7EkpPpzksenLv/image.png",
  "Bowls and Feeders": "https://plain-apac-prod-public.komododecks.com/202607/19/W2eUDTR7EkpPpzksenLv/image.png",
  "Bowls & feeders": "https://plain-apac-prod-public.komododecks.com/202607/19/W2eUDTR7EkpPpzksenLv/image.png",
  "Pet beds and mats": "https://plain-apac-prod-public.komododecks.com/202607/19/Xh1ppSCsGICiCX2wnpMt/image.png",
  "Beds & Mats": "https://plain-apac-prod-public.komododecks.com/202607/19/Xh1ppSCsGICiCX2wnpMt/image.png",
  "Beds and Mats": "https://plain-apac-prod-public.komododecks.com/202607/19/Xh1ppSCsGICiCX2wnpMt/image.png",
  "Pet Beds & Mats": "https://plain-apac-prod-public.komododecks.com/202607/19/Xh1ppSCsGICiCX2wnpMt/image.png",
  "Pet beds & mats": "https://plain-apac-prod-public.komododecks.com/202607/19/Xh1ppSCsGICiCX2wnpMt/image.png",
  "Toys": "https://plain-apac-prod-public.komododecks.com/202607/19/TuLKUGUKUTMBrrKWHK3H/image.png",
  "Treats": "https://plain-apac-prod-public.komododecks.com/202607/19/XUDGEcoOk1Sta4g1HK2W/image.png",
  "Pet food": "https://plain-apac-prod-public.komododecks.com/202607/19/SyC4N4HdfhonQB3UIuXs/image.png",
  "Pet Food": "https://plain-apac-prod-public.komododecks.com/202607/19/SyC4N4HdfhonQB3UIuXs/image.png",
  "Cats supplies": "https://plain-apac-prod-public.komododecks.com/202607/19/kNiIGkJSUGMc2rdxLj7b/image.png",
  "Cat Supplies": "https://plain-apac-prod-public.komododecks.com/202607/19/kNiIGkJSUGMc2rdxLj7b/image.png",
  "Cats Supplies": "https://plain-apac-prod-public.komododecks.com/202607/19/kNiIGkJSUGMc2rdxLj7b/image.png",
  "Cat supplies": "https://plain-apac-prod-public.komododecks.com/202607/19/kNiIGkJSUGMc2rdxLj7b/image.png",
  "Dog supplies": "https://plain-apac-prod-public.komododecks.com/202607/19/IKoFeAlBlG2LLOiAl7GD/image.png",
  "Dog Supplies": "https://plain-apac-prod-public.komododecks.com/202607/19/IKoFeAlBlG2LLOiAl7GD/image.png",
  "Grooming": "https://plain-apac-prod-public.komododecks.com/202607/19/QEDDLWIIesBmVTisrtT0/image.png",
  // Kids & Baby Subcategories
  "Baby clothing": "https://plain-apac-prod-public.komododecks.com/202607/19/Os8dJzLJbXITPK3AoEIk/image.png",
  "Baby Clothing": "https://plain-apac-prod-public.komododecks.com/202607/19/Os8dJzLJbXITPK3AoEIk/image.png",
  "Kids clothing": "https://plain-apac-prod-public.komododecks.com/202607/19/ZgUrdXclCNmMk0Xslp7U/image.png",
  "Kids Clothing": "https://plain-apac-prod-public.komododecks.com/202607/19/ZgUrdXclCNmMk0Xslp7U/image.png",
  "Kid's Clothing": "https://plain-apac-prod-public.komododecks.com/202607/19/ZgUrdXclCNmMk0Xslp7U/image.png",
  "Boys Clothing": "https://plain-apac-prod-public.komododecks.com/202607/19/ZgUrdXclCNmMk0Xslp7U/image.png",
  "Girls Clothing": "https://plain-apac-prod-public.komododecks.com/202607/19/ZgUrdXclCNmMk0Xslp7U/image.png",
  "Kids toys": "https://plain-apac-prod-public.komododecks.com/202607/19/dc45gH7wluQX21F5c9PA/image.png",
  "Kids Toys": "https://plain-apac-prod-public.komododecks.com/202607/19/dc45gH7wluQX21F5c9PA/image.png",
  "Toys & Games": "https://plain-apac-prod-public.komododecks.com/202607/19/dc45gH7wluQX21F5c9PA/image.png",
  "Baby care": "https://plain-apac-prod-public.komododecks.com/202607/19/ZCVAks9PlwVhbTNmaqt9/image.png",
  "Baby Care": "https://plain-apac-prod-public.komododecks.com/202607/19/ZCVAks9PlwVhbTNmaqt9/image.png",
  "School essentials": "https://plain-apac-prod-public.komododecks.com/202607/19/UpPW8VmmdE5oUDkfdpfv/image.png",
  "School Essentials": "https://plain-apac-prod-public.komododecks.com/202607/19/UpPW8VmmdE5oUDkfdpfv/image.png",
  "School Supplies": "https://plain-apac-prod-public.komododecks.com/202607/19/UpPW8VmmdE5oUDkfdpfv/image.png",
  "School supplies": "https://plain-apac-prod-public.komododecks.com/202607/19/UpPW8VmmdE5oUDkfdpfv/image.png",
  "Baby feeder": "https://plain-apac-prod-public.komododecks.com/202607/19/fIdtLXUdrGvudKD5FY3d/image.png",
  "Baby Feeders": "https://plain-apac-prod-public.komododecks.com/202607/19/fIdtLXUdrGvudKD5FY3d/image.png",
  "Baby Feeder": "https://plain-apac-prod-public.komododecks.com/202607/19/fIdtLXUdrGvudKD5FY3d/image.png",
  "Feeding Essentials": "https://plain-apac-prod-public.komododecks.com/202607/19/fIdtLXUdrGvudKD5FY3d/image.png",
  "Feeding essentials": "https://plain-apac-prod-public.komododecks.com/202607/19/fIdtLXUdrGvudKD5FY3d/image.png",
  "Baby feeding": "https://plain-apac-prod-public.komododecks.com/202607/19/fIdtLXUdrGvudKD5FY3d/image.png",
  "Baby Feeding": "https://plain-apac-prod-public.komododecks.com/202607/19/fIdtLXUdrGvudKD5FY3d/image.png",
  "Feeding & Nursing": "https://plain-apac-prod-public.komododecks.com/202607/19/fIdtLXUdrGvudKD5FY3d/image.png",
  "Feeding & nursing": "https://plain-apac-prod-public.komododecks.com/202607/19/fIdtLXUdrGvudKD5FY3d/image.png",
  "Baby bedding": "https://plain-apac-prod-public.komododecks.com/202607/19/iDEVV7rHUhkkyKKL2r5M/image.png",
  "Baby Bedding": "https://plain-apac-prod-public.komododecks.com/202607/19/iDEVV7rHUhkkyKKL2r5M/image.png",
  "Kids footwear": "https://plain-apac-prod-public.komododecks.com/202607/19/O1xpKrNBSTcD5eOxFA7q/image.png",
  "Kids Footwear": "https://plain-apac-prod-public.komododecks.com/202607/19/O1xpKrNBSTcD5eOxFA7q/image.png",
  "Kid's Footwear": "https://plain-apac-prod-public.komododecks.com/202607/19/O1xpKrNBSTcD5eOxFA7q/image.png",

  "Earrings": "https://plain-apac-prod-public.komododecks.com/202607/17/Dux3oOjYmv3MOPHXBDSD/image.png",
  "Necklaces": "https://plain-apac-prod-public.komododecks.com/202607/17/zUndEgCUCwICjghFDbFI/image.png",
  "Bracelets": "https://plain-apac-prod-public.komododecks.com/202607/17/gi7NW1jlDPYC4fg05rzk/image.png",
  "Rings": "https://plain-apac-prod-public.komododecks.com/202607/17/EA3OAob6bji3nJL3y3kf/image.png",
  "Watches": "https://plain-apac-prod-public.komododecks.com/202607/17/ODa2F7nS3cEVW6NVuS9G/image.png",
  "Bags": "https://plain-apac-prod-public.komododecks.com/202607/17/gJfEvjOxvgeoz795o9U1/image.png",
  "Hair Accessories": "https://plain-apac-prod-public.komododecks.com/202607/17/y33JoB79IfLCKHM08AN4/image.png",
  "Sunglasses": "https://plain-apac-prod-public.komododecks.com/202607/17/ebvSEPRoWMb98i5UDfef/image.png",
  "Ethnic Wear": "/ethnic_wear.png",
  "Tops & T-Shirts": "https://plain-apac-prod-public.komododecks.com/202607/18/MlW17UoPtrMl3FMCWbKb/image.png",
  "Activewear": "https://plain-apac-prod-public.komododecks.com/202607/18/1u8VswmedgZwztWdsz2d/image.png",
  "Bottom Wear": "https://plain-apac-prod-public.komododecks.com/202607/18/6ht1dh6zjMI977LdwSR6/image.png",
  "Winter Wear": "https://plain-apac-prod-public.komododecks.com/202607/18/Y2uYQNbva99bWhIQEaLC/image.png",
  "Dresses": "https://plain-apac-prod-public.komododecks.com/202607/18/E6zzmgXa5xt0FBOmKOO1/image.png",
  "Loungewear": "https://plain-apac-prod-public.komododecks.com/202607/18/Q4ATUcO3gKAdhYtEbv41/image.png",
  "Co-ord Sets": "https://plain-apac-prod-public.komododecks.com/202607/18/hd3SuFgV7kzPaUfD8S3r/image.png",
  "Sneakers": "https://plain-apac-prod-public.komododecks.com/202607/18/nWsRLOAFVrhd8Bc4uosr/image.png",
  "Heels": "https://plain-apac-prod-public.komododecks.com/202607/18/oO03g2OGbSMjHvSXehHs/image.png",
  "Flats": "https://plain-apac-prod-public.komododecks.com/202607/18/MJd9n3Vi3aEo3OOIhrzQ/image.png",
  "Boots": "https://plain-apac-prod-public.komododecks.com/202607/18/VXU9G3ZzrFxXZAAFV4Sp/image.png",
  "Sandals": "https://plain-apac-prod-public.komododecks.com/202607/18/S1eXhIW7A4RBiXZmSPUU/image.png",
  "Sports Shoes": "https://plain-apac-prod-public.komododecks.com/202607/18/aomKf46UJ6FqsCal9DBz/image.png",
  "Slippers": "https://plain-apac-prod-public.komododecks.com/202607/18/jsHjqG1BJQPrl2t1KR5i/image.png",
  "Loafers": "https://plain-apac-prod-public.komododecks.com/202607/18/69KaZqXdNyqozJjkyGDR/image.png",
  // Electronics
  "Power Banks": "/light_blue_power_bank.png",
  "Cables & Chargers": "https://plain-apac-prod-public.komododecks.com/202607/18/cDwBmvQ3LP4uXRd2xx68/image.png",
  "Smart Home Devices": "https://plain-apac-prod-public.komododecks.com/202607/18/7sDGc2wXbG2aROPiFMzT/image.png",
  "Audio Devices": "https://plain-apac-prod-public.komododecks.com/202607/18/7lFtAxyBUDNhYXvGddF2/image.png",
  "Gaming Accessories": "https://plain-apac-prod-public.komododecks.com/202607/18/AMT6IyKMY1o0USGHe2Jn/image.png",
  "Laptop Accessories": "https://plain-apac-prod-public.komododecks.com/202607/18/KAz9khkhtxxno21zqwmx/image.png",
  "Smart Watches": "https://plain-apac-prod-public.komododecks.com/202607/18/EMgbgDjZFUWuTPIKBHvS/image.png",
  "Mobile Accessories": "/mobile_accessories_white_grey.png",
  "Mobile accessories": "/mobile_accessories_white_grey.png",

  // Health and Wellness
  "Vitamins & Supplements": "https://plain-apac-prod-public.komododecks.com/202607/19/oYZHEFLhWNVLu06hNIRG/image.png",
  "Fitness & Equipment": "https://plain-apac-prod-public.komododecks.com/202607/19/jDf8QHVunkSgf4HY4cWm/image.png",
  "Fitness Equipment": "https://plain-apac-prod-public.komododecks.com/202607/19/jDf8QHVunkSgf4HY4cWm/image.png",
  "Personal Care": "https://plain-apac-prod-public.komododecks.com/202607/19/n1V1NbDpVNvdfF5YBMOR/image.png",
  "Yoga Essentials": "https://plain-apac-prod-public.komododecks.com/202607/19/WFraEpdDbHlrkqrJCGeN/image.png",
  "Healthy snacks": "https://plain-apac-prod-public.komododecks.com/202607/19/LFuf1lxAZyEigsPyJnRT/image.png",
  "Massagers": "https://plain-apac-prod-public.komododecks.com/202607/19/TsAOeXU0VKeAujbCByHS/image.png",
  "Health Monitors": "https://plain-apac-prod-public.komododecks.com/202607/19/I02qDtczOg4ke33jFyH5/image.png",
  "Wellness Kits": "https://plain-apac-prod-public.komododecks.com/202607/19/duKItNe5Gyjra2NWCTss/image.png",

};



const CONTAIN_SUBCATEGORIES = new Set([
  "Power Banks",
  "Cables & Chargers",
  "Smart Home Devices",
  "Gaming Accessories",
  "Laptop Accessories",
]);

const TOP_ALIGNED_SUBCATEGORIES = new Set([
  "Kids Clothing",
  "Kids clothing",
  "Kid's Clothing",
  "Boys Clothing",
  "Girls Clothing",
  "Baby Clothing",
  "Baby clothing",
  "Baby Care",
  "Baby care",
  "Dresses",
  "Ethnic Wear",
  "Tops & T-Shirts",
]);


export default function CategoryPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const categoryId = params.id;
  const subcategoryId = searchParams?.get("subcategory") || null;

  const [dbCategoryId, setDbCategoryId] = useState<string>(categoryId);
  const [details, setDetails] = useState({
    name: "Category",
    description: "",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1400",
  });

  const [resolvedFallbackCategoryId, setResolvedFallbackCategoryId] = useState<string>(() => {
    return CATEGORY_DETAILS[categoryId] ? categoryId : "1";
  });

  useEffect(() => {
    const entry = Object.entries(CATEGORY_DETAILS).find(
      ([_, value]) => value.name.toLowerCase() === details.name.toLowerCase()
    );
    if (entry) {
      setResolvedFallbackCategoryId(entry[0]);
    }
  }, [details.name]);

  useEffect(() => {
    const localFallback = CATEGORY_DETAILS[categoryId] ?? CATEGORY_DETAILS["1"];
    setDetails(localFallback);
    setDbCategoryId(categoryId);

    const fetchCategoryDetails = async () => {
      // 1. Try direct fetch
      try {
        const res = await fetch(`/api/categories/${categoryId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.name) {
            setDbCategoryId(String(data.id));
            setDetails({
              name: data.name,
              description: data.description || localFallback.description,
              image: data.image || localFallback.image,
            });
            return;
          }
        }
      } catch { }

      // 2. Try match by name
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const categoriesList = await res.json();
          if (Array.isArray(categoriesList) && categoriesList.length > 0) {
            const matched = categoriesList.find(
              (c: any) => c.name.toLowerCase() === localFallback.name.toLowerCase()
            );
            if (matched) {
              setDbCategoryId(String(matched.id));
              setDetails({
                name: matched.name,
                description: matched.description || localFallback.description,
                image: matched.image || localFallback.image,
              });
              return;
            }
          }
        }
      } catch { }
    };

    fetchCategoryDetails();
  }, [categoryId]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Cart & Favorites integration
  const { addToCart, toggleFavorite, favorites } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [facileChoiceId, setFacileChoiceId] = useState<string | null>(null);
  const [productsLoading, setProductsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter States
  const [priceLimit, setPriceLimit] = useState<number | null>(null);
  const [selectedDiscounts, setSelectedDiscounts] = useState<number[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<number | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedConnectivity, setSelectedConnectivity] = useState<string[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  // Derive min and max price limits dynamically from loaded products
  const priceLimits = useMemo(() => {
    if (!products || products.length === 0) return { min: 0, max: 10000 };
    const prices = products.map((p) => Number(p.sellingPrice));
    let min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) {
      min = 0;
    }
    return { min, max };
  }, [products]);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const price = Number(p.sellingPrice);
      const mrp = Number(p.mrp);
      const discount = mrp > price ? ((mrp - price) / mrp) * 100 : 0;

      // Price limit filter
      if (priceLimit !== null && price > priceLimit) return false;

      // Discount filter
      if (selectedDiscounts.length > 0) {
        const matchesAnyDiscount = selectedDiscounts.some((idx) => {
          const minD = DISCOUNT_RANGES[idx].min;
          return discount >= minD;
        });
        if (!matchesAnyDiscount) return false;
      }

      // Delivery days filter
      if (selectedDelivery !== null) {
        const pDays = Number(p.deliveryDays || 3);
        if (pDays > selectedDelivery) return false;
      }

      // Color filter
      if (selectedColors.length > 0) {
        if (!p.color || !selectedColors.includes(p.color)) return false;
      }

      // Rating filter
      if (selectedRating !== null) {
        const pRating = Number(p.rating || 0);
        if (pRating < selectedRating) return false;
      }

      // Brand filter
      if (selectedBrands.length > 0) {
        if (!p.brand || !selectedBrands.includes(p.brand)) return false;
      }

      // Size filter
      if (selectedSizes.length > 0) {
        if (!p.size || !selectedSizes.includes(p.size)) return false;
      }

      // Connectivity filter (specifically for Audio Devices subcategory)
      if (selectedConnectivity.length > 0) {
        const titleAndDesc = `${p.title} ${p.description || ""}`.toLowerCase();
        const matchesAny = selectedConnectivity.some((c) => {
          if (c === "Wireless") return titleAndDesc.includes("wireless") || titleAndDesc.includes("bluetooth");
          if (c === "Bluetooth") return titleAndDesc.includes("bluetooth");
          if (c === "Wired") return titleAndDesc.includes("wired");
          return false;
        });
        if (!matchesAny) return false;
      }

      return true;
    });
  }, [
    products,
    priceLimit,
    selectedDiscounts,
    selectedDelivery,
    selectedColors,
    selectedRating,
    selectedBrands,
    selectedSizes,
    selectedConnectivity,
  ]);

  // Sorting Logic
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === "price-asc") {
      list.sort((a, b) => Number(a.sellingPrice) - Number(b.sellingPrice));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => Number(b.sellingPrice) - Number(a.sellingPrice));
    } else if (sortBy === "rating") {
      list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (sortBy === "discount") {
      list.sort((a, b) => {
        const discA = Number(a.mrp) > Number(a.sellingPrice) ? ((Number(a.mrp) - Number(a.sellingPrice)) / Number(a.mrp)) : 0;
        const discB = Number(b.mrp) > Number(b.sellingPrice) ? ((Number(b.mrp) - Number(b.sellingPrice)) / Number(b.mrp)) : 0;
        return discB - discA;
      });
    } else {
      // Default ("featured") and "rating-reviews" sort: Rating (desc) then reviews (desc)
      list.sort((a, b) => {
        const ratA = Number(a.rating || 0);
        const ratB = Number(b.rating || 0);
        if (ratB !== ratA) return ratB - ratA;
        return Number(b.reviews || 0) - Number(a.reviews || 0);
      });
    }
    return list;
  }, [filteredProducts, sortBy]);

  const clearAllFilters = () => {
    setPriceLimit(null);
    setSelectedDiscounts([]);
    setSelectedDelivery(null);
    setSelectedColors([]);
    setSelectedRating(null);
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSelectedConnectivity([]);
  };

  const totalActiveFilters =
    (priceLimit !== null ? 1 : 0) +
    selectedDiscounts.length +
    (selectedDelivery !== null ? 1 : 0) +
    selectedColors.length +
    (selectedRating !== null ? 1 : 0) +
    selectedBrands.length +
    selectedSizes.length +
    selectedConnectivity.length;

  const hasActiveFilters = totalActiveFilters > 0;

  const toggleBrand = (b: string) =>
    setSelectedBrands((prev) =>
      prev.includes(b) ? prev.filter((item) => item !== b) : [...prev, b]
    );

  const toggleColor = (c: string) =>
    setSelectedColors((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );

  const toggleSize = (s: string) =>
    setSelectedSizes((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );

  const toggleDiscount = (idx: number) =>
    setSelectedDiscounts((prev) =>
      prev.includes(idx) ? prev.filter((item) => item !== idx) : [...prev, idx]
    );

  const toggleConnectivity = (c: string) =>
    setSelectedConnectivity((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const fallback = (FALLBACK_SUBCATEGORIES[resolvedFallbackCategoryId] ?? []).map((name, index) => ({ id: `fallback-${index}`, name }));

    const sanitize = (list: SubCategory[]) => {
      let filtered = list;
      if (resolvedFallbackCategoryId === "2") {
        filtered = list.filter(sub =>
          sub.name.toLowerCase() !== "apparel" &&
          sub.name.toLowerCase() !== "travel bags" &&
          sub.name.toLowerCase() !== "travel bag"
        );
      }
      if (resolvedFallbackCategoryId === "3") {
        filtered = filtered.filter(sub =>
          sub.name.toLowerCase() !== "kitchenware" &&
          sub.name.toLowerCase() !== "kitchen ware"
        );
      }
      if (resolvedFallbackCategoryId === "5") {
        filtered = filtered.filter(sub =>
          sub.name.toLowerCase() !== "running shoes" &&
          sub.name.toLowerCase() !== "running shoe"
        );
      }
      const seen = new Set<string>();
      return filtered.filter(sub => {
        const normalized = sub.name.toLowerCase().replace(/\s+/g, "");
        if (seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
      });
    };

    fetch(`/api/categories/${dbCategoryId}/subcategories`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        const rawList = Array.isArray(data) && data.length ? data : fallback;
        setSubcategories(sanitize(rawList));
      })
      .catch(() => setSubcategories(sanitize(fallback)))
      .finally(() => setLoading(false));
  }, [dbCategoryId, resolvedFallbackCategoryId]);

  useEffect(() => {
    const isShoesFilter = searchParams?.get("filter") === "shoes";
    if (!subcategoryId && !isShoesFilter) {
      setProducts([]);
      return;
    }
    setProductsLoading(true);

    let url = `/api/products`;
    if (isShoesFilter) {
      url = `/api/products?categoryId=${dbCategoryId}`;
    } else if (String(subcategoryId).startsWith("fallback-")) {
      url = `/api/products?categoryId=${dbCategoryId}`;
    } else {
      url = `/api/products?subCategoryId=${subcategoryId}`;
    }

    fetch(url)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        let loadedProducts: any[] = [];
        if (Array.isArray(data) && data.length > 0) {
          if (isShoesFilter) {
            const allowedSubNames = ["sneakers", "loafers", "sports shoes"];
            loadedProducts = data.filter((p) => {
              const subName = (p.subCategory?.name || "").toLowerCase();
              return allowedSubNames.some((sub) => subName.includes(sub));
            });
          } else if (String(subcategoryId).startsWith("fallback-")) {
            const fallbackList = FALLBACK_SUBCATEGORIES[resolvedFallbackCategoryId] ?? [];
            const index = parseInt(String(subcategoryId).replace("fallback-", ""), 10);
            const fallbackName = fallbackList[index];
            loadedProducts = data.filter(p => p.subCategory?.name?.toLowerCase() === fallbackName.toLowerCase());
          } else {
            loadedProducts = data;
          }
        }

        setProducts(loadedProducts);
      })
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
  }, [subcategoryId, dbCategoryId, resolvedFallbackCategoryId, subcategories, searchParams]);

  useEffect(() => {
    fetch(`/api/products?categoryId=${dbCategoryId}`)
      .then((response) => response.ok ? response.json() : [])
      .then((categoryProducts) => {
        const choice = (Array.isArray(categoryProducts) ? categoryProducts : [])
          .filter((product) => Number(product.reviews ?? 0) > 0)
          .sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0)
            || Number(b.reviews ?? 0) - Number(a.reviews ?? 0))[0];
        setFacileChoiceId(choice ? String(choice.id) : null);
      })
      .catch(() => setFacileChoiceId(null));
  }, [dbCategoryId]);

  const isShoesFilter = searchParams?.get("filter") === "shoes";
  const selectedSub = subcategories.find(s => String(s.id) === String(subcategoryId));
  const subcategoryName = isShoesFilter ? "Shoes, Sneakers & Loafers" : (
    selectedSub ? selectedSub.name : (
      String(subcategoryId).startsWith("fallback-") ? (
        FALLBACK_SUBCATEGORIES[resolvedFallbackCategoryId]?.[parseInt(String(subcategoryId).replace("fallback-", ""), 10)] || "Subcategory"
      ) : "Subcategory"
    )
  );

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: "bs" + product.id,
      name: product.title,
      price: product.sellingPrice,
      brand: product.brand || "facile Store",
      image: product.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300",
    });
    triggerToast(`Added ${product.title} to your bag! 🛍️`);
  };

  const handleToggleFavorite = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite("bs" + product.id);
    const isNow = !favorites.includes("bs" + product.id);
    triggerToast(isNow ? `Added ${product.title} to Wishlist! ❤️` : `Removed ${product.title} from Wishlist.`);
  };

  const filterPanelProps: FilterPanelProps = {
    categoryId: resolvedFallbackCategoryId,
    subcategoryName,
    products,
    selectedBrands, toggleBrand,
    selectedColors, toggleColor,
    selectedSizes, toggleSize,
    priceLimit, setPriceLimit, priceLimits,
    selectedDiscounts, toggleDiscount,
    selectedRating, setSelectedRating,
    selectedDelivery, setSelectedDelivery,
    selectedConnectivity, toggleConnectivity,
    hasActiveFilters, clearAllFilters,
  };

  return (
    <main className="min-h-screen bg-[#F4F4F0] pb-20 text-[#4a556a] relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#4a556a] text-[#FAF3E3] py-3 px-5 rounded-2xl shadow-xl transition-all duration-300 font-semibold text-xs border border-white/10">
          {toastMessage}
        </div>
      )}

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-72 bg-white h-full shadow-2xl flex flex-col animate-slide-in">
            {/* Scrollable accordion body */}
            <div className="flex-1 overflow-y-auto">
              <FilterPanel {...filterPanelProps} />
            </div>

            {/* Footer */}
            <div className="flex border-t border-natural/10">
              <button
                type="button"
                onClick={() => { clearAllFilters(); setIsMobileFilterOpen(false); }}
                className="flex-1 py-3.5 text-xs font-bold text-[#4a556a]/60 hover:text-[#4a556a] transition-colors cursor-pointer"
              >
                CLOSE
              </button>
              <div className="w-px bg-natural/10" />
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3.5 text-xs font-bold text-apricot hover:text-apricot/80 transition-colors cursor-pointer"
              >
                APPLY ({sortedProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {(!subcategoryId && !isShoesFilter) ? (
          <Link href="/#categories" className="inline-flex items-center gap-2 text-[#4A5568] hover:text-[#5271FF] text-sm sm:text-base font-extrabold transition-colors mb-2">
            <ArrowLeft size={18} /> Back to categories
          </Link>
        ) : (
          <Link href={`/category/${categoryId}`} className="inline-flex items-center gap-2 text-[#4A5568] hover:text-[#5271FF] text-sm sm:text-base font-extrabold transition-colors mb-2">
            <ArrowLeft size={18} /> Back to all {details.name} subcategories
          </Link>
        )}

      </section>

      <section className="max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        {(!subcategoryId && !isShoesFilter) ? (
          /* Render grid of subcategories */
          loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2].map((item) => <div key={item} className="h-52 rounded-[28px] bg-white/60 animate-pulse" />)}
            </div>
          ) : subcategories.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subcategories.map((subcategory, index) => {
                const style = CARD_STYLES[index % CARD_STYLES.length];
                const imageSrc = SUBCATEGORY_IMAGES[subcategory.name]
                  || Object.entries(SUBCATEGORY_IMAGES).find(([k]) => k.toLowerCase() === subcategory.name.toLowerCase())?.[1];
                const hasImage = !!imageSrc;
                return (
                  <Link
                    key={subcategory.id}
                    href={`/category/${categoryId}?subcategory=${subcategory.id}`}
                    className={`group relative aspect-video overflow-hidden rounded-[28px] border border-white/70 ${hasImage ? 'bg-white' : `bg-gradient-to-br ${style.surface}`
                      } p-7 shadow-[0_8px_30px_rgba(74,85,106,0.08)] hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(74,85,106,0.16)] transition-all duration-300`}
                  >
                    {hasImage && imageSrc ? (
                      <>
                        <img
                          src={imageSrc}
                          alt={subcategory.name}
                          className={`absolute inset-0 w-full h-full ${CONTAIN_SUBCATEGORIES.has(subcategory.name)
                            ? "object-contain p-3 sm:p-4 object-center"
                            : TOP_ALIGNED_SUBCATEGORIES.has(subcategory.name)
                              ? "object-cover object-top"
                              : "object-cover object-center"
                            } transition-transform duration-700 group-hover:scale-105`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                      </>
                    ) : (
                      <>
                        <span className={`absolute -right-9 -top-10 w-32 h-32 rounded-full ${style.accent} opacity-30 transition-transform duration-500 group-hover:scale-125`} />
                        <span className="absolute -right-2 bottom-4 text-[72px] leading-none font-black text-white/35 select-none">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </>
                    )}

                    <div className={`relative z-10 h-full flex flex-col items-start ${hasImage ? "justify-end" : "justify-between"}`}>
                      {!hasImage && (
                        <span className={`w-14 h-14 rounded-2xl ${style.icon} text-white flex items-center justify-center shadow-md transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105`}>
                          <Boxes size={25} strokeWidth={1.8} />
                        </span>
                      )}

                      <div className="w-full">
                        <h3 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${hasImage ? "text-white drop-shadow-md" : "text-[#3f485a]"}`}>
                          {subcategory.name}
                        </h3>
                        <span className={`mt-3 inline-flex items-center gap-2 text-xs font-bold transition-colors ${hasImage ? "text-white/90 group-hover:text-white drop-shadow-sm" : "text-[#4a556a]/70 group-hover:text-[#4a556a]"
                          }`}>
                          Browse products
                          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-white/70 border border-[#4a556a]/10 p-10 text-center">
              <Boxes className="mx-auto mb-3 opacity-50" />
              <p className="font-bold">No subcategories are available yet.</p>
            </div>
          )
        ) : (
          /* Render grid of products for the selected subcategory */
          productsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin text-apricot" size={32} />
              <p className="text-xs font-semibold text-[#4a556a]/60">Loading products...</p>
            </div>
          ) : products.length ? (
            <div className="space-y-3 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#4a556a]/10 pb-4">
                <div className="flex items-center gap-3">
                  <p className="text-sm sm:text-base text-[#4a556a]/80 font-medium">
                    {sortedProducts.length === 0 ? (
                      "No results matching filters"
                    ) : (
                      <>
                        Showing <span className="font-bold text-[#4a556a]">1–{sortedProducts.length}</span> of{" "}
                        <span className="font-bold text-[#4a556a]">{products.length}</span> product{products.length !== 1 ? "s" : ""}
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                  {/* Mobile Filters button */}
                  <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#4a556a]/20 rounded-full text-xs font-bold text-[#4a556a] hover:border-[#4a556a]/40 transition-all cursor-pointer shadow-xs"
                  >
                    <SlidersHorizontal size={13} />
                    Filters
                    {hasActiveFilters && (
                      <span className="w-4 h-4 bg-apricot text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                        {totalActiveFilters}
                      </span>
                    )}
                  </button>

                  {/* Sort dropdown */}
                  <SortDropdown value={sortBy} onChange={setSortBy} />
                </div>
              </div>

              {/* Active filter pills */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {priceLimit !== null && (
                    <button
                      type="button"
                      onClick={() => setPriceLimit(null)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer"
                    >
                      Up to ₹{priceLimit.toLocaleString("en-IN")}<X size={9} />
                    </button>
                  )}
                  {selectedBrands.map((b) => (
                    <button
                      type="button"
                      key={b}
                      onClick={() => toggleBrand(b)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer"
                    >
                      <Store size={8} />{b}<X size={9} />
                    </button>
                  ))}
                  {selectedColors.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => toggleColor(c)}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-natural/20 flex-shrink-0"
                        style={{ background: COLOR_MAP[c] || "#ccc" }}
                      />
                      {c}<X size={9} />
                    </button>
                  ))}
                  {selectedSizes.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggleSize(s)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer"
                    >
                      <Ruler size={8} />{s}<X size={9} />
                    </button>
                  ))}
                  {selectedConnectivity.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => toggleConnectivity(c)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer"
                    >
                      <Wifi size={8} />{c}<X size={9} />
                    </button>
                  ))}
                  {selectedDiscounts.map((idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => toggleDiscount(idx)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer"
                    >
                      <Zap size={8} />{DISCOUNT_RANGES[idx].label}<X size={9} />
                    </button>
                  ))}
                  {selectedRating !== null && (
                    <button
                      type="button"
                      onClick={() => setSelectedRating(null)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer"
                    >
                      {selectedRating}★ & up<X size={9} />
                    </button>
                  )}
                  {selectedDelivery !== null && (
                    <button
                      type="button"
                      onClick={() => setSelectedDelivery(null)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#dde0f0] text-[#4a556a] rounded-full text-[10px] font-bold hover:bg-apricot/10 hover:text-apricot transition-all cursor-pointer"
                    >
                      <Clock size={8} />
                      {DELIVERY_OPTIONS.find((o) => o.maxDays === selectedDelivery)?.label}
                      <X size={9} />
                    </button>
                  )}
                </div>
              )}

              {/* Two-column layout for sidebar + grid */}
              <div className="flex gap-6 items-start mt-10">
                {/* Desktop Sticky Sidebar */}
                <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24">
                  <FilterSidebar {...filterPanelProps} />
                </aside>

                {/* Product Grid */}
                <div className="flex-1 min-w-0">
                  {sortedProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/70 border border-[#4a556a]/10 rounded-[28px]">
                      <div className="w-16 h-16 bg-white border border-natural/15 rounded-2xl flex items-center justify-center mb-5 shadow-xs">
                        <Search size={24} className="text-[#4a556a]/25" />
                      </div>
                      <h2 className="text-base font-bold text-[#4a556a] mb-1">No products found</h2>
                      <p className="text-xs text-[#4a556a]/55 max-w-xs leading-relaxed mb-6">
                        We couldn't find any products matching your current filters.
                        Try adjusting or clearing your filters.
                      </p>
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="px-5 py-2.5 bg-[#4a556a] hover:bg-apricot hover:text-white text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {sortedProducts.map((product) => {
                        const isFav = favorites.includes("bs" + product.id);
                        const mrp = Number(product.mrp);
                        const price = Number(product.sellingPrice);
                        const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
                        const isFacileChoice = String(product.id) === facileChoiceId;

                        return (
                          <div
                            key={product.id}
                            className="group bg-white hover:bg-[#5271FF] border border-natural/10 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col relative"
                          >
                            {discount > 0 && (
                              <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-apricot text-white text-xs sm:text-sm font-bold rounded-full shadow-md">
                                -{discount}%
                              </div>
                            )}
                            {isFacileChoice && (
                              <div className={`absolute left-3 z-20 rounded-full bg-[#5271FF] px-3 py-1 text-[10px] font-extrabold tracking-wide text-white shadow-md ${discount > 0 ? "top-12" : "top-3"}`}>
                                Facile Choice
                              </div>
                            )}
                            <button
                              onClick={(e) => handleToggleFavorite(product, e)}
                              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/95 text-[#4a556a] hover:text-apricot shadow-xs hover:scale-105 active:scale-95 transition-all border border-natural/10 focus:outline-none cursor-pointer"
                              aria-label="Add to wishlist"
                            >
                              <Heart size={13} style={isFav ? { fill: "#870339", color: "#870339" } : {}} />
                            </button>

                            <Link href={`/product/bs${product.id}`} className="flex flex-col flex-1">
                              <div className="aspect-square bg-neutral-50 overflow-hidden flex-shrink-0 relative">
                                <ProductImage
                                  src={product.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300"}
                                  alt={product.title}
                                  className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                                />
                              </div>

                              <div className="p-4 flex-1 flex flex-col justify-between">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-1 overflow-hidden">
                                    {product.brand && (
                                      <p className="text-[9px] font-semibold text-[#4a556a]/50 group-hover:text-white/60 transition-colors">
                                        {product.brand}
                                      </p>
                                    )}
                                    <h3 className="text-sm font-bold text-[#5271FF] group-hover:text-white leading-snug line-clamp-2 transition-colors">
                                      {product.title}
                                    </h3>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-natural/8 mt-3">
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-sm font-extrabold text-[#5271FF] group-hover:text-white transition-colors">
                                      ₹{price.toLocaleString("en-IN")}
                                    </span>
                                    {mrp > price && (
                                      <span className="text-[10px] text-natural/45 group-hover:text-white/50 line-through font-medium transition-colors">
                                        ₹{mrp.toLocaleString("en-IN")}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <Star size={10} className={(product.reviews ?? 0) > 0 ? "text-amber-400 fill-amber-400" : "text-neutral-300"} />
                                    {(product.reviews ?? 0) > 0 ? (
                                      <>
                                        <span className="text-[10px] font-bold text-[#4a556a] group-hover:text-white transition-colors">
                                          {Number(product.rating ?? 0).toFixed(1)}
                                        </span>
                                        <span className="text-[10px] text-natural/50 group-hover:text-white/60 transition-colors">
                                          ({product.reviews})
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-[10px] text-natural/60 group-hover:text-white/70 transition-colors">0</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Link>

                            <div className="px-4 pb-4">
                              <button
                                onClick={(e) => handleAddToCart(product, e)}
                                className="w-full h-8 bg-[#5271FF] group-hover:bg-white group-hover:text-[#5271FF] hover:scale-[1.02] active:scale-[0.98] text-white text-[10px] font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
                              >
                                <ShoppingCart size={11} className="stroke-[2.5px]" />
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
            </div>
          ) : (
            <div className="rounded-[28px] bg-white/70 border border-[#4a556a]/10 p-16 text-center">
              <Boxes className="mx-auto mb-3 opacity-50 text-apricot" size={32} />
              <p className="font-bold text-[#4a556a]">No products available in this subcategory.</p>
              <p className="text-xs text-[#4a556a]/60 mt-1">Please check back later or explore other sections.</p>
            </div>
          )
        )}
      </section>
    </main>
  );
}

// ─── Filter Panel Components ──────────────────────────────────────────────────

interface FilterPanelProps {
  categoryId: string;
  subcategoryName: string;
  products: any[];
  // Brand
  selectedBrands: string[];
  toggleBrand: (b: string) => void;
  // Color
  selectedColors: string[];
  toggleColor: (c: string) => void;
  // Size
  selectedSizes: string[];
  toggleSize: (s: string) => void;
  // Price Range
  priceLimit: number | null;
  setPriceLimit: (p: number | null) => void;
  priceLimits: { min: number; max: number };
  // Discount
  selectedDiscounts: number[];
  toggleDiscount: (idx: number) => void;
  // Rating
  selectedRating: number | null;
  setSelectedRating: (r: number | null) => void;
  // Delivery
  selectedDelivery: number | null;
  setSelectedDelivery: (d: number | null) => void;
  // Connectivity
  selectedConnectivity: string[];
  toggleConnectivity: (c: string) => void;
  // clear
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
}

function FilterCheckbox({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-2.5 py-1.5 text-left text-[11px] font-semibold text-[#4a556a]/80 hover:text-[#4a556a] transition-colors focus:outline-none cursor-pointer"
    >
      <span
        className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${checked
          ? "bg-apricot border-apricot text-white"
          : "border-[#4a556a]/20 bg-white hover:border-[#4a556a]/40"
          }`}
      >
        {checked && <Check size={10} strokeWidth={3} />}
      </span>
      <span className="truncate">{children}</span>
    </button>
  );
}

function PriceSlider({
  priceLimit,
  setPriceLimit,
  min,
  max,
}: {
  priceLimit: number | null;
  setPriceLimit: (p: number | null) => void;
  min: number;
  max: number;
}) {
  const [localVal, setLocalVal] = useState(priceLimit !== null ? priceLimit : max);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalVal(priceLimit !== null ? priceLimit : max);
  }, [priceLimit, max]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleChange = (val: number) => {
    setLocalVal(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setPriceLimit(val);
    }, 150);
  };

  return (
    <div className="pt-2 pb-1 px-1 space-y-2">
      <input
        type="range"
        min={min}
        max={max}
        value={localVal}
        onChange={(e) => handleChange(Number(e.target.value))}
        onMouseUp={() => setPriceLimit(localVal)}
        onTouchEnd={() => setPriceLimit(localVal)}
        className="w-full h-1 bg-[#4a556a]/10 rounded-lg appearance-none cursor-pointer accent-apricot"
      />
      <div className="flex items-center justify-between text-[10px] font-semibold text-[#4a556a]/60">
        <span>₹{min}</span>
        <span className="text-apricot font-bold text-xs bg-apricot/5 px-2.5 py-0.5 rounded-full border border-apricot/15">
          Up to ₹{localVal.toLocaleString("en-IN")}
        </span>
        <span>₹{max}</span>
      </div>
    </div>
  );
}

function FilterPanel({
  categoryId,
  subcategoryName,
  products,
  selectedBrands, toggleBrand,
  selectedColors, toggleColor,
  selectedSizes, toggleSize,
  priceLimit, setPriceLimit, priceLimits,
  selectedDiscounts, toggleDiscount,
  selectedRating, setSelectedRating,
  selectedDelivery, setSelectedDelivery,
  selectedConnectivity, toggleConnectivity,
  hasActiveFilters, clearAllFilters,
}: FilterPanelProps) {
  const [openSections, setOpenSections] = useState<string[]>(["price"]);
  const toggleSection = (id: string) =>
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const brands = useMemo(() => {
    const normalizedSubcategoryName = subcategoryName.toLowerCase().replace(/\s+/g, "");

    if (categoryId === "2" && subcategoryName === "Ethnic Wear") {
      return ["Zara", "H&M", "Mango", "Uniqlo", "Levi's", "Forever 21", "Fabindia"];
    }
    if (categoryId === "2" && normalizedSubcategoryName === "activewear") {
      return ["Nike", "Puma", "Adidas", "Reebok", "HRX", "New Balance"];
    }
    if (categoryId === "2" && FASHION_RETAIL_SUBCATEGORIES.has(subcategoryName)) {
      return ["Zara", "H&M", "Mango", "Uniqlo", "Levi's", "Forever 21"];
    }
    if (categoryId === "2" && APPAREL_SUBCATEGORIES.has(subcategoryName)) {
      return ["The Souled Store", "Snitch", "Bonkers Corner", "Bewakoof", "Urbanic", "NEWME", "Nobero", "Powerlook", "Rare Rabbit", "The Bear House"];
    }
    if (categoryId === "7" && JEWELRY_SUBCATEGORIES.has(subcategoryName)) {
      return ["Pandora", "Giva", "Palmonas", "Pipa Bella"];
    }
    if (CATEGORY_BRANDS[categoryId]) {
      return CATEGORY_BRANDS[categoryId];
    }
    const s = new Set(products.map((p) => p.brand).filter(Boolean) as string[]);
    return Array.from(s).sort();
  }, [products, categoryId, subcategoryName]);

  const colors = useMemo(() => {
    const s = new Set(products.map((p) => p.color).filter(Boolean) as string[]);
    return Array.from(s).sort();
  }, [products]);

  const sizes = useMemo(() => {
    const ORDER = ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "One Size", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];
    const s = new Set(products.map((p) => p.size).filter(Boolean) as string[]);
    return Array.from(s).sort((a, b) => {
      const ai = ORDER.indexOf(a), bi = ORDER.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [products]);

  const showSizeFilter = categoryId === "2" || categoryId === "8";
  const showConnectivityFilter = categoryId === "1" && subcategoryName === "Audio Devices";

  const Section = ({
    id, icon, label, badge, children,
  }: {
    id: string;
    icon: React.ReactNode;
    label: string;
    badge: number;
    children: React.ReactNode;
  }) => {
    const open = openSections.includes(id);
    return (
      <div className="border-b border-[#4a556a]/10 last:border-b-0">
        <button
          type="button"
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-[#4a556a] hover:bg-[#F4F4F0] transition-colors cursor-pointer group"
        >
          <span className="flex items-center gap-2">
            <span className={`transition-colors ${open ? "text-apricot" : "text-[#4a556a]/40 group-hover:text-[#4a556a]/60"}`}>
              {icon}
            </span>
            {label}
          </span>
          <span className="flex items-center gap-1.5">
            {badge > 0 && (
              <span className="w-4 h-4 bg-apricot text-white rounded-full text-[8px] flex items-center justify-center font-bold">
                {badge}
              </span>
            )}
            <ChevronDown
              size={13}
              className={`text-[#4a556a]/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </span>
        </button>
        {open && (
          <div className="px-4 pb-3 space-y-1.5">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#4a556a]/10">
        <h2 className="text-base font-extrabold text-[#5271FF]">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-bold text-apricot hover:underline cursor-pointer uppercase tracking-wide"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Price Range Slider */}
      <Section id="price" icon={<Tag size={12} />} label="Price Range" badge={0}>
        <PriceSlider
          priceLimit={priceLimit}
          setPriceLimit={setPriceLimit}
          min={priceLimits.min}
          max={priceLimits.max}
        />
      </Section>

      {/* Brand */}
      {brands.length > 0 && (
        <Section id="brand" icon={<Store size={12} />} label="Brand" badge={selectedBrands.length}>
          {brands.map((b) => (
            <FilterCheckbox key={b} checked={selectedBrands.includes(b)} onToggle={() => toggleBrand(b)}>
              {b}
            </FilterCheckbox>
          ))}
        </Section>
      )}

      {/* Size (Category Specific) */}
      {showSizeFilter && sizes.length > 0 && (
        <Section id="size" icon={<Ruler size={12} />} label="Size" badge={selectedSizes.length}>
          {sizes.map((s) => (
            <FilterCheckbox key={s} checked={selectedSizes.includes(s)} onToggle={() => toggleSize(s)}>
              {s}
            </FilterCheckbox>
          ))}
        </Section>
      )}

      {/* Connectivity (Subcategory Specific for Audio Devices) */}
      {showConnectivityFilter && (
        <Section id="connectivity" icon={<Wifi size={12} />} label="Connectivity" badge={selectedConnectivity.length}>
          {["Bluetooth", "Wireless", "Wired"].map((c) => (
            <FilterCheckbox key={c} checked={selectedConnectivity.includes(c)} onToggle={() => toggleConnectivity(c)}>
              {c}
            </FilterCheckbox>
          ))}
        </Section>
      )}

      {/* Color */}
      {colors.length > 0 && (
        <Section id="color" icon={<Palette size={12} />} label="Color" badge={selectedColors.length}>
          {colors.map((c) => (
            <FilterCheckbox key={c} checked={selectedColors.includes(c)} onToggle={() => toggleColor(c)}>
              <span className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full border border-natural/20 flex-shrink-0"
                  style={{ background: COLOR_MAP[c] || "#ccc" }}
                />
                {c}
              </span>
            </FilterCheckbox>
          ))}
        </Section>
      )}

      {/* Discount */}
      <Section id="discount" icon={<Zap size={12} />} label="Discount" badge={selectedDiscounts.length}>
        {DISCOUNT_RANGES.map((d, i) => (
          <FilterCheckbox key={i} checked={selectedDiscounts.includes(i)} onToggle={() => toggleDiscount(i)}>
            {d.label}
          </FilterCheckbox>
        ))}
      </Section>

      {/* Customer Rating */}
      <Section id="rating" icon={<Star size={12} />} label="Rating" badge={selectedRating ? 1 : 0}>
        {[4, 3, 2].map((stars) => (
          <FilterCheckbox
            key={stars}
            checked={selectedRating === stars}
            onToggle={() => setSelectedRating(selectedRating === stars ? null : stars)}
          >
            <span className="flex items-center gap-1.5">
              <span className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={11}
                    className={i < stars ? "text-amber-400 fill-amber-400" : "text-[#4a556a]/20 fill-[#4a556a]/10"}
                  />
                ))}
              </span>
              <span className="text-[#4a556a]/60">& up</span>
            </span>
          </FilterCheckbox>
        ))}
      </Section>

      {/* Delivery Time */}
      <Section id="delivery" icon={<Clock size={12} />} label="Delivery Time" badge={selectedDelivery != null ? 1 : 0}>
        {DELIVERY_OPTIONS.map((opt) => (
          <FilterCheckbox
            key={opt.maxDays}
            checked={selectedDelivery === opt.maxDays}
            onToggle={() => setSelectedDelivery(selectedDelivery === opt.maxDays ? null : opt.maxDays)}
          >
            <span className="flex items-center gap-1.5">
              <Clock size={11} className="text-apricot" />
              {opt.label}
            </span>
          </FilterCheckbox>
        ))}
      </Section>
    </div>
  );
}

function FilterSidebar(props: FilterPanelProps) {
  return (
    <div className="bg-white border border-[#4a556a]/10 rounded-2xl overflow-hidden shadow-xs">
      <FilterPanel {...props} />
    </div>
  );
}

function SortDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm ${open
          ? "bg-[#4a556a] text-white border-[#4a556a] shadow-md"
          : "bg-white text-[#4a556a] border-[#4a556a]/15 hover:border-[#4a556a]/40 hover:shadow-md"
          }`}
      >
        <span className={`text-[10px] font-semibold mr-0.5 ${open ? "text-white/60" : "text-[#4a556a]/45"}`}>
          Sort
        </span>
        <span className="truncate max-w-[110px]">{selected.label}</span>
        <ChevronDown
          size={13}
          className={`flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-white/70" : "text-[#4a556a]/40"
            }`}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-xl border border-[#4a556a]/10 overflow-hidden"
          style={{ minWidth: "190px", animation: "fadeSlideDown 0.15s ease" }}
        >
          <div className="px-4 py-2 bg-[#4a556a]/5 border-b border-[#4a556a]/8">
            <p className="text-[9px] font-bold text-[#4a556a]/50 uppercase tracking-widest">Sort by</p>
          </div>

          {SORT_OPTIONS.map((opt, idx) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-[11px] font-semibold transition-all duration-150 cursor-pointer group ${opt.value === value
                ? "bg-apricot/8 text-apricot"
                : "text-[#4a556a]/75 hover:bg-[#4a556a] hover:text-white"
                } ${idx !== SORT_OPTIONS.length - 1 ? "border-b border-[#4a556a]/6" : ""}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all ${opt.value === value
                  ? "bg-apricot scale-110"
                  : "bg-[#4a556a]/20 group-hover:bg-white/60"
                  }`}
              />
              {opt.label}
              {opt.value === value && (
                <Check size={11} className="ml-auto text-apricot flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
