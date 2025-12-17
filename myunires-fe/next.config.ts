import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: '/uploads/:path*',
          destination: 'http://localhost:3001/uploads/:path*',
        },
      ],
    };
  },
};

export default nextConfig;
