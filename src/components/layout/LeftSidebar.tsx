'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarSections = {
  "Getting Started": [
    { name: "Main Page", href: "/" },
    { name: "About CrimsonWiki", href: "/about" },
    { name: "Editing Guide", href: "/help:editing" },
    { name: "Style Guide", href: "/help:style" },
    { name: "Recent Changes", href: "/special:recentchanges" }
  ],
  "Walkthrough": [
    { name: "Prologue", href: "/walkthrough/prologue" },
    { name: "Chapter 1", href: "/walkthrough/chapter-1" },
    { name: "Chapter 2", href: "/walkthrough/chapter-2" },
    { name: "Chapter 3", href: "/walkthrough/chapter-3" },
    { name: "Chapter 4", href: "/walkthrough/chapter-4" },
    { name: "All Chapters", href: "/walkthrough" }
  ],
  "Bosses": [
    { name: "World Bosses", href: "/bosses/world" },
    { name: "Dungeon Bosses", href: "/bosses/dungeon" },
    { name: "Field Bosses", href: "/bosses/field" },
    { name: "Boss List", href: "/bosses" }
  ],
  "Quests": [
    { name: "Main Quests", href: "/quests/main" },
    { name: "Side Quests", href: "/quests/side" },
    { name: "Faction Quests", href: "/quests/faction" },
    { name: "Hidden Quests", href: "/quests/hidden" }
  ],
  "Items": [
    { name: "Weapons", href: "/items/weapons" },
    { name: "Armor", href: "/items/armor" },
    { name: "Accessories", href: "/items/accessories" },
    { name: "Consumables", href: "/items/consumables" },
    { name: "Materials", href: "/items/materials" }
  ],
  "Characters": [
    { name: "Kliff", href: "/characters/kliff" },
    { name: "Damiane", href: "/characters/damiane" },
    { name: "Oongka", href: "/characters/oongka" },
    { name: "All Characters", href: "/characters" }
  ],
  "Locations": [
    { name: "Hernand", href: "/locations/hernand" },
    { name: "Demeniss", href: "/locations/demeniss" },
    { name: "Delesyia", href: "/locations/delesyia" },
    { name: "Pailune", href: "/locations/pailune" },
    { name: "Maps", href: "/maps" }
  ],
  "Systems": [
    { name: "Combat", href: "/systems/combat" },
    { name: "Crafting", href: "/systems/crafting" },
    { name: "Skills", href: "/systems/skills" },
    { name: "Builds", href: "/systems/builds" },
    { name: "Leveling", href: "/systems/leveling" }
  ]
};

export function LeftSidebar() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.keys(sidebarSections).map(key => [key, true]))
  );
  const pathname = usePathname();

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="left-sidebar">
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
}
