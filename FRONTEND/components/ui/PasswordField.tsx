"use client";

import React, { useState, InputHTMLAttributes } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  showStrengthMeter?: boolean;
  strengthScore?: number; // 0 to 4
  strengthLabel?: string; // Weak, Fair, Good, Strong
}

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label, error, showStrengthMeter = false, strengthScore = 0, strengthLabel = "", id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `password-${label.toLowerCase().replace(/\s+/g, "-")}`;

    const toggleVisibility = (e: React.MouseEvent) => {
      e.preventDefault();
      setShowPassword(!showPassword);
    };

    // Determine strength bar color
    const getStrengthColorClass = () => {
      switch (strengthScore) {
        case 1:
          return "bg-apricot/60"; // Weak
        case 2:
          return "bg-apricot"; // Fair
        case 3:
          return "bg-fern/60"; // Good
        case 4:
          return "bg-fern"; // Strong
        default:
          return "bg-natural/20";
      }
    };

    return (
      <div className="w-full space-y-1.5 font-sans">
        <label
          htmlFor={inputId}
          className="block text-xs font-bold uppercase tracking-wider text-fern/80"
        >
          {label}
        </label>
        
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-natural/70 group-focus-within:text-apricot transition-colors duration-200">
            <Lock size={18} className="stroke-[2px]" />
          </div>
          
          <input
            ref={ref}
            id={inputId}
            type={showPassword ? "text" : "password"}
            style={{ backgroundColor: '#F0F1FC' }}
            className={`
              w-full h-11 border rounded-xl text-sm font-semibold text-fern pl-11 pr-11
              transition-all duration-300 placeholder:text-natural/50 focus:outline-none
              ${
                error
                  ? "border-apricot focus:border-apricot focus:ring-2 focus:ring-apricot/20"
                  : "border-natural/30 focus:border-fern focus:ring-2 focus:ring-fern/10"
              }
            `}
            {...props}
          />
          
          <button
            type="button"
            onClick={toggleVisibility}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-natural/70 hover:text-fern transition-colors duration-200 focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff size={18} className="stroke-[2px]" />
            ) : (
              <Eye size={18} className="stroke-[2px]" />
            )}
          </button>
        </div>

        {/* Strength Meter */}
        {showStrengthMeter && props.value && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-natural">
              <span>Password Strength</span>
              <span className={strengthScore >= 3 ? "text-fern" : "text-apricot"}>
                {strengthLabel}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-full rounded-full transition-all duration-300 ${
                    step <= strengthScore ? getStrengthColorClass() : "bg-natural/20"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {error ? (
          <p className="text-[11px] font-bold text-apricot animate-fade-in flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-apricot" />
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

PasswordField.displayName = "PasswordField";
