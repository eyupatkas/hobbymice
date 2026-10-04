import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Güncellemeler — HobbyMice',
  description: 'HobbyMice sunucusunun güncellemeleri: yeni özellikler, oyun içi komutlar, güvenlik iyileştirmeleri ve site yenilikleri.',
  alternates: { canonical: '/guncellemeler' },
};

const TAG_STYLE = {
  oyun: { bg: 'rgba(79,192,106,.14)', color: '#4fc06a', label: 'Oyun' },
  güvenlik: { bg: 'rgba(224,82,82,.14)', color: '#e05252', label: 'Güvenlik' },
  site: { bg: 'rgba(255,204,64,.14)', color: '#ffcc40', label: 'Site' },
  'altyapı': { bg: 'rgba(169,156,199,.14)', color: '#a99cc7', label: 'Altyapı' },
};

function loadUpdates() {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'content', 'updates.json'), 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data.entries) ? data.entries : [];
  } catch {
    return [];
  }
}

function fmtDate(iso) {
  const d = new Date(iso + 'T12:00:00');
  return isNaN(d) ? iso : d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function UpdatesPage() {
  const entries = loadUpdates();
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        📰 Güncellemeler
      </h1>
      <p className="muted" style={{ marginTop: -6 }}>
        HobbyMice sürekli gelişiyor — yeni özellikler, düzeltmeler ve iyileştirmeler burada.
      </p>

      {entries.length === 0 && (
        <div className="panel" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 40 }}>🧀</div>
          <p className="muted">Henüz güncelleme notu yok — yakında buradayız!</p>
        </div>
      )}

      {entries.map((e, i) => {
        const tag = TAG_STYLE[e.tag] || TAG_STYLE.site;
        return (
          <div key={i} className="panel" style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>{e.title}</h2>
              <span style={{
                fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                background: tag.bg, color: tag.color,
              }}>{tag.label}</span>
              <span className="muted small" style={{ marginLeft: 'auto' }}>📅 {fmtDate(e.date)}</span>
            </div>
            <ul style={{ margin: '12px 0 0', paddingLeft: 4, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {(e.items || []).map((item, j) => (
                <li key={j} style={{ lineHeight: 1.65, fontSize: 14.5, display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--cheese)' }}>▸</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <p style={{ marginTop: 20 }}>
        <Link className="btn btn-ghost" href="/">← Ana sayfaya dön</Link>
        <span className="muted small" style={{ marginLeft: 12 }}>Oyna butonuyla sen de aramıza katıl! 🧀</span>
      </p>
    </div>
  );
}
