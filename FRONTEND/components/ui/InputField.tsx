"use client";

import React, { InputHTMLAttributes } from "react";
import { LucideIcon } from "lucide-react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: LucideIcon;
  helperText?: string;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, icon: Icon, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

    return (
      <div className="w-full space-y-1.5 font-sans">
        <label
          htmlFor={inputId}
          className="block text-xs font-bold uppercase tracking-wider text-fern/80"
        >
          {label}
        </label>
        
        <div className="relative group">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-natural/70 group-focus-within:text-apricot transition-colors duration-200">
              <Icon size={18} className="stroke-[2px]" />
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full h-11 bg-white/70 border rounded-xl text-sm font-semibold text-fern
              transition-all duration-300 placeholder:text-natural/50 focus:outline-none focus:bg-white
              ${Icon ? "pl-11 pr-4" : "px-4"}
              ${
                error
                  ? "border-apricot focus:border-apricot focus:ring-2 focus:ring-apricot/20"
                  : "border-natural/30 focus:border-fern focus:ring-2 focus:ring-fern/10"
              }
              ${className}
            `}
            {...props}
          />
        </div>

        {error ? (
          <p className="text-[11px] font-bold text-apricot animate-fade-in flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-apricot" />
            {error}
          </p>
        ) : helperText ? (
          <p className="text-[10px] font-medium text-natural/80">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

InputField.displayName = "InputField";
