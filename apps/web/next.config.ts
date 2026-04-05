import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Enable PWA-friendly output
  output: "standalone",
};

export default nextConfig;
