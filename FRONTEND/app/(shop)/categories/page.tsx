"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// ─── Category Data ────────────────────────────────────────────────────────────
// Matches the actual products seeded in the backend (DataInitializer.java)
const CATEGORIES = [
  {
    id: "2",
    name: "Fashion",
    tagline: "Fresh styles & wardrobe essentials",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=900",
    href: "/category/2",
  },
  {
    id: "4",
    name: "Beauty",
    tagline: "Skincare, fragrance & personal care",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=900",
    href: "/category/4",
  },
  {
    id: "3",
    name: "Home & Living",
    tagline: "Beautiful essentials for every room and home decor",
    image: "https://plain-apac-prod-public.komododecks.com/202607/18/tDedHWXYOjaYCXJx6JkU/image.png",
    href: "/category/3",
  },
  {
    id: "7",
    name: "Jewellery & Accessories",
    tagline: "Elegant jewellery & premium accessories",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=900",
    href: "/category/7",
  },
  {
    id: "8",
    name: "Footwear",
    tagline: "Stylish shoes & comfortable footwear",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=900",
    href: "/category/8",
  },
  {
    id: "1",
    name: "Electronics",
    tagline: "Smart gadgets & home electronics",
    image: "https://plain-apac-prod-public.komododecks.com/202607/18/CFEDJmfGLPxeAaBrfGkg/image.png",
    href: "/category/1",
  },
  {
    id: "9",
    name: "Stationery",
    tagline: "Notebooks, journals & creative workspace tools",
    image: "https://plain-apac-prod-public.komododecks.com/202607/18/EPkaqlfAPhSL9rqbzGlV/image.png",
    href: "/category/9",
  },
  {
    id: "6",
    name: "Kids & Baby",
    tagline: "Playful toys & nursery essentials",
    image: "https://images.unsplash.com/photo-1599443015574-be5fe8a05783?q=80&w=900",
    href: "/category/6",
  },
  {
    id: "10",
    name: "Health & Wellness",
    tagline: "Fitness, nutrition & healthcare essentials",
    image: "https://plain-apac-prod-public.komododecks.com/202607/18/4Y7tzw7CeoPlHbREaaqS/image.png",
    href: "/category/10",
  },
  {
    id: "5",
    name: "Sports",
    tagline: "Activewear, exercise gear & sports gear",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=900",
    href: "/category/5",
  },
  {
    id: "11",
    name: "Pets",
    tagline: "Supplies, treats & toys for your best friends",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=900",
    href: "/category/11",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const [categoriesList, setCategoriesList] = useState<any[]>(CATEGORIES);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const updated = CATEGORIES.map((cat) => {
              const dbCat = data.find((c: any) => c.name.toLowerCase() === cat.name.toLowerCase());
              return dbCat ? { ...cat, id: String(dbCat.id), href: `/category/${dbCat.id}` } : cat;
            });
            setCategoriesList(updated);
          }
        }
      } catch (err) {
        console.warn("Failed to load categories from backend, using fallbacks.", err);
      }
    };
    loadCategories();
  }, []);

  return (
    <main className="min-h-screen bg-[#F4F4F0] text-[#4a556a] pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-base text-[#4a556a]/50 font-medium mb-6">
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
          {categoriesList.map((cat) => (
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

      </div>
    </main>
  );
}
