import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function GET() {
  const supabase = await createClient();

  // Fetch all published article slugs
  const { data: articles } = await supabase
    .from('articles')
    .select('slug')
    .eq('is_published', true);

  if (!articles || articles.length === 0) {
    redirect('/');
  }

  // Select a random article
  const randomIndex = Math.floor(Math.random() * articles.length);
  const randomArticle = articles[randomIndex];

  redirect(`/wiki/${randomArticle.slug}`);
}
