"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Bot, ShoppingBag, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F4F4F0] text-[#4a556a] pb-20">
      {/* Hero Section */}
      <div className="relative py-24 sm:py-32 overflow-hidden bg-[#4a556a] text-[#FAF3E3]">
        <div className="absolute inset-0 opacity-20 bg-[url('/about_bg.png')] bg-cover bg-center" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img src="/logo.svg" alt="Facile Logo" className="w-20 h-20 mx-auto mb-6 -mt-12 opacity-90" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-serif mb-6">
            Welcome to facile
          </h1>
          <p className="text-lg sm:text-xl text-[#FAF3E3]/80 max-w-3xl mx-auto leading-relaxed">
            Where quality meets convenience. We bring together trusted brands, great value, and a hassle-free shopping experience tailored just for you.
          </p>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#4a556a]/10 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
            <div className="w-16 h-16 bg-[#DDE0F0] text-[#5271FF] rounded-full flex items-center justify-center mb-6">
              <Bot size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#4a556a]">Fia AI Assistant</h3>
            <p className="text-base text-[#4a556a]/70 leading-relaxed">
              Meet Fia, your personal shopping assistant. Fia is here to help you find products, answer questions, and make your shopping experience seamless.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#4a556a]/10 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
            <div className="w-16 h-16 bg-[#DDE0F0] text-[#5271FF] rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#4a556a]">Curated Quality</h3>
            <p className="text-base text-[#4a556a]/70 leading-relaxed">
              Every item is carefully selected to ensure it meets our high standards for both style and durability.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#4a556a]/10 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
            <div className="w-16 h-16 bg-[#DDE0F0] text-[#5271FF] rounded-full flex items-center justify-center mb-6">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#4a556a]">Trusted Partners</h3>
            <p className="text-base text-[#4a556a]/70 leading-relaxed">
              We collaborate with reputable brands that share our vision for excellence and customer satisfaction.
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#4a556a] mb-6">Our Story</h2>
            <div className="space-y-4 text-lg text-[#4a556a]/80 leading-relaxed">
              <p>
                Founded with a vision to simplify shopping without compromising on quality, Facile has grown into a destination for discerning shoppers. We believe that finding the right product shouldn't be a chore, but a delightful discovery.
              </p>
              <p>
                From humble beginnings to a curated marketplace, our journey is fueled by our commitment to bringing you the best. Our team works tirelessly to source products that blend seamlessly into your lifestyle, ensuring every purchase adds value to your day.
              </p>
              <p>
                At Facile, it's not just about what you buy; it's about the experience. Welcome to a better way to shop.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/categories" className="inline-flex items-center justify-center px-8 py-4 bg-[#5271FF] hover:bg-[#3A56D4] text-white text-sm font-bold tracking-widest uppercase rounded-full shadow-sm hover:shadow-md transition-all">
                Explore Our Collections
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-[#DDE0F0] rounded-3xl transform translate-x-4 translate-y-4 -z-10" />
            <img 
              src="/about_cover.png" 
              alt="Facile Store" 
              className="rounded-3xl shadow-lg w-full object-cover aspect-[4/3]"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
