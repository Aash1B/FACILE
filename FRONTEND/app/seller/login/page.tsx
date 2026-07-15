"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Check, LogIn, ShieldAlert } from "lucide-react";
import { InputField } from "@/components/ui/InputField";
import { PasswordField } from "@/components/ui/PasswordField";
import { useAuth } from "@/context/AuthContext";

export default function SellerLoginPage() {
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
    // If the logged in user is not a SELLER, block access
    if (!userProfile || userProfile.role !== "SELLER") {
      await logout();
      throw new Error("Access restricted. This portal is only for registered sellers.");
    }
    
    setShowSuccessToast(true);
    setTimeout(() => {
      router.push("/seller");
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
      <div className="w-full space-y-6 animate-fade-in relative">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-fern flex items-center gap-2">
            <ShieldAlert size={26} className="text-apricot" />
            2FA Verification
          </h1>
          <p className="text-xs text-natural font-medium">
            Enter the 6-digit verification code from your authenticator app.
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
            style={{ backgroundColor: '#424530', color: '#F4E6C7' }}
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
    );
  }

  /* ── Standard Login Screen ───────────────────────────────────────── */
  return (
    <div className="w-full space-y-6 animate-fade-in relative">
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
          <span>Signed in successfully! Redirecting... 💼</span>
        </div>
      )}

      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-fern">
          Seller Portal
        </h1>
        <p className="text-xs text-natural font-medium">
          Sign in to manage your mindful store and catalog.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Email Address"
          type="email"
          placeholder="merchant@example.com"
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
            label="Password"
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

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs font-bold text-natural hover:text-fern select-none cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-natural/30 text-fern focus:ring-fern focus:ring-offset-warm-ivory accent-fern cursor-pointer"
              />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-bold transition-colors text-apricot hover:text-apricot/85"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || showSuccessToast}
          className="w-full h-11 active:scale-98 font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          style={{ backgroundColor: '#424530', color: '#F4E6C7' }}
          onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = '#2c2e20'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#424530'; }}
        >
          {isSubmitting ? (
            <div
              className="w-5 h-5 border-2 rounded-full animate-spin"
              style={{ borderColor: '#F4E6C7', borderTopColor: 'transparent' }}
            />
          ) : (
            <>
              <LogIn size={15} />
              Sign In to Dashboard
            </>
          )}
        </button>
      </form>

      {/* Footer Link */}
      <div className="text-center pt-4 border-t" style={{ borderColor: "rgba(66,69,48,0.15)" }}>
        <p className="text-xs text-natural font-medium">
          Want to sell with us?{" "}
          <Link
            href="/seller/register"
            className="font-bold text-apricot hover:text-apricot/85 transition-colors underline"
          >
            Create a merchant account
          </Link>
        </p>
      </div>
    </div>
  );
}
