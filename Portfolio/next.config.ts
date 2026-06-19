import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/revision11", destination: "/revision11/index.html" },
      { source: "/revision11/:slug", destination: "/revision11/:slug/index.html" },
    ];
  },
};

export default nextConfig;
