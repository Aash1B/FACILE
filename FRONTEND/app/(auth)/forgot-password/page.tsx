"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Check, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import { InputField } from "@/components/ui/InputField";
import { PasswordField } from "@/components/ui/PasswordField";
import { useAuth } from "@/context/AuthContext";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, resetPassword } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Validation / Error states
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Password strength states
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "" });

  const checkPasswordStrength = (pass: string) => {
    if (!pass) {
      setPasswordStrength({ score: 0, label: "" });
      return;
    }
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 10) score += 1;
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumbers = /\d/.test(pass);
    const hasNonalphas = /\W/.test(pass);
    if (hasUpperCase && hasLowerCase) score += 1;
    if (hasNumbers || hasNonalphas) score += 1;
    const finalScore = Math.min(score, 4);
    let label = "Weak";
    if (finalScore === 2) label = "Fair";
    if (finalScore === 3) label = "Good";
    if (finalScore === 4) label = "Strong";
    setPasswordStrength({ score: finalScore, label });
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email address is required");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send reset code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter a valid 6-digit OTP code");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await resetPassword(email, otpCode, newPassword);
      setShowSuccessToast(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to reset password. Please verify the code.");
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
          style={{ backgroundColor: "#4a5568", color: "#faf3e3", borderColor: "#4A5568" }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#4A5568" }}
          >
            <Check size={12} style={{ color: "#4a5568" }} className="stroke-[3px]" />
          </div>
          <span>Password reset successfully! Redirecting... 🛍️</span>
        </div>
      )}

      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-fern">
          Reset Password
        </h1>
        <p className="text-xs text-natural font-medium">
          {step === 1 
            ? "Enter your email address to request a secure password recovery code."
            : `We have sent a verification code to ${email}. Enter the code and your new credentials.`}
        </p>
      </div>

      {step === 1 ? (
        /* STEP 1: Request Code */
        <form onSubmit={handleSendOtp} className="space-y-4">
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

          {error && (
            <p className="text-xs font-bold text-apricot animate-fade-in flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-apricot" />
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !email}
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
            ) : (
              <>
                <span>Send Code</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>
      ) : (
        /* STEP 2: Input Code & New Password */
        <form onSubmit={handleReset} className="space-y-4">
          <InputField
            label="Verification Code"
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

          <PasswordField
            label="New Password"
            placeholder="••••••••••••"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              checkPasswordStrength(e.target.value);
              if (error) setError("");
            }}
            showStrengthMeter={true}
            strengthScore={passwordStrength.score}
            strengthLabel={passwordStrength.label}
            disabled={isSubmitting}
            required
          />

          <PasswordField
            label="Confirm New Password"
            placeholder="••••••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
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

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || showSuccessToast || otpCode.length !== 6 || newPassword.length < 8 || newPassword !== confirmPassword}
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
            ) : (
              <>
                <ShieldCheck size={15} />
                Reset Password
              </>
            )}
          </button>
        </form>
      )}

      {/* Footer link */}
      <div className="text-center pt-2">
        <p className="text-xs text-natural font-medium">
          Remember your credentials?{" "}
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
