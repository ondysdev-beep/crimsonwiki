'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/lib/types/database';

export function Sidebar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (data) setCategories(data as Category[]);
    };
    fetchCategories();
  }, []);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col sticky top-16 h-[calc(100vh-4rem)] border-r border-dark-700 bg-dark-900/50 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'
          }`}
      >
        <div className="flex items-center justify-between p-3 border-b border-dark-700/50">
          {!collapsed && (
            <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider">
              Categories
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 text-dark-400 hover:text-dark-200 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {categories.map((category) => {
            const isActive = pathname === `/category/${category.slug}`;
            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg text-sm transition-all ${isActive
                    ? 'bg-dark-700 text-white'
                    : 'text-dark-300 hover:text-dark-100 hover:bg-dark-800'
                  }`}
                title={category.name}
              >
                <span className="text-lg shrink-0">{category.icon}</span>
                {!collapsed && (
                  <span className="truncate">{category.name}</span>
                )}
                {isActive && !collapsed && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: category.color || '#dc2626' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="p-3 border-t border-dark-700/50">
            <Link
              href="/wiki/new"
              className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-crimson-600/10 hover:bg-crimson-600/20 text-crimson-400 text-sm font-medium rounded-lg border border-crimson-600/20 transition-colors"
            >
              Create Article
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
