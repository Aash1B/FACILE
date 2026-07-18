"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, BarChart3, Users, Settings, LogOut, ShieldAlert, Activity, Wifi } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  
  const isLoginPage = pathname === "/admin/login";

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#FAF6EE', color: '#4A5568' }}>
        <div className="w-10 h-10 border-4 rounded-full animate-spin mb-4" style={{ borderColor: '#4A5568', borderTopColor: 'transparent' }} />
        <span className="text-xs font-bold tracking-widest uppercase opacity-75">Verifying admin credentials...</span>
      </div>
    );
  }

  // Admin login page has its own layout wrapped by the parent
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: '#FAF6EE', color: '#4A5568' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-red-500/10 text-red-600">
          <ShieldAlert size={32} />
        </div>
        <h1 className="font-serif text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-xs text-natural max-w-sm mb-6 leading-relaxed">
          The page you are trying to view is restricted to company administrators. Please sign in with an administrator account.
        </p>
        <div className="flex gap-4">
          <Link href="/admin/login" className="h-10 px-6 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-sm" style={{ backgroundColor: '#4A5568', color: '#F4E6C7' }}>
            Go to Admin Login
          </Link>
          <Link href="/" className="h-10 px-6 font-bold text-xs uppercase tracking-wider rounded-xl border transition-all flex items-center justify-center cursor-pointer" style={{ borderColor: 'rgba(74,85,104,0.3)', color: '#4A5568' }}>
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  // Dashboard sidebar layout
  return (
    <div className="min-h-screen flex font-sans" style={{ backgroundColor: '#FAF6EE' }}>
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex md:w-64 flex-col justify-between p-6 border-r transition-all duration-200" style={{ backgroundColor: '#F4E6C7', borderColor: 'rgba(165,142,116,0.2)' }}>
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <span className="font-serif text-2xl font-bold tracking-wider" style={{ color: '#4A5568' }}>
              facile
            </span>
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 rounded" style={{ backgroundColor: '#E09132', color: '#4A5568' }}>
              Admin
            </span>
          </div>

          {/* Navigation */}
          <nav className="space-y-1.5">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 h-11 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200"
              style={{
                backgroundColor: pathname === "/admin" ? '#4A5568' : 'transparent',
                color: pathname === "/admin" ? '#F4E6C7' : '#4A5568'
              }}
            >
              <BarChart3 size={15} />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/admin#sellers"
              className="flex items-center gap-3 px-4 h-11 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:bg-stone-500/5"
              style={{ color: '#4A5568' }}
            >
              <Users size={15} />
              <span>Sellers</span>
            </Link>

            <div className="pt-4 border-t my-4" style={{ borderColor: 'rgba(74,85,104,0.1)' }} />

            <div className="px-4 py-2 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase opacity-65" style={{ color: '#4A5568' }}>
                <span>System Status</span>
                <Wifi size={12} className="text-green-600 animate-pulse" />
              </div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-natural">
                <span>Traffic</span>
                <span className="flex items-center gap-1 text-fern font-bold">
                  <Activity size={10} /> Live (142)
                </span>
              </div>
            </div>
          </nav>
        </div>

        {/* Footer Admin Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-3 py-2 rounded-2xl border bg-white/40" style={{ borderColor: 'rgba(165,142,116,0.2)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase text-[#F4E6C7]" style={{ backgroundColor: '#4A5568' }}>
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-fern truncate leading-none mb-0.5">{user.name}</p>
              <span className="text-[9px] font-semibold text-natural uppercase tracking-wider">Super Admin</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer hover:bg-red-500/10 text-red-700"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between h-16 px-6 border-b" style={{ backgroundColor: '#F4E6C7', borderColor: 'rgba(165,142,116,0.2)' }}>
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold tracking-wider" style={{ color: '#4A5568' }}>
              facile
            </span>
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: '#E09132', color: '#4A5568' }}>
              Admin
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-xl text-red-700 hover:bg-red-500/10 cursor-pointer"
          >
            <LogOut size={14} />
          </button>
        </header>

        {/* Dashboard children content */}
        <main className="flex-1 p-6 md:p-8 lg:p-10 animate-fade-in flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}


