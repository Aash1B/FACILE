"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Check, UserPlus } from "lucide-react";
import { InputField } from "@/components/ui/InputField";
import { PasswordField } from "@/components/ui/PasswordField";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register, verifyOtp, resendOtp, loginWithGoogle } = useAuth();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // OTP Verification states
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Password strength states
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "" });

  // Validation / Error states
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    acceptTerms?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Email format validation helper
  const validateEmail = (val: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) return "Email address is required";
    if (!emailRegex.test(val)) return "Please enter a valid email address";
    return "";
  };

  // Password strength calculator
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

  const handleBlur = (field: keyof typeof errors) => {
    const newErrors = { ...errors };
    switch (field) {
      case "name":
        if (!name) newErrors.name = "Full name is required";
        else if (name.length < 2) newErrors.name = "Name must be at least 2 characters";
        else delete newErrors.name;
        break;
      case "email":
        const emailErr = validateEmail(email);
        if (emailErr) newErrors.email = emailErr;
        else delete newErrors.email;
        break;
      case "password":
        if (!password) newErrors.password = "Password is required";
        else if (password.length < 8) newErrors.password = "Password must be at least 8 characters";
        else delete newErrors.password;
        break;
      case "confirmPassword":
        if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
        else if (confirmPassword !== password) newErrors.confirmPassword = "Passwords do not match";
        else delete newErrors.confirmPassword;
        break;
      case "acceptTerms":
        if (!acceptTerms) newErrors.acceptTerms = "You must accept the terms & conditions";
        else delete newErrors.acceptTerms;
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameErr = !name ? "Full name is required" : name.length < 2 ? "Name must be at least 2 characters" : "";
    const emailErr = validateEmail(email);
    const passwordErr = !password ? "Password is required" : password.length < 8 ? "Password must be at least 8 characters" : "";
    const confirmErr = !confirmPassword ? "Please confirm your password" : confirmPassword !== password ? "Passwords do not match" : "";
    const termsErr = !acceptTerms ? "You must accept the terms & conditions" : "";

    if (nameErr || emailErr || passwordErr || confirmErr || termsErr) {
      setErrors({ name: nameErr, email: emailErr, password: passwordErr, confirmPassword: confirmErr, acceptTerms: termsErr });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await register(name, email, password);
      if (result.requiresVerification) {
        setRegisteredEmail(result.email);
        setIsVerifyingOtp(true);
      } else {
        setShowSuccessToast(true);
        setTimeout(() => { router.push("/"); }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      setErrors({ email: err.message || "Email is already registered." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP code");
      return;
    }
    setOtpError("");
    setIsSubmitting(true);
    try {
      const success = await verifyOtp(registeredEmail, otpCode);
      if (success) {
        setShowSuccessToast(true);
        setTimeout(() => { router.push("/"); }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      setOtpError(err.message || "OTP verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setResendSuccess(false);
    setOtpError("");
    try {
      await resendOtp(registeredEmail);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setOtpError(err.message || "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
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
        console.error(e);
        setIsSubmitting(false);
        setErrors({ email: e.message || "Google registration failed." });
      }
    };

    const initializeGoogle = () => {
      if (typeof window !== "undefined" && (window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "121404179374-e8b82qes4l6n15r2j0973m08o6qjtf7s.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById("google-signup-btn"),
          { theme: "outline", size: "large", type: "standard", shape: "rectangular", text: "signup_with", logo_alignment: "left" }
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

  /* ── OTP Verification View ───────────────────────────────────────── */
  if (isVerifyingOtp) {
    return (
      <div className="w-full space-y-5 animate-fade-in relative">
        {/* Toast Notification */}
        {showSuccessToast && (
          <div
            className="fixed bottom-6 right-6 z-50 py-3.5 px-5 rounded-2xl shadow-xl flex items-center gap-2.5 border animate-slide-in text-xs font-semibold"
            style={{ backgroundColor: "#4a5568", color: "#faf3e3", borderColor: "#738290" }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#738290" }}
            >
              <Check size={12} style={{ color: "#4a5568" }} className="stroke-[3px]" />
            </div>
            <span>Verification successful! Welcome to Facile... 🛍️</span>
          </div>
        )}

        {/* Header */}
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-fern">
            Verify Your Email
          </h1>
          <p className="text-xs text-natural font-medium">
            Enter the 6-digit code sent to <strong className="text-fern">{registeredEmail}</strong>.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <InputField
            label="Verification Code"
            type="text"
            placeholder="123456"
            maxLength={6}
            value={otpCode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setOtpCode(val);
              if (otpError) setOtpError("");
            }}
            error={otpError}
            disabled={isSubmitting}
            required
          />

          {resendSuccess && (
            <p className="text-xs font-semibold animate-fade-in" style={{ color: "#4a5568" }}>
              ✓ A new code has been sent successfully. Check your terminal/mail!
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || showSuccessToast || otpCode.length !== 6}
            className="w-full h-11 active:scale-98 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#c9d7f0", color: "#4a5568" }}
            onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = "#a1b5d8"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#c9d7f0"; }}
          >
            {isSubmitting ? (
              <div
                className="w-5 h-5 border-2 rounded-full animate-spin"
                style={{ borderColor: "#4a5568", borderTopColor: "transparent" }}
              />
            ) : (
              <>
                <Check size={15} />
                Verify Code
              </>
            )}
          </button>
        </form>

        {/* Footer Actions */}
        <div className="text-center pt-4 border-t flex flex-col gap-2" style={{ borderColor: "rgba(74,85,104,0.15)" }}>
          <button
            type="button"
            disabled={isResending || isSubmitting}
            onClick={handleResendOtp}
            className="text-xs font-bold text-apricot hover:text-apricot/85 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isResending ? "Resending Code..." : "Didn't receive the code? Resend Code"}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setIsVerifyingOtp(false)}
            className="text-xs text-natural hover:text-fern transition-colors font-medium cursor-pointer"
          >
            ← Back to Register
          </button>
        </div>
      </div>
    );
  }

  /* ── Register Form View ──────────────────────────────────────────── */
  return (
    <div className="w-full space-y-5 animate-fade-in relative">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div
          className="fixed bottom-6 right-6 z-50 py-3.5 px-5 rounded-2xl shadow-xl flex items-center gap-2.5 border animate-slide-in text-xs font-semibold"
          style={{ backgroundColor: "#4a5568", color: "#faf3e3", borderColor: "#738290" }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#738290" }}
          >
            <Check size={12} style={{ color: "#4a5568" }} className="stroke-[3px]" />
          </div>
          <span>Account created! Welcome to Facile... 🛍️</span>
        </div>
      )}

      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-fern">
          Create Account
        </h1>
        <p className="text-xs text-natural font-medium">
          Sign up to save items, track orders, and checkout easily.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <InputField
          label="Full Name"
          type="text"
          placeholder="Your Name"
          icon={User}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors({ ...errors, name: "" });
          }}
          onBlur={() => handleBlur("name")}
          error={errors.name}
          disabled={isSubmitting}
          required
        />

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

        <PasswordField
          label="Password"
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            checkPasswordStrength(e.target.value);
            if (errors.password) setErrors({ ...errors, password: "" });
          }}
          onBlur={() => handleBlur("password")}
          error={errors.password}
          showStrengthMeter={true}
          strengthScore={passwordStrength.score}
          strengthLabel={passwordStrength.label}
          disabled={isSubmitting}
          required
        />

        <PasswordField
          label="Confirm Password"
          placeholder="••••••••••••"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
          }}
          onBlur={() => handleBlur("confirmPassword")}
          error={errors.confirmPassword}
          disabled={isSubmitting}
          required
        />

        {/* Terms */}
        <div className="space-y-1">
          <label className="flex items-start gap-2.5 text-xs font-bold text-natural hover:text-fern select-none cursor-pointer">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked);
                  if (errors.acceptTerms) setErrors({ ...errors, acceptTerms: "" });
                }}
                onBlur={() => handleBlur("acceptTerms")}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded flex items-center justify-center transition-all duration-300 border ${
                  acceptTerms
                    ? "border-transparent text-white"
                    : "border-natural/30 bg-transparent"
                }`}
                style={{
                  background: acceptTerms
                    ? "linear-gradient(135deg, #4285F4, #EA4335, #FBBC05, #34A853)"
                    : "transparent",
                }}
              >
                {acceptTerms && <Check size={11} className="stroke-[3.5px] text-white" />}
              </div>
            </div>
            <span className="leading-tight">
              I agree to the{" "}
              <Link href="/terms" className="text-apricot hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-apricot hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-[11px] font-bold text-apricot animate-fade-in flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-apricot" />
              {errors.acceptTerms}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || showSuccessToast}
          className="w-full h-11 active:scale-98 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#c9d7f0", color: "#4a5568" }}
          onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = "#a1b5d8"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#c9d7f0"; }}
        >
          {isSubmitting ? (
            <div
              className="w-5 h-5 border-2 rounded-full animate-spin"
              style={{ borderColor: "#4a5568", borderTopColor: "transparent" }}
            />
          ) : (
            <>
              <UserPlus size={15} />
              Register Account
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

      {/* Google Register Button */}
      <div id="google-signup-btn" className="w-full flex justify-center min-h-[44px]"></div>

      {/* Footer Link */}
      <div className="text-center pt-2 border-t" style={{ borderColor: "rgba(74,85,104,0.15)" }}>
        <p className="text-xs text-natural font-medium">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-apricot hover:text-apricot/85 transition-colors underline"
          >
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
