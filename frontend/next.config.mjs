/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: [
      "wrapped-images.spotifycdn.com",
      "image-cdn-ak.spotifycdn.com",
      "lineup-images.scdn.co",
      "blend-playlist-covers.spotifycdn.com",
      "mosaic.scdn.co",
      "image-cdn-fa.spotifycdn.com",
    ],
  },
};

export default nextConfig;
