"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-warm-ivory font-sans text-fern">
      {/* Split Pane: Left Side (Banner, Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-fern items-end p-16 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-out hover:scale-105"
          style={{ backgroundImage: "url('/auth_banner.png')" }}
        />
        
        {/* Gradient Overlay matching brand 'fern' color */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#424530]/95 via-[#424530]/60 to-[#424530]/10 pointer-events-none" />

        {/* Floating Accent Sparkles */}
        <div className="absolute top-12 left-12 flex items-center gap-2.5 text-warm-ivory z-10 select-none">
          <span className="font-serif text-3xl font-bold tracking-[0.08em] hover:text-apricot transition-colors duration-300">
            facile
          </span>
          <div className="h-4 w-px bg-warm-ivory/30" />
          <div className="flex items-center gap-1 text-[10px] tracking-[0.15em] uppercase font-bold text-warm-ivory/80">
            <Sparkles size={11} className="text-apricot" />
            <span>Slow Living</span>
          </div>
        </div>

        {/* Branding Info */}
        <div className="relative z-10 space-y-4 max-w-md text-warm-ivory">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-apricot">
            Curated Lifestyles
          </p>
          <h2 className="font-serif text-4xl font-semibold leading-[1.2] tracking-tight">
            Designed to feel like home. Crafted to last.
          </h2>
          <p className="text-xs font-medium leading-relaxed text-warm-ivory/80">
            Explore our collections of minimal apparel, conscious ceramics, and thoughtfully designed workspace essentials.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[10px] font-bold tracking-wider text-warm-ivory/50">
            <span>© {new Date().getFullYear()} FACILE INC.</span>
            <span>•</span>
            <span>ALL RIGHTS RESERVED</span>
          </div>
        </div>
      </div>

      {/* Split Pane: Right Side (Form Container) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 md:p-16 relative">
        {/* Top bar with back-to-store link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-natural hover:text-fern transition-colors duration-200 group"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            Back to store
          </Link>
          
          <div className="lg:hidden">
            <Link
              href="/"
              className="font-serif text-2xl font-bold tracking-[0.08em] text-fern hover:text-apricot transition-colors duration-300"
            >
              facile
            </Link>
          </div>
        </div>

        {/* Center Form Content */}
        <div className="my-auto py-10 sm:max-w-md sm:w-full sm:mx-auto">
          {children}
        </div>

        {/* Footer info (Mobile only) */}
        <div className="text-center text-[10px] text-natural/80 font-bold uppercase tracking-wider lg:hidden">
          © {new Date().getFullYear()} FACILE INC. • ALL RIGHTS RESERVED
        </div>
      </div>
    </div>
  );
}
