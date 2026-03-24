import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Users, FileText, FolderOpen, Shield } from 'lucide-react';
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
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-7 h-7 text-crimson-500" />
        <h1 className="text-2xl font-bold text-dark-50">Admin Panel</h1>
        <span className="text-xs px-2 py-0.5 bg-crimson-600/20 text-crimson-400 rounded-full font-medium capitalize">
          {me.role}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Users', value: userCount ?? 0 },
          { label: 'Articles', value: articleCount ?? 0 },
          { label: 'Published', value: publishedCount ?? 0 },
          { label: 'Categories', value: categoryCount ?? 0 },
          { label: 'Comments', value: commentCount ?? 0 },
        ].map((stat) => (
          <div key={stat.label} className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-dark-50">{stat.value}</p>
            <p className="text-xs text-dark-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/users"
          className="flex items-center gap-4 p-6 bg-dark-800/50 border border-dark-700 rounded-xl hover:border-dark-600 hover:bg-dark-800 transition-all group"
        >
          <Users className="w-8 h-8 text-crimson-500" />
          <div>
            <p className="font-medium text-dark-100 group-hover:text-white transition-colors">
              Manage Users
            </p>
            <p className="text-sm text-dark-500">Roles, bans, profiles</p>
          </div>
        </Link>
        <Link
          href="/admin/articles"
          className="flex items-center gap-4 p-6 bg-dark-800/50 border border-dark-700 rounded-xl hover:border-dark-600 hover:bg-dark-800 transition-all group"
        >
          <FileText className="w-8 h-8 text-crimson-500" />
          <div>
            <p className="font-medium text-dark-100 group-hover:text-white transition-colors">
              Manage Articles
            </p>
            <p className="text-sm text-dark-500">Publish, unpublish, delete</p>
          </div>
        </Link>
        <Link
          href="/admin/categories"
          className="flex items-center gap-4 p-6 bg-dark-800/50 border border-dark-700 rounded-xl hover:border-dark-600 hover:bg-dark-800 transition-all group"
        >
          <FolderOpen className="w-8 h-8 text-crimson-500" />
          <div>
            <p className="font-medium text-dark-100 group-hover:text-white transition-colors">
              Manage Categories
            </p>
            <p className="text-sm text-dark-500">Add, edit, reorder</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
