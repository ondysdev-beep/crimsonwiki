import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatDateRelative, SITE_NAME, SITE_URL } from '@/lib/utils';
import type { ArticleWithCategory, Category } from '@/lib/types/database';

interface PageProps {
  params: { username: string };
  searchParams: { tab?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', params.username)
    .single();

  if (!data) return { title: 'User Not Found' };

  return {
    title: `${data.username} - Profile`,
    description: `${data.username}'s profile on ${SITE_NAME}`,
    openGraph: {
      title: `${data.username} | ${SITE_NAME}`,
      url: `${SITE_URL}/profile/${data.username}`,
    },
  };
}

export default async function ProfilePage({ params, searchParams }: PageProps) {
  const supabase = await createClient();
  const tab = searchParams.tab || 'overview';

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, role, is_founder, created_at')
    .eq('username', params.username)
    .single();

  if (!profileData || profileError) notFound();
  const profile = profileData as {
    id: string;
    username: string;
    avatar_url: string | null;
    role: string;
    is_founder: boolean;
    created_at: string;
  };

  const { data: articlesData } = await supabase
    .from('articles')
    .select('*, categories(*), profiles!articles_created_by_fkey(*)')
    .eq('created_by', profile.id)
    .eq('is_published', true)
    .order('updated_at', { ascending: false });
  const articles = (articlesData || []) as unknown as ArticleWithCategory[];

  const { count: editCount } = await supabase
    .from('article_revisions')
    .select('*', { count: 'exact', head: true })
    .eq('edited_by', profile.id);

  const { count: commentCount } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id);

  const { data: recentEditsData } = await supabase
    .from('article_revisions')
    .select('*, articles!article_revisions_article_id_fkey(slug, title)')
    .eq('edited_by', profile.id)
    .order('created_at', { ascending: false })
    .limit(10);
  const recentEdits = (recentEditsData || []) as {
    id: string;
    created_at: string;
    edit_summary: string | null;
    articles: { slug: string; title: string } | null;
  }[];

  const joinDate = formatDate(profile.created_at);

  return (
    <div className="section page-enter" style={{ maxWidth: 860 }}>
      {/* Profile Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 32 }}>
        <div style={{ flexShrink: 0 }}>
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.username}
              width={80}
              height={80}
              style={{ borderRadius: '50%', border: '2px solid var(--border)' }}
            />
          ) : (
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--crimson)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 28, fontWeight: 700,
              border: '2px solid var(--border)',
            }}>
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {profile.username}
            </h1>
            {profile.is_founder && (
              <span className="founder-badge">Founder</span>
            )}
            <span className="badge" style={{ textTransform: 'capitalize' }}>{profile.role}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
            Joined {joinDate}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
        <div className="sidebar-card" style={{ textAlign: 'center', margin: 0 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{articles.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Articles Created</div>
        </div>
        <div className="sidebar-card" style={{ textAlign: 'center', margin: 0 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{editCount ?? 0}</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Total Edits</div>
        </div>
        <div className="sidebar-card" style={{ textAlign: 'center', margin: 0 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{commentCount ?? 0}</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Comments</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'articles', label: 'Articles' },
          { key: 'contributions', label: 'Contributions' },
        ].map((t) => (
          <Link
            key={t.key}
            href={`/profile/${profile.username}${t.key === 'overview' ? '' : `?tab=${t.key}`}`}
            style={{
              padding: '10px 16px', fontSize: 13, fontWeight: 500,
              borderBottom: tab === t.key ? '2px solid var(--crimson-bright)' : '2px solid transparent',
              color: tab === t.key ? 'var(--crimson-bright)' : 'var(--text-muted)',
              textDecoration: 'none', transition: 'color 0.15s',
            }}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Tab Content */}
      {(tab === 'overview' || tab === 'articles') && (
        <div>
          <div className="section-title" style={{ fontSize: 16, marginBottom: 16 }}>
            {tab === 'overview' ? 'Recent Articles' : 'All Articles'}
          </div>
          {articles.length > 0 ? (
            <div className="article-list">
              {(tab === 'overview' ? articles.slice(0, 5) : articles).map((article) => {
                const cat = article.categories as unknown as Category | null;
                return (
                  <Link
                    key={article.id}
                    href={`/wiki/${article.slug}`}
                    className="article-item"
                    style={{ '--cat-color': cat?.color || '#9b2020' } as React.CSSProperties}
                  >
                    <div className="article-item-cat" />
                    <div className="article-item-body">
                      <div className="article-item-title">{article.title}</div>
                      <div className="article-item-meta">
                        {cat?.name && <span style={{ color: cat.color || '#dc2626' }}>{cat.name}</span>}
                        {' -- '}
                        {formatDateRelative(article.updated_at)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-dim)' }}>
              No articles yet.
            </div>
          )}
        </div>
      )}

      {tab === 'contributions' && (
        <div>
          <div className="section-title" style={{ fontSize: 16, marginBottom: 16 }}>
            Recent Contributions
          </div>
          {recentEdits.length > 0 ? (
            <div className="article-list">
              {recentEdits.map((edit) => (
                <div key={edit.id} className="article-item" style={{ cursor: 'default' }}>
                  <div className="article-item-body">
                    {edit.articles ? (
                      <Link
                        href={`/wiki/${edit.articles.slug}`}
                        className="article-item-title"
                        style={{ color: 'var(--text-primary)', textDecoration: 'none' }}
                      >
                        {edit.articles.title}
                      </Link>
                    ) : (
                      <span style={{ color: 'var(--text-dim)' }}>Deleted article</span>
                    )}
                    {edit.edit_summary && (
                      <div className="article-item-meta" style={{ fontStyle: 'italic' }}>{edit.edit_summary}</div>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)', flexShrink: 0 }}>
                    {formatDateRelative(edit.created_at)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-dim)' }}>
              No contributions yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
