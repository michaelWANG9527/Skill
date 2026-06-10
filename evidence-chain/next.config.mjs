/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // 原生模块与含动态 require 的包不打进 bundle，由 Node 运行时直接加载
    serverComponentsExternalPackages: [
      'better-sqlite3',
      '@prisma/adapter-better-sqlite3',
      '@prisma/adapter-pg',
      'minio',
    ],
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
