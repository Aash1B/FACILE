"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Check, UserPlus } from "lucide-react";
import { InputField } from "@/components/ui/InputField";
import { PasswordField } from "@/components/ui/PasswordField";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Password strength states
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
  });

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

    // Check length
    if (pass.length >= 8) score += 1;
    if (pass.length >= 10) score += 1;

    // Check complexity
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumbers = /\d/.test(pass);
    const hasNonalphas = /\W/.test(pass);

    if (hasUpperCase && hasLowerCase) score += 1;
    if (hasNumbers || hasNonalphas) score += 1;

    // Normalize score to max of 4
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

    // Trigger full validation
    const nameErr = !name ? "Full name is required" : name.length < 2 ? "Name must be at least 2 characters" : "";
    const emailErr = validateEmail(email);
    const passwordErr = !password ? "Password is required" : password.length < 8 ? "Password must be at least 8 characters" : "";
    const confirmErr = !confirmPassword ? "Please confirm your password" : confirmPassword !== password ? "Passwords do not match" : "";
    const termsErr = !acceptTerms ? "You must accept the terms & conditions" : "";

    if (nameErr || emailErr || passwordErr || confirmErr || termsErr) {
      setErrors({
        name: nameErr,
        email: emailErr,
        password: passwordErr,
        confirmPassword: confirmErr,
        acceptTerms: termsErr,
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const success = await register(name, email);
      if (success) {
        setShowSuccessToast(true);
        setTimeout(() => {
          router.push("/");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setErrors({ email: "Email is already registered." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-5 animate-fade-in relative">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-fern text-warm-ivory py-3.5 px-5 rounded-2xl shadow-xl flex items-center gap-2.5 border border-natural/20 animate-slide-in text-xs font-semibold">
          <div className="w-5 h-5 rounded-full bg-apricot flex items-center justify-center">
            <Check size={12} className="text-warm-ivory stroke-[3px]" />
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
          <label className="flex items-start gap-2 text-xs font-bold text-natural hover:text-fern select-none cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => {
                setAcceptTerms(e.target.checked);
                if (errors.acceptTerms) setErrors({ ...errors, acceptTerms: "" });
              }}
              onBlur={() => handleBlur("acceptTerms")}
              className="mt-0.5 w-4 h-4 rounded border-natural/30 text-fern focus:ring-fern focus:ring-offset-warm-ivory accent-fern cursor-pointer"
            />
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
          className="w-full h-11 bg-fern hover:bg-fern/90 active:scale-98 text-warm-ivory font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-warm-ivory border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <UserPlus size={15} />
              Register Account
            </>
          )}
        </button>
      </form>

      {/* Footer Link */}
      <div className="text-center pt-2 border-t border-natural/15">
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
