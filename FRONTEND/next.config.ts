import type { NextConfig } from "next";

const authServiceUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://127.0.0.1:8082";
const orderServiceUrl = process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || "http://127.0.0.1:8081";
const paymentServiceUrl = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || "http://127.0.0.1:8084";
const productServiceUrl = process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || "http://127.0.0.1:8083";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: "/api/auth/:path*",
                destination: `${authServiceUrl}/api/auth/:path*`,
            },
            {
                source: "/api/cart/:path*",
                destination: `${orderServiceUrl}/api/cart/:path*`,
            },
            {
                source: "/api/orders/:path*",
                destination: `${orderServiceUrl}/api/orders/:path*`,
            },
            {
                source: "/api/payments/:path*",
                destination: `${paymentServiceUrl}/:path*`,
            },
            {
                source: "/api/products/:path*",
                destination: `${productServiceUrl}/api/products/:path*`,
            },
            {
                source: "/api/categories/:path*",
                destination: `${productServiceUrl}/api/categories/:path*`,
            },
        ];
    },
};

export default nextConfig;
