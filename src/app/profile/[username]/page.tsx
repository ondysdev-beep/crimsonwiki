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
    .select('id, username, avatar_url, role, is_founder, created_at, bio, website_url, twitter_handle, discord_username')
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
    bio: string | null;
    website_url: string | null;
    twitter_handle: string | null;
    discord_username: string | null;
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
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">{profile.username}</div>
          <div className="page-hd-sub">
            {profile.is_founder && <span className="founder-tag">founder</span>}
            <span className={`tag tag-${profile.role}`}>{profile.role}</span>
            &nbsp;· Joined {joinDate}
          </div>
        </div>
      </div>

      {/* PROFILE INFO */}
      <div className="content-grid">
        <div>
          {/* PROFILE HEADER */}
          <div className="wiki-box">
            <div className="wiki-box-body">
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0 }}>
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.username}
                      width={80}
                      height={80}
                      style={{
                        borderRadius: '50%',
                        border: '2px solid var(--border)',
                        width: '80px',
                        height: '80px'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '80px', height: '80px', borderRadius: '50%',
                      background: 'var(--amber)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: 'var(--bg-0)', fontSize: '28px', fontWeight: '700',
                      border: '2px solid var(--border)',
                    }}>
                      {profile.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '4px' }}>
                    {profile.username}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-1)', marginBottom: profile.bio ? '8px' : 0 }}>
                    {profile.is_founder && <span style={{ color: 'var(--amber)', marginRight: '8px' }}>Founder</span>}
                    <span style={{ textTransform: 'capitalize' }}>{profile.role}</span>
                    {' · Joined '}{joinDate}
                  </div>
                  {profile.bio && (
                    <p style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: '1.6', margin: '0 0 8px' }}>{profile.bio}</p>
                  )}
                  {(profile.website_url || profile.twitter_handle || profile.discord_username) && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px' }}>
                      {profile.website_url && (
                        <a href={profile.website_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--link)' }}>
                          🌐 {profile.website_url.replace(/^https?:\/\/(www\.)?/, '')}
                        </a>
                      )}
                      {profile.twitter_handle && (
                        <a href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--link)' }}>
                          𝕏 @{profile.twitter_handle.replace('@', '')}
                        </a>
                      )}
                      {profile.discord_username && (
                        <span style={{ color: 'var(--text-2)' }}>💬 {profile.discord_username}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* STATS */}
          <table className="wiki-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th className="td-count">Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Articles Created</td>
                <td className="td-count">{articles.length}</td>
              </tr>
              <tr>
                <td>Total Edits</td>
                <td className="td-count">{editCount ?? 0}</td>
              </tr>
              <tr>
                <td>Comments</td>
                <td className="td-count">{commentCount ?? 0}</td>
              </tr>
            </tbody>
          </table>

          {/* TABS */}
          <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'articles', label: 'Articles' },
              { key: 'contributions', label: 'Contributions' },
            ].map((t) => (
              <Link
                key={t.key}
                href={`/profile/${profile.username}${t.key === 'overview' ? '' : `?tab=${t.key}`}`}
                style={{
                  padding: '8px 16px', fontSize: '13px', fontWeight: '500',
                  borderBottom: tab === t.key ? '2px solid var(--amber)' : '2px solid transparent',
                  color: tab === t.key ? 'var(--amber)' : 'var(--text-1)',
                  textDecoration: 'none', transition: 'color 0.15s',
                }}
              >
                {t.label}
              </Link>
            ))}
          </div>

          {/* TAB CONTENT */}
          {(tab === 'overview' || tab === 'articles') && (
            <div className="wiki-box">
              <div className="wiki-box-hd">
                {tab === 'overview' ? 'Recent Articles' : 'All Articles'}
              </div>
              <div className="wiki-box-body">
                {articles.length > 0 ? (
                  <table className="article-table">
                    <thead>
                      <tr>
                        <th>Article</th>
                        <th>Category</th>
                        <th>Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(tab === 'overview' ? articles.slice(0, 5) : articles).map((article) => {
                        const cat = article.categories as unknown as Category | null;
                        return (
                          <tr key={article.id}>
                            <td className="td-title">
                              <Link href={`/wiki/${article.slug}`}>{article.title}</Link>
                            </td>
                            <td>
                              {cat?.name && (
                                <span className={`tag tag-${cat.slug}`}>{cat.name}</span>
                              )}
                            </td>
                            <td className="td-meta">{formatDateRelative(article.updated_at)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-2)' }}>
                    No articles yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'contributions' && (
            <div className="wiki-box">
              <div className="wiki-box-hd">Recent Contributions</div>
              <div className="wiki-box-body">
                {recentEdits.length > 0 ? (
                  <table className="article-table">
                    <thead>
                      <tr>
                        <th>Article</th>
                        <th>Summary</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEdits.map((edit) => (
                        <tr key={edit.id}>
                          <td className="td-title">
                            {edit.articles ? (
                              <Link href={`/wiki/${edit.articles.slug}`}>{edit.articles.title}</Link>
                            ) : (
                              <span style={{ color: 'var(--text-2)' }}>Deleted article</span>
                            )}
                          </td>
                          <td style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                            {edit.edit_summary || 'No summary'}
                          </td>
                          <td className="td-meta">{formatDateRelative(edit.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-2)' }}>
                    No contributions yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar">
          <div className="wiki-box">
            <div className="wiki-box-hd">Activity</div>
            <div className="wiki-box-body">
              <div className="contrib-row">
                <span>Articles Created</span>
                <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--amber)' }}>{articles.length}</span>
              </div>
              <div className="contrib-row">
                <span>Total Edits</span>
                <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--amber)' }}>{editCount ?? 0}</span>
              </div>
              <div className="contrib-row">
                <span>Comments</span>
                <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--amber)' }}>{commentCount ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Quick Actions</div>
            <div className="wiki-box-body">
              <Link href="/wiki/new" className="sidebar-link">Create Article</Link>
              <Link href="/search" className="sidebar-link">Browse Wiki</Link>
              <Link href="/contribute" className="sidebar-link">Contribute</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
