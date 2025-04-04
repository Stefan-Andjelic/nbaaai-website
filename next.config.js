/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'https://xmafcglwwassycpxymua.supabase.co',
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.supabase.co',
                pathname: '/storage/v1/**',
            },
        ],
    },
  };
  
  module.exports = nextConfig;