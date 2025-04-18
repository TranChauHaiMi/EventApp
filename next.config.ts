import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { hostname: "savory-kangaroo-482.convex.cloud", 
        protocol: "https" },
    ],
  },
};

export default nextConfig;