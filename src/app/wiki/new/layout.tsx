import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Article',
  description: 'Create a new wiki article on CrimsonWiki.',
  robots: { index: false, follow: false },
};

export default function NewArticleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
