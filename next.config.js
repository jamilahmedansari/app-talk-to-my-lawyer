/** @type {import("next").NextConfig} */
const nextConfig = {
  /* ============================================================
   * Build-time settings
   * ============================================================
   * In production, we should enable strict checking
   */
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },

  /* ============================================================
   * Image optimisation
   * ============================================================
   * Disable the default Image Optimization (useful on Netlify
   * and other non-Vercel hosts).
   */
  images: {
    unoptimized: true,
    domains: ['localhost', 'your-domain.com'], // Add your domains here
  },

  /* ============================================================
   * Runtime environment variables
   * ============================================================
   * Extend as needed. Values are injected at build time.
   */
  env: {
    CUSTOM_KEY: "my-value",
  },

  /* ============================================================
   * Custom headers for security
   * ============================================================ */
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: process.env.NEXT_PUBLIC_BASE_URL || "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, stripe-signature",
          },
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ]
  },

  /* ============================================================
   * Server external packages
   * ============================================================ */
  serverExternalPackages: ['@prisma/client'],
}

module.exports = nextConfig
