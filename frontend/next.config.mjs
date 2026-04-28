/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow Docker/Railway to handle the port
  serverExternalPackages: [],
  // Allow images from Stripe etc
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.stripe.com' },
    ],
  },
  // Output for Railway
  output: 'standalone',
  // Fix workspace root detection
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
