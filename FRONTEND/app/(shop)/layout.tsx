import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      {/* Push content below the two-tier fixed navbar (~104px) */}
      <main className="flex-1 pt-[104px] animate-fade-in">
        {children}
      </main>
    </>
  );
}
