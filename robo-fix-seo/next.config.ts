// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.techreviewer.de",
        pathname: "/wp-content/uploads/**",
      },
      { protocol: "https", hostname: "i.pinimg.com", pathname: "/**" },
      { protocol: "https", hostname: "www.connect.de", pathname: "/**" },
      {
        protocol: "https",
        hostname: "ohmymi.com.my",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
  eslint: {
    // 👇 خليه يكمّل الـbuild حتى لو موجودة أخطاء ESLint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
