import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return ['/sw.js', '/storage.js', '/precache.json'].map(source => ({
      source,
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ...(source === '/sw.js' ? [{ key: 'Service-Worker-Allowed', value: '/' }] : []),
      ],
    }));
  },
};

export default nextConfig;
