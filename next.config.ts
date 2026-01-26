import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization settings
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
