/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['i.ibb.co'], // Allow images from imgbb
  },
  eslint: {
    dirs: ['src'],
  }
};

module.exports = nextConfig;

