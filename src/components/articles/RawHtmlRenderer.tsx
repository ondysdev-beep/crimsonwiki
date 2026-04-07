'use client';
import { useEffect, useRef } from 'react';

export function RawHtmlRenderer({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const onLoad = () => {
      try {
        const doc = iframe.contentDocument;
        if (doc) {
          const h = doc.documentElement.scrollHeight;
          if (h > 0) iframe.style.height = h + 'px';
        }
      } catch {
        // cross-origin or unavailable
      }
    };
    iframe.addEventListener('load', onLoad);
    return () => iframe.removeEventListener('load', onLoad);
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={html}
      style={{ width: '100%', border: 'none', display: 'block', minHeight: 200 }}
      sandbox="allow-scripts allow-same-origin"
      title="Article HTML content"
    />
  );
}
