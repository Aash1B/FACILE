import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

const CATEGORIES = [
  { id: "1", name: "Electronics", description: "Smart devices, audio and everyday technology", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=900" },
  { id: "2", name: "Fashion", description: "Fresh styles and comfortable wardrobe essentials", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=900" },
  { id: "3", name: "Home & Kitchen", description: "Beautiful essentials for every room", image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=900" },
  { id: "4", name: "Beauty", description: "Skincare, fragrance and personal care favourites", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=900" },
  { id: "5", name: "Sports", description: "Fitness equipment, footwear and active gear", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=900" },
  { id: "6", name: "Toys & Baby", description: "Playful and practical picks for little ones", image: "https://images.unsplash.com/photo-1599443015574-be5fe8a05783?q=80&w=900" },
];

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-[#F4F4F0] text-[#4a556a] pb-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <Link href="/#categories" className="inline-flex items-center gap-2 text-xs font-bold hover:text-apricot transition-colors mb-8">
          <ArrowLeft size={15} /> Back to home
        </Link>

        <div className="mb-9">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-apricot mb-2">Find what you love</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">All Categories</h1>
          <p className="mt-3 text-sm text-[#4a556a]/70 max-w-xl">Browse every department and choose a category to discover its available subcategories.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="group relative h-[310px] overflow-hidden rounded-[28px] shadow-[0_10px_30px_rgba(74,85,106,0.10)] hover:-translate-y-1.5 hover:shadow-[0_18px_45px_rgba(74,85,106,0.2)] transition-all duration-300"
            >
              <img src={category.image} alt={category.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#303746]/95 via-[#303746]/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <h2 className="text-2xl font-extrabold">{category.name}</h2>
                <p className="mt-2 text-xs leading-relaxed text-white/75">{category.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold">
                  Explore category <ArrowRight size={15} className="transition-transform group-hover:translate-x-1.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
