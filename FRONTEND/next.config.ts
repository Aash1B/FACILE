import type { NextConfig } from "next";

const requireServiceUrl = (value: string | undefined, variableName: string): string => {
    if (!value) {
        throw new Error(`Missing required frontend service URL: ${variableName}`);
    }
    return value.replace(/\/+$/, "");
};

const AUTH_USER_BASE_URL = requireServiceUrl(
    process.env.NEXT_PUBLIC_AUTH_SERVICE_URL,
    "NEXT_PUBLIC_AUTH_SERVICE_URL"
);
const PRODUCT_BASE_URL = requireServiceUrl(
    process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL,
    "NEXT_PUBLIC_PRODUCT_SERVICE_URL"
);
const ORDER_BASE_URL = requireServiceUrl(
    process.env.NEXT_PUBLIC_ORDER_SERVICE_URL,
    "NEXT_PUBLIC_ORDER_SERVICE_URL"
);
const PAYMENT_BASE_URL = requireServiceUrl(
    process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL,
    "NEXT_PUBLIC_PAYMENT_SERVICE_URL"
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
                destination: `${PAYMENT_BASE_URL}/:path*`,
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
