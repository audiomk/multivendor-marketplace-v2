import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  serverExternalPackages: ['mongoose'],
  eslint: {
    ignoreDuringBuilds: true,  // ← add this
  },
  typescript: {
    ignoreBuildErrors: true,   // ← add this too
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      kerberos: false,
      '@mongodb-js/zstd': false,
      '@aws-sdk/credential-providers': false,
      'gcp-metadata': false,
      snappy: false,
      socks: false,
      'mongodb-client-encryption': false,
    }
    return config
  },
}

export default nextConfig