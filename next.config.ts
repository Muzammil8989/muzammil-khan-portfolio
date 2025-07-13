import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Solution 1: Disable CSS optimization
  experimental: {
    optimizeCss: false,
  },

  // Solution 2: Custom webpack configuration
  webpack: (config) => {
    // Remove problematic CSS minification
    config.optimization.minimizer = config.optimization.minimizer.filter(
      (minimizer: any) => minimizer.constructor.name !== "CssMinimizerPlugin"
    );

    return config;
  },

  // Solution 3: Configure asset processing
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },

  // Solution 4: Enable SWC minification (alternative to Terser)
  swcMinify: true,

  // Solution 5: Configure modularize imports if needed
  modularizeImports: {
    "@mui/material": {
      transform: "@mui/material/{{member}}",
    },
    "@mui/icons-material": {
      transform: "@mui/icons-material/{{member}}",
    },
  },
};

export default nextConfig;
