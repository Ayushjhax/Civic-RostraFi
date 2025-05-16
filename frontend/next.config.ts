// next.config.js
import { createCivicAuthPlugin } from "@civic/auth-web3/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_USERNAME: process.env.REDIS_USERNAME,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.aceternity.com",
      },
      { hostname: "images.unsplash.com" },
      { hostname: "ui.aceternity.com" },
      { hostname: "img.freepik.com" },
      { hostname: "media.istockphoto.com" },
      { hostname: "cdn.pixabay.com" },
      { hostname: "upload.wikimedia.org" },
      { hostname: "pbs.twimg.com" },
      {
        protocol: "https",
        hostname: "**.gstatic.com",
      },
    ],
  },
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: process.env.NEXT_PUBLIC_CIVIC_CLIENT_ID || "",
  enableSolanaWalletAdapter: true,
});

export default withCivicAuth(nextConfig);
