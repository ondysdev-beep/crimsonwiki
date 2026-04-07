import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_NAV } from '@/lib/nav-config';
import type { NavSection } from '@/lib/nav-config';
export type { NavSection } from '@/lib/nav-config';

export const getNavConfig = cache(async function getNavConfigImpl(): Promise<NavSection[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'nav_config')
      .single();
    if (data?.value) {
      const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
      if (Array.isArray(parsed)) return parsed as NavSection[];
    }
  } catch { /* fall through */ }
  return DEFAULT_NAV;
});

export interface SiteSettings {
  site_notice_enabled: boolean;
  site_notice_text: string;
  discord_url: string;
  stats_min_articles: number;
  stub_threshold: number;
  footer_tagline: string;
}

const DEFAULTS: SiteSettings = {
  site_notice_enabled: true,
  site_notice_text: 'Welcome to CrimsonWiki! Help us build the most complete Crimson Desert resource — create an account and start contributing today.',
  discord_url: 'https://discord.gg/crimsondesert',
  stats_min_articles: 50,
  stub_threshold: 300,
  footer_tagline: 'The community-driven encyclopedia for Crimson Desert.',
};

export const getSettings = cache(async function getSettingsImpl(): Promise<SiteSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value');

    if (error || !data) return DEFAULTS;

    const map: Record<string, string> = {};
    data.forEach(r => { map[r.key] = r.value; });

    return {
      site_notice_enabled: map.site_notice_enabled !== 'false',
      site_notice_text: map.site_notice_text ?? DEFAULTS.site_notice_text,
      discord_url: map.discord_url ?? DEFAULTS.discord_url,
      stats_min_articles: parseInt(map.stats_min_articles ?? '') || DEFAULTS.stats_min_articles,
      stub_threshold: parseInt(map.stub_threshold ?? '') || DEFAULTS.stub_threshold,
      footer_tagline: map.footer_tagline ?? DEFAULTS.footer_tagline,
    };
  } catch {
    return DEFAULTS;
  }
});
