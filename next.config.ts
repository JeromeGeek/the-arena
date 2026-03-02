import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Wikimedia Commons (existing)
      { protocol: "https", hostname: "upload.wikimedia.org" },
      // Cloudinary
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
