import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['example.com', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    const baseUrl = process.env.TDSC_BASE_URL || 'http://127.0.0.1:8080';
    return [
      {
        source: '/:locale(zh-CN|en-US)/tdsc/:path*',
        destination: `${baseUrl}/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
