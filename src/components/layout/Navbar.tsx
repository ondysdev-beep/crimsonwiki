'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NavbarAuth } from './NavbarAuth';

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="nav-wrap">
      <nav className="nav">
        <Link href="/" className="logo">
          Crimson<span>Wiki</span>
        </Link>

        <div className="nav-links">
          <Link href="/" className={`nav-link${isActive('/') ? ' active' : ''}`}>Home</Link>
          <Link href="/search" className={`nav-link${isActive('/search') ? ' active' : ''}`}>Categories</Link>
          <Link href="/contribute" className={`nav-link${isActive('/contribute') ? ' active' : ''}`}>Contribute</Link>
        </div>

        <div className="nav-right">
          <Link href="/search" className="search-pill">
            Search the wiki...
          </Link>

          <NavbarAuth />
        </div>
      </nav>
    </div>
  );
}
