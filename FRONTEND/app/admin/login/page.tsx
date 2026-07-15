"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Check, LogIn, ShieldAlert, KeyRound } from "lucide-react";
import { InputField } from "@/components/ui/InputField";
import { PasswordField } from "@/components/ui/PasswordField";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, verifyMfa, logout } = useAuth();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // MFA Challenge states
  const [isMfaPending, setIsMfaPending] = useState(false);
  const [mfaToken, setMfaToken] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaError, setMfaError] = useState("");

  // Validation / Error states
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Email format validation helper
  const validateEmail = (val: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) return "Email address is required";
    if (!emailRegex.test(val)) return "Please enter a valid email address";
    return "";
  };

  const handleBlur = (field: "email" | "password") => {
    const newErrors = { ...errors };
    if (field === "email") {
      const emailErr = validateEmail(email);
      if (emailErr) newErrors.email = emailErr;
      else delete newErrors.email;
    } else if (field === "password") {
      if (!password) newErrors.password = "Password is required";
      else delete newErrors.password;
    }
    setErrors(newErrors);
  };

  const verifyRoleAndRedirect = async (userProfile: any) => {
    // If the logged in user is not an ADMIN, block access
    if (!userProfile || userProfile.role !== "ADMIN") {
      await logout();
      throw new Error("Access restricted. This portal is only for company administrators.");
    }
    
    setShowSuccessToast(true);
    setTimeout(() => {
      router.push("/admin");
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    const passwordErr = password ? "" : "Password is required";

    if (emailErr || passwordErr) {
      setErrors({ email: emailErr, password: passwordErr });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (typeof result === "object" && result.requiresMfa) {
        setMfaToken(result.mfaToken || "");
        setIsMfaPending(true);
      } else if (result) {
        // Fetch fresh profile from local storage to verify role
        const rawUser = localStorage.getItem("facile_user");
        const userProfile = rawUser ? JSON.parse(rawUser) : null;
        await verifyRoleAndRedirect(userProfile);
      }
    } catch (err: any) {
      console.error(err);
      setErrors({ email: err.message || "Invalid credentials. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaCode || mfaCode.length !== 6) {
      setMfaError("Please enter a valid 6-digit code");
      return;
    }
    setMfaError("");
    setIsSubmitting(true);

    try {
      const success = await verifyMfa(mfaToken, mfaCode);
      if (success) {
        const rawUser = localStorage.getItem("facile_user");
        const userProfile = rawUser ? JSON.parse(rawUser) : null;
        await verifyRoleAndRedirect(userProfile);
      }
    } catch (err: any) {
      console.error(err);
      setMfaError(err.message || "Invalid 2FA code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── MFA Challenge Screen ────────────────────────────────────────── */
  if (isMfaPending) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#F4E6C7' }}>
        <div className="w-full max-w-md p-8 border rounded-3xl bg-white/70 backdrop-blur shadow-sm space-y-6 animate-fade-in relative" style={{ borderColor: 'rgba(165,142,116,0.25)' }}>
          {/* Header */}
          <div className="space-y-1">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-fern flex items-center gap-2">
              <ShieldAlert size={26} className="text-apricot animate-pulse" />
              Admin 2FA
            </h1>
            <p className="text-xs text-natural font-medium">
              Enter the 6-digit verification code from your administrator authenticator.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleVerifyMfa} className="space-y-4">
            <InputField
              label="Verification Code"
              type="text"
              placeholder="123456"
              maxLength={6}
              value={mfaCode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setMfaCode(val);
                if (mfaError) setMfaError("");
              }}
              error={mfaError}
              disabled={isSubmitting}
              required
            />

            <button
              type="submit"
              disabled={isSubmitting || mfaCode.length !== 6}
              className="w-full h-11 active:scale-98 font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: '#4A5568', color: '#F4E6C7' }}
            >
              {isSubmitting ? (
                <div
                  className="w-5 h-5 border-2 rounded-full animate-spin"
                  style={{ borderColor: '#F4E6C7', borderTopColor: 'transparent' }}
                />
              ) : "Verify & Sign In"}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => setIsMfaPending(false)}
              className="text-xs font-semibold text-natural hover:text-fern transition-colors cursor-pointer"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Standard Login Screen ───────────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col justify-between p-6 sm:p-12 md:p-16 relative" style={{ backgroundColor: '#F4E6C7' }}>
      {/* Top bar with back-to-store link */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors duration-200 group"
          style={{ color: '#4A5568' }}
        >
          <ShieldAlert size={14} className="transition-transform group-hover:scale-110" />
          Facile Main Shop
        </Link>
        
        <div>
          <span className="font-serif text-2xl font-bold tracking-[0.08em]" style={{ color: '#4A5568' }}>
            facile
          </span>
        </div>
      </div>

      {/* Center Form Content */}
      <div className="my-auto py-10 sm:max-w-md sm:w-full sm:mx-auto">
        <div className="w-full p-8 border rounded-3xl bg-white/70 backdrop-blur shadow-sm space-y-6 relative" style={{ borderColor: 'rgba(165,142,116,0.25)' }}>
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
              <span>Admin Authentication Success! Redirecting... 💼</span>
            </div>
          )}

          {/* Header */}
          <div className="space-y-1">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-fern flex items-center gap-2">
              <KeyRound size={24} className="text-apricot" />
              Admin Portal
            </h1>
            <p className="text-xs text-natural font-medium">
              Enterprise credentials required. Unauthorized access will be audited.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Admin Email Address"
              type="email"
              placeholder="admin@facile.com"
              icon={Mail}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              onBlur={() => handleBlur("email")}
              error={errors.email}
              disabled={isSubmitting}
              required
            />

            <div className="space-y-1">
              <PasswordField
                label="Admin Password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                onBlur={() => handleBlur("password")}
                error={errors.password}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || showSuccessToast}
              className="w-full h-11 active:scale-98 font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              style={{ backgroundColor: '#4A5568', color: '#F4E6C7' }}
              onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = '#2c2e20'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#4A5568'; }}
            >
              {isSubmitting ? (
                <div
                  className="w-5 h-5 border-2 rounded-full animate-spin"
                  style={{ borderColor: '#F4E6C7', borderTopColor: 'transparent' }}
                />
              ) : (
                <>
                  <LogIn size={15} />
                  Authorize Access
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-[10px] font-bold uppercase tracking-wider opacity-50" style={{ color: '#4A5568' }}>
        © {new Date().getFullYear()} FACILE CORP SECURITY • SECURE ACCESS CONTROL
      </div>
    </div>
  );
}

