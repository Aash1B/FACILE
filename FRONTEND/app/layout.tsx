import type { Metadata } from "next";
import { Geist, Geist_Mono, Antic_Didone } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anticDidone = Antic_Didone({
  variable: "--font-antic",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Facile – Online Marketplace",
  description: "Shop high-quality products at affordable prices. Free shipping, secure payment, and easy returns.",
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml", sizes: "any" }],
    shortcut: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${anticDidone.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F4F4F0] text-fern">
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
