"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Boxes, Star, ShoppingCart, Heart, Loader2 } from "lucide-react";
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

const CARD_STYLES = [
  { surface: "from-[#DDE0F0] to-[#eef0f9]", icon: "bg-[#4a556a]", accent: "bg-[#aeb7d8]" },
  { surface: "from-[#f9dbe8] to-[#fff0f6]", icon: "bg-[#E8437F]", accent: "bg-[#f2a9c7]" },
  { surface: "from-[#eadfcf] to-[#fff8ec]", icon: "bg-[#A58E74]", accent: "bg-[#d9c3a6]" },
];

const FALLBACK_PRODUCTS_MAP: Record<string, Record<string, any>> = {
  "1": {
    "Mobile Accessories": { id: 101, title: "Magnetic Phone Mount", brand: "Portronics", sellingPrice: 499, mrp: 999, rating: 4.2, reviews: 35, image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?q=80&w=400", description: "Universal air vent magnetic car phone mount holder" },
    "Audio Devices": { id: 102, title: "Wireless Bluetooth Earbuds", brand: "boAt", sellingPrice: 1799, mrp: 3999, rating: 4.6, reviews: 142, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=400", description: "Bluetooth 5.3 wireless earbuds with active noise cancelation" },
    "Smart Watches": { id: 103, title: "Smart Fitness Watch", brand: "Noise", sellingPrice: 3999, mrp: 7999, rating: 4.4, reviews: 88, image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400", description: "Smart watch with AMOLED display & bluetooth calling" },
    "Laptop Accessories": { id: 104, title: "Multi-port USB-C Hub", brand: "Anker", sellingPrice: 1299, mrp: 2499, rating: 4.5, reviews: 54, image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=400", description: "6-in-1 USB C hub with HDMI port and SD card slot" },
    "Gaming Accessories": { id: 105, title: "RGB Gaming Mouse", brand: "Logitech", sellingPrice: 999, mrp: 1999, rating: 4.3, reviews: 72, image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=400", description: "Wired gaming mouse with 12000 DPI adjustable sensor" },
    "Smart Home Devices": { id: 106, title: "Smart Wi-Fi Plug", brand: "Wipro", sellingPrice: 899, mrp: 1999, rating: 4.1, reviews: 31, image: "https://images.unsplash.com/photo-1543512214-318c7553f230?q=80&w=400", description: "16A smart plug with energy monitoring, Alexa compatible" },
    "Power Banks": { id: 107, title: "20000mAh Power Bank", brand: "Mi", sellingPrice: 1499, mrp: 2499, rating: 4.4, reviews: 95, image: "https://images.unsplash.com/photo-1609592424083-d922a91a92e9?q=80&w=400", description: "20W fast charging power bank with triple output ports" },
    "Cables & Chargers": { id: 108, title: "Braided USB-C Cable", brand: "Anker", sellingPrice: 349, mrp: 699, rating: 4.5, reviews: 120, image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=400", description: "Type C to Type C 6ft fast charging braided nylon cable" }
  },
  "2": {
    "Tops & T-Shirts": { id: 201, title: "Premium Cotton Tee", brand: "H&M", sellingPrice: 799, mrp: 1499, rating: 4.4, reviews: 215, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400", description: "Breathable 100% organic cotton t-shirt for daily comfort" },
    "Dresses": { id: 202, title: "Summer Floral Dress", brand: "Mango", sellingPrice: 1499, mrp: 2999, rating: 4.5, reviews: 112, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400", description: "Elegant floral printed summer dress with lightweight feel" },
    "Bottom Wear": { id: 203, title: "Slim Fit Denim Jeans", brand: "Levi's", sellingPrice: 1999, mrp: 3499, rating: 4.3, reviews: 189, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=400", description: "Classic dark wash stretchable slim fit denim jeans" },
    "Ethnic Wear": { id: 204, title: "Traditional Kurta Set", brand: "Fabindia", sellingPrice: 2999, mrp: 4999, rating: 4.5, reviews: 134, image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400", description: "Beautiful traditional cotton printed kurta set for festive wear" },
    "Winter Wear": { id: 205, title: "Knit Woolen Sweater", brand: "Allen Solly", sellingPrice: 2499, mrp: 3999, rating: 4.6, reviews: 92, image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=400", description: "Cozy winter sweater made of premium insulating wool" },
    "Activewear": { id: 206, title: "Athletic Gym Tights", brand: "Nike", sellingPrice: 1299, mrp: 2499, rating: 4.4, reviews: 78, image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=400", description: "High-waist moisture-wicking active compression tights" },
    "Loungewear": { id: 207, title: "Cozy Pyjama Set", brand: "Marks & Spencer", sellingPrice: 1199, mrp: 1999, rating: 4.3, reviews: 67, image: "https://images.unsplash.com/photo-1562572159-4ebcd318f4dd?q=80&w=400", description: "Super soft cotton pyjama and tee nightwear lounge set" },
    "Co-ord Sets": { id: 208, title: "Linen Co-ord Set", brand: "Zara", sellingPrice: 2199, mrp: 3999, rating: 4.5, reviews: 54, image: "https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=400", description: "Stylish matching linen top and trousers set for summer" }
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
    "Sneakers": { id: 801, title: "Classic White Sneakers", brand: "Puma", sellingPrice: 2999, mrp: 4999, rating: 4.4, reviews: 78, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400", description: "Low-top white sneakers with comfortable cushioned sole" },
    "Flats": { id: 802, title: "Comfortable Ballet Flats", brand: "Bata", sellingPrice: 999, mrp: 1999, rating: 4.2, reviews: 48, image: "https://images.unsplash.com/photo-1596702994230-a8859ad8db29?q=80&w=400", description: "Soft slip-on ballet flats perfect for daily office wear" },
    "Heels": { id: 803, title: "Elegant Stiletto Heels", brand: "Carlton London", sellingPrice: 2299, mrp: 3999, rating: 4.5, reviews: 92, image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400", description: "Pointed toe stiletto heels for parties and evening wear" },
    "Sandals": { id: 804, title: "Strappy Casual Sandals", brand: "Crocs", sellingPrice: 799, mrp: 1499, rating: 4.2, reviews: 36, image: "https://images.unsplash.com/photo-1603487265291-7493b8f68224?q=80&w=400", description: "Comfortable everyday wear strappy flat sandals" },
    "Boots": { id: 805, title: "Ankle Length Leather Boots", brand: "Woodland", sellingPrice: 3499, mrp: 5999, rating: 4.5, reviews: 112, image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=400", description: "Stylish chelsea ankle boots with block heel" },
    "Loafers": { id: 806, title: "Classic Suede Loafers", brand: "Clarks", sellingPrice: 1999, mrp: 3499, rating: 4.3, reviews: 54, image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=400", description: "Slip-on suede leather loafers for a smart-casual look" },
    "Slippers": { id: 807, title: "Orthopedic Soft Slippers", brand: "Doctor Extra Soft", sellingPrice: 499, mrp: 999, rating: 4.2, reviews: 31, image: "https://images.unsplash.com/photo-1603487265291-7493b8f68224?q=80&w=400", description: "Orthopedic cushion slippers for active home use" },
    "Sports Shoes": { id: 808, title: "Pro Running Shoes", brand: "Nike", sellingPrice: 3499, mrp: 5999, rating: 4.4, reviews: 78, image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=400", description: "Comfortable and durable sports shoes for active running" }
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

  return (
    <main className="min-h-screen bg-[#FAF3E3] pb-20 text-[#4a556a]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#4a556a] text-[#FAF3E3] py-3 px-5 rounded-2xl shadow-xl transition-all duration-300 font-semibold text-xs border border-white/10">
          {toastMessage}
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
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-[#4a556a]">
                  Showing {products.length} product{products.length !== 1 ? "s" : ""}
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => {
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
                        <div className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-apricot text-white text-[9px] font-bold rounded-full shadow-sm">
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
