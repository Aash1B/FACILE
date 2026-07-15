"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Check, ShieldCheck } from "lucide-react";
import { InputField } from "@/components/ui/InputField";
import { useAuth } from "@/context/AuthContext";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { verifyOtp, resendOtp } = useAuth();

  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email address is required");
      return;
    }
    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter a valid 6-digit OTP code");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const success = await verifyOtp(email, otpCode);
      if (success) {
        setShowSuccessToast(true);
        setTimeout(() => {
          router.push("/profile");
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "OTP verification failed. Please check the code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Please enter your email to resend verification code");
      return;
    }
    setIsResending(true);
    setResendSuccess(false);
    setError("");
    try {
      await resendOtp(email);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 4000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to resend verification code.");
    } finally {
      setIsResending(false);
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
          <span>Account verified! Redirecting... 🛍️</span>
        </div>
      )}

      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-fern">
          Verify Account
        </h1>
        <p className="text-xs text-natural font-medium">
          Enter your email and the 6-digit OTP code sent to your inbox.
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
            if (error) setError("");
          }}
          disabled={isSubmitting}
          required
        />

        <InputField
          label="Verification Code (OTP)"
          type="text"
          placeholder="123456"
          maxLength={6}
          value={otpCode}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            setOtpCode(val);
            if (error) setError("");
          }}
          disabled={isSubmitting}
          required
        />

        {error && (
          <p className="text-xs font-bold text-apricot animate-fade-in flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-apricot" />
            {error}
          </p>
        )}

        {resendSuccess && (
          <p className="text-xs font-semibold animate-fade-in text-fern">
            ✓ A new code has been sent successfully. Check your terminal/mail!
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || showSuccessToast || otpCode.length !== 6 || !email}
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
              <ShieldCheck size={15} />
              Verify & Activate
            </>
          )}
        </button>
      </form>

      {/* Actions */}
      <div className="text-center pt-2 flex flex-col gap-2.5">
        <button
          type="button"
          disabled={isResending || isSubmitting || !email}
          onClick={handleResend}
          className="text-xs font-bold text-apricot hover:text-apricot/85 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isResending ? "Resending Code..." : "Didn't receive the code? Resend Code"}
        </button>

        <p className="text-xs text-natural font-medium">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-bold text-apricot hover:text-apricot/85 transition-colors underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
