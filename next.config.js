/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    loader: "imgix",
    path: "/",
  },
};

module.exports = nextConfig;
