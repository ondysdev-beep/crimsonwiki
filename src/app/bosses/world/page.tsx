import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'World Bosses',
  description: `World bosses guide for ${SITE_NAME} -- open-world boss encounters and strategies.`,
};

export default function WorldBossesPage() {
  // Redirect to category as requested
  redirect('/category/bosses');
}
