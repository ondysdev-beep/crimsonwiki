'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NavbarAuth } from './NavbarAuth';
import { useSidebar } from '@/lib/context/SidebarContext';

export function Navbar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const { toggleMobile } = useSidebar();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const mainLinks = [
    { name: 'Home', href: '/' },
    { name: 'Walkthrough', href: '/category/walkthrough' },
    { name: 'Quests', href: '/category/quests' },
    { name: 'Bosses', href: '/category/bosses' },
    { name: 'Classes', href: '/category/classes' },
    { name: 'Items', href: '/category/items' },
    { name: 'Lore', href: '/category/lore' },
  ];

  const subLinks = [
    { name: 'Characters', href: '/category/characters' },
    { name: 'Factions', href: '/category/factions' },
    { name: 'Locations', href: '/category/locations' },
    { name: 'Crafting', href: '/category/crafting' },
    { name: 'Mounts', href: '/category/mounts' },
    { name: 'Activities', href: '/category/activities' },
    { name: 'Camp', href: '/category/camp' },
    { name: 'Collectibles', href: '/category/collectibles' },
    { name: 'Tips & Tricks', href: '/category/tips' },
    { name: 'Random Page', href: '/special/random' },
    { name: 'Contribute', href: '/contribute' },
    { name: 'Discord', href: '/discord' },
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

        <button
          className="topbar-hamburger"
          onClick={toggleMobile}
          aria-label="Open navigation"
        >
          <span /><span /><span />
        </button>

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
