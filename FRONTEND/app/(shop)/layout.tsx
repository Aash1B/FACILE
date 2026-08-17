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
      {/* Push content below the two-tier fixed navbar (~164px on mobile, ~136px on desktop) */}
      <main className="flex-1 pt-[164px] md:pt-[136px] animate-fade-in">
        {children}
      </main>
      <Footer />
      <FacileChatbot />
    </>
  );
}
