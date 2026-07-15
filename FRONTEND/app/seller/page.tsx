"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Package, Trash2, Edit3, Image as ImageIcon, Sparkles, Check, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop"
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
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=300&auto=format&fit=crop"
  }
];

const CATEGORIES = [
  "Conscious Apparel",
  "Ceramics & Pottery",
  "Home Accents",
  "Workspace Essentials"
];

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Redirect if not logged in or not a seller
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "SELLER")) {
      router.push("/seller/login");
    }
  }, [user, isLoading, router]);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mrp, setMrp] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subcategory, setSubcategory] = useState("");
  const [stocks, setStocks] = useState("");
  const [image, setImage] = useState("");
  
  // Custom mock image preview helper
  const [imageFilePreview, setImageFilePreview] = useState<string | null>(null);

  // Listing states
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [formError, setFormError] = useState("");

  const handleMockImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFilePreview(reader.result as string);
        setImage(""); // Reset string URL if file is chosen
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title || !description || !mrp || !sellingPrice || !stocks) {
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

    const imageSource = imageFilePreview || image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300&auto=format&fit=crop";

    const newProduct: Product = {
      id: "p_" + Math.random().toString(36).substr(2, 9),
      title,
      description,
      mrp: mrpNum,
      sellingPrice: priceNum,
      category,
      subcategory: subcategory || "General",
      stocks: stockNum,
      image: imageSource
    };

    setProducts([newProduct, ...products]);
    setShowSuccessToast(true);

    // Reset Form
    setTitle("");
    setDescription("");
    setMrp("");
    setSellingPrice("");
    setCategory(CATEGORIES[0]);
    setSubcategory("");
    setStocks("");
    setImage("");
    setImageFilePreview(null);

    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]" style={{ color: '#424530' }}>
        <div className="w-10 h-10 border-4 rounded-full animate-spin mb-4" style={{ borderColor: '#424530', borderTopColor: 'transparent' }} />
        <span className="text-sm font-semibold tracking-wider uppercase opacity-80">
          Loading Workspace...
        </span>
      </div>
    );
  }

  // Double check credentials
  if (!user || user.role !== "SELLER") {
    return null;
  }

  return (
    <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div
          className="fixed bottom-6 right-6 z-50 py-3.5 px-5 rounded-2xl flex items-center gap-2.5 border animate-slide-in text-xs font-semibold shadow-xl"
          style={{ backgroundColor: "#424530", color: "#F4E6C7", borderColor: "#A58E74" }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#E09132" }}
          >
            <Check size={12} style={{ color: "#424530" }} className="stroke-[3px]" />
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
                style={{ borderColor: 'rgba(66,69,48,0.2)', color: '#424530' }}
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
                style={{ borderColor: 'rgba(66,69,48,0.2)', color: '#424530' }}
                required
              />
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold tracking-wider uppercase text-fern">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-2 text-xs font-semibold rounded-xl border bg-transparent outline-none cursor-pointer"
                  style={{ borderColor: 'rgba(66,69,48,0.2)', color: '#424530' }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-[#F4E6C7]">{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold tracking-wider uppercase text-fern">
                  Subcategory
                </label>
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="e.g. Tableware"
                  className="w-full h-10 px-3.5 text-xs font-medium rounded-xl border bg-transparent transition-all outline-none"
                  style={{ borderColor: 'rgba(66,69,48,0.2)', color: '#424530' }}
                />
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
                    style={{ borderColor: 'rgba(66,69,48,0.2)', color: '#424530' }}
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
                    style={{ borderColor: 'rgba(66,69,48,0.2)', color: '#424530' }}
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
                style={{ borderColor: 'rgba(66,69,48,0.2)', color: '#424530' }}
                required
              />
            </div>

            {/* Premium Image Uploader visual mock */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold tracking-wider uppercase text-fern">
                Product Image
              </label>
              
              <div className="grid grid-cols-1 gap-2.5">
                <input
                  type="text"
                  value={image}
                  onChange={(e) => {
                    setImage(e.target.value);
                    setImageFilePreview(null); // Reset file if URL is written
                  }}
                  placeholder="https://image-url.com/file.jpg"
                  className="w-full h-9 px-3.5 text-[11px] font-medium rounded-xl border bg-transparent outline-none"
                  style={{ borderColor: 'rgba(66,69,48,0.2)', color: '#424530' }}
                />

                <div className="relative border-2 border-dashed rounded-xl h-24 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-white/10" style={{ borderColor: 'rgba(66,69,48,0.15)' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMockImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {imageFilePreview ? (
                    <div className="relative w-full h-full p-2 flex items-center justify-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageFilePreview} alt="Preview" className="h-full max-w-[80px] rounded object-cover" />
                      <span className="text-[10px] font-semibold text-fern">Image Selected</span>
                    </div>
                  ) : (
                    <>
                      <ImageIcon size={20} className="text-natural mb-1" />
                      <span className="text-[10px] font-bold text-natural uppercase tracking-wider">Drag & Drop or Browse</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full h-11 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer text-[#F4E6C7] transition-all duration-200 mt-2 shadow-sm"
              style={{ backgroundColor: '#424530' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2c2e20'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#424530'}
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
                    <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: p.stocks <= 5 ? '#E09132' : '#424530' }}>
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
