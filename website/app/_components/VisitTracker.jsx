'use client';
// Ziyaret takipçisi: her sayfa görünümünde /api/track'e tek atımlık (keepalive)
// bildirim yollar. Admin sayfaları takip edilmez. Botsuz, gerçek tarayıcı trafiği.
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function VisitTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    try {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathname, ref: document.referrer || '' }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }, [pathname]);
  return null;
}
