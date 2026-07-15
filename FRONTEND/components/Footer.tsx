
"use client";

import React, { useState } from "react";
import {
  Mail,
  ArrowRight,
  Heart,
  Globe,
  Sparkles
} from "lucide-react";

function Instagram({ size = 18 }: { size?: number }) {
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
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function Facebook({ size = 18 }: { size?: number }) {
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
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function Twitter({ size = 18 }: { size?: number }) {
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
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
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
    <footer className="bg-fern text-warm-ivory border-t border-natural/30 select-none">

      {/* Newsletter / Headline Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-natural/20">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-md space-y-2">
            <h3 className="text-xl sm:text-2xl font-serif font-bold tracking-wide flex items-center gap-2">
              <Sparkles size={20} className="text-apricot animate-pulse" />
              Join the facile community
            </h3>
            <p className="text-xs sm:text-sm text-warm-ivory/70 leading-relaxed font-medium">
              Receive updates on new collections, exclusive private sales, and stories about slow living and sustainability.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full lg:max-w-md">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center sm:relative w-full">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-ivory/50" size={16} />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-11.5 pl-11 pr-4 sm:pr-32 bg-white/10 border border-natural/35 focus:border-apricot focus:ring-1 focus:ring-apricot text-xs text-warm-ivory rounded-full shadow-inner transition-all duration-200 placeholder:text-warm-ivory/45 focus:outline-none font-semibold"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto h-11.5 sm:h-8.5 px-5 bg-apricot hover:bg-apricot/90 text-warm-ivory text-xs font-bold tracking-wide rounded-full flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-97 hover:shadow-md sm:absolute sm:right-1.5 sm:top-1/2 sm:-translate-y-1/2"
              >
                {subscribed ? "Subscribed!" : "Subscribe"}
                {!subscribed && <ArrowRight size={12} />}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Link Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10">

          {/* Brand Info (Col span 4) */}
          <div className="md:col-span-4 space-y-6">
            <a href="#" className="font-serif text-3xl font-bold tracking-[0.08em] text-[#4a556a]">
              facile
            </a>
            <p className="text-xs text-warm-ivory/75 leading-relaxed font-semibold max-w-sm">
              We design and curate premium-quality essentials with a focus on simplicity, utility, and ethical sourcing. Bringing slow fashion and fine craftsmanship closer to you.
            </p>
            <div className="flex items-center gap-4 text-warm-ivory/70">
              <a href="#" className="hover:text-apricot transition-colors p-1" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="hover:text-apricot transition-colors p-1" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="hover:text-apricot transition-colors p-1" aria-label="Twitter">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-1" />

          {/* Links: Shop (Col span 2) */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-apricot">Shop</h4>
            <ul className="space-y-2.5 text-xs text-warm-ivory/80 font-semibold">
              <li><a href="#best-sellers" className="hover:text-apricot transition-colors">New Arrivals</a></li>
              <li><a href="#best-sellers" className="hover:text-apricot transition-colors">Best Sellers</a></li>
              <li><a href="#special-offer" className="hover:text-apricot transition-colors">Trending Offer</a></li>
              <li><a href="#categories" className="hover:text-apricot transition-colors">Categories</a></li>
            </ul>
          </div>

          {/* Links: Customer Support (Col span 2.5) */}
          <div className="md:col-span-2.5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-apricot">Support</h4>
            <ul className="space-y-2.5 text-xs text-warm-ivory/80 font-semibold">
              <li><a href="#" className="hover:text-apricot transition-colors">Shipping & Delivery</a></li>
              <li><a href="#" className="hover:text-apricot transition-colors">Returns & Refunds</a></li>
              <li><a href="#" className="hover:text-apricot transition-colors">Frequently Asked Questions</a></li>
              <li><a href="#" className="hover:text-apricot transition-colors">Size Guide</a></li>
            </ul>
          </div>

          {/* Links: Company & Brand (Col span 2.5) */}
          <div className="md:col-span-2.5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-apricot">Brand</h4>
            <ul className="space-y-2.5 text-xs text-warm-ivory/80 font-semibold">
              <li><a href="#" className="hover:text-apricot transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-apricot transition-colors">Sustainability Commitments</a></li>
              <li><a href="#" className="hover:text-apricot transition-colors">Journal & Blog</a></li>
              <li><a href="#" className="hover:text-apricot transition-colors">Careers</a></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="bg-[#363827] text-warm-ivory/60 text-[10px] font-bold border-t border-natural/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">

          <div className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} facile. Made with</span>
            <Heart size={10} className="text-apricot fill-apricot" />
            <span>for conscious living.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-warm-ivory transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-warm-ivory transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-warm-ivory transition-colors flex items-center gap-1">
              <Globe size={11} />
              English (US)
            </a>
          </div>

        </div>
      </div>

    </footer>
  );
}