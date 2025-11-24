import type { NextConfig } from 'next';
import './src/libs/Env';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localstack',
        port: '4566',
        pathname: '/park-hub-company-images/**',
      },
      {
        protocol: 'https',
        hostname: 'localstack',
        port: '4566',
        pathname: '/park-hub-company-images/**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
