import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'pixelmatch', 'pngjs'],
  },
}

export default nextConfig
