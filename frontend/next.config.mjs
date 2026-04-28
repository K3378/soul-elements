/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from Stripe etc
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.stripe.com' },
    ],
  },
  // Static export for serving from Express backend
  output: 'export',
  // Clean URLs
  trailingSlash: true,
};

export default nextConfig;
