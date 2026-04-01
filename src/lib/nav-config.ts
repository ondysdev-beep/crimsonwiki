export interface NavLink { name: string; href: string; }
export interface NavSection { name: string; links: NavLink[]; }

export const DEFAULT_NAV: NavSection[] = [
  { name: 'Getting Started', links: [
    { name: 'Main Page', href: '/' },
    { name: 'About CrimsonWiki', href: '/about' },
    { name: 'Editing Guide', href: '/help/editing' },
    { name: 'Style Guide', href: '/help/style' },
    { name: 'Contribute', href: '/contribute' },
  ]},
  { name: 'Story & Quests', links: [
    { name: 'Quests', href: '/category/quests' },
    { name: 'Walkthrough', href: '/category/walkthrough' },
    { name: 'Lore', href: '/category/lore' },
    { name: 'Factions', href: '/category/factions' },
    { name: 'Characters', href: '/category/characters' },
  ]},
  { name: 'Combat', links: [
    { name: 'Bosses', href: '/category/bosses' },
    { name: 'Classes', href: '/category/classes' },
    { name: 'Locations', href: '/category/locations' },
  ]},
  { name: 'Items & Economy', links: [
    { name: 'Items', href: '/category/items' },
    { name: 'Crafting', href: '/category/crafting' },
    { name: 'Camp', href: '/category/camp' },
    { name: 'Mounts', href: '/category/mounts' },
    { name: 'Collectibles', href: '/category/collectibles' },
  ]},
  { name: 'Community', links: [
    { name: 'Activities', href: '/category/activities' },
    { name: 'Tips & Tricks', href: '/category/tips' },
    { name: 'Discord Server', href: '/discord' },
    { name: 'Community Portal', href: '/community' },
  ]},
  { name: 'Wiki Tools', links: [
    { name: 'All Pages', href: '/special/allpages' },
    { name: 'Recent Changes', href: '/special/recentchanges' },
    { name: 'New Pages', href: '/special/newpages' },
    { name: 'Statistics', href: '/statistics' },
    { name: 'Categories', href: '/categories' },
  ]},
];
