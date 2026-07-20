"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

interface User {
  id?: number;
  name: string;
  email: string;
  role?: string;
  mfaEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ requiresMfa: boolean; mfaToken?: string } | boolean>;
  loginWithGoogle: (idToken: string) => Promise<boolean>;
  verifyMfa: (mfaToken: string, code: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: string) => Promise<{ requiresVerification: boolean; email: string }>;
  verifyOtp: (email: string, otpCode: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  logout: () => void;
  setupMfa: () => Promise<{ secret: string; qrCodeUrl: string }>;
  enableMfa: (code: string) => Promise<boolean>;
  disableMfa: () => Promise<boolean>;
  getSessions: () => Promise<any[]>;
  revokeSession: (id: number) => Promise<boolean>;
  getAuditLogs: () => Promise<any[]>;
  deleteAccount: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to set session details in storage & cookies
const setAuthSession = (token: string, refreshToken: string, userProfile: User) => {
  localStorage.setItem("facile_token", token);
  localStorage.setItem("facile_refresh_token", refreshToken);
  localStorage.setItem("facile_user", JSON.stringify(userProfile));
  
  if (typeof window !== "undefined") {
    // Expiration set to 7 days to match refresh token
    document.cookie = `facile_token=${token}; path=/; max-age=604800; SameSite=Lax`;
  }
};

// Helper to clear session details from storage & cookies
const clearAuthSession = () => {
  localStorage.removeItem("facile_token");
  localStorage.removeItem("facile_refresh_token");
  localStorage.removeItem("facile_user");
  
  if (typeof window !== "undefined") {
    document.cookie = "facile_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for active session verification on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("facile_token");
      if (token) {
        try {
          const response = await api.get("/api/auth/me");
          setUser(response.data);
        } catch (e: any) {
          console.error("Session verification failed:", e?.message || e);
          clearAuthSession();
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<{ requiresMfa: boolean; mfaToken?: string } | boolean> => {
    setIsLoading(true);
    try {
      const response = await api.post("/api/auth/login", { email, password });
      const data = response.data;
      
      if (data.requiresMfa) {
        setIsLoading(false);
        return { requiresMfa: true, mfaToken: data.mfaToken };
      }

      const userProfile: User = { name: data.name, email: data.email, role: data.role };
      setAuthSession(data.accessToken, data.refreshToken, userProfile);
      setUser(userProfile);
      return true;
    } catch (error: any) {
      console.error("Login error:", error?.message || error);
      throw new Error(error.response?.data?.error || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (idToken: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.post("/api/auth/google", { idToken });
      const data = response.data;
      const userProfile: User = { name: data.name, email: data.email, role: data.role };
      setAuthSession(data.accessToken, data.refreshToken, userProfile);
      setUser(userProfile);
      return true;
    } catch (error: any) {
      const message = error.response?.data?.error
        || error.response?.data?.message
        || (error.code === "ERR_NETWORK" ? "Authentication service is unavailable." : null)
        || "Google sign in failed.";
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMfa = async (mfaToken: string, code: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.post("/api/auth/mfa/verify", { mfaToken, code });
      const data = response.data;
      const userProfile: User = { name: data.name, email: data.email, role: data.role };
      setAuthSession(data.accessToken, data.refreshToken, userProfile);
      setUser(userProfile);
      return true;
    } catch (error: any) {
      console.error("MFA Verify error:", error?.message || error);
      throw new Error(error.response?.data?.error || "Invalid 2FA code.");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role?: string): Promise<{ requiresVerification: boolean; email: string }> => {
    setIsLoading(true);
    try {
      const response = await api.post("/api/auth/register", { name, email, password, role });
      const data = response.data;
      if (data.requiresVerification) {
        return { requiresVerification: true, email: data.email };
      }
      
      const userProfile: User = { name: data.name, email: data.email, role: data.role };
      setAuthSession(data.accessToken, data.refreshToken, userProfile);
      setUser(userProfile);
      return { requiresVerification: false, email: data.email };
    } catch (error: any) {
      console.error("Registration error:", error?.message || error);
      throw new Error(error.response?.data?.error || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otpCode: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.post("/api/auth/verify-otp", { email, otpCode });
      const data = response.data;
      const userProfile: User = { name: data.name, email: data.email, role: data.role };
      setAuthSession(data.accessToken, data.refreshToken, userProfile);
      setUser(userProfile);
      return true;
    } catch (error: any) {
      console.error("Verification error:", error?.message || error);
      throw new Error(error.response?.data?.error || "OTP Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string): Promise<boolean> => {
    try {
      await api.post("/api/auth/resend-otp", { email });
      return true;
    } catch (error: any) {
      console.error("Resend OTP error:", error?.message || error);
      throw new Error(error.response?.data?.error || "Failed to resend OTP.");
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      await api.post("/api/auth/forgot-password", { email });
      return true;
    } catch (error: any) {
      console.error("Forgot password error:", error?.message || error);
      throw new Error(error.response?.data?.error || "Failed to request recovery code.");
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await api.post("/api/auth/reset-password", { token, newPassword });
      const data = response.data;
      const userProfile: User = { name: data.name, email: data.email, role: data.role };
      setAuthSession(data.accessToken, data.refreshToken, userProfile);
      setUser(userProfile);
      return true;
    } catch (error: any) {
      console.error("Reset password error:", error?.message || error);
      throw new Error(error.response?.data?.error || "Failed to reset password.");
    }
  };

  const logout = () => {
    // Optionally call backend /logout if you want to invalidate refresh token
    api.post("/api/auth/logout", { refreshToken: localStorage.getItem("facile_refresh_token") }).catch(() => {});
    clearAuthSession();
    setUser(null);
  };

  const deleteAccount = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      await api.delete("/api/auth/me");
      clearAuthSession();
      setUser(null);
      return true;
    } catch (error: any) {
      console.error("Delete account error:", error?.message || error);
      throw new Error(error.response?.data?.error || "Failed to delete account.");
    } finally {
      setIsLoading(false);
    }
  };

  const setupMfa = async (): Promise<{ secret: string; qrCodeUrl: string }> => {
    try {
      const response = await api.post("/api/auth/mfa/setup");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to setup 2FA.");
    }
  };

  const enableMfa = async (code: string): Promise<boolean> => {
    try {
      await api.post("/api/auth/mfa/enable", { code });
      if (user) {
        setUser({ ...user, mfaEnabled: true });
        localStorage.setItem("facile_user", JSON.stringify({ ...user, mfaEnabled: true }));
      }
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to enable 2FA.");
    }
  };

  const disableMfa = async (): Promise<boolean> => {
    try {
      await api.post("/api/auth/mfa/disable");
      if (user) {
        setUser({ ...user, mfaEnabled: false });
        localStorage.setItem("facile_user", JSON.stringify({ ...user, mfaEnabled: false }));
      }
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to disable 2FA.");
    }
  };

  const getSessions = async (): Promise<any[]> => {
    try {
      const response = await api.get("/api/auth/sessions");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to load active sessions.");
    }
  };

  const revokeSession = async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/api/auth/sessions/${id}`);
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to revoke session.");
    }
  };

  const getAuditLogs = async (): Promise<any[]> => {
    try {
      const response = await api.get("/api/auth/audit-logs");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to load audit logs.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        verifyMfa,
        register,
        verifyOtp,
        resendOtp,
        forgotPassword,
        resetPassword,
        logout,
        deleteAccount,
        setupMfa,
        enableMfa,
        disableMfa,
        getSessions,
        revokeSession,
        getAuditLogs,
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
