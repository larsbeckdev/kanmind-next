import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // The dev server is opened from other devices in the local network as well.
  // Without these hosts Next blocks its own dev resources cross-origin, the
  // client bundle never loads and the page stops at the server-rendered
  // loading state.
  allowedDevOrigins: ["10.80.0.230", "*.local"],
}

export default nextConfig
