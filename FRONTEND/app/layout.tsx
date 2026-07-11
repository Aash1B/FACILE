import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import Navbar from "../components/Navbar";
import CartDrawer from "../components/CartDrawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Facile – Discover the Best Products",
  description: "Shop high-quality products at affordable prices. Free shipping, secure payment, and easy returns.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-warm-ivory">
        <CartProvider>
          <Navbar />
          <CartDrawer />
          {/* Push content below the two-tier fixed navbar (~104px) */}
          <main className="flex-1 pt-[104px]">
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  );
}
