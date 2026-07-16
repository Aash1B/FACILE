import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: "/api/auth/:path*",
                destination: "http://localhost:8082/api/auth/:path*",
            },
            {
                source: "/api/cart/:path*",
                destination: "http://localhost:8081/api/cart/:path*",
            },
            {
                source: "/api/orders/:path*",
                destination: "http://localhost:8081/api/orders/:path*",
            },
            {
                source: "/api/payments/:path*",
                destination: "http://localhost:8084/:path*",
            },
            {
                source: "/api/products/:path*",
                destination: "http://localhost:8083/api/products/:path*",
            },
            {
                source: "/api/categories/:path*",
                destination: "http://localhost:8083/api/categories/:path*",
            },
        ];
    },
};

export default nextConfig;
