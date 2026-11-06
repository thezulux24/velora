/** @type {import('next').NextConfig} */
const cms = process.env.NEXT_PUBLIC_CMS_URL || 'https://webproai.tech';
const portals = (process.env.NEXT_PUBLIC_PORTAL_ORIGINS || 'http://localhost:3005').split(',').join(' ');

const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'webproai.tech' },
      { protocol: 'https', hostname: '*.webproai.tech' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000,
  },
  // El portal muestra la landing en un iframe: nada de X-Frame-Options DENY, solo los orígenes del CMS.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: `frame-ancestors 'self' ${cms} ${portals}; base-uri 'self'; object-src 'none'` },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
        ],
      },
    ];
  },
};
export default nextConfig;
