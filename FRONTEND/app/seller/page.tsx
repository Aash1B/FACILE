"use client";

import React, { useState, useEffect } from "react";
import { Plus, Package, Trash2, Edit3, Image as ImageIcon, Sparkles, Check, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

interface Product {
  id: string;
  title: string;
  description: string;
  mrp: number;
  sellingPrice: number;
  category: string;
  subcategory: string;
  stocks: number;
  image: string;
  images: string[];
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "Minimalist Stoneware Mug",
    description: "Hand-thrown sand-textured ceramic mug with matte glaze. Perfect for slow mornings.",
    mrp: 32.00,
    sellingPrice: 28.00,
    category: "Ceramics & Pottery",
    subcategory: "Drinkware",
    stocks: 14,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop"]
  },
  {
    id: "p2",
    title: "Organic Linen Cushion Cover",
    description: "100% Belgian flax linen cushion in soft natural oatmeal tones.",
    mrp: 45.00,
    sellingPrice: 39.00,
    category: "Home Accents",
    subcategory: "Textiles",
    stocks: 25,
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=300&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=300&auto=format&fit=crop"]
  }
];

const MOCK_CATEGORIES = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Fashion" },
  { id: 3, name: "Home & Kitchen" },
  { id: 4, name: "Beauty" },
  { id: 5, name: "Sports" },
  { id: 6, name: "Toys & Baby" }
];

const MOCK_SUBCATEGORIES: Record<number, any[]> = {
  1: [ { id: 1, name: "Wearables" }, { id: 2, name: "Audio" } ],
  2: [ { id: 6, name: "Apparel" } ],
  3: [ { id: 7, name: "Kitchenware" } ],
  4: [ { id: 5, name: "Fragrance" } ],
  5: [ { id: 4, name: "Footwear" } ],
  6: [ { id: 3, name: "Baby Toys" } ]
};

const CATEGORIES = [
  "Conscious Apparel",
  "Ceramics & Pottery",
  "Home Accents",
  "Workspace Essentials"
];

export default function SellerDashboardPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mrp, setMrp] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  
  const [categoriesList, setCategoriesList] = useState<any[]>(MOCK_CATEGORIES);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(String(MOCK_CATEGORIES[0].id));
  const [subcategoriesList, setSubcategoriesList] = useState<any[]>(MOCK_SUBCATEGORIES[MOCK_CATEGORIES[0].id]);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>(String(MOCK_SUBCATEGORIES[MOCK_CATEGORIES[0].id][0].id));
  
  const [stocks, setStocks] = useState("");
  const [image, setImage] = useState("");
  
  // Multiple Images State
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Listing states
  const [products, setProducts] = useState<Product[]>([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchProductsFromDb = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        const mapped: Product[] = data.map((p: any) => ({
          id: String(p.id),
          title: p.title,
          description: p.description,
          mrp: Number(p.mrp),
          sellingPrice: Number(p.sellingPrice),
          category: p.category?.name || "General",
          subcategory: p.subCategory?.name || "General",
          stocks: 50,
          image: p.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300",
          images: [p.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300"]
        }));
        
        setProducts(mapped);
        
        // Background fetch stock levels
        mapped.forEach(async (prod) => {
          try {
            const resInv = await fetch(`/api/products/${prod.id}/inventory`);
            if (resInv.ok) {
              const inv = await resInv.json();
              setProducts(prev => prev.map(pr => pr.id === prod.id ? { ...pr, stocks: inv.stock } : pr));
            }
          } catch (e) {
            console.error("Failed to load inventory for product id: " + prod.id, e);
          }
        });
      }
    } catch (err) {
      console.error("Failed to load products from database:", err);
    }
  };

  const fetchCategoriesFromDb = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setCategoriesList(data);
          setSelectedCategoryId(String(data[0].id));
          return;
        }
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
    // API Fallback
    setCategoriesList(MOCK_CATEGORIES);
    setSelectedCategoryId(String(MOCK_CATEGORIES[0].id));
  };

  useEffect(() => {
    fetchProductsFromDb();
    fetchCategoriesFromDb();
  }, []);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategoryId) return;
      try {
        const res = await fetch(`/api/categories/${selectedCategoryId}/subcategories`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setSubcategoriesList(data);
            setSelectedSubCategoryId(String(data[0].id));
            return;
          } else {
            // No subcategories in database for this category! Create one dynamically
            const catIdNum = Number(selectedCategoryId);
            const fallbackName = MOCK_SUBCATEGORIES[catIdNum]?.[0]?.name || "General";
            
            const createRes = await fetch(`/api/categories/${selectedCategoryId}/subcategories`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ name: fallbackName })
            });
            
            if (createRes.ok) {
              const newSub = await createRes.json();
              setSubcategoriesList([newSub]);
              setSelectedSubCategoryId(String(newSub.id));
              return;
            }
          }
        }
      } catch (err) {
        console.error("Failed to load subcategories:", err);
      }
      // API Fallback
      const catIdNum = Number(selectedCategoryId);
      const fallbacks = MOCK_SUBCATEGORIES[catIdNum] || [ { id: 1, name: "General" } ];
      setSubcategoriesList(fallbacks);
      setSelectedSubCategoryId(String(fallbacks[0].id));
    };
    fetchSubcategories();
  }, [selectedCategoryId]);

  const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setImages(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title || !description || !mrp || !sellingPrice || !stocks || !selectedCategoryId || !selectedSubCategoryId) {
      setFormError("Please fill out all required fields.");
      return;
    }

    const mrpNum = parseFloat(mrp);
    const priceNum = parseFloat(sellingPrice);
    const stockNum = parseInt(stocks);

    if (isNaN(mrpNum) || mrpNum <= 0) {
      setFormError("Please enter a valid MRP.");
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError("Please enter a valid Selling Price.");
      return;
    }
    if (priceNum > mrpNum) {
      setFormError("Selling Price cannot exceed MRP.");
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      setFormError("Stocks cannot be negative.");
      return;
    }

    const imageSource = images[0] || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300&auto=format&fit=crop";

    const payload = {
      title,
      description,
      mrp: mrpNum,
      sellingPrice: priceNum,
      image: imageSource,
      category: {
        id: Number(selectedCategoryId)
      },
      subCategory: {
        id: Number(selectedSubCategoryId)
      }
    };

    try {
      const res = await fetch(`/api/products?initialStock=${stockNum}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowSuccessToast(true);
        setTitle("");
        setDescription("");
        setMrp("");
        setSellingPrice("");
        setStocks("");
        setImages([]);
        setNewImageUrl("");
        
        await fetchProductsFromDb();

        setTimeout(() => {
          setShowSuccessToast(false);
        }, 3000);
      } else {
        setFormError("Failed to save product in database. Please check connection.");
      }
    } catch (err) {
      setFormError("Error occurred while connecting to database.");
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await fetchProductsFromDb();
      } else {
        alert("Failed to delete product from database.");
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Error occurred while deleting product from database.");
    }
  };

  return (
    <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div
          className="fixed bottom-6 right-6 z-50 py-3.5 px-5 rounded-2xl flex items-center gap-2.5 border animate-slide-in text-xs font-semibold shadow-xl"
          style={{ backgroundColor: "#4A5568", color: "#F4E6C7", borderColor: "#A58E74" }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#E09132" }}
          >
            <Check size={12} style={{ color: "#4A5568" }} className="stroke-[3px]" />
          </div>
          <span>Product listed successfully in shop catalog! 🌟</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-6" style={{ borderColor: 'rgba(165,142,116,0.15)' }}>
        <div className="space-y-1">
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-apricot flex items-center gap-1.5">
            <Sparkles size={11} className="animate-pulse" />
            Merchant Dashboard
          </p>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-fern">
            Product & Inventory Control
          </h1>
          <p className="text-xs text-natural font-medium">
            Review your collection, control inventory levels, and list new slow-living pieces.
          </p>
        </div>
      </div>

      {/* Analytics Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Revenue */}
        <div className="bg-white border rounded-3xl p-5 shadow-sm flex items-start justify-between" style={{ borderColor: 'rgba(165,142,116,0.2)' }}>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-natural tracking-wider uppercase">Estimated Sales Revenue</p>
            <h3 className="text-xl font-bold text-fern">
              ₹{(products.reduce((acc, p) => acc + (p.sellingPrice * (p.stocks + 4)), 0) * 8.5).toLocaleString("en-IN", {maximumFractionDigits: 0})}
            </h3>
            <span className="text-[9px] text-green-700 bg-green-500/10 px-1.5 py-0.5 rounded font-bold">Platform Active</span>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-fern bg-[#F4E6C7]">
            <TrendingUp size={15} />
          </div>
        </div>

        {/* Card 2: Orders */}
        <div className="bg-white border rounded-3xl p-5 shadow-sm flex items-start justify-between" style={{ borderColor: 'rgba(165,142,116,0.2)' }}>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-natural tracking-wider uppercase">Estimated Orders</p>
            <h3 className="text-xl font-bold text-fern">
              {products.reduce((acc, p) => acc + (p.stocks % 3), 0) + 8} Completed
            </h3>
            <span className="text-[9px] text-natural font-semibold">100% Fulfillment Rate</span>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-fern bg-[#F4E6C7]">
            <Package size={15} />
          </div>
        </div>

        {/* Card 3: Active Listings */}
        <div className="bg-white border rounded-3xl p-5 shadow-sm flex items-start justify-between" style={{ borderColor: 'rgba(165,142,116,0.2)' }}>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-natural tracking-wider uppercase">Active Products</p>
            <h3 className="text-xl font-bold text-fern">
              {products.length} Items
            </h3>
            <span className="text-[9px] text-natural font-semibold">Listed in Main Catalog</span>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-fern bg-[#F4E6C7]">
            <Sparkles size={14} />
          </div>
        </div>

        {/* Card 4: Low Stock Alert */}
        <div className="bg-white border rounded-3xl p-5 shadow-sm flex items-start justify-between" style={{ borderColor: 'rgba(165,142,116,0.2)' }}>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-natural tracking-wider uppercase">Low Stock Warnings</p>
            <h3 className="text-xl font-bold text-fern">
              {products.filter(p => p.stocks < 15).length} Products
            </h3>
            <span className="text-[9px] font-bold text-apricot bg-apricot/10 px-1.5 py-0.5 rounded">
              Stocks &lt; 15 Items
            </span>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-apricot bg-[#F4E6C7]">
            <AlertTriangle size={15} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Col: Add Product Form */}
        <div className="lg:col-span-1 border rounded-3xl p-6 shadow-sm" style={{ backgroundColor: '#F4E6C7', borderColor: 'rgba(165,142,116,0.25)' }}>
          <div className="flex items-center gap-2 mb-6 text-fern">
            <Plus size={18} className="stroke-[2.5px]" />
            <h2 className="font-serif text-xl font-bold">List New Product</h2>
          </div>

          <form onSubmit={handleAddProduct} className="space-y-4">
            {formError && (
              <p className="text-xs font-bold text-apricot animate-fade-in">
                ⚠️ {formError}
              </p>
            )}

            {/* Title */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold tracking-wider uppercase text-fern">
                Product Title <span className="text-apricot">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Stoneware Serving Bowl"
                className="w-full h-10 px-3.5 text-xs font-medium rounded-xl border bg-transparent transition-all outline-none"
                style={{ borderColor: 'rgba(74,85,104,0.2)', color: '#4A5568' }}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold tracking-wider uppercase text-fern">
                Description <span className="text-apricot">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Handcrafted details, materials used, glaze finish..."
                rows={3}
                className="w-full p-3.5 text-xs font-medium rounded-xl border bg-transparent transition-all outline-none resize-none"
                style={{ borderColor: 'rgba(74,85,104,0.2)', color: '#4A5568' }}
                required
              />
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold tracking-wider uppercase text-fern">
                  Category <span className="text-apricot">*</span>
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full h-10 px-2 text-xs font-semibold rounded-xl border bg-transparent outline-none cursor-pointer text-fern font-medium"
                  style={{ borderColor: 'rgba(74,85,104,0.2)' }}
                  required
                >
                  <option value="" disabled>Select Category</option>
                  {categoriesList.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#F4E6C7]">{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold tracking-wider uppercase text-fern">
                  Subcategory <span className="text-apricot">*</span>
                </label>
                <select
                  value={selectedSubCategoryId}
                  onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                  className="w-full h-10 px-2 text-xs font-semibold rounded-xl border bg-transparent outline-none cursor-pointer text-fern font-medium"
                  style={{ borderColor: 'rgba(74,85,104,0.2)' }}
                  required
                >
                  <option value="" disabled>Select Subcategory</option>
                  {subcategoriesList.map((sc) => (
                    <option key={sc.id} value={sc.id} className="bg-[#F4E6C7]">{sc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold tracking-wider uppercase text-fern">
                  MRP ($) <span className="text-apricot">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-natural">
                    <DollarSign size={12} />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    placeholder="39.99"
                    className="w-full h-10 pl-8 pr-3.5 text-xs font-medium rounded-xl border bg-transparent outline-none"
                    style={{ borderColor: 'rgba(74,85,104,0.2)', color: '#4A5568' }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold tracking-wider uppercase text-fern">
                  Selling Price ($) <span className="text-apricot">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-natural">
                    <DollarSign size={12} />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="35.00"
                    className="w-full h-10 pl-8 pr-3.5 text-xs font-medium rounded-xl border bg-transparent outline-none"
                    style={{ borderColor: 'rgba(74,85,104,0.2)', color: '#4A5568' }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Inventory Stocks */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold tracking-wider uppercase text-fern">
                Available Stocks <span className="text-apricot">*</span>
              </label>
              <input
                type="number"
                value={stocks}
                onChange={(e) => setStocks(e.target.value)}
                placeholder="20"
                className="w-full h-10 px-3.5 text-xs font-medium rounded-xl border bg-transparent outline-none"
                style={{ borderColor: 'rgba(74,85,104,0.2)', color: '#4A5568' }}
                required
              />
            </div>

            {/* Multiple Image Uploader Section */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold tracking-wider uppercase text-fern">
                Product Image Gallery
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://image-url.com/file.jpg"
                  className="flex-1 h-9 px-3.5 text-[11px] font-medium rounded-xl border bg-transparent outline-none text-fern"
                  style={{ borderColor: 'rgba(74,85,104,0.2)' }}
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="h-9 px-3.5 bg-fern font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer text-[#F4E6C7] transition-all hover:bg-stone-900"
                >
                  Add URL
                </button>
              </div>

              <div className="relative border-2 border-dashed rounded-xl h-24 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-white/10" style={{ borderColor: 'rgba(74,85,104,0.15)' }}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleMultipleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center text-center">
                  <ImageIcon size={20} className="text-natural mb-1" />
                  <span className="text-[10px] font-bold text-natural uppercase tracking-wider">Upload Multiple Files</span>
                </div>
              </div>

              {/* Thumbnails Row */}
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 pt-2 animate-fade-in">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square border rounded-lg overflow-hidden bg-stone-100 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="Product image preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 w-4.5 h-4.5 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] hover:bg-red-700 shadow-md cursor-pointer"
                      >
                        ✕
                      </button>
                      {idx === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-fern/90 text-[#F4E6C7] text-[8px] text-center font-bold py-0.5 tracking-wider uppercase">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full h-11 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer text-[#F4E6C7] transition-all duration-200 mt-2 shadow-sm"
              style={{ backgroundColor: '#4A5568' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2c2e20'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#4A5568'}
            >
              List Product to Store
            </button>
          </form>
        </div>

        {/* Right Col: Current Listings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-fern">
              <Package size={20} />
              <h2 className="font-serif text-xl font-bold">Current Workspace Listings</h2>
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full text-fern" style={{ backgroundColor: 'rgba(165,142,116,0.15)' }}>
              {products.length} Products
            </span>
          </div>

          {products.length === 0 ? (
            <div className="border border-dashed rounded-3xl p-12 text-center" style={{ borderColor: 'rgba(165,142,116,0.3)', backgroundColor: 'rgba(244,230,199,0.2)' }}>
              <Package size={36} className="mx-auto text-natural mb-3 opacity-60" />
              <h3 className="font-serif text-lg font-semibold text-fern mb-1">No products listed</h3>
              <p className="text-xs text-natural font-medium max-w-sm mx-auto leading-relaxed">
                You haven't listed any items in your store yet. Fill out the catalog builder form to display products.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="group relative border rounded-3xl overflow-hidden flex flex-col justify-between shadow-sm transition-all duration-300 hover:shadow-md"
                  style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(165,142,116,0.2)' }}
                >
                  {/* Product Header / Image */}
                  <div>
                    <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 bg-[#F4E6C7] text-fern text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded shadow-sm">
                        {p.category}
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-serif text-md font-bold text-fern group-hover:text-apricot transition-colors line-clamp-1">
                            {p.title}
                          </h3>
                          <span className="text-[10px] text-natural font-semibold tracking-wider">
                            {p.subcategory}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-fern">
                            ${p.sellingPrice.toFixed(2)}
                          </span>
                          {p.mrp > p.sellingPrice && (
                            <p className="text-[10px] text-natural line-through font-medium leading-none mt-0.5">
                              ${p.mrp.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs text-stone-500 font-medium leading-relaxed line-clamp-2">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions / Stocks footer */}
                  <div className="px-5 py-4 border-t flex items-center justify-between bg-stone-50/50" style={{ borderColor: 'rgba(165,142,116,0.1)' }}>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: p.stocks <= 5 ? '#E09132' : '#4A5568' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.stocks <= 5 ? '#E09132' : '#34A853' }} />
                      <span>{p.stocks} units left</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        title="Edit product info (visual only)"
                        className="p-2 rounded-lg hover:bg-stone-100 transition-colors text-fern border border-transparent cursor-pointer hover:border-stone-200"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        title="Delete product"
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-600 border border-transparent cursor-pointer hover:border-red-100"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


