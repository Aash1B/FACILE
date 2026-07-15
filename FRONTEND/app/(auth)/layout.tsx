"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <div
      className="auth-palette min-h-screen flex font-sans"
      style={{ backgroundColor: '#faf3e3', color: '#4a5568' }}
    >
      {/* Split Pane: Left Side (Banner, Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-end p-16 overflow-hidden" style={{ backgroundColor: '#ced2ee' }}>
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-out hover:scale-105"
          style={{ backgroundImage: 'none', backgroundColor: '#ced2ee' }}
        />
        
        {/* Decorative soft shapes for visual interest */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: '#a1b5d8' }} />
        <div className="absolute bottom-16 left-8 w-48 h-48 rounded-full opacity-15 blur-2xl" style={{ backgroundColor: '#738290' }} />
        <div className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full opacity-10 blur-xl" style={{ backgroundColor: '#e4f0d0' }} />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#ced2ee]/80 via-[#ced2ee]/30 to-[#ced2ee]/5 pointer-events-none"
        />

        {/* Floating Accent Sparkles */}
        <div className="absolute top-12 left-12 flex items-center gap-2.5 z-10 select-none" style={{ color: '#4A5568' }}>
          <span className="font-serif text-3xl font-bold tracking-[0.08em] text-[#4a556a]">
            facile
          </span>
          <div className="h-4 w-px" style={{ backgroundColor: 'rgba(165,142,116,0.4)' }} />
          <div className="flex items-center gap-1 text-[10px] tracking-[0.15em] uppercase font-bold" style={{ color: '#A58E74' }}>
            <Sparkles size={11} style={{ color: '#E09132' }} />
            <span>Slow Living</span>
          </div>
        </div>

        {/* Branding Info */}
        <div className="relative z-10 space-y-4 max-w-md" style={{ color: '#4a5568' }}>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: '#4a5568' }}>
            Curated Lifestyles
          </p>
          <h2 className="font-serif text-4xl font-semibold leading-[1.2] tracking-tight">
            Designed to feel like home. Crafted to last.
          </h2>
          <p className="text-xs font-medium leading-relaxed" style={{ color: 'rgba(74,85,104,0.7)' }}>
            Explore our collections of minimal apparel, conscious ceramics, and thoughtfully designed workspace essentials.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[10px] font-bold tracking-wider" style={{ color: 'rgba(74,85,104,0.45)' }}>
            <span>© {new Date().getFullYear()} FACILE INC.</span>
            <span>•</span>
            <span>ALL RIGHTS RESERVED</span>
          </div>
        </div>
      </div>

      {/* Split Pane: Right Side (Form Container) */}
      <div
        className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 md:p-16 relative"
        style={{ backgroundColor: '#faf3e3' }}
      >
        {/* Top bar with back-to-store link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors duration-200 group"
            style={{ color: '#4a5568' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#4a5568')}
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            Back to store
          </Link>
          
          <div className="lg:hidden">
            <Link
              href="/"
              className="font-serif text-2xl font-bold tracking-[0.08em] text-[#4a556a]"
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
        <div className="text-center text-[10px] font-bold uppercase tracking-wider lg:hidden" style={{ color: 'rgba(74,85,104,0.25)' }}>
          © {new Date().getFullYear()} FACILE INC. • ALL RIGHTS RESERVED
        </div>
      </div>
    </div>
  );
}

