import Link from 'next/link';
import { getDb } from '../../../lib/db';
import { fmtDateTime, nf } from '../../../lib/util';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Analitik — Yönetim — HobbyMice', robots: { index: false, follow: false } };

function dayKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function lastNDays(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    out.push({ key: dayKey(d), label: `${d.getDate()}.${d.getMonth() + 1}`, start: new Date(d.getFullYear(), d.getMonth(), d.getDate()), end: new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1) });
  }
  return out;
}

// Kucuk bar grafigi: bars=[{label, values:[{v, title, color}]}]
function BarChart({ bars, colors, height = 90 }) {
  const max = Math.max(1, ...bars.flatMap((b) => b.values.map((v) => v.v)));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height, paddingTop: 6 }}>
      {bars.map((b, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: height - 18 }}>
            {b.values.map((v, j) => (
              <div key={j} title={`${b.label} ${v.title}: ${nf(v.v)}`} style={{ width: Math.max(6, 24 / bars.length), height: Math.max(2, ((height - 18) * v.v) / max), background: colors[j], borderRadius: 2 }} />
            ))}
          </div>
          <div className="muted" style={{ fontSize: 9 }}>{b.label}</div>
        </div>
      ))}
    </div>
  );
}

// Son 24 saatin online cereyi (server_stats 1dk orneklerinden, 15dk asalme)
function OnlineSpark({ samples }) {
  if (!samples.length) return <div className="muted small">Henüz veri yok (oyun sunucusu dakikalık örnek yazıyor).</div>;
  const w = 560, h = 90, pad = 4;
  const max = Math.max(1, ...samples.map((s) => s.players));
  const pts = samples.map((s, i) => `${pad + (i * (w - pad * 2)) / Math.max(1, samples.length - 1)},${h - pad - ((h - pad * 2) * s.players) / max}`).join(' ');
  const now = samples[samples.length - 1];
  return (
    <>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h, display: 'block' }}>
        <polyline points={pts} fill="none" stroke="#ffcc40" strokeWidth="2" />
      </svg>
      <div className="muted small">Son örnek: {now.players} oyuncu / {now.rooms} oda ({fmtDateTime(new Date(now.ts * 1000))})</div>
    </>
  );
}

export default async function AdminAnalytics() {
  const d = getDb();
  const days = lastNDays(14);
  const day0 = days[0].start;
  const today0 = days[days.length - 1].start;

  const [
    totalPlayers,
    regToday,
    loginsToday,
    uniquePlayersToday,
    onlineNowDocs,
    recentLogins,
    recentRegs,
    loginDocs,
    regDocs,
    statDocs,
    visitDocs,
  ] = await Promise.all([
    d.collection('accounts').countDocuments({}),
    d.collection('accounts').countDocuments({ regDate: { $gte: Math.floor(today0.getTime() / 1000) } }),
    d.collection('connexionlog').countDocuments({ date: { $gte: Math.floor(today0.getTime() / 1000) } }),
    d.collection('connexionlog').distinct('playerName', { date: { $gte: Math.floor(today0.getTime() / 1000) } }),
    d.collection('server_stats').find({}).sort({ ts: -1 }).limit(1).toArray(),
    d.collection('connexionlog').find({}).sort({ date: -1 }).limit(10).toArray(),
    d.collection('accounts').find({}, { sort: { regDate: -1 }, limit: 10, projection: { playerName: 1, regDate: 1 } }).toArray(),
    d.collection('connexionlog').find({ date: { $gte: Math.floor(day0.getTime() / 1000) } }, { projection: { date: 1 } }).toArray(),
    d.collection('accounts').find({ regDate: { $gte: Math.floor(day0.getTime() / 1000) } }, { projection: { regDate: 1 } }).toArray(),
    d.collection('server_stats').find({ ts: { $gte: Math.floor((Date.now() - 24 * 3600000) / 1000) } }, { projection: { ts: 1, players: 1, rooms: 1 }, sort: { ts: 1 } }).toArray(),
    d.collection('site_visits').find({ ts: { $gte: day0 } }, { projection: { ts: 1, path: 1, ref: 1, ip: 1 } }).toArray(),
  ]);

  // 14 gunluk seriler (JS tarafinda gun kovalarina dokme)
  const loginBars = days.map((day) => ({ label: day.label, values: [{ v: 0, title: 'giriş' }] }));
  for (const doc of loginDocs) {
    const k = dayKey(new Date(doc.date * 1000));
    const bucket = loginBars.find((b) => b.label === days.find((x) => x.key === k)?.label);
    if (bucket) bucket.values[0].v++;
  }
  const regBars = days.map((day) => ({ label: day.label, values: [{ v: 0, title: 'kayıt' }] }));
  for (const doc of regDocs) {
    if (!doc.regDate) continue;
    const k = dayKey(new Date(doc.regDate * 1000));
    const bucket = regBars.find((b) => b.label === days.find((x) => x.key === k)?.label);
    if (bucket) bucket.values[0].v++;
  }
  const pvBars = days.map((day) => ({ label: day.label, values: [{ v: 0, title: 'görüntüleme' }, { v: 0, title: 'tekil ziyaretçi' }] }));
  const seenIps = new Set();
  for (const doc of visitDocs) {
    const k = dayKey(new Date(doc.ts));
    const bucket = pvBars.find((b) => b.label === days.find((x) => x.key === k)?.label);
    if (!bucket) continue;
    bucket.values[0].v++;
    const ipKey = dayKey(new Date(doc.ts)) + '|' + doc.ip;
    if (!seenIps.has(ipKey)) { seenIps.add(ipKey); bucket.values[1].v++; }
  }

  // Trafik kaynaklari + populer sayfalar
  const refCount = {};
  for (const doc of visitDocs) {
    let host = 'doğrudan';
    try { if (doc.ref) host = new URL(doc.ref).host || 'doğrudan'; } catch {}
    refCount[host] = (refCount[host] || 0) + 1;
  }
  const topRefs = Object.entries(refCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const pageCount = {};
  for (const doc of visitDocs) pageCount[doc.path] = (pageCount[doc.path] || 0) + 1;
  const topPages = Object.entries(pageCount).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // 15dk asalme ile online cereyi
  const spark = statDocs.filter((_, i) => i % 15 === 0 || i === statDocs.length - 1);
  const onlineNow = onlineNowDocs[0] || null;

  return (
    <>
      <div className="stat-grid">
        <div className="stat"><div className="v">{nf(totalPlayers)}</div><div className="l">Kayıtlı oyuncu</div></div>
        <div className="stat"><div className="v">{nf(loginsToday)}</div><div className="l">Bugün oyuna giriş</div></div>
        <div className="stat"><div className="v">{nf(uniquePlayersToday.length)}</div><div className="l">Bugün tekil oyuncu</div></div>
        <div className="stat"><div className="v">{onlineNow ? nf(onlineNow.players) : '—'}</div><div className="l">Şu an oyunda</div></div>
        <div className="stat"><div className="v">{nf(pvBars[pvBars.length - 1].values[0].v)}</div><div className="l">Bugün site PV</div></div>
        <div className="stat"><div className="v">{nf(pvBars[pvBars.length - 1].values[1].v)}</div><div className="l">Bugün tekil ziyaretçi</div></div>
      </div>

      <h2>Oyun trafiği</h2>
      <div className="panel tight" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18 }}>
        <div><b>Son 24 saat — oyundaki oyuncu sayısı</b><OnlineSpark samples={spark} /></div>
        <div><b>Son 14 gün — oyuna giriş</b><BarChart bars={loginBars} colors={['#4fc06a']} /></div>
        <div><b>Son 14 gün — yeni kayıt</b><BarChart bars={regBars} colors={['#ffcc40']} /></div>
      </div>

      <h2>Site trafiği (gerçek tarayıcı ziyaretleri)</h2>
      <div className="panel tight">
        <b>Son 14 gün — görüntüleme (sarı) ve tekil ziyaretçi (yeşil)</b>
        <BarChart bars={pvBars} colors={['#ffcc40', '#4fc06a']} height={110} />
        <p className="muted small" style={{ margin: '6px 0 0' }}>Takip {day0.toLocaleDateString('tr-TR')} tarihinde başladı; statik dosyalar (/play, /dl, /assets) ve admin sayfaları sayılmaz.</p>
      </div>

      <div className="panel tight" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 18 }}>
        <div>
          <b>Trafik kaynakları (14 gün)</b>
          <table className="tbl"><tbody>
            {topRefs.length ? topRefs.map(([host, count], i) => (
              <tr key={i}><td>{host}</td><td style={{ textAlign: 'right' }} className="muted">{nf(count)}</td></tr>
            )) : <tr><td className="muted">Henüz veri yok</td></tr>}
          </tbody></table>
        </div>
        <div>
          <b>En çok görüntülenen sayfalar (14 gün)</b>
          <table className="tbl"><tbody>
            {topPages.length ? topPages.map(([path, count], i) => (
              <tr key={i}><td>{path}</td><td style={{ textAlign: 'right' }} className="muted">{nf(count)}</td></tr>
            )) : <tr><td className="muted">Henüz veri yok</td></tr>}
          </tbody></table>
        </div>
      </div>

      <h2>Son oyuna girişler</h2>
      <div className="panel tight">
        <table className="tbl">
          <tbody>
            {recentLogins.length ? recentLogins.map((l, i) => (
              <tr key={i}>
                <td style={{ whiteSpace: 'nowrap' }} className="muted small">{fmtDateTime(new Date(l.date * 1000))}</td>
                <td><b>{l.playerName}</b></td>
                <td className="muted small">{l.ipCountry || '?'} · {l.gameCommunity || '?'}</td>
                <td className="muted small">{l.ipAddress}</td>
              </tr>
            )) : <tr><td className="muted">Henüz kayıt yok</td></tr>}
          </tbody>
        </table>
      </div>

      <h2>Son kayıtlar</h2>
      <div className="panel tight">
        <table className="tbl">
          <tbody>
            {recentRegs.length ? recentRegs.map((r, i) => (
              <tr key={i}>
                <td><b>{r.playerName}</b></td>
                <td style={{ whiteSpace: 'nowrap' }} className="muted small">{r.regDate ? fmtDateTime(new Date(r.regDate * 1000)) : '—'}</td>
              </tr>
            )) : <tr><td className="muted">Henüz kayıt yok</td></tr>}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 18 }}><Link className="btn btn-ghost" href="/admin">← Yönetim özetine dön</Link></p>
    </>
  );
}
