"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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
      style={{ backgroundColor: '#F4F4F0', color: '#4a5568' }}
    >
      {/* Split Pane: Left Side (Banner, Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-end p-16 overflow-hidden" style={{ backgroundColor: '#5271FF' }}>
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-out hover:scale-105"
          style={{ backgroundImage: 'none', backgroundColor: '#5271FF' }}
        />
        
        {/* Decorative soft shapes for visual interest */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: '#a1b5d8' }} />
        <div className="absolute bottom-16 left-8 w-48 h-48 rounded-full opacity-15 blur-2xl" style={{ backgroundColor: '#4A5568' }} />
        <div className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full opacity-10 blur-xl" style={{ backgroundColor: '#e4f0d0' }} />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#5271FF]/90 via-[#5271FF]/50 to-[#5271FF]/20 pointer-events-none"
        />

        {/* Brand wordmark */}
        <div className="absolute top-12 left-12 z-10 select-none text-white">
          <span className="font-serif text-5xl font-bold tracking-[0.08em] text-white">
            facile
          </span>
        </div>

        {/* Branding Info */}
        <div className="relative z-10 space-y-4 max-w-md text-white">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/90">
          </p>
          <h2 className="font-serif text-4xl font-semibold leading-[1.2] tracking-tight">
            Your one-stop online marketplace.
          </h2>
          <p className="text-lg font-medium leading-relaxed text-white/80">
            Browse the best in fashion, beauty, electronic, health and welness and more.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[10px] font-bold tracking-wider text-white/60">
            <span>© {new Date().getFullYear()} FACILE INC.</span>
            <span>•</span>
            <span>ALL RIGHTS RESERVED</span>
          </div>
        </div>
      </div>

      {/* Split Pane: Right Side (Form Container) */}
      <div
        className="w-full lg:w-1/2 flex flex-col justify-between p-6 pt-4 sm:p-12 sm:pt-6 md:p-16 md:pt-8 relative"
        style={{ backgroundColor: '#F4F4F0' }}
      >
        {/* Top bar with back-to-store link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider transition-colors duration-200 group"
            style={{ color: '#4a5568' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#4a5568')}
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
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
        <div className="my-auto py-10 sm:max-w-lg sm:w-full sm:mx-auto lg:relative lg:top-6">
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

