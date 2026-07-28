"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Ruler, Info, ChevronDown, ChevronUp } from "lucide-react";

/* ─── Size Data ──────────────────────────────────────────────────── */

const WOMENS_TOPS = {
  title: "Women's Tops & Dresses",
  headers: ["Size", "Bust (in)", "Waist (in)", "Hips (in)", "US", "UK", "EU"],
  rows: [
    ["XS",  "31–32", "24–25", "34–35", "0–2",  "4–6",   "32–34"],
    ["S",   "33–34", "26–27", "36–37", "4–6",  "8–10",  "36–38"],
    ["M",   "35–36", "28–29", "38–39", "8–10", "12–14", "40–42"],
    ["L",   "37–39", "30–32", "40–42", "12–14","16–18", "44–46"],
    ["XL",  "40–42", "33–35", "43–45", "16–18","20–22", "48–50"],
    ["XXL", "43–45", "36–38", "46–48", "20–22","24–26", "52–54"],
  ],
};

const MENS_TOPS = {
  title: "Men's Shirts & T-Shirts",
  headers: ["Size", "Chest (in)", "Waist (in)", "Neck (in)", "US/UK", "EU"],
  rows: [
    ["S",   "34–36", "28–30", "14–14.5", "S",  "44–46"],
    ["M",   "38–40", "32–34", "15–15.5", "M",  "48–50"],
    ["L",   "42–44", "36–38", "16–16.5", "L",  "52–54"],
    ["XL",  "46–48", "40–42", "17–17.5", "XL", "56–58"],
    ["XXL", "50–52", "44–46", "18–18.5", "XXL","60–62"],
  ],
};

const FOOTWEAR_SIZES = {
  title: "Footwear (Unisex)",
  headers: ["India/UK", "US Men", "US Women", "EU", "Foot Length (cm)"],
  rows: [
    ["5",  "6",  "7.5",  "38", "23.5"],
    ["6",  "7",  "8.5",  "39", "24.5"],
    ["7",  "8",  "9.5",  "40", "25.5"],
    ["8",  "9",  "10.5", "41", "26.5"],
    ["9",  "10", "11.5", "42", "27.5"],
    ["10", "11", "12.5", "43", "28.5"],
    ["11", "12", "13.5", "44", "29.5"],
    ["12", "13", "—",    "45", "30.5"],
  ],
};

const KIDS_SIZES = {
  title: "Kids & Baby",
  headers: ["Age", "Size", "Chest (in)", "Waist (in)", "Height (cm)"],
  rows: [
    ["0–6 mo",   "NB / 0–6M",  "16–17", "16–17", "56–68"],
    ["6–12 mo",  "6–12M",       "17–18", "17–18", "68–76"],
    ["1–2 yr",   "1–2Y",        "19–20", "19–20", "76–92"],
    ["3–4 yr",   "3–4Y",        "21–22", "20–21", "92–104"],
    ["5–6 yr",   "5–6Y",        "23–24", "21–22", "104–116"],
    ["7–8 yr",   "7–8Y",        "25–27", "22–23", "116–128"],
    ["9–10 yr",  "9–10Y",       "28–30", "23–25", "128–140"],
    ["11–12 yr", "11–12Y",      "31–33", "25–27", "140–152"],
  ],
};

const TABS = [
  { key: "women",    label: "Women's Clothing", data: WOMENS_TOPS },
  { key: "men",      label: "Men's Clothing",   data: MENS_TOPS },
  { key: "footwear", label: "Footwear",          data: FOOTWEAR_SIZES },
  { key: "kids",     label: "Kids & Baby",       data: KIDS_SIZES },
];

const MEASURE_TIPS = [
  {
    title: "Bust / Chest",
    instruction: "Wrap the tape around the fullest part of your bust or chest, keeping it level all the way around.",
  },
  {
    title: "Waist",
    instruction: "Measure around your natural waistline — the narrowest part of your torso, usually just above the belly button.",
  },
  {
    title: "Hips",
    instruction: "Stand with feet together and measure around the widest part of your hips and buttocks.",
  },
  {
    title: "Foot Length",
    instruction: "Stand on a sheet of paper, mark the heel and longest toe, then measure the distance between the marks in cm.",
  },
];

/* ─── Component ──────────────────────────────────────────────────── */

export default function SizeGuidePage() {
  const [activeTab, setActiveTab] = useState("women");
  const [expandedTip, setExpandedTip] = useState<number | null>(null);

  const activeData = TABS.find((t) => t.key === activeTab)!.data;

  return (
    <div className="bg-[#F4F4F0] text-fern font-sans min-h-screen pb-20">

      {/* Header */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#4A5568] hover:text-[#5271FF] text-sm font-extrabold transition-colors mb-6"
        >
          <ArrowLeft size={18} /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-[#5271FF]/10 text-[#5271FF]">
            <Ruler size={24} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#4A5568] tracking-tight">
            Size Guide
          </h1>
        </div>
        <p className="text-sm text-[#4A5568]/70 font-medium max-w-xl mb-8">
          Find your perfect fit. All measurements are in <strong>inches</strong> unless otherwise
          noted. If you&apos;re between sizes, we recommend sizing up for a relaxed fit.
        </p>
      </section>

      {/* Tab Bar */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer border ${
                activeTab === tab.key
                  ? "bg-[#5271FF] text-white border-[#5271FF] shadow-md"
                  : "bg-white text-[#4A5568] border-natural/20 hover:border-[#5271FF]/40 hover:text-[#5271FF]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Size Table */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div
          className="bg-white border border-natural/15 rounded-2xl overflow-hidden shadow-sm"
          style={{
            boxShadow:
              "0 4px 6px rgba(74,85,104,0.03), 0 10px 25px rgba(74,85,104,0.06), 0 20px 48px rgba(74,85,104,0.04)",
          }}
        >
          {/* Table Title */}
          <div className="px-6 py-5 border-b border-natural/10 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#4A5568]">{activeData.title}</h2>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-[#5271FF]/60">
              <Info size={12} /> Scroll horizontally on mobile
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F4F4F0]">
                  {activeData.headers.map((h, i) => (
                    <th
                      key={i}
                      className={`px-5 py-3.5 text-[11px] uppercase tracking-wider font-extrabold text-[#5271FF] ${
                        i === 0 ? "text-left sticky left-0 bg-[#F4F4F0] z-10" : "text-center"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeData.rows.map((row, ri) => (
                  <tr
                    key={ri}
                    className={`transition-colors duration-200 ${
                      ri % 2 === 0 ? "bg-white" : "bg-[#FAFAF8]"
                    } hover:bg-[#5271FF]/[0.04]`}
                  >
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={`px-5 py-3.5 text-[13px] font-semibold border-b border-natural/8 ${
                          ci === 0
                            ? "text-left text-[#5271FF] font-extrabold sticky left-0 z-10 " +
                              (ri % 2 === 0 ? "bg-white" : "bg-[#FAFAF8]")
                            : "text-center text-[#4A5568]"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How to Measure */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#4A5568] tracking-tight mb-5">
          How to Measure
        </h2>

        <div className="grid gap-3">
          {MEASURE_TIPS.map((tip, i) => {
            const isOpen = expandedTip === i;
            return (
              <button
                key={i}
                onClick={() => setExpandedTip(isOpen ? null : i)}
                className="w-full text-left bg-white border border-natural/15 rounded-xl px-5 py-4 transition-all duration-300 hover:border-[#5271FF]/30 cursor-pointer group"
                style={{
                  boxShadow: isOpen
                    ? "0 4px 12px rgba(82,113,255,0.08)"
                    : "0 1px 3px rgba(74,85,104,0.04)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#5271FF]/10 text-[#5271FF] text-xs font-extrabold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-sm font-bold text-[#4A5568] group-hover:text-[#5271FF] transition-colors">
                      {tip.title}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronUp size={16} className="text-[#5271FF]" />
                  ) : (
                    <ChevronDown size={16} className="text-[#4A5568]/40" />
                  )}
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-40 opacity-100 mt-3" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-[13px] text-[#4A5568]/80 font-medium pl-10 leading-relaxed">
                    {tip.instruction}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Pro Tips */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-gradient-to-br from-[#5271FF]/[0.06] to-[#5271FF]/[0.02] border border-[#5271FF]/15 rounded-2xl px-6 py-6">
          <h3 className="text-sm font-extrabold text-[#5271FF] uppercase tracking-wider mb-3">
            💡 Sizing Tips
          </h3>
          <ul className="space-y-2 text-[13px] text-[#4A5568] font-medium leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#5271FF] shrink-0" />
              Use a soft, flexible measuring tape — not a metal one.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#5271FF] shrink-0" />
              Wear lightweight clothing or measure directly on your body.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#5271FF] shrink-0" />
              Keep the tape snug but not tight — you should be able to slip a finger underneath.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#5271FF] shrink-0" />
              Between sizes? Size up for a comfortable, relaxed fit.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#5271FF] shrink-0" />
              Individual product pages may include specific sizing notes — check those too!
            </li>
          </ul>
        </div>
      </section>

      {/* Still need help? */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 text-center">
        <p className="text-sm text-[#4A5568]/70 font-medium">
          Still unsure about your size?{" "}
          <Link href="/#" className="text-[#5271FF] font-bold hover:underline">
            Contact our support team
          </Link>{" "}
          — we&apos;re happy to help!
        </p>
      </section>
    </div>
  );
}
