/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: false,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("pdf-lib");
    }
    return config;
  },
};

export default nextConfig;
