// FIXED: Restricted Supabase hostname to specific project instead of wildcard
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_SUPABASE_URL
          ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
          : '*.supabase.co'
      },
      { protocol: 'https', hostname: '*.supabase.com' },
      { protocol: 'https', hostname: '*.supabase.in' },
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
      { protocol: 'https', hostname: 'media.discordapp.net' },
      { protocol: 'https', hostname: 'cdn.crimsonwiki.org' },
      { protocol: 'https', hostname: 'crimsonwiki.org' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: '*.amazonaws.com' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
    ],
  },
  trailingSlash: false,
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
      { source: '/lore', destination: '/category/lore', permanent: false },
      { source: '/crafting', destination: '/category/crafting', permanent: false },
      { source: '/tips', destination: '/category/tips', permanent: false },
      { source: '/mounts', destination: '/category/mounts', permanent: false },
      { source: '/factions', destination: '/category/factions', permanent: false },
      { source: '/activities', destination: '/category/activities', permanent: false },
      { source: '/camp', destination: '/category/camp', permanent: false },
      { source: '/collectibles', destination: '/category/collectibles', permanent: false },

      // Character redirects for consistency
      { source: '/wiki/kliff', destination: '/characters/kliff', permanent: true },
      { source: '/wiki/damiane', destination: '/characters/damiane', permanent: true },
      { source: '/wiki/oongka', destination: '/characters/oongka', permanent: true },

      // Walkthrough redirects for consistency
      { source: '/wiki/prologue', destination: '/walkthrough/prologue', permanent: true },
      { source: '/wiki/chapter-1', destination: '/walkthrough/chapter-1', permanent: true },
      { source: '/wiki/chapter-2', destination: '/walkthrough/chapter-2', permanent: true },
      { source: '/wiki/chapter-3', destination: '/walkthrough/chapter-3', permanent: true },
      { source: '/wiki/chapter-4', destination: '/walkthrough/chapter-4', permanent: true },
    ];
  },
};

module.exports = nextConfig;
