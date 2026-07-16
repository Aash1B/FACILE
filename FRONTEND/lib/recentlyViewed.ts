export type RecentProduct = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviews?: number;
  maxOrderQuantity?: number;
};

const MAX_RECENT_PRODUCTS = 10;
export const RECENT_PRODUCTS_CHANGED = "facile-recent-products-changed";

const getStorageKey = () => {
  if (typeof window === "undefined") return "facile_recent_products_guest";
  try {
    const storedUser = localStorage.getItem("facile_user");
    const email = storedUser ? JSON.parse(storedUser)?.email : null;
    return `facile_recent_products_${email || "guest"}`;
  } catch {
    return "facile_recent_products_guest";
  }
};

export const getRecentlyViewed = (): RecentProduct[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(getStorageKey());
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const recordRecentlyViewed = (product: RecentProduct) => {
  if (typeof window === "undefined" || !product?.id) return;
  const nextProducts = [
    product,
    ...getRecentlyViewed().filter((item) => item.id !== product.id),
  ].slice(0, MAX_RECENT_PRODUCTS);

  localStorage.setItem(getStorageKey(), JSON.stringify(nextProducts));
  window.dispatchEvent(new CustomEvent(RECENT_PRODUCTS_CHANGED));
};
