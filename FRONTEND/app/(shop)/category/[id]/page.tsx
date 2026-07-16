"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Boxes } from "lucide-react";

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
  "1": ["Wearables", "Audio", "Gadgets"],
  "2": ["Apparel", "Winterwear"],
  "3": ["Cookware", "Home Decor"],
  "4": ["Skincare", "Fragrance"],
  "5": ["Footwear", "Fitness Gear"],
  "6": ["Baby Toys", "Baby Care"],
  "7": ["Jewellery", "Accessories"],
  "8": ["Shoes", "Casual Footwear"],
  "9": ["Office Supplies", "Notebooks & Planners"],
  "10": ["Supplements", "Personal Care"],
  "11": ["Pet Food", "Pet Toys"],
};

const CARD_STYLES = [
  { surface: "from-[#DDE0F0] to-[#eef0f9]", icon: "bg-[#4a556a]", accent: "bg-[#aeb7d8]" },
  { surface: "from-[#f9dbe8] to-[#fff0f6]", icon: "bg-[#E8437F]", accent: "bg-[#f2a9c7]" },
  { surface: "from-[#eadfcf] to-[#fff8ec]", icon: "bg-[#A58E74]", accent: "bg-[#d9c3a6]" },
];

type SubCategory = { id: number | string; name: string };

export default function CategoryPage() {
  const params = useParams<{ id: string }>();
  const categoryId = params.id;
  const details = CATEGORY_DETAILS[categoryId] ?? CATEGORY_DETAILS["1"];
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fallback = (FALLBACK_SUBCATEGORIES[categoryId] ?? []).map((name, index) => ({ id: `fallback-${index}`, name }));

    fetch(`/api/categories/${categoryId}/subcategories`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setSubcategories(Array.isArray(data) && data.length ? data : fallback))
      .catch(() => setSubcategories(fallback))
      .finally(() => setLoading(false));
  }, [categoryId]);

  return (
    <main className="min-h-screen bg-[#FAF3E3] pb-20 text-[#4a556a]">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link href="/#categories" className="inline-flex items-center gap-2 text-xs font-bold hover:text-apricot transition-colors mb-6">
          <ArrowLeft size={15} /> Back to categories
        </Link>

        <div className="relative min-h-[300px] overflow-hidden rounded-[32px] shadow-sm flex items-end">
          <img src={details.image} alt={details.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#303746]/90 via-[#303746]/35 to-transparent" />
          <div className="relative z-10 max-w-2xl p-8 sm:p-12 text-white">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#FAF3E3]/80 mb-3">Shop category</p>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">{details.name}</h1>
            <p className="mt-3 text-sm sm:text-base text-white/85 leading-relaxed">{details.description}</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {loading ? (
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
        )}
      </section>
    </main>
  );
}
