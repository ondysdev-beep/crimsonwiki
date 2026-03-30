'use client';

import { useState, useEffect } from 'react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '36px',
        height: '36px',
        background: 'var(--bg-2)',
        border: '1px solid var(--border-2)',
        color: 'var(--text-2)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        zIndex: 50,
        transition: 'color 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--crimson-bright)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(155,32,32,0.4)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-2)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-2)';
      }}
    >
      ▲
    </button>
  );
}
