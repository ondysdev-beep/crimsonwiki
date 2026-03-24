import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { SITE_NAME } from '@/lib/utils';

export function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-700 mt-auto">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <BookOpen className="w-6 h-6 text-crimson-500" />
              <span className="font-display text-lg font-bold text-dark-50">
                Crimson<span className="text-crimson-500">Wiki</span>
              </span>
            </Link>
            <p className="text-sm text-dark-400 max-w-md">
              {SITE_NAME} is a community-driven wiki for Crimson Desert.
              All content is created and maintained by the community. Crimson Desert
              is a trademark of Pearl Abyss. This site is not affiliated with Pearl Abyss.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-dark-200 uppercase tracking-wider mb-3">
              Wiki
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/category/quests" className="text-dark-400 hover:text-crimson-400 transition-colors">
                  Quests
                </Link>
              </li>
              <li>
                <Link href="/category/bosses" className="text-dark-400 hover:text-crimson-400 transition-colors">
                  Bosses
                </Link>
              </li>
              <li>
                <Link href="/category/items" className="text-dark-400 hover:text-crimson-400 transition-colors">
                  Items
                </Link>
              </li>
              <li>
                <Link href="/category/classes" className="text-dark-400 hover:text-crimson-400 transition-colors">
                  Classes
                </Link>
              </li>
              <li>
                <Link href="/category/lore" className="text-dark-400 hover:text-crimson-400 transition-colors">
                  Lore
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-semibold text-dark-200 uppercase tracking-wider mb-3">
              Community
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/wiki/new" className="text-dark-400 hover:text-crimson-400 transition-colors">
                  Create Article
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-dark-400 hover:text-crimson-400 transition-colors">
                  Search Wiki
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-dark-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-dark-500">
            &copy; {new Date().getFullYear()} {SITE_NAME}. Community content available under CC BY-SA 4.0.
          </p>
          <div className="flex gap-4 text-xs text-dark-500">
            <Link href="/privacy" className="hover:text-dark-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-dark-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
