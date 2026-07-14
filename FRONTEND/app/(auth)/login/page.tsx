"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Check, LogIn } from "lucide-react";
import { InputField } from "@/components/ui/InputField";
import { PasswordField } from "@/components/ui/PasswordField";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trigger full validation
    const emailErr = validateEmail(email);
    const passwordErr = password ? "" : "Password is required";

    if (emailErr || passwordErr) {
      setErrors({ email: emailErr, password: passwordErr });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const success = await login(email, password);
      if (success) {
        setShowSuccessToast(true);
        setTimeout(() => { router.push("/"); }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      setErrors({ email: err.message || "Invalid credentials. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in relative">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div
          className="fixed bottom-6 right-6 z-50 py-3.5 px-5 rounded-2xl flex items-center gap-2.5 border animate-slide-in text-xs font-semibold"
          style={{ backgroundColor: "#4a5568", color: "#faf3e3", borderColor: "#738290" }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#738290" }}
          >
            <Check size={12} style={{ color: "#4a5568" }} className="stroke-[3px]" />
          </div>
          <span>Signed in successfully! Redirecting... 🛍️</span>
        </div>
      )}

      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-fern">
          Welcome Back
        </h1>
        <p className="text-xs text-natural font-medium">
          Sign in to your account to continue shopping.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Email Address"
          type="email"
          placeholder="yourname@example.com"
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
              className="text-xs font-bold transition-colors"
              style={{ color: '#e8a1c4' }}
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || showSuccessToast}
          className="w-full h-11 active:scale-98 font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#c9d7f0', color: '#4a5568' }}
          onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = '#a1b5d8'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#c9d7f0'; }}
        >
          {isSubmitting ? (
            <div
              className="w-5 h-5 border-2 rounded-full animate-spin"
              style={{ borderColor: '#4a5568', borderTopColor: 'transparent' }}
            />
          ) : (
            <>
              <LogIn size={15} />
              Sign In
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{ borderColor: "rgba(74,85,104,0.2)" }}></div>
        </div>
        <span
          className="relative px-3 text-[10px] font-bold tracking-widest uppercase"
          style={{ color: "#4a5568", backgroundColor: "#faf3e3" }}
        >
          Or continue with
        </span>
      </div>

      {/* Social / Guest Button */}
      <button
        type="button"
        disabled={isSubmitting || showSuccessToast}
        className="w-full h-11 font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#c9d7f0', color: '#4a5568', borderColor: 'rgba(74,85,104,0.25)' }}
        onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = '#a1b5d8'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#c9d7f0'; }}
        onClick={async () => {
          setIsSubmitting(true);
          try {
            await login("guest@example.com", "guestpassword123");
            setShowSuccessToast(true);
            setTimeout(() => router.push("/"), 1500);
          } catch (e) {
            try {
              await register("Guest User", "guest@example.com", "guestpassword123");
              setShowSuccessToast(true);
              setTimeout(() => router.push("/"), 1500);
            } catch (regErr: any) {
              console.error(regErr);
              setIsSubmitting(false);
              setErrors({ email: "Failed to authenticate Guest. " + (regErr.message || "") });
            }
          }
        }}
      >
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Sign in with Google
      </button>

      {/* Footer Link */}
      <div className="text-center pt-2">
        <p className="text-xs text-natural font-medium">
          New to Facile?{" "}
          <Link
            href="/register"
            className="font-bold text-apricot hover:text-apricot/85 transition-colors underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
