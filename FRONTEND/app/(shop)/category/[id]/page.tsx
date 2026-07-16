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

const CATEGORY_DETAILS: Record<string, { name: string; description: string; image: string }> = {
  "1": { name: "Electronics", description: "Discover smart technology for work, home and entertainment.", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1400" },
  "2": { name: "Fashion", description: "Refresh your wardrobe with everyday essentials and new styles.", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1400" },
  "3": { name: "Home & Living", description: "Thoughtful pieces that make every room feel more like home.", image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=1400" },
  "4": { name: "Beauty", description: "Skincare, fragrance and beauty favourites selected for you.", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1400" },
  "5": { name: "Sports", description: "Gear and footwear to keep you moving and performing your best.", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1400" },
  "6": { name: "Kids & Baby", description: "Playful, practical picks for little ones and growing families.", image: "https://images.unsplash.com/photo-1599443015574-be5fe8a05783?q=80&w=1400" },
  "7": { name: "Jewellery & Accessories", description: "Find the perfect touch of sparkle and class for every occasion.", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1400" },
  "8": { name: "Footwear", description: "Step out in comfort and style with our curated footwear options.", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1400" },
  "9": { name: "Stationery", description: "Equip your workspace with notebooks, writing instruments and planners.", image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=1400" },
  "10": { name: "Health & Wellness", description: "Nourish your body and mind with our organic health essentials.", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1400" },
  "11": { name: "Pets", description: "Show some love to your pets with top quality supplies, food and toys.", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1400" },
};

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

const CATEGORY_BRANDS: Record<string, string[]> = {
  "8": ["Adidas", "Nike", "FILA", "HRX", "Puma", "Superdry"],
};

const CARD_STYLES = [
  { surface: "from-[#DDE0F0] to-[#eef0f9]", icon: "bg-[#4a556a]", accent: "bg-[#aeb7d8]" },
  { surface: "from-[#f9dbe8] to-[#fff0f6]", icon: "bg-[#E8437F]", accent: "bg-[#f2a9c7]" },
  { surface: "from-[#eadfcf] to-[#fff8ec]", icon: "bg-[#A58E74]", accent: "bg-[#d9c3a6]" },
];

const FALLBACK_PRODUCTS_MAP: Record<string, Record<string, any>> = {
  "1": {
    "Mobile Accessories": { id: 101, title: "Magnetic Phone Mount", brand: "Portronics", sellingPrice: 499, mrp: 999, rating: 4.2, reviews: 35, image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?q=80&w=400", description: "Universal air vent magnetic car phone mount holder", color: "Black", deliveryDays: 2 },
    "Audio Devices": { id: 102, title: "Wireless Bluetooth Earbuds", brand: "boAt", sellingPrice: 1799, mrp: 3999, rating: 4.6, reviews: 142, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=400", description: "Bluetooth 5.3 wireless earbuds with active noise cancelation", color: "White", deliveryDays: 3 },
    "Smart Watches": { id: 103, title: "Smart Fitness Watch", brand: "Noise", sellingPrice: 3999, mrp: 7999, rating: 4.4, reviews: 88, image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400", description: "Smart watch with AMOLED display & bluetooth calling", color: "Black", deliveryDays: 2 },
    "Laptop Accessories": { id: 104, title: "Multi-port USB-C Hub", brand: "Anker", sellingPrice: 1299, mrp: 2499, rating: 4.5, reviews: 54, image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=400", description: "6-in-1 USB C hub with HDMI port and SD card slot", color: "Grey", deliveryDays: 4 },
    "Gaming Accessories": { id: 105, title: "RGB Gaming Mouse", brand: "Logitech", sellingPrice: 999, mrp: 1999, rating: 4.3, reviews: 72, image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=400", description: "Wired gaming mouse with 12000 DPI adjustable sensor", color: "Black", deliveryDays: 1 },
    "Smart Home Devices": { id: 106, title: "Smart Wi-Fi Plug", brand: "Wipro", sellingPrice: 899, mrp: 1999, rating: 4.1, reviews: 31, image: "https://images.unsplash.com/photo-1543512214-318c7553f230?q=80&w=400", description: "16A smart plug with energy monitoring, Alexa compatible", color: "White", deliveryDays: 3 },
    "Power Banks": { id: 107, title: "20000mAh Power Bank", brand: "Mi", sellingPrice: 1499, mrp: 2499, rating: 4.4, reviews: 95, image: "https://images.unsplash.com/photo-1609592424083-d922a91a92e9?q=80&w=400", description: "20W fast charging power bank with triple output ports", color: "Black", deliveryDays: 5 },
    "Cables & Chargers": { id: 108, title: "Braided USB-C Cable", brand: "Anker", sellingPrice: 349, mrp: 699, rating: 4.5, reviews: 120, image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=400", description: "Type C to Type C 6ft fast charging braided nylon cable", color: "Red", deliveryDays: 2 }
  },
  "2": {
    "Tops & T-Shirts": { id: 201, title: "Premium Cotton Tee", brand: "H&M", sellingPrice: 799, mrp: 1499, rating: 4.4, reviews: 215, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400", description: "Breathable 100% organic cotton t-shirt for daily comfort", color: "Black", size: "M", deliveryDays: 3 },
    "Dresses": { id: 202, title: "Summer Floral Dress", brand: "Mango", sellingPrice: 1499, mrp: 2999, rating: 4.5, reviews: 112, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400", description: "Elegant floral printed summer dress with lightweight feel", color: "Pink", size: "S", deliveryDays: 4 },
    "Bottom Wear": { id: 203, title: "Slim Fit Denim Jeans", brand: "Levi's", sellingPrice: 1999, mrp: 3499, rating: 4.3, reviews: 189, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=400", description: "Classic dark wash stretchable slim fit denim jeans", color: "Blue", size: "L", deliveryDays: 3 },
    "Ethnic Wear": { id: 204, title: "Traditional Kurta Set", brand: "Fabindia", sellingPrice: 2999, mrp: 4999, rating: 4.5, reviews: 134, image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400", description: "Beautiful traditional cotton printed kurta set for festive wear", color: "Yellow", size: "M", deliveryDays: 5 },
    "Winter Wear": { id: 205, title: "Knit Woolen Sweater", brand: "Allen Solly", sellingPrice: 2499, mrp: 3999, rating: 4.6, reviews: 92, image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=400", description: "Cozy winter sweater made of premium insulating wool", color: "Grey", size: "XL", deliveryDays: 2 },
    "Activewear": { id: 206, title: "Athletic Gym Tights", brand: "Nike", sellingPrice: 1299, mrp: 2499, rating: 4.4, reviews: 78, image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=400", description: "High-waist moisture-wicking active compression tights", color: "Black", size: "S", deliveryDays: 3 },
    "Loungewear": { id: 207, title: "Cozy Pyjama Set", brand: "Marks & Spencer", sellingPrice: 1199, mrp: 1999, rating: 4.3, reviews: 67, image: "https://images.unsplash.com/photo-1562572159-4ebcd318f4dd?q=80&w=400", description: "Super soft cotton pyjama and tee nightwear lounge set", color: "Beige", size: "M", deliveryDays: 4 },
    "Co-ord Sets": { id: 208, title: "Linen Co-ord Set", brand: "Zara", sellingPrice: 2199, mrp: 3999, rating: 4.5, reviews: 54, image: "https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=400", description: "Stylish matching linen top and trousers set for summer", color: "Blue", size: "S", deliveryDays: 3 }
  },
  "3": {
    "Home Decor": { id: 301, title: "Handcrafted Ceramic Vase", brand: "Ellementry", sellingPrice: 1199, mrp: 1999, rating: 4.7, reviews: 84, image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=400", description: "Minimalist white glazed ceramic flower pot vase" },
    "Kitchen Essentials": { id: 302, title: "Knife Set 5-Piece", brand: "Pigeon", sellingPrice: 1699, mrp: 2999, rating: 4.3, reviews: 59, image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=400", description: "5-piece high-carbon stainless steel knife set with wooden block" },
    "Dining": { id: 303, title: "Porcelain Dinner Set", brand: "Clay Craft", sellingPrice: 3499, mrp: 5999, rating: 4.6, reviews: 112, image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=400", description: "18-piece fine ceramic dining plate and bowl collection" },
    "Bedding": { id: 304, title: "Double Cotton Bedsheet", brand: "Portico New York", sellingPrice: 1299, mrp: 2499, rating: 4.4, reviews: 92, image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?q=80&w=400", description: "Breathable 210 TC floral printed cotton bedsheet with 2 pillowcases" },
    "Storage & Organization": { id: 305, title: "Wardrobe Organizers 3-Pack", brand: "Kuber Industries", sellingPrice: 499, mrp: 999, rating: 4.2, reviews: 48, image: "https://images.unsplash.com/photo-1595348020949-87cdfbb44174?q=80&w=400", description: "Set of 3 non-woven fabric underwear and sock dividers" },
    "Lighting": { id: 306, title: "Hanging Pendant Light", brand: "Philips", sellingPrice: 999, mrp: 1999, rating: 4.3, reviews: 36, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=400", description: "Vintage industrial metallic cage ceiling pendant lamp" },
    "Furniture": { id: 307, title: "Wood End Table", brand: "Urban Ladder", sellingPrice: 4499, mrp: 7999, rating: 4.5, reviews: 68, image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=400", description: "Compact modern bedside lamp table with storage shelf" },
    "Bath Essentials": { id: 308, title: "Bath Towels 2-Pack", brand: "Spaces", sellingPrice: 999, mrp: 1999, rating: 4.4, reviews: 78, image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?q=80&w=400", description: "Set of 2 ultra absorbent 600 GSM combed cotton bath towels" }
  },
  "4": {
    "Skincare": { id: 401, title: "Organic Vitamin C Serum", brand: "Mamaearth", sellingPrice: 799, mrp: 1499, rating: 4.6, reviews: 142, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400", description: "Anti-aging glowing skin serum with vitamin C, E & hyaluronic acid" },
    "Makeup": { id: 402, title: "Matte Liquid Lipstick", brand: "Lakme", sellingPrice: 599, mrp: 999, rating: 4.5, reviews: 96, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=400", description: "Longwear transfer-proof intense red liquid lipstick" },
    "Hair Care": { id: 403, title: "Argan Oil Hair Mask", brand: "L'Oreal Professional", sellingPrice: 699, mrp: 1199, rating: 4.3, reviews: 114, image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400", description: "Deep conditioning hair repair mask for dry and damaged hair" },
    "Fragrances": { id: 404, title: "Luxury Eau De Parfum", brand: "Fogg", sellingPrice: 2999, mrp: 4999, rating: 4.8, reviews: 64, image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=400", description: "Warm woody and citrusy signature long-lasting fragrance" },
    "Bath & Body": { id: 405, title: "Cocoa Body Butter", brand: "The Body Shop", sellingPrice: 499, mrp: 899, rating: 4.4, reviews: 88, image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=400", description: "Deeply moisturizing cocoa butter cream for dry skin" },
    "Nail Care": { id: 406, title: "Gel Nail Lacquer Set", brand: "Nykaa", sellingPrice: 399, mrp: 699, rating: 4.3, reviews: 54, image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=400", description: "Set of 3 long-lasting high shine gel nail polishes" },
    "Beauty Tools": { id: 407, title: "Sonic Facial Cleansing Brush", brand: "Foreo", sellingPrice: 1499, mrp: 2499, rating: 4.5, reviews: 58, image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400", description: "Waterproof sonic face massager and pore exfoliator tool" },
    "Men's Grooming": { id: 408, title: "Beard Growth Oil", brand: "The Man Company", sellingPrice: 349, mrp: 599, rating: 4.4, reviews: 78, image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=400", description: "Natural oil for beard growth, nourishment, and softness" }
  },
  "5": {
    "Cricket": { id: 501, title: "Willow Cricket Bat", brand: "SG", sellingPrice: 5999, mrp: 9999, rating: 4.5, reviews: 118, image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=400", description: "Grade-A english willow cricket bat with dynamic rubber grip" },
    "Football": { id: 502, title: "Soccer Football Size 5", brand: "Nivia", sellingPrice: 799, mrp: 1499, rating: 4.4, reviews: 78, image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=400", description: "Professional machine-stitched training football size 5" },
    "Badminton": { id: 503, title: "Graphite Rackets Pair", brand: "Yonex", sellingPrice: 2199, mrp: 3999, rating: 4.5, reviews: 92, image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=400", description: "High-tension lightweight graphite rackets with 6 shuttles" },
    "Gym Equipment": { id: 504, title: "Dumbbells 20kg Set", brand: "Kore", sellingPrice: 1999, mrp: 3999, rating: 4.5, reviews: 114, image: "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?q=80&w=400", description: "PVC plate dumbbells set with steel rods and locks" },
    "Cycling": { id: 505, title: "Mountain Bicycle 27.5T", brand: "Hero", sellingPrice: 12999, mrp: 18999, rating: 4.6, reviews: 92, image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=400", description: "27.5-inch wheel alloy frame mountain bike with suspension" },
    "Running Gear": { id: 506, title: "Running Waist Pouch", brand: "Decathlon", sellingPrice: 599, mrp: 1299, rating: 4.3, reviews: 107, image: "https://images.unsplash.com/photo-1447049959918-d5743c95977c?q=80&w=400", description: "Waterproof running waist pouch with dual bottle holders" },
    "Outdoor Games": { id: 507, title: "Wooden Carrom Board", brand: "Precise", sellingPrice: 1799, mrp: 2999, rating: 4.4, reviews: 59, image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=400", description: "32-inch carrom board with coins, striker & powder set" },
    "Sports Accessories": { id: 508, title: "Tension Resistance Band", brand: "Strauss", sellingPrice: 449, mrp: 899, rating: 4.3, reviews: 84, image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400", description: "Heavy resistance pull-up assist band for workouts" }
  },
  "6": {
    "Baby Clothing": { id: 601, title: "Cotton Rompers", brand: "Luvlap", sellingPrice: 799, mrp: 1499, rating: 4.4, reviews: 126, image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=400", description: "Pack of 3 super soft organic cotton snap button rompers" },
    "Kids Clothing": { id: 602, title: "Casual Tee & Shorts", brand: "FirstCry", sellingPrice: 999, mrp: 1999, rating: 4.3, reviews: 92, image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400", description: "Unisex casual cotton printed tee and comfortable denim shorts" },
    "Toys": { id: 603, title: "Wooden Stacking Blocks", brand: "Funskool", sellingPrice: 699, mrp: 1299, rating: 4.7, reviews: 115, image: "https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=400", description: "Safe non-toxic wooden stacking blocks for toddler learning" },
    "Baby Care": { id: 604, title: "Gentle Baby Wipes", brand: "Himalaya", sellingPrice: 349, mrp: 599, rating: 4.3, reviews: 67, image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400", description: "Pack of 3 gentle water-based unscented baby wipes" },
    "School Essentials": { id: 605, title: "School Backpack", brand: "Skybags", sellingPrice: 999, mrp: 1999, rating: 4.6, reviews: 156, image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=400", description: "Lightweight water resistant school bag with multiple compartments" },
    "Feeding Essentials": { id: 606, title: "Silicone Feeding Bottle", brand: "Pigeon", sellingPrice: 449, mrp: 799, rating: 4.4, reviews: 78, image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400", description: "Premium quality silicone nipple feeding bottle 240ml" },
    "Baby Bedding": { id: 607, title: "Baby Mosquito Net Bed", brand: "Mee Mee", sellingPrice: 799, mrp: 1499, rating: 4.5, reviews: 51, image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=400", description: "Comfortable soft padded mattress with protective mosquito net" },
    "Kids Footwear": { id: 608, title: "Kids Light-Up Sneakers", brand: "Liberty", sellingPrice: 899, mrp: 1799, rating: 4.4, reviews: 63, image: "https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=400", description: "Slip-resistant velcro closure sneakers with LED lights" }
  },
  "7": {
    "Earrings": { id: 701, title: "Silver Hoop Earrings", brand: "Giva", sellingPrice: 999, mrp: 1999, rating: 4.3, reviews: 35, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400", description: "Classic sterling silver hoop earrings for daily wear" },
    "Necklaces": { id: 702, title: "Gold Plated Pendant Necklace", brand: "Caratlane", sellingPrice: 1499, mrp: 2999, rating: 4.7, reviews: 88, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=400", description: "Minimalist gold plated chain with circular pendant" },
    "Bracelets": { id: 703, title: "Beaded Charm Bracelet", brand: "Pandora", sellingPrice: 799, mrp: 1499, rating: 4.2, reviews: 54, image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400", description: "Delicate charm bracelet with crystal beads" },
    "Rings": { id: 704, title: "Classic Solitaire Ring", brand: "Giva", sellingPrice: 1199, mrp: 2499, rating: 4.4, reviews: 92, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400", description: "Elegant cubic zirconia solitaire ring in silver" },
    "Watches": { id: 705, title: "Minimalist Leather Watch", brand: "Fossil", sellingPrice: 3499, mrp: 5999, rating: 4.5, reviews: 112, image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=400", description: "Classic analog watch with brown leather strap" },
    "Bags": { id: 706, title: "Leather Tote Bag", brand: "Baggit", sellingPrice: 2999, mrp: 4999, rating: 4.6, reviews: 78, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400", description: "Spacious genuine leather tote bag with zip closure" },
    "Hair Accessories": { id: 707, title: "Silk Scrunchies Set", brand: "Accessorize", sellingPrice: 499, mrp: 999, rating: 4.2, reviews: 48, image: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?q=80&w=400", description: "Pack of 5 pure mulberry silk hair scrunchies" },
    "Sunglasses": { id: 708, title: "Classic Aviator Sunglasses", brand: "Ray-Ban", sellingPrice: 1999, mrp: 3999, rating: 4.5, reviews: 87, image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=400", description: "UV protected aviator sunglasses with gold frame" }
  },
  "8": {
    "Sneakers": { id: 801, title: "Classic White Sneakers", brand: "Puma", sellingPrice: 2999, mrp: 4999, rating: 4.4, reviews: 78, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400", description: "Low-top white sneakers with comfortable cushioned sole", color: "White", size: "UK 8", deliveryDays: 2 },
    "Flats": { id: 802, title: "Comfortable Ballet Flats", brand: "FILA", sellingPrice: 999, mrp: 1999, rating: 4.2, reviews: 48, image: "https://images.unsplash.com/photo-1596702994230-a8859ad8db29?q=80&w=400", description: "Soft slip-on ballet flats perfect for daily office wear", color: "Black", size: "UK 6", deliveryDays: 3 },
    "Heels": { id: 803, title: "Elegant Stiletto Heels", brand: "Superdry", sellingPrice: 2299, mrp: 3999, rating: 4.5, reviews: 92, image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400", description: "Pointed toe stiletto heels for parties and evening wear", color: "Red", size: "UK 7", deliveryDays: 4 },
    "Sandals": { id: 804, title: "Strappy Casual Sandals", brand: "HRX", sellingPrice: 799, mrp: 1499, rating: 4.2, reviews: 36, image: "https://images.unsplash.com/photo-1603487265291-7493b8f68224?q=80&w=400", description: "Comfortable everyday wear strappy flat sandals", color: "Black", size: "UK 9", deliveryDays: 1 },
    "Boots": { id: 805, title: "Ankle Length Leather Boots", brand: "Adidas", sellingPrice: 3499, mrp: 5999, rating: 4.5, reviews: 112, image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=400", description: "Stylish chelsea ankle boots with block heel", color: "Brown", size: "UK 10", deliveryDays: 5 },
    "Loafers": { id: 806, title: "Classic Suede Loafers", brand: "Nike", sellingPrice: 1999, mrp: 3499, rating: 4.3, reviews: 54, image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=400", description: "Slip-on suede leather loafers for a smart-casual look", color: "Beige", size: "UK 8", deliveryDays: 2 },
    "Slippers": { id: 807, title: "Orthopedic Soft Slippers", brand: "Puma", sellingPrice: 499, mrp: 999, rating: 4.2, reviews: 31, image: "https://images.unsplash.com/photo-1603487265291-7493b8f68224?q=80&w=400", description: "Orthopedic cushion slippers for active home use", color: "Blue", size: "UK 7", deliveryDays: 3 },
    "Sports Shoes": { id: 808, title: "Pro Running Shoes", brand: "Nike", sellingPrice: 3499, mrp: 5999, rating: 4.4, reviews: 78, image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=400", description: "Comfortable and durable sports shoes for active running", color: "Blue", size: "UK 9", deliveryDays: 2 }
  },
  "9": {
    "Notebooks": { id: 901, title: "Hardcover Journal", brand: "Matrikas", sellingPrice: 499, mrp: 899, rating: 4.4, reviews: 92, image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=400", description: "Premium 120 GSM dotted journal notebook with pocket" },
    "Pens & Pencils": { id: 902, title: "Fine Tip Gel Pens Set", brand: "Pilot", sellingPrice: 299, mrp: 599, rating: 4.5, reviews: 114, image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=400", description: "Pack of 12 black fine tip gel ink pens" },
    "Art Supplies": { id: 903, title: "Water Color Paints Set", brand: "Camel", sellingPrice: 899, mrp: 1499, rating: 4.6, reviews: 78, image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=400", description: "24 vibrant colors watercolor tubes with mixing palette" },
    "Desk Organizers": { id: 904, title: "Mesh Desk Organizer", brand: "Deli", sellingPrice: 499, mrp: 999, rating: 4.3, reviews: 54, image: "https://images.unsplash.com/photo-1595348020949-87cdfbb44174?q=80&w=400", description: "Multi-functional metal desk pen holder and storage tidy" },
    "Journals": { id: 905, title: "Leather Bound Diary", brand: "Craftsmen", sellingPrice: 699, mrp: 1299, rating: 4.5, reviews: 48, image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=400", description: "Vintage handmade leather pocket journal diary book" },
    "Planners": { id: 906, title: "Dated Daily Planner", brand: "Neorah", sellingPrice: 699, mrp: 1199, rating: 4.4, reviews: 88, image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=400", description: "A5 size dated daily and weekly goal-setting planner book" },
    "Sticky Notes": { id: 907, title: "Sticky Notes Pad Set", brand: "3M Post-it", sellingPrice: 199, mrp: 399, rating: 4.2, reviews: 36, image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=400", description: "Self-adhesive multi-color neon sticky notes pack" },
    "Office Supplies": { id: 908, title: "Heavy Duty Stapler", brand: "Kangaroo", sellingPrice: 249, mrp: 499, rating: 4.4, reviews: 58, image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=400", description: "25 sheets capacity desk stapler with staples pack" }
  },
  "10": {
    "Vitamins & Supplements": { id: 1001, title: "Multivitamin Capsules", brand: "MuscleBlaze", sellingPrice: 499, mrp: 999, rating: 4.4, reviews: 78, image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=400", description: "Daily multivitamin with zinc, vitamin C & D3 (60 capsules)" },
    "Fitness Equipment": { id: 1002, title: "Resistance Bands Set", brand: "Boldfit", sellingPrice: 799, mrp: 1499, rating: 4.5, reviews: 114, image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400", description: "Stackable loop exercise bands with handles and door anchor" },
    "Personal Care": { id: 1003, title: "Charcoal Hand Wash", brand: "Dettol", sellingPrice: 299, mrp: 499, rating: 4.3, reviews: 54, image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=400", description: "Anti-bacterial organic activated charcoal hand wash liquid" },
    "Yoga Essentials": { id: 1004, title: "TPE Yoga Mat", brand: "Boldfit", sellingPrice: 1199, mrp: 1999, rating: 4.6, reviews: 92, image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=400", description: "6mm thick high-density anti-slip yoga mat with carry strap" },
    "Healthy Snacks": { id: 1005, title: "Almonds & Berries Mix", brand: "True Elements", sellingPrice: 499, mrp: 799, rating: 4.4, reviews: 88, image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=400", description: "Gluten-free nutrient-dense trail mix dry fruits pack" },
    "Massagers": { id: 1006, title: "Handheld Body Massager", brand: "Dr. Trust", sellingPrice: 1799, mrp: 2999, rating: 4.5, reviews: 68, image: "https://images.unsplash.com/photo-1519823551276-6452893fea23?q=80&w=400", description: "Deep tissue percussion massager with multiple speed settings" },
    "Health Monitors": { id: 1007, title: "Digital BP Monitor", brand: "Omron", sellingPrice: 1499, mrp: 2499, rating: 4.4, reviews: 95, image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=400", description: "Fully automatic upper arm BP monitor with large display" },
    "Wellness Kits": { id: 1008, title: "Immunity Booster Box", brand: "Organic India", sellingPrice: 1199, mrp: 1999, rating: 4.5, reviews: 54, image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=400", description: "Assorted collection of green teas, organic honey & supplements" }
  },
  "11": {
    "Dog Supplies": { id: 1101, title: "Padded Dog Harness", brand: "Heads Up For Tails", sellingPrice: 799, mrp: 1499, rating: 4.4, reviews: 92, image: "https://images.unsplash.com/photo-1544568100-847a948585b9?q=80&w=400", description: "No-pull oxford fabric reflective harness" },
    "Cat Supplies": { id: 1102, title: "Hemp Cat Scratching Post", brand: "Trixie", sellingPrice: 999, mrp: 1999, rating: 4.5, reviews: 54, image: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?q=80&w=400", description: "Cat scratching tree post with hanging play ball" },
    "Pet Food": { id: 1103, title: "Dry Dog Kibble", brand: "Royal Canin", sellingPrice: 999, mrp: 1299, rating: 4.4, reviews: 78, image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=400", description: "Dry food for adult dogs 3kg" },
    "Treats": { id: 1104, title: "Chicken Dog Treats", brand: "Pedigree", sellingPrice: 399, mrp: 599, rating: 4.3, reviews: 36, image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=400", description: "Grain-free natural calcium rich dog treats" },
    "Toys": { id: 1105, title: "Squeaky Dog Ball", brand: "Kong", sellingPrice: 299, mrp: 499, rating: 4.4, reviews: 48, image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=400", description: "Indestructible treat dispenser rubber dog ball" },
    "Grooming": { id: 1106, title: "Pet Deshedding Tool", brand: "Wahl", sellingPrice: 499, mrp: 999, rating: 4.3, reviews: 31, image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=400", description: "Stainless steel dual-sided pet deshedding tool" },
    "Beds & Mats": { id: 1107, title: "Memory Foam Pet Bed", brand: "HUFT", sellingPrice: 2299, mrp: 3999, rating: 4.5, reviews: 68, image: "https://images.unsplash.com/photo-1541599540903-216a46ca1ad0?q=80&w=400", description: "Bolster sleeping bed for large pets" },
    "Bowls & Feeders": { id: 1108, title: "Double Pet Bowl Set", brand: "SuperDog", sellingPrice: 599, mrp: 1199, rating: 4.4, reviews: 58, image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=400", description: "Non-spill silicone mat double bowls for food/water" }
  }
};

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

export default function CategoryPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const categoryId = params.id;
  const subcategoryId = searchParams?.get("subcategory") || null;

  const details = CATEGORY_DETAILS[categoryId] ?? CATEGORY_DETAILS["1"];
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Cart & Favorites integration
  const { addToCart, toggleFavorite, favorites } = useCart();
  const [products, setProducts] = useState<any[]>([]);
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
    const min = Math.min(...prices);
    const max = Math.max(...prices);
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
    const fallback = (FALLBACK_SUBCATEGORIES[categoryId] ?? []).map((name, index) => ({ id: `fallback-${index}`, name }));

    fetch(`/api/categories/${categoryId}/subcategories`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setSubcategories(Array.isArray(data) && data.length ? data : fallback))
      .catch(() => setSubcategories(fallback))
      .finally(() => setLoading(false));
  }, [categoryId]);

  useEffect(() => {
    if (!subcategoryId) {
      setProducts([]);
      return;
    }
    setProductsLoading(true);

    let url = `/api/products`;
    if (String(subcategoryId).startsWith("fallback-")) {
      url = `/api/products?categoryId=${categoryId}`;
    } else {
      url = `/api/products?subCategoryId=${subcategoryId}`;
    }

    fetch(url)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        let loadedProducts: any[] = [];
        if (Array.isArray(data) && data.length > 0) {
          if (String(subcategoryId).startsWith("fallback-")) {
            const fallbackList = FALLBACK_SUBCATEGORIES[categoryId] ?? [];
            const index = parseInt(String(subcategoryId).replace("fallback-", ""), 10);
            const fallbackName = fallbackList[index];
            loadedProducts = data.filter(p => p.subCategory?.name?.toLowerCase() === fallbackName.toLowerCase());
          } else {
            loadedProducts = data;
          }
        }

        // If no products were returned from the API, try to load from the fallback map
        if (loadedProducts.length === 0) {
          const selectedSubObj = subcategories.find(s => String(s.id) === String(subcategoryId));
          let lookupName = selectedSubObj ? selectedSubObj.name : "";
          if (!lookupName && String(subcategoryId).startsWith("fallback-")) {
            const fallbackList = FALLBACK_SUBCATEGORIES[categoryId] ?? [];
            const index = parseInt(String(subcategoryId).replace("fallback-", ""), 10);
            lookupName = fallbackList[index] || "";
          }
          const fallbackProduct = FALLBACK_PRODUCTS_MAP[categoryId]?.[lookupName];
          if (fallbackProduct) {
            loadedProducts = [fallbackProduct];
          }
        }

        setProducts(loadedProducts);
      })
      .catch(() => {
        const selectedSubObj = subcategories.find(s => String(s.id) === String(subcategoryId));
        let lookupName = selectedSubObj ? selectedSubObj.name : "";
        if (!lookupName && String(subcategoryId).startsWith("fallback-")) {
          const fallbackList = FALLBACK_SUBCATEGORIES[categoryId] ?? [];
          const index = parseInt(String(subcategoryId).replace("fallback-", ""), 10);
          lookupName = fallbackList[index] || "";
        }
        const fallbackProduct = FALLBACK_PRODUCTS_MAP[categoryId]?.[lookupName];
        setProducts(fallbackProduct ? [fallbackProduct] : []);
      })
      .finally(() => setProductsLoading(false));
  }, [subcategoryId, categoryId, subcategories]);

  const selectedSub = subcategories.find(s => String(s.id) === String(subcategoryId));
  const subcategoryName = selectedSub ? selectedSub.name : (
    String(subcategoryId).startsWith("fallback-") ? (
      FALLBACK_SUBCATEGORIES[categoryId]?.[parseInt(String(subcategoryId).replace("fallback-", ""), 10)] || "Subcategory"
    ) : "Subcategory"
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
  };

  return (
    <main className="min-h-screen bg-[#FAF3E3] pb-20 text-[#4a556a] relative">
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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {!subcategoryId ? (
          <Link href="/#categories" className="inline-flex items-center gap-2 text-xs font-bold hover:text-apricot transition-colors mb-6">
            <ArrowLeft size={15} /> Back to categories
          </Link>
        ) : (
          <Link href={`/category/${categoryId}`} className="inline-flex items-center gap-2 text-xs font-bold hover:text-apricot transition-colors mb-6">
            <ArrowLeft size={15} /> Back to all {details.name} subcategories
          </Link>
        )}

        <div className="relative min-h-[220px] sm:min-h-[300px] overflow-hidden rounded-[32px] shadow-sm flex items-end">
          <img src={details.image} alt={details.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#303746]/90 via-[#303746]/35 to-transparent" />
          <div className="relative z-10 max-w-2xl p-8 sm:p-12 text-white">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#FAF3E3]/80 mb-3">Shop category</p>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              {subcategoryId ? `${details.name} › ${subcategoryName}` : details.name}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/85 leading-relaxed">{details.description}</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {!subcategoryId ? (
          /* Render grid of subcategories */
          loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2].map((item) => <div key={item} className="h-52 rounded-[28px] bg-white/60 animate-pulse" />)}
            </div>
          ) : subcategories.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subcategories.map((subcategory, index) => {
                const style = CARD_STYLES[index % CARD_STYLES.length];
                return (
                  <Link
                    key={subcategory.id}
                    href={`/category/${categoryId}?subcategory=${subcategory.id}`}
                    className={`group relative min-h-52 overflow-hidden rounded-[28px] border border-white/70 bg-gradient-to-br ${style.surface} p-7 shadow-[0_8px_30px_rgba(74,85,106,0.08)] hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(74,85,106,0.16)] transition-all duration-300`}
                  >
                    <span className={`absolute -right-9 -top-10 w-32 h-32 rounded-full ${style.accent} opacity-30 transition-transform duration-500 group-hover:scale-125`} />
                    <span className="absolute -right-2 bottom-4 text-[72px] leading-none font-black text-white/35 select-none">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="relative z-10 h-full flex flex-col items-start justify-between gap-7">
                      <span className={`w-14 h-14 rounded-2xl ${style.icon} text-white flex items-center justify-center shadow-md transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105`}>
                        <Boxes size={25} strokeWidth={1.8} />
                      </span>

                      <div className="w-full">
                        <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#3f485a]">{subcategory.name}</h3>
                        <span className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[#4a556a]/70 group-hover:text-[#4a556a] transition-colors">
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
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#4a556a]/10 pb-4">
                <div className="flex items-center gap-3">
                  <p className="text-xs text-[#4a556a]/65 font-medium">
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
              <div className="flex gap-6 items-start">
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

                        return (
                          <div
                            key={product.id}
                            className="group bg-white hover:bg-[#4a556a] border border-natural/10 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col relative"
                          >
                            {discount > 0 && (
                              <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-apricot text-white text-xs sm:text-sm font-bold rounded-full shadow-md">
                                -{discount}%
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
                                <img
                                  src={product.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300"}
                                  alt={product.title}
                                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                />
                              </div>

                              <div className="p-4 flex-1 flex flex-col justify-between">
                                <div className="space-y-1">
                                  {product.brand && (
                                    <p className="text-[9px] font-semibold text-[#4a556a]/50 group-hover:text-white/60 transition-colors">
                                      {product.brand}
                                    </p>
                                  )}
                                  <h3 className="text-xs font-bold text-[#4a556a] group-hover:text-white leading-snug line-clamp-2 transition-colors">
                                    {product.title}
                                  </h3>
                                  <div className="flex items-center gap-1">
                                    <Star size={10} className="text-amber-400 fill-amber-400" />
                                    <span className="text-[10px] font-bold text-[#4a556a] group-hover:text-white transition-colors">
                                      {product.rating || 4.5}
                                    </span>
                                    <span className="text-[10px] text-natural/50 group-hover:text-white/60 transition-colors">
                                      ({product.reviews || 42})
                                    </span>
                                  </div>
                                </div>

                                <div className="pt-3 border-t border-natural/8 mt-3">
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-sm font-extrabold text-[#4a556a] group-hover:text-white transition-colors">
                                      ₹{price.toLocaleString("en-IN")}
                                    </span>
                                    {mrp > price && (
                                      <span className="text-[10px] text-natural/45 group-hover:text-white/50 line-through font-medium transition-colors">
                                        ₹{mrp.toLocaleString("en-IN")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Link>

                            <div className="px-4 pb-4">
                              <button
                                onClick={(e) => handleAddToCart(product, e)}
                                className="w-full h-8 bg-[#4a556a] group-hover:bg-white group-hover:text-[#4a556a] hover:scale-[1.02] active:scale-[0.98] text-white text-[10px] font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
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
        className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
          checked
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
    if (CATEGORY_BRANDS[categoryId]) {
      return CATEGORY_BRANDS[categoryId];
    }
    const s = new Set(products.map((p) => p.brand).filter(Boolean) as string[]);
    return Array.from(s).sort();
  }, [products, categoryId]);

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
          className="w-full flex items-center justify-between px-4 py-3 text-[11px] font-bold text-[#4a556a] hover:bg-[#FAF3E3]/60 transition-colors cursor-pointer group"
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
        <h2 className="text-sm font-bold text-[#4a556a]">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-[10px] font-bold text-apricot hover:underline cursor-pointer uppercase tracking-wide"
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
        className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm ${
          open
            ? "bg-[#4a556a] text-white border-[#4a556a] shadow-md"
            : "bg-white text-[#4a556a] border-[#4a556a]/15 hover:border-[#4a556a]/40 hover:shadow-md"
        }`}
      >
        <span className={`text-[10px] font-semibold mr-0.5 ${ open ? "text-white/60" : "text-[#4a556a]/45" }`}>
          Sort
        </span>
        <span className="truncate max-w-[110px]">{selected.label}</span>
        <ChevronDown
          size={13}
          className={`flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-180 text-white/70" : "text-[#4a556a]/40"
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
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-[11px] font-semibold transition-all duration-150 cursor-pointer group ${
                opt.value === value
                  ? "bg-apricot/8 text-apricot"
                  : "text-[#4a556a]/75 hover:bg-[#4a556a] hover:text-white"
              } ${idx !== SORT_OPTIONS.length - 1 ? "border-b border-[#4a556a]/6" : ""}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all ${
                  opt.value === value
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
