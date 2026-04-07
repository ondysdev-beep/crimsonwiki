// FIXED: Replaced manual Tiptap JSON walker with generateText function
import { generateText } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import type { JSONContent } from '@tiptap/core';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateRelative(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function extractTextFromJson(json: unknown): string {
  if (!json || typeof json !== 'object') return '';
  const j = json as Record<string, unknown>;
  if (j.type === 'rawHtml' && typeof j.html === 'string') {
    return j.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  try {
    return generateText(json as JSONContent, [StarterKit as any]);
  } catch {
    return '';
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + '...';
}

export const SITE_NAME = 'CrimsonWiki';
export const SITE_DESCRIPTION = 'The community-driven wiki for Crimson Desert. Guides, lore, bosses, quests, items, classes, crafting, and more.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://crimsonwiki.org';
