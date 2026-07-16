import type { RecentProduct } from "./recentlyViewed";

export type SavedProduct = RecentProduct & { brand?: string };
export const SAVED_PRODUCTS_CHANGED = "facile-saved-products-changed";

const getStorageKey = () => {
  if (typeof window === "undefined") return "facile_saved_products_guest";
  try {
    const storedUser = localStorage.getItem("facile_user");
    const email = storedUser ? JSON.parse(storedUser)?.email : null;
    return `facile_saved_products_${email || "guest"}`;
  } catch {
    return "facile_saved_products_guest";
  }
};

export const getSavedProducts = (): SavedProduct[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(getStorageKey());
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const persist = (products: SavedProduct[]) => {
  localStorage.setItem(getStorageKey(), JSON.stringify(products));
  window.dispatchEvent(new CustomEvent(SAVED_PRODUCTS_CHANGED));
};

export const saveProductForLater = (product: SavedProduct) => {
  persist([product, ...getSavedProducts().filter((item) => item.id !== product.id)]);
};

export const removeSavedProduct = (id: string) => {
  persist(getSavedProducts().filter((item) => item.id !== id));
};

export const isProductSaved = (id: string) => getSavedProducts().some((item) => item.id === id);
