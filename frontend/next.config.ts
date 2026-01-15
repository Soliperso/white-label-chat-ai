import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disabled to prevent Supabase auth AbortErrors in development
  turbopack: {
    root: "/Users/ahmedchebli/Desktop/ChatForge", // Monorepo root directory
  },
};

export default nextConfig;
