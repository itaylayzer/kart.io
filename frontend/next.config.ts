import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  basePath: "/kart.io",
  output: "export",

  transpilePackages: [
    "@colyseus/schema"           // make sure schema package is transpiled
  ],

  experimental: {
    externalDir: true,           // lets Next process ../colyseus-server sources
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
