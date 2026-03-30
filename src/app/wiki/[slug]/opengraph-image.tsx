import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  params: { slug: string };
}

export default async function ArticleOgImage({ params }: Props) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('articles')
    .select('title, excerpt, categories(name, color)')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  const title    = (data as { title?: string } | null)?.title    ?? 'CrimsonWiki';
  const excerpt  = (data as { excerpt?: string } | null)?.excerpt ?? 'The community-driven encyclopedia for Crimson Desert.';
  const catData  = (data as { categories?: { name: string; color: string | null } | null } | null)?.categories;
  const catName  = catData?.name  ?? '';
  const catColor = catData?.color ?? '#c9a227';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#111214',
          padding: '60px',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Top accent line */}
        <div style={{ width: '100%', height: '4px', background: catColor, marginBottom: '40px' }} />

        {/* Category badge */}
        {catName && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                background: catColor + '22',
                border: `1px solid ${catColor}55`,
                color: catColor,
                padding: '4px 14px',
                fontSize: '14px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              {catName}
            </div>
          </div>
        )}

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 40 ? '52px' : '64px',
            fontWeight: 700,
            color: '#f0e6cc',
            lineHeight: 1.15,
            marginBottom: '24px',
            flex: 1,
          }}
        >
          {title}
        </div>

        {/* Excerpt */}
        {excerpt && (
          <div
            style={{
              fontSize: '20px',
              color: '#9a8a6a',
              lineHeight: 1.5,
              marginBottom: '40px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {excerpt}
          </div>
        )}

        {/* Footer bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #2a2520',
            paddingTop: '24px',
          }}
        >
          <div style={{ fontSize: '18px', color: catColor, fontWeight: 700, letterSpacing: '0.5px' }}>
            ⚔ CrimsonWiki
          </div>
          <div style={{ fontSize: '14px', color: '#666', letterSpacing: '0.5px' }}>
            crimsonwiki.org
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
