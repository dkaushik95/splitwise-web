import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/functions/v1/:path*',
        destination: 'https://ejimxnpwacaszpnenupr.supabase.co/functions/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
