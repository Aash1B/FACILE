"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Leaf, Award, Truck } from "lucide-react";

// ─── Category Data ────────────────────────────────────────────────────────────
// Matches the actual products seeded in the backend (DataInitializer.java)
const CATEGORIES = [
  {
    id: "1",
    name: "Electronics",
    tagline: "Smart gadgets & audio",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=900",
    href: "/category/1",
  },
  {
    id: "2",
    name: "Fashion",
    tagline: "Fresh styles & wardrobe essentials",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=900",
    href: "/category/2",
  },
  {
    id: "3",
    name: "Home & Kitchen",
    tagline: "Beautiful essentials for every room",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=900",
    href: "/category/3",
  },
  {
    id: "4",
    name: "Beauty",
    tagline: "Skincare, fragrance & personal care",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=900",
    href: "/category/4",
  },
  {
    id: "5",
    name: "Sports",
    tagline: "Fitness gear & active essentials",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=900",
    href: "/category/5",
  },
  {
    id: "6",
    name: "Toys & Baby",
    tagline: "Playful picks for little ones",
    image: "https://images.unsplash.com/photo-1599443015574-be5fe8a05783?q=80&w=900",
    href: "/category/6",
  },
];

// ─── Trust badges ─────────────────────────────────────────────────────────────
const BADGES = [
  {
    icon: <ShoppingBag size={22} className="text-apricot" />,
    title: "Curated with Love",
    desc: "Handpicked products from the best brands",
  },
  {
    icon: <Leaf size={22} className="text-apricot" />,
    title: "Support Small",
    desc: "Empowering homegrown businesses",
  },
  {
    icon: <Award size={22} className="text-apricot" />,
    title: "Quality You Can Trust",
    desc: "Premium quality at fair prices",
  },
  {
    icon: <Truck size={22} className="text-apricot" />,
    title: "Fast & Safe Delivery",
    desc: "Quick shipping pan India",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  return (
<<<<<<< HEAD
    <main className="min-h-screen bg-[#F4F4F0] text-[#4a556a] pb-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <Link href="/#categories" className="inline-flex items-center gap-2 text-xs font-bold hover:text-apricot transition-colors mb-8">
          <ArrowLeft size={15} /> Back to home
        </Link>
=======
    <main className="min-h-screen bg-[#FAF3E3] text-[#4a556a] pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
>>>>>>> 5665a108df49036c6781996a9e07342e5ef3980d

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] text-[#4a556a]/50 font-medium mb-6">
          <Link href="/" className="hover:text-apricot transition-colors">Home</Link>
          <span className="text-[#4a556a]/30">›</span>
          <span className="text-[#4a556a] font-semibold">Categories</span>
        </nav>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#4a556a]">
            All Categories
          </h1>
          <p className="mt-2 text-sm text-[#4a556a]/60">
            Explore our wide range of handpicked products
          </p>
        </div>

        {/* Category grid — matches reference 4-col on desktop, 2-col on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group bg-white rounded-2xl overflow-hidden border border-natural/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {/* Image */}
              <div className="relative w-full overflow-hidden" style={{ paddingBottom: "68%" }}>
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Card footer */}
              <div className="flex items-center justify-between px-4 py-3.5 flex-1">
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-[#4a556a] group-hover:text-apricot transition-colors truncate">
                    {cat.name}
                  </h2>
                  <p className="text-[11px] text-[#4a556a]/50 mt-0.5 truncate">
                    {cat.tagline}
                  </p>
                </div>

                {/* Arrow button */}
                <div className="ml-3 flex-shrink-0 w-8 h-8 rounded-full border border-natural/20 group-hover:border-apricot group-hover:bg-apricot flex items-center justify-center transition-all duration-300">
                  <ArrowRight
                    size={14}
                    className="text-[#4a556a]/50 group-hover:text-white transition-all duration-300 group-hover:translate-x-0.5"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Trust badges strip */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {BADGES.map((b) => (
            <div
              key={b.title}
              className="flex items-start gap-3 bg-white rounded-2xl px-4 py-4 border border-natural/10 shadow-sm"
            >
              <div className="flex-shrink-0 mt-0.5">{b.icon}</div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#4a556a] leading-tight">{b.title}</p>
                <p className="text-[10px] text-[#4a556a]/50 mt-0.5 leading-snug">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
