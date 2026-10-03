'use client';
// Sürüm-farkındalıklı indirme bilgisi: mount sonrası /dl/version.json okunur,
// sayfadaki tüm ZIP bağlantıları sürümlü adrese çevrilir (cache-kırıcı) ve
// beklenen boyut/sürüm metni yazılır. Inline script yerine client component —
// hydration zamanlamasına bağlı kalmadan her sayfada çalışır.
import { useEffect } from 'react';

export default function DlInfo() {
  useEffect(() => {
    let dead = false;
    fetch('/dl/version.json', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(j => {
        if (dead) return;
        const mb = (j.bytes / 1048576).toFixed(0);
        const info = document.querySelector('[data-dl]');
        if (info) info.textContent = '⬇ İndirme: ~' + mb + ' MB · En son kararlı sürüm v' + j.v;
        document.querySelectorAll('a[href="/dl/Hobby-Mice.zip"]').forEach(a => {
          a.setAttribute('href', '/dl/HobbyMice-v' + j.v + '.zip');
        });
      })
      .catch(() => {});
    return () => { dead = true; };
  }, []);
  return <div id="dl-info" className="hero-dl-info" data-dl />;
}
