import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8082",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to automatically append the Bearer access token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("facile_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 token refresh rotation
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    const isPublicPath = 
      originalRequest.url && (
        originalRequest.url.includes("/api/auth/login") ||
        originalRequest.url.includes("/api/auth/register") ||
        originalRequest.url.includes("/api/auth/refresh") ||
        originalRequest.url.includes("/api/auth/verify-otp") ||
        originalRequest.url.includes("/api/auth/resend-otp") ||
        originalRequest.url.includes("/api/auth/forgot-password") ||
        originalRequest.url.includes("/api/auth/reset-password") ||
        originalRequest.url.includes("/api/auth/google") ||
        originalRequest.url.includes("/api/auth/mfa/verify")
      );

    const hasAuthHeader = originalRequest.headers?.Authorization || originalRequest.headers?.authorization;

    // Only attempt refresh if error is 401, not a retry, is a secured path, and was sent with credentials
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !isPublicPath &&
      hasAuthHeader
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("facile_refresh_token");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call the refresh endpoint to obtain a new token pair
        const response = await axios.post("http://localhost:8082/api/auth/refresh", {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem("facile_token", accessToken);
        localStorage.setItem("facile_refresh_token", newRefreshToken);

        // Update the authorization header for the original request and retry it
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is expired or invalid; perform local logout and redirect
        localStorage.removeItem("facile_token");
        localStorage.removeItem("facile_refresh_token");
        localStorage.removeItem("facile_user");
        
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
