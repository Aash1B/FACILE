"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<{ requiresVerification: boolean; email: string }>;
  verifyOtp: (email: string, otpCode: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for saved user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("facile_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user:", e);
        localStorage.removeItem("facile_user");
        localStorage.removeItem("facile_token");
        localStorage.removeItem("facile_refresh_token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8082/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Login failed. Please check your credentials.");
      }
      const data = await response.json();
      localStorage.setItem("facile_token", data.accessToken);
      localStorage.setItem("facile_refresh_token", data.refreshToken);
      const userProfile: User = { name: data.name, email: data.email };
      localStorage.setItem("facile_user", JSON.stringify(userProfile));
      setUser(userProfile);
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ requiresVerification: boolean; email: string }> => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8082/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Registration failed.");
      }
      const data = await response.json();
      if (data.requiresVerification) {
        return { requiresVerification: true, email: data.email };
      }
      
      localStorage.setItem("facile_token", data.accessToken);
      localStorage.setItem("facile_refresh_token", data.refreshToken);
      const userProfile: User = { name: data.name, email: data.email };
      localStorage.setItem("facile_user", JSON.stringify(userProfile));
      setUser(userProfile);
      return { requiresVerification: false, email: data.email };
    } catch (error: any) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otpCode: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8082/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "OTP Verification failed.");
      }
      const data = await response.json();
      localStorage.setItem("facile_token", data.accessToken);
      localStorage.setItem("facile_refresh_token", data.refreshToken);
      const userProfile: User = { name: data.name, email: data.email };
      localStorage.setItem("facile_user", JSON.stringify(userProfile));
      setUser(userProfile);
      return true;
    } catch (error: any) {
      console.error("Verification error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:8082/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to resend OTP.");
      }
      return true;
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("facile_user");
    localStorage.removeItem("facile_token");
    localStorage.removeItem("facile_refresh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
