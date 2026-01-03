/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tr.rbxcdn.com",
      },
      {
        protocol: "https",
        hostname: "thumbnails.roblox.com",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
    ],
  },
};

export default nextConfig;
