import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import FloatingCartSummary from "@/components/FloatingCartSummary";
import Footer from "@/components/Footer";
import FacileChatbot from "@/components/FacileChatbot";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<div className="h-[104px] bg-[#FAF3E3] border-b border-natural/15" />}>
        <Navbar />
      </Suspense>
      <FloatingCartSummary />
      <CartDrawer />
      <FacileChatbot />
      {/* Push content below the two-tier fixed navbar (~140px on mobile, ~104px on desktop) */}
      <main className="flex-1 pt-[140px] md:pt-[104px] animate-fade-in">
        {children}
      </main>
      <Footer />
    </>
  );
}
