const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
    serverActions: true
  },
  webpack: (config) => {
    // Define the `FLUENTFFMPEG_COV` variable as false
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.FLUENTFFMPEG_COV': false
      })
    );

    return config;
  }
};

module.exports = nextConfig;
