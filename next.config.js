/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'a0.muscache.com',
      },
      {
        protocol: 'https',
        hostname: '*.muscache.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize Puppeteer and related dependencies for server-side
      config.externals = [
        ...config.externals,
        'puppeteer',
        'puppeteer-extra',
        'puppeteer-extra-plugin-stealth',
      ];
    }
    return config;
  },
};

module.exports = nextConfig;
