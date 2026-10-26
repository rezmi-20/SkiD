/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['10.235.92.15', '*.trycloudflare.com', '*.lhr.life'],
  // PDFKit uses __dirname to locate font files. Next.js bundling breaks this
  // by resolving __dirname to C:\ROOT. Marking it as external fixes the path.
  serverExternalPackages: ['pdfkit'],
  experimental: {
    // Re-verification sends a validated, <=3 MB Fayda document as a data URL
    // directly to the server action so it can be encrypted before persistence.
    serverActions: { bodySizeLimit: '5mb' },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
      {
        source: '/api/:path*/verification-document',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'none'; frame-ancestors 'self'",
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Cache-Control',
            value: 'private, no-store',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
