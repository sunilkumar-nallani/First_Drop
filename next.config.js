/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Disable the floating dev indicator (N logo) in development
  devIndicators: false,

  // Image optimization configuration
  images: {
    domains: ['localhost'],
    // Add external domains if you use image hosting (e.g., Cloudinary, AWS S3)
    // domains: ['localhost', 'res.cloudinary.com', 'your-bucket.s3.amazonaws.com'],
  },

  // Experimental features (use with caution)
  experimental: {
    // Enable if you need server actions (Next.js 14+)
    // serverActions: true,
  },

  // Redirects configuration
  async redirects() {
    return [
      // Optional: Redirect old routes
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // },
    ];
  },

  // Headers configuration (security headers)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Webpack configuration (if needed)
  webpack: (config, { isServer }) => {
    // Add any custom webpack config here
    return config;
  },
};

module.exports = nextConfig;
