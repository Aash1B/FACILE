"use client";

import React, { useState } from "react";
import {
  Mail,
  ArrowRight,
  Heart,
  Globe,
  Sparkles
} from "lucide-react";

function Instagram({ size = 18, strokeWidth = 2 }: { size?: number, strokeWidth?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function Facebook({ size = 18, strokeWidth = 2 }: { size?: number, strokeWidth?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function Twitter({ size = 18, strokeWidth = 2 }: { size?: number, strokeWidth?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function Pinterest({ size = 18 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 21.5s2.5-5 3-7c0-2 2-3 4-2.5s2.5 3.5 1 5.5" />
    </svg>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-fern text-warm-ivory border-t border-natural/30 relative z-50 select-none">
      
      {/* SECTION 1 - Newsletter (Hero Section) */}
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-14 border-b border-natural/10 flex flex-col items-center text-center">
        <Sparkles size={24} className="text-apricot mb-4 animate-pulse" />
        <h3 className="text-3xl sm:text-4xl font-serif font-bold tracking-wide mb-4">
          Register to shop
        </h3>
        
        <form onSubmit={handleSubscribe} className="w-full sm:max-w-md relative group">
          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-warm-ivory/50 transition-colors group-focus-within:text-apricot" size={18} />
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-14 pl-14 pr-36 bg-white/5 border border-natural/30 focus:border-apricot focus:bg-white/10 text-sm text-warm-ivory rounded-full shadow-inner transition-all duration-300 placeholder:text-warm-ivory/45 focus:outline-none font-medium"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-11 px-6 bg-apricot hover:bg-[#3A56D4] hover:-translate-y-0.5 active:translate-y-0 text-warm-ivory text-xs font-bold tracking-widest uppercase rounded-full flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md"
          >
            {subscribed ? "Registered!" : "Register"}
            {!subscribed && <ArrowRight size={14} />}
          </button>
        </form>
      </div>

      {/* SECTION 2 - Main Footer Grid */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-y-12 gap-x-8 md:gap-x-12">

          {/* Column 1 - Brand */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col justify-end h-full space-y-4">
            <span 
              className="font-antic font-normal text-3xl text-[#5271FF] tracking-[0.02em]"
            >
              FACILE
            </span>
            <p className="text-[13px] text-warm-ivory/75 leading-loose font-medium max-w-[280px]">
              We design timeless essentials crafted with simplicity, quality and sustainability.
            </p>
            <div className="flex items-center gap-5 pt-2 text-warm-ivory/70">
              <a href="#" className="hover:text-apricot hover:-translate-y-1 transition-all duration-300" aria-label="Instagram">
                <Instagram size={20} strokeWidth={1.5} />
              </a>
              <a href="#" className="hover:text-apricot hover:-translate-y-1 transition-all duration-300" aria-label="Facebook">
                <Facebook size={20} strokeWidth={1.5} />
              </a>
              <a href="#" className="hover:text-apricot hover:-translate-y-1 transition-all duration-300" aria-label="Twitter">
                <Twitter size={20} strokeWidth={1.5} />
              </a>
              <a href="#" className="hover:text-apricot hover:-translate-y-1 transition-all duration-300" aria-label="Pinterest">
                <Pinterest size={20} />
              </a>
            </div>
          </div>

          {/* Grouped Link Columns to push right and control spacing */}
          <div className="md:col-span-8 lg:col-span-9 flex flex-wrap md:flex-nowrap justify-end gap-12 sm:gap-16 lg:gap-20 w-full">
            
            {/* Column 2 - SHOP */}
            <div className="flex flex-col justify-end h-full space-y-3 min-w-max">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-warm-ivory/40">Shop</h4>
              <ul className="space-y-1 text-[13px] text-warm-ivory/90 font-medium">
                <li><a href="#best-sellers" className="hover:text-apricot transition-colors duration-200">New Arrivals</a></li>
                <li><a href="#best-sellers" className="hover:text-apricot transition-colors duration-200">Best Sellers</a></li>
                <li><a href="#categories" className="hover:text-apricot transition-colors duration-200">Categories</a></li>
                <li><a href="#" className="hover:text-apricot transition-colors duration-200">Gift Cards</a></li>
              </ul>
            </div>

            {/* Column 3 - SUPPORT */}
            <div className="flex flex-col justify-end h-full space-y-3 min-w-max">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-warm-ivory/40">Support</h4>
              <ul className="space-y-1 text-[13px] text-warm-ivory/90 font-medium">
                <li><a href="#" className="hover:text-apricot transition-colors duration-200">Shipping</a></li>
                <li><a href="#" className="hover:text-apricot transition-colors duration-200">Contact</a></li>
                <li><a href="#" className="hover:text-apricot transition-colors duration-200">Track Order</a></li>
                <li><a href="#" className="hover:text-apricot transition-colors duration-200">Size Guide</a></li>
              </ul>
            </div>

            {/* Column 4 - COMPANY */}
            <div className="flex flex-col justify-end h-full space-y-3 min-w-max">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-warm-ivory/40">Company</h4>
              <ul className="space-y-1 text-[13px] text-warm-ivory/90 font-medium">
                <li><a href="#" className="hover:text-apricot transition-colors duration-200">About Us</a></li>
                <li><a href="#" className="hover:text-apricot transition-colors duration-200">Sustainability</a></li>
                <li><a href="#" className="hover:text-apricot transition-colors duration-200">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 3 - Bottom Bar */}
      <div className="bg-[#5271FF] border-t border-natural/10 text-warm-ivory/80 text-[11px] font-medium tracking-wide">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-1.5 text-center">
            <span>© {new Date().getFullYear()} FACILE.</span>
            <span>Made with</span>
            <Heart size={10} className="text-[#5271FF] fill-[#5271FF] mx-0.5 inline" />
            <span>for seamless shopping.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <a href="#" className="hover:text-warm-ivory transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-warm-ivory transition-colors">Terms</a>
            <a href="#" className="hover:text-warm-ivory transition-colors">Cookies</a>
            <a href="#" className="hover:text-warm-ivory transition-colors flex items-center gap-1.5 ml-2">
              <Globe size={12} strokeWidth={1.5} />
              Language
            </a>
          </div>

        </div>
      </div>

    </footer>
  );
}