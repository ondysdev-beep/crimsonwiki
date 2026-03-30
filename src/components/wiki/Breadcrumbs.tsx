import Link from 'next/link';

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  crumbs: Crumb[];
}

export function Breadcrumbs({ crumbs }: Props) {
  if (crumbs.length <= 1) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `https://crimsonwiki.org${c.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" style={{ marginBottom: '10px' }}>
        <ol style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', listStyle: 'none', padding: 0, margin: 0, fontSize: '11px', color: 'var(--text-3)' }}>
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {i > 0 && <span style={{ margin: '0 2px', opacity: 0.5 }}>›</span>}
                {crumb.href && !isLast ? (
                  <Link href={crumb.href} style={{ color: 'var(--link)', textDecoration: 'none' }}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span style={{ color: isLast ? 'var(--text-1)' : 'var(--text-2)' }}>{crumb.label}</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
