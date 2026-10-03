import Link from 'next/link';
import { getDb } from '../../../lib/db';
import { nf, safeContainsRegex, toInt } from '../../../lib/util';

export const dynamic = 'force-dynamic';

const SORTS = {
  son: 'lastOn', peynir: 'cheeseCount', first: 'firstCount',
  bootcamp: 'bootcampCount', kayit: 'regDate', isim: 'playerName',
};
const PER_PAGE = 30;

export default async function OyuncularPage({ searchParams }) {
  const sp = await searchParams;
  const q0 = String(sp.q || '').trim().slice(0, 60);
  const sortField = SORTS[sp.s] || 'lastOn';
  const page = Math.max(1, toInt(sp.sayfa, 1));
  const q = q0
    ? { $or: [{ playerName: safeContainsRegex(q0) }, { emailAddress: safeContainsRegex(q0) }] }
    : {};
  const d = getDb();
  const [total, players] = await Promise.all([
    d.collection('accounts').countDocuments(q),
    d.collection('accounts').find(q)
      .sort(sortField === 'playerName' ? { playerName: 1 } : { [sortField]: -1 })
      .skip((page - 1) * PER_PAGE).limit(PER_PAGE)
      .project({ playerName: 1, emailAddress: 1, cheeseCount: 1, firstCount: 1, bootcampCount: 1, normalSaves: 1, staffRoles: 1 })
      .toArray(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <>
      <div className="pagehead"><h1>Oyuncular <span className="muted small">({nf(total)})</span></h1></div>
      <form method="get" action="/admin/oyuncular" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <input type="text" name="q" defaultValue={q0} placeholder="İsim veya e-posta ara..." style={{ maxWidth: 280 }} />
        <select name="s" defaultValue={sp.s || 'son'}>
          <option value="son">Son girişe göre</option>
          <option value="peynir">Peynire göre</option>
          <option value="first">First&apos;e göre</option>
          <option value="bootcamp">Bootcampa göre</option>
          <option value="kayit">Kayıt tarihine göre</option>
          <option value="isim">İsme göre</option>
        </select>
        <button className="btn btn-ghost btn-sm">Ara</button>
      </form>
      <div className="panel tight" style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Oyuncu</th><th>E-posta</th><th className="num">🧀</th><th className="num">First</th>
              <th className="num">Bootcamp</th><th className="num">Kurtarma</th><th>Yetki</th><th />
            </tr>
          </thead>
          <tbody>
            {players.length ? players.map(p => (
              <tr key={String(p._id)}>
                <td><b>{p.playerName}</b></td>
                <td className="muted small">{p.emailAddress || '—'}</td>
                <td className="num">{nf(p.cheeseCount)}</td>
                <td className="num">{nf(p.firstCount)}</td>
                <td className="num">{nf(p.bootcampCount)}</td>
                <td className="num">{nf(p.normalSaves)}</td>
                <td>
                  {(p.staffRoles || []).map(r => (
                    <span key={r} className="chip plain" style={{ fontSize: 10.5, padding: '2px 8px' }}>{r}</span>
                  ))}
                </td>
                <td><Link className="btn btn-ghost btn-sm" href={`/admin/oyuncular/${p._id}`}>Düzenle</Link></td>
              </tr>
            )) : <tr><td colSpan={8} className="muted">Sonuç yok</td></tr>}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="pager">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .map(p => (
              <Link key={p} className={'pg' + (p === page ? ' cur' : '')}
                href={`/admin/oyuncular?q=${encodeURIComponent(q0)}&s=${encodeURIComponent(sp.s || 'son')}&sayfa=${p}`}>{p}</Link>
            ))}
        </div>
      )}
    </>
  );
}
