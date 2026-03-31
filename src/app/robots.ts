// FIXED: Removed redundant Googlebot and Bingbot rules, added /profile/ to disallow list
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/utils';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/wiki/new',
          '/wiki/*/edit',
          '/settings',
          '/admin',
          '/profile/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
