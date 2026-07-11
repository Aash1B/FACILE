import type { Metadata } from "next";
import { CartProvider } from "../context/CartContext";
import Navbar from "../components/Navbar";
import CartDrawer from "../components/CartDrawer";
import "./globals.css";

export const metadata: Metadata = {
  title: "facile • Curated Homegrown Instagram Brands",
  description: "Shop directly from India's finest slow-fashion, handmade ceramics, and organic skincare homegrown creators in one single checkout.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="flex flex-col bg-warm-ivory text-fern selection:bg-apricot/30 selection:text-fern">
        <CartProvider>
          <Navbar />
          <main className="flex-grow flex flex-col pt-[106px]">{children}</main>
          <CartDrawer />

          {/* Clean Mockup Footer in Cherish Green (Fern) */}
          <footer className="bg-fern border-t border-natural/20 py-12 px-4 sm:px-6 lg:px-8 text-warm-ivory font-sans mt-auto">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
              
              {/* Logo & Description */}
              <div className="space-y-4">
                <span className="font-serif text-3xl font-extrabold tracking-wider text-warm-ivory block">facile</span>
                <p className="text-xs text-warm-ivory/70 leading-relaxed max-w-xs">
                  Your one-stop shop for quality products at the best prices. Connecting you with slow, homegrown creators.
                </p>
              </div>

              {/* Quick Links */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-apricot">Quick Links</h4>
                <ul className="text-xs text-warm-ivory/80 space-y-2 font-medium">
                  <li><a href="#home" className="hover:text-warm-ivory transition-colors">Home</a></li>
                  <li><a href="#shop" className="hover:text-warm-ivory transition-colors">Shop</a></li>
                  <li><a href="#categories" className="hover:text-warm-ivory transition-colors">Categories</a></li>
                  <li><a href="#blogs" className="hover:text-warm-ivory transition-colors">Blogs</a></li>
                </ul>
              </div>

              {/* Customer Service */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-apricot">Customer Service</h4>
                <ul className="text-xs text-warm-ivory/80 space-y-2 font-medium">
                  <li><a href="#track-order" className="hover:text-warm-ivory transition-colors">Track Order</a></li>
                  <li><a href="#returns" className="hover:text-warm-ivory transition-colors">Returns & Refunds</a></li>
                  <li><a href="#shipping" className="hover:text-warm-ivory transition-colors">Shipping Policy</a></li>
                  <li><a href="#help" className="hover:text-warm-ivory transition-colors">Help Center</a></li>
                </ul>
              </div>

              {/* Newsletter Subscription */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-warm-ivory font-semibold">Subscribe to our newsletter</h4>
                <p className="text-xs text-warm-ivory/70 leading-relaxed">
                  Get the latest updates on new products and upcoming sales.
                </p>
                <div className="flex gap-2 max-w-sm">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 focus:border-warm-ivory text-xs text-warm-ivory rounded-lg placeholder:text-warm-ivory/55 focus:outline-none"
                  />
                  <button className="px-4 py-2 bg-apricot hover:opacity-90 active:scale-98 text-fern text-xs font-bold rounded-lg transition-all">
                    Subscribe
                  </button>
                </div>
              </div>

            </div>

            <div className="max-w-7xl mx-auto border-t border-white/10 mt-10 pt-6 text-center text-[10px] text-warm-ivory/55">
              <span>© {new Date().getFullYear()} Facile ShopMate. All rights reserved.</span>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
