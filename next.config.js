/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: false,
  webpack(config) {
    config.module.rules.push({
      test: /\.gb$/i,
      type: "asset/resource",
    });
    return config;
  },
};

module.exports = nextConfig;
