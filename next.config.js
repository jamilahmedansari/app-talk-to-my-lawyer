/** @type {import("next").NextConfig} */
const nextConfig = {
  /* ============================================================
   * Build-time settings
   * ============================================================
   * Ignore lint & type errors during production builds so they
   * don't fail the CI/CD pipeline. Adjust to false in stricter
   * environments.
   */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  /* ============================================================
   * Image optimisation
   * ============================================================
   * Disable the default Image Optimization (useful on Netlify
   * and other non-Vercel hosts).
   */
  images: {
    unoptimized: true,
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
   * Custom headers
   * ============================================================ */
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
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
    ]
  },

  /* ============================================================
   * Experimental features
   * ============================================================ */
  experimental: {
    // Disable static generation for problematic routes
    workerThreads: false,
    cpus: 1,
  },

  /* ============================================================
   * Build output
   * ============================================================ */
  output: 'standalone',

  /* ============================================================
   * Disable static generation
   * ============================================================ */
  trailingSlash: false,
  generateEtags: false,
}

module.exports = nextConfig
