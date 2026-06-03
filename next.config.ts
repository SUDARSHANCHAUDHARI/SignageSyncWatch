import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp', 'pixelmatch', 'pngjs'],
}

export default nextConfig
