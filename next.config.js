/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
  async redirects() {
    return [
      // Help pages with colons
      { source: '/help:editing', destination: '/help/editing', permanent: true },
      { source: '/help:style', destination: '/help/style', permanent: true },

      // Special pages with colons
      { source: '/special:allpages', destination: '/special/allpages', permanent: true },
      { source: '/special:recentchanges', destination: '/special/recentchanges', permanent: true },
      { source: '/special:newpages', destination: '/special/newpages', permanent: true },
      { source: '/special:random', destination: '/special/random', permanent: false },

      // Category redirects
      { source: '/bosses', destination: '/category/bosses', permanent: false },
      { source: '/quests', destination: '/category/quests', permanent: false },
      { source: '/items', destination: '/category/items', permanent: false },
      { source: '/builds', destination: '/category/classes', permanent: false },
      { source: '/maps', destination: '/category/locations', permanent: false },
    ];
  },
};

module.exports = nextConfig;
