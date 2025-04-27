/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint kontrollerini build sırasında devre dışı bırak
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript kontrollerini build sırasında devre dışı bırak
    ignoreBuildErrors: true,
  },
  // serverComponentsExternalPackages artık serverExternalPackages olarak kullanılıyor
  serverExternalPackages: ['@prisma/client', 'bcrypt'],
  
  images: {
    domains: ['s3.tebi.io'],
  },
  
  // Middleware ayarları için yeni yapılandırma
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  
  webpack: (config) => {
    // jsonwebtoken için webpack polyfills
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
    };
    return config;
  },
  productionBrowserSourceMaps: true,
  
  // Pages Router olmadığını belirt
  useFileSystemPublicRoutes: true,
}

module.exports = nextConfig 