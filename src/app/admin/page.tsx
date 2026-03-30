import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Users, FileText, FolderOpen, MessageSquare, AlertTriangle, GitBranch, Settings, ArrowRight, BarChart2, Image } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types/database';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Panel',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  const me = profile as Profile | null;
  if (!me || (me.role !== 'admin' && me.role !== 'moderator')) {
    redirect('/');
  }

  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: articleCount } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });

  const { count: publishedCount } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  const { count: categoryCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });

  const { count: commentCount } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true });

  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Admin Panel</div>
          <div className="page-hd-sub">
            <span style={{
              fontSize: '11px', padding: '2px 8px',
              background: 'rgba(155,32,32,0.12)',
              border: '1px solid rgba(155,32,32,0.3)',
              color: 'var(--crimson-bright)',
              textTransform: 'capitalize',
            }}>{me.role}</span>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-strip">
        {[
          { label: 'Users', value: userCount ?? 0 },
          { label: 'Articles', value: articleCount ?? 0 },
          { label: 'Published', value: publishedCount ?? 0 },
          { label: 'Categories', value: categoryCount ?? 0 },
          { label: 'Comments', value: commentCount ?? 0 },
        ].map((stat) => (
          <div key={stat.label} className="stat-cell">
            <span className="stat-num">{stat.value}</span>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* SECTIONS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {([
          {
            heading: 'Content',
            items: [
              { href: '/admin/articles', Icon: FileText, title: 'Articles', desc: 'Publish, unpublish, delete' },
              { href: '/admin/categories', Icon: FolderOpen, title: 'Categories', desc: 'Add, edit, reorder, set parent' },
              { href: '/admin/stubs', Icon: AlertTriangle, title: 'Stub Articles', desc: 'Articles under word threshold' },
              { href: '/admin/media', Icon: Image, title: 'Media Library', desc: 'Browse & delete uploaded images' },
            ],
          },
          {
            heading: 'Moderation',
            items: [
              { href: '/admin/users', Icon: Users, title: 'Users', desc: 'Roles, profiles, bans' },
              { href: '/admin/comments', Icon: MessageSquare, title: 'Comments', desc: 'Review and delete comments' },
              { href: '/admin/revisions', Icon: GitBranch, title: 'Revisions', desc: 'Recent edits across all articles' },
            ],
          },
          {
            heading: 'System',
            items: [
              { href: '/admin/settings', Icon: Settings, title: 'Site Settings', desc: 'Banner, Discord link, thresholds' },
              { href: '/admin/redirects', Icon: ArrowRight, title: 'Redirects', desc: 'Manage 301 slug redirects' },
              { href: '/admin/analytics', Icon: BarChart2, title: 'Analytics', desc: 'Views, editors, category stats' },
            ],
          },
        ] as const).map(section => (
          <div key={section.heading} className="wiki-box">
            <div className="wiki-box-hd">{section.heading}</div>
            <div className="wiki-box-body" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {section.items.map(({ href, Icon, title, desc }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-3)',
                    textDecoration: 'none',
                  }}
                >
                  <Icon style={{ width: 16, height: 16, color: 'var(--crimson-bright)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-0)' }}>{title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>{desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
