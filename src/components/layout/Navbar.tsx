'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NavbarAuth } from './NavbarAuth';

export function Navbar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const mainLinks = [
    { name: 'Home', href: '/' },
    { name: 'Walkthrough', href: '/walkthrough' },
    { name: 'Bosses', href: '/bosses' },
    { name: 'Items', href: '/items' },
    { name: 'Quests', href: '/quests' },
    { name: 'Builds', href: '/systems/builds' },
    { name: 'Characters', href: '/characters' }
  ];

  const subLinks = [
    { name: 'All Pages', href: '/special:allpages' },
    { name: 'Recent Changes', href: '/special:recentchanges' },
    { name: 'New Articles', href: '/special:newpages' },
    { name: 'Random Page', href: '/special:random' },
    { name: 'Community Portal', href: '/community' },
    { name: 'Discord', href: '/discord' },
    { name: 'Contribute', href: '/contribute' }
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* TOP BAR */}
      <header className="topbar">
        <Link href="/" className="topbar-logo">
          ⚔ CRIMSONWIKI
        </Link>

        <div className="topbar-links">
          {mainLinks.map(link => (
            <Link
              key={link.name}
              href={link.href}
              className={`topbar-link ${isActive(link.href) ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="topbar-right">
          <form onSubmit={handleSearch} className="topbar-search">
            <input
              type="text"
              placeholder="Search wiki..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="topbar-search-btn">
              Go
            </button>
          </form>

          <NavbarAuth />
        </div>
      </header>

      {/* SUBNAV */}
      <nav className="subnav">
        {subLinks.map(link => (
          <Link
            key={link.name}
            href={link.href}
            className={`subnav-item ${isActive(link.href) ? 'active' : ''}`}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </>
  );
}
