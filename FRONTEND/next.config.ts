import type { NextConfig } from "next";

const DEFAULT_SERVICE_URLS = {
    auth: "https://facile-auth-user.onrender.com",
    order: "https://facile-order-cart.onrender.com",
    payment: "https://facile-payment-notification.onrender.com",
    product: "https://facile-product-inventory.onrender.com",
} as const;

const resolveServiceUrl = (value: string | undefined, fallback: string): string => {
    const configuredValue = value?.trim();
    const isPlaceholder = configuredValue?.includes("your-") || configuredValue?.includes("example.com");
    return (configuredValue && !isPlaceholder ? configuredValue : fallback).replace(/\/+$/, "");
};

const AUTH_USER_BASE_URL = resolveServiceUrl(
    process.env.NEXT_PUBLIC_AUTH_SERVICE_URL,
    DEFAULT_SERVICE_URLS.auth
);
const PRODUCT_BASE_URL = resolveServiceUrl(
    process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL,
    DEFAULT_SERVICE_URLS.product
);
const ORDER_BASE_URL = resolveServiceUrl(
    process.env.NEXT_PUBLIC_ORDER_SERVICE_URL,
    DEFAULT_SERVICE_URLS.order
);
const PAYMENT_BASE_URL = resolveServiceUrl(
    process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL,
    DEFAULT_SERVICE_URLS.payment
);

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: "/api/auth/:path*",
                destination: `${AUTH_USER_BASE_URL}/api/auth/:path*`,
            },
            {
                source: "/api/cart/:path*",
                destination: `${ORDER_BASE_URL}/api/cart/:path*`,
            },
            {
                source: "/api/orders/:path*",
                destination: `${ORDER_BASE_URL}/api/orders/:path*`,
            },
            {
                source: "/api/payments/:path*",
                destination: `${PAYMENT_BASE_URL}/payments/:path*`,
            },
            {
                source: "/api/products/:path*",
                destination: `${PRODUCT_BASE_URL}/api/products/:path*`,
            },
            {
                source: "/api/categories/:path*",
                destination: `${PRODUCT_BASE_URL}/api/categories/:path*`,
            },
            {
                source: "/api/user/:path*",
                destination: `${PRODUCT_BASE_URL}/api/user/:path*`,
            },
        ];
    },
};

export default nextConfig;
