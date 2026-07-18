"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string | null;
  onSelectSize: (size: string) => void;
  isShoeSize?: boolean;
  showValidation?: boolean;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizes,
  selectedSize,
  onSelectSize,
  isShoeSize,
  showValidation
}) => {
  if (!sizes || sizes.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-extrabold text-natural uppercase tracking-wider flex items-center gap-2">
          {isShoeSize ? "Size (UK)" : "Size"}
        </span>
        
        {/* Validation Message */}
        <div
          className={`flex items-center gap-1 text-[10px] font-bold text-[#E8437F] transition-opacity duration-300 ${
            showValidation ? "opacity-100" : "opacity-0"
          }`}
        >
          <AlertCircle size={12} />
          Please select a size.
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isSelected = selectedSize === size;
          return (
            <button
              key={size}
              onClick={() => onSelectSize(size)}
              className={`
                min-w-[44px] h-[38px] px-2.5 rounded-[10px] text-[11px] font-bold transition-all duration-200 
                flex items-center justify-center border focus:outline-none cursor-pointer
                ${
                  isSelected
                    ? "bg-[#4A5568] text-white border-[#4A5568] shadow-md transform scale-[1.03]"
                    : "bg-white text-[#4A5568] border-natural/25 hover:border-[#4A5568] hover:-translate-y-0.5 hover:shadow-sm hover:bg-natural/5"
                }
                ${showValidation && !isSelected && !selectedSize ? "border-[#E8437F]/50 bg-[#E8437F]/5" : ""}
              `}
              aria-label={`Select size ${size}`}
              aria-pressed={isSelected}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
};
