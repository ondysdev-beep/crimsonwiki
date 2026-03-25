import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Clock, FileText, MessageSquare, Edit, ExternalLink, Twitter } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatDateRelative, SITE_NAME, SITE_URL } from '@/lib/utils';
import type { Profile, ArticleWithCategory } from '@/lib/types/database';

interface PageProps {
  params: { username: string };
  searchParams: { tab?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('username, bio')
    .eq('username', params.username)
    .single();
  const profile = data as { username: string; bio: string | null } | null;

  if (!profile) return { title: 'User Not Found' };

  return {
    title: `${profile.username} - Profile`,
    description: profile.bio || `${profile.username}'s profile on ${SITE_NAME}`,
    openGraph: {
      title: `${profile.username} | ${SITE_NAME}`,
      url: `${SITE_URL}/profile/${profile.username}`,
    },
  };
}

export default async function ProfilePage({ params, searchParams }: PageProps) {
  const supabase = await createClient();
  const tab = searchParams.tab || 'overview';

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single();

  if (!profileData) notFound();
  const profile = profileData as Profile;

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile Header */}
      <div className="flex items-start gap-5 mb-8">
        <div className="shrink-0">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.username}
              width={80}
              height={80}
              className="rounded-full border-2 border-dark-600"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-crimson-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-dark-600">
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-dark-50">{profile.username}</h1>
            {profile.is_founder && (
              <span className="text-xs font-semibold px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">
                Founder
              </span>
            )}
            <span className="text-xs font-medium px-2 py-0.5 bg-dark-700 text-dark-300 rounded-full capitalize">
              {profile.role}
            </span>
          </div>
          {profile.bio && (
            <p className="text-sm text-dark-400 mb-2 max-w-xl">{profile.bio}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-dark-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Joined {formatDate(profile.created_at)}
            </span>
            {profile.website_url && (
              <a
                href={profile.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-crimson-400 hover:text-crimson-300"
              >
                <ExternalLink className="w-3 h-3" />
                Website
              </a>
            )}
            {profile.twitter_handle && (
              <a
                href={`https://x.com/${profile.twitter_handle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-crimson-400 hover:text-crimson-300"
              >
                <Twitter className="w-3 h-3" />
                {profile.twitter_handle}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-dark-50">{articles.length}</p>
          <p className="text-xs text-dark-400">Articles Created</p>
        </div>
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-dark-50">{editCount ?? 0}</p>
          <p className="text-xs text-dark-400">Total Edits</p>
        </div>
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-dark-50">{commentCount ?? 0}</p>
          <p className="text-xs text-dark-400">Comments</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-dark-700">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'articles', label: 'Articles' },
          { key: 'contributions', label: 'Contributions' },
        ].map((t) => (
          <Link
            key={t.key}
            href={`/profile/${profile.username}${t.key === 'overview' ? '' : `?tab=${t.key}`}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-crimson-500 text-crimson-400'
                : 'border-transparent text-dark-400 hover:text-dark-200'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Tab Content */}
      {(tab === 'overview' || tab === 'articles') && (
        <div>
          <h2 className="text-lg font-semibold text-dark-100 mb-4">
            {tab === 'overview' ? 'Recent Articles' : 'All Articles'}
          </h2>
          {articles.length > 0 ? (
            <div className="space-y-3">
              {(tab === 'overview' ? articles.slice(0, 5) : articles).map((article) => (
                <Link
                  key={article.id}
                  href={`/wiki/${article.slug}`}
                  className="flex items-center gap-4 bg-dark-800/50 border border-dark-700 rounded-lg p-4 hover:border-dark-600 hover:bg-dark-800 transition-all"
                >
                  <FileText className="w-5 h-5 text-dark-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-dark-100 font-medium truncate">{article.title}</p>
                    <p className="text-xs text-dark-500">
                      {article.categories?.name && (
                        <span style={{ color: article.categories.color || '#dc2626' }}>
                          {article.categories.name}
                        </span>
                      )}
                      {' -- '}
                      {formatDateRelative(article.updated_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-dark-500 text-center py-12">No articles yet.</p>
          )}
        </div>
      )}

      {tab === 'contributions' && (
        <div>
          <h2 className="text-lg font-semibold text-dark-100 mb-4">Recent Contributions</h2>
          {recentEdits.length > 0 ? (
            <div className="space-y-3">
              {recentEdits.map((edit) => (
                <div
                  key={edit.id}
                  className="flex items-center gap-4 bg-dark-800/50 border border-dark-700 rounded-lg p-4"
                >
                  <Edit className="w-5 h-5 text-dark-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    {edit.articles ? (
                      <Link
                        href={`/wiki/${edit.articles.slug}`}
                        className="text-dark-100 font-medium hover:text-crimson-400 transition-colors"
                      >
                        {edit.articles.title}
                      </Link>
                    ) : (
                      <span className="text-dark-400">Deleted article</span>
                    )}
                    {edit.edit_summary && (
                      <p className="text-xs text-dark-500 italic">{edit.edit_summary}</p>
                    )}
                  </div>
                  <span className="text-xs text-dark-500 shrink-0">
                    {formatDateRelative(edit.created_at)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-dark-500 text-center py-12">No contributions yet.</p>
          )}
        </div>
      )}

      {tab === 'comments' && (
        <div>
          <h2 className="text-lg font-semibold text-dark-100 mb-4">Recent Comments</h2>
          <p className="text-dark-500 text-center py-12">
            <MessageSquare className="w-6 h-6 mx-auto mb-2 text-dark-600" />
            {commentCount ?? 0} comments posted
          </p>
        </div>
      )}
    </div>
  );
}
