"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const isAuthPage = pathname === "/seller/login" || pathname === "/seller/register";

  const handleLogout = () => {
    logout();
    router.push("/seller/login");
  };

  // Auth pages layout: Split pane layout themed for sellers
  if (isAuthPage) {
    return (
      <div
        className="min-h-screen flex font-sans"
        style={{ backgroundColor: '#F4E6C7', color: '#424530' }}
      >
        {/* Split Pane: Left Side (Banner, Desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 relative items-end p-16 overflow-hidden" style={{ backgroundColor: '#A58E74' }}>
          {/* Decorative soft shapes for visual interest */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: '#E09132' }} />
          <div className="absolute bottom-16 left-8 w-60 h-60 rounded-full opacity-15 blur-2xl" style={{ backgroundColor: '#424530' }} />
          
          {/* Gradient overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#424530]/40 via-transparent to-[#424530]/5 pointer-events-none"
          />

          {/* Floating Accent Sparkles */}
          <div className="absolute top-12 left-12 flex items-center gap-2.5 z-10 select-none" style={{ color: '#F4E6C7' }}>
            <span className="font-serif text-3xl font-bold tracking-[0.08em]">
              facile
            </span>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-1 text-[10px] tracking-[0.15em] uppercase font-bold" style={{ color: '#F4E6C7' }}>
              <Sparkles size={11} style={{ color: '#E09132' }} />
              <span>Partner</span>
            </div>
          </div>

          {/* Branding Info */}
          <div className="relative z-10 space-y-4 max-w-md text-[#F4E6C7]">
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase opacity-80">
              Merchant Workspace
            </p>
            <h2 className="font-serif text-4xl font-semibold leading-[1.2] tracking-tight">
              Grow your mindful business with us.
            </h2>
            <p className="text-xs font-medium leading-relaxed opacity-90">
              Bring your conscious ceramics, slow fashion, and crafted essentials to a community that appreciates details, quality, and intention.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[10px] font-bold tracking-wider opacity-60">
              <span>© {new Date().getFullYear()} FACILE PARTNER HUB</span>
            </div>
          </div>
        </div>

        {/* Split Pane: Right Side (Form Container) */}
        <div
          className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 md:p-16 relative"
          style={{ backgroundColor: '#F4E6C7' }}
        >
          {/* Top bar with back-to-store link */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors duration-200 group"
              style={{ color: '#424530' }}
            >
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
              Back to store
            </Link>
            
            <div className="lg:hidden">
              <span className="font-serif text-2xl font-bold tracking-[0.08em]" style={{ color: '#424530' }}>
                facile
              </span>
            </div>
          </div>

          {/* Center Form Content */}
          <div className="my-auto py-10 sm:max-w-md sm:w-full sm:mx-auto">
            {children}
          </div>

          {/* Footer info (Mobile only) */}
          <div className="text-center text-[10px] font-bold uppercase tracking-wider lg:hidden opacity-50" style={{ color: '#424530' }}>
            © {new Date().getFullYear()} FACILE PARTNER • ALL RIGHTS RESERVED
          </div>
        </div>
      </div>
    );
  }

  // Dashboard layout
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAF6EE' }}>
      {/* Top Seller Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 z-30 flex items-center justify-between px-6 border-b transition-all duration-200" style={{ backgroundColor: '#F4E6C7', borderColor: 'rgba(165,142,116,0.2)' }}>
        <div className="flex items-center gap-6">
          <Link href="/seller" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold tracking-wider" style={{ color: '#424530' }}>
              facile
            </span>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 rounded" style={{ backgroundColor: '#424530', color: '#F4E6C7' }}>
              Partner
            </span>
          </Link>
        </div>

        {user && user.role === "SELLER" && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold" style={{ borderColor: 'rgba(165,142,116,0.3)', color: '#424530', backgroundColor: 'rgba(250,246,238,0.5)' }}>
              <UserIcon size={14} className="stroke-[2.5px]" />
              <span>{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-xl transition-all cursor-pointer hover:bg-red-500/10 text-red-700"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pt-16 animate-fade-in flex flex-col">
        {children}
      </main>
    </div>
  );
}
