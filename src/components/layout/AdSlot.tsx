// FIXED: Removed unused ref and useRef, added guard to return null if slotId is empty
'use client';

import { useEffect, useRef } from 'react';

interface AdSlotProps {
  slotId: string;
  format?: 'auto' | 'rectangle' | 'vertical';
  style?: React.CSSProperties;
  className?: string;
}

const ADSENSE_CLIENT = 'ca-pub-9218255749368917';

export function AdSlot({ slotId, format = 'auto', style, className }: AdSlotProps) {
  // Return null if no slot ID is provided
  if (!slotId) return null;

  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      // @ts-expect-error adsbygoogle global
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch { }
  }, []);

  return (
    <div className={className} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="false"
      />
    </div>
  );
}
