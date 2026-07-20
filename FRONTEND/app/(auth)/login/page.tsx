"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Check, LogIn, ShieldAlert } from "lucide-react";
import { InputField } from "@/components/ui/InputField";
import { PasswordField } from "@/components/ui/PasswordField";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, verifyMfa } = useAuth();

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
      const result = await login(email, password);
      if (typeof result === "object" && result.requiresMfa) {
        setMfaToken(result.mfaToken || "");
        setIsMfaPending(true);
      } else if (result) {
        setShowSuccessToast(true);
        setTimeout(() => { router.push("/profile"); }, 1500);
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
        setShowSuccessToast(true);
        setTimeout(() => { router.push("/profile"); }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      setMfaError(err.message || "Invalid 2FA code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleGoogleCredentialResponse = async (response: any) => {
      setIsSubmitting(true);
      try {
        await loginWithGoogle(response.credential);
        setShowSuccessToast(true);
        setTimeout(() => router.push("/profile"), 1500);
      } catch (e: any) {
        setIsSubmitting(false);
        setErrors({ email: e.message || "Google sign-in failed." });
      }
    };

    const initializeGoogle = () => {
      if (typeof window !== "undefined" && (window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "121404179374-e8b82qes4l6n15r2j0973m08o6qjtf7s.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: 280, type: "standard", shape: "rectangular", text: "signin_with", logo_alignment: "left" }
        );
      }
    };

    const timer = setInterval(() => {
      if (typeof window !== "undefined" && (window as any).google) {
        initializeGoogle();
        clearInterval(timer);
      }
    }, 300);

    return () => clearInterval(timer);
  }, [loginWithGoogle, router]);

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
            style={{ backgroundColor: '#c9d7f0', color: '#4a5568' }}
            onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = '#a1b5d8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#c9d7f0'; }}
          >
            {isSubmitting ? (
              <div
                className="w-5 h-5 border-2 rounded-full animate-spin"
                style={{ borderColor: '#4a5568', borderTopColor: 'transparent' }}
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
    <div className="w-full space-y-8 animate-fade-in relative">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div
          className="fixed bottom-6 right-6 z-50 py-3.5 px-5 rounded-2xl flex items-center gap-2.5 border animate-slide-in text-xs font-semibold"
          style={{ backgroundColor: "#4a5568", color: "#faf3e3", borderColor: "#4A5568" }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#4A5568" }}
          >
            <Check size={12} style={{ color: "#4a5568" }} className="stroke-[3px]" />
          </div>
          <span>Signed in successfully! Redirecting... 🛍️</span>
        </div>
      )}

      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-serif text-[34px] font-bold tracking-tight text-fern">
          Welcome Back
        </h1>
        <p className="text-sm text-natural font-medium">
          Sign in to your account to continue shopping.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 [&_label]:text-sm [&_input:not([type=checkbox])]:h-12 [&_input:not([type=checkbox])]:text-sm [&_svg]:h-5 [&_svg]:w-5">
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
            <label className="flex items-center gap-2.5 text-sm font-bold text-natural hover:text-fern select-none cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-natural/30 text-[#5271FF] focus:ring-[#5271FF] focus:ring-offset-warm-ivory accent-[#5271FF] cursor-pointer"
              />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-bold transition-colors text-apricot hover:text-apricot/85"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || showSuccessToast}
          className="w-full h-12 active:scale-98 font-bold text-sm uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
              <LogIn size={20} />
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
          className="relative px-4 text-xs font-bold tracking-widest uppercase"
          style={{ color: "#4a5568", backgroundColor: "#faf3e3" }}
        >
          Or continue with
        </span>
      </div>

      {/* Google Login Button */}
      <div id="google-signin-btn" className="w-full flex justify-center min-h-[48px]"></div>

      {/* Footer Link */}
      <div className="text-center pt-2 lg:fixed lg:right-0 lg:w-1/2" style={{ bottom: "112px" }}>
        <p className="text-sm text-natural font-medium">
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
