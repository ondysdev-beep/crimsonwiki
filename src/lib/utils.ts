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
  const content = json as { content?: unknown[] };
  if (!content.content) return '';

  function walkNodes(nodes: unknown[]): string {
    let text = '';
    for (const node of nodes) {
      const n = node as { type?: string; text?: string; content?: unknown[] };
      if (n.text) text += n.text + ' ';
      if (n.content) text += walkNodes(n.content);
    }
    return text;
  }
  return walkNodes(content.content).trim();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + '...';
}

export const SITE_NAME = 'CrimsonWiki';
export const SITE_DESCRIPTION = 'The community-driven wiki for Crimson Desert. Guides, lore, bosses, quests, items, classes, crafting, and more.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://crimsonwiki.org';
