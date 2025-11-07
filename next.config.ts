import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Either use `domains` (simple) …
    domains: ["res.cloudinary.com"],
  },
};

export default nextConfig;
