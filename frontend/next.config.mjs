/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.spotifycdn.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "**.scdn.co",
        port: "",
      },
    ],
  },
};

export default nextConfig;
