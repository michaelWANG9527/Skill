/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['pino', 'pino-pretty'],
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
