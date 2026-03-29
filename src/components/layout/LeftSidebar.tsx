'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/lib/context/SidebarContext';

const STORAGE_KEY = 'sidebar-open-sections';

const sidebarSections = {
  "Getting Started": [
    { name: "Main Page", href: "/" },
    { name: "About CrimsonWiki", href: "/about" },
    { name: "Editing Guide", href: "/help/editing" },
    { name: "Style Guide", href: "/help/style" },
    { name: "Recent Changes", href: "/special/recentchanges" }
  ],
  "Quests": [
    { name: "Main Quests", href: "/quests/main" },
    { name: "Side Quests", href: "/quests/side" },
    { name: "Faction Quests", href: "/quests/faction" },
    { name: "Hidden Quests", href: "/quests/hidden" },
    { name: "All Quests", href: "/category/quests" }
  ],
};

export function LeftSidebar() {
  const defaultOpen = Object.fromEntries(Object.keys(sidebarSections).map(key => [key, true]));
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(defaultOpen);
  const { mobileOpen, closeMobile } = useSidebar();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setOpenSections(JSON.parse(saved));
    } catch { }
  }, []);

  const pathname = usePathname();

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => {
      const next = { ...prev, [section]: !prev[section] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { }
      return next;
    });
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const inner = (
    <aside className={`left-sidebar${mobileOpen ? ' mobile-open' : ''}`}>
      {Object.entries(sidebarSections).map(([section, links]) => (
        <div key={section} className="sidebar-section">
          <button
            className="sidebar-section-hd"
            onClick={() => toggleSection(section)}
          >
            {section}
            <span style={{ fontSize: '9px', opacity: '0.5' }}>
              {openSections[section] ? '▲' : '▼'}
            </span>
          </button>
          {openSections[section] && links.map(link => (
            <Link
              key={link.name}
              href={link.href}
              className={`sidebar-link ${isActive(link.href) ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      ))}
    </aside>
  );

  return (
    <>
      {mobileOpen && (
        <div className="mobile-sidebar-overlay" onClick={closeMobile} />
      )}
      {inner}
    </>
  );
}
