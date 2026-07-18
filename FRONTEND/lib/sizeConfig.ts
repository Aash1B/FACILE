export const SIZE_MAP: Record<string, string[]> = {
  tshirt: ["S", "M", "L", "XL", "XXL"],
  shirt: ["S", "M", "L", "XL", "XXL"],
  hoodie: ["S", "M", "L", "XL", "XXL"],
  sweatshirt: ["S", "M", "L", "XL", "XXL"],
  jacket: ["S", "M", "L", "XL", "XXL"],
  jeans: ["28", "30", "32", "34", "36", "38"],
  trousers: ["28", "30", "32", "34", "36", "38"],
  shoes: ["6", "7", "8", "9", "10", "11", "12"]
};

/**
 * Returns the available sizes for a given product based on its category and subCategory.
 * Returns null if the product does not require a size.
 */
export const getSizesForCategory = (category: string, subCategory: string, name?: string): string[] | null => {
  const cat = (category || "").toLowerCase();
  const sub = (subCategory || "").toLowerCase();
  const prodName = (name || "").toLowerCase();

  // Shoes
  if (cat.includes("shoes") || cat.includes("footwear") || sub.includes("shoes") || sub.includes("footwear") || prodName.includes("shoe") || prodName.includes("sneaker") || prodName.includes("boot")) {
    return SIZE_MAP.shoes;
  }

  // Jeans & Trousers
  if (cat.includes("jeans") || sub.includes("jeans") || prodName.includes("jeans")) {
    return SIZE_MAP.jeans;
  }
  if (cat.includes("trousers") || sub.includes("trousers") || sub.includes("pants") || prodName.includes("trouser") || prodName.includes("pant")) {
    return SIZE_MAP.trousers;
  }

  // Clothing (Tops/Winterwear)
  if (sub.includes("t-shirt") || sub.includes("tshirt") || sub.includes("t shirt") || prodName.includes("t-shirt") || prodName.includes("tshirt")) return SIZE_MAP.tshirt;
  if (sub.includes("hoodie") || prodName.includes("hoodie")) return SIZE_MAP.hoodie;
  if (sub.includes("sweatshirt") || prodName.includes("sweatshirt")) return SIZE_MAP.sweatshirt;
  if (sub.includes("jacket") || prodName.includes("jacket") || prodName.includes("coat")) return SIZE_MAP.jacket;
  
  // Sweaters & Cardigans
  if (prodName.includes("sweater") || prodName.includes("cardigan") || prodName.includes("knit") || sub.includes("winter") || cat.includes("winter")) {
    return SIZE_MAP.sweatshirt; // S, M, L, XL, XXL
  }

  if (sub.includes("shirt") && !sub.includes("sweatshirt") || (prodName.includes("shirt") && !prodName.includes("t-shirt"))) return SIZE_MAP.shirt;

  // Broader catch-all for clothing if subCategory/category is generic
  if (cat.includes("clothing") || cat.includes("apparel") || cat.includes("fashion") || cat.includes("men") || cat.includes("women")) {
    if (sub.includes("top") || sub.includes("wear") || sub.includes("dress") || sub.includes("clothing")) {
       return SIZE_MAP.shirt; 
    }
  }

  return null;
};
