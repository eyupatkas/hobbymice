import Link from 'next/link';
import { getDb } from '../../lib/db';
import { getUser } from '../../lib/session';
import { LB_DEFS } from '../../lib/site-data';
import { nf } from '../../lib/util';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const tur = Object.prototype.hasOwnProperty.call(LB_DEFS, sp.tur) ? sp.tur : 'peynir';
  return {
    title: `En İyi Oyuncular — ${LB_DEFS[tur].label} Sıralaması | HobbyMice`,
    description: `HobbyMice'in en iyi oyuncuları: ${LB_DEFS[tur].label.toLowerCase()} sıralamasında ilk 50. Sen de oyna, listeye gir!`,
    alternates: { canonical: '/siralama' },
  };
}

export default async function SiralamaPage({ searchParams }) {
  const sp = await searchParams;
  const tur = Object.prototype.hasOwnProperty.call(LB_DEFS, sp.tur) ? sp.tur : 'peynir';
  const def = LB_DEFS[tur];
  const proj = { playerName: 1 };
  proj[def.field] = 1;

  const user = await getUser();
  const d = getDb();
  const docs = await d.collection('accounts').find({}, { projection: proj })
    .sort({ [def.field]: -1 }).limit(50).toArray();
  let myRank = null;
  if (user && !docs.some(x => x.playerName === user.playerName)) {
    const acc = await d.collection('accounts').findOne({ _id: user.accountId }, { projection: proj });
    if (acc && acc[def.field] > 0) {
      const higher = await d.collection('accounts').countDocuments({ [def.field]: { $gt: acc[def.field] } });
      myRank = higher + 1;
    }
  }

  const medals = ['🥇', '🥈', '🥉'];
  const podium = docs.slice(0, 3);
  const podiumCards = [];
  if (podium.length === 3) podiumCards.push([podium[1], 1]);
  podiumCards.push([podium[0], 0]);
  if (podium.length === 2) podiumCards.push([podium[1], 1]);
  if (podium.length === 3) podiumCards.push([podium[2], 2]);

  // Haftalık peynir yarışmasının dağıtılmış son sonuçları (oyunda /haftalik).
  const champions = await d.collection('weekly_winners')
    .find({}).sort({ week: -1 }).limit(1).next();
  const championPrizes = ['🍓3 + 🧀300 + 👑 unvan', '🍓2 + 🧀200', '🍓1 + 🧀100'];

  return (
    <>
      <div className="pagehead">
        <h1>Oyuncu Sıralaması 🏆</h1>
        <p>Sunucunun efsaneleri — tablo canlı olarak oyun veritabanından okunur, her turdan sonra güncellenir.</p>
      </div>
      <div className="lb-tabs">
        {Object.entries(LB_DEFS).map(([k, v]) => (
          <Link key={k} className={k === tur ? 'cur' : ''} href={`/siralama?tur=${k}`}>{v.emoji} {v.label}</Link>
        ))}
      </div>
      <div className="panel tight lb-desc">{def.emoji} <b>{def.label} nedir?</b> {def.desc}</div>
      {champions && Array.isArray(champions.winners) && champions.winners.length > 0 && (
        <div className="panel tight">
          <h2 style={{ marginTop: 0 }}>🏅 Haftanın Şampiyonları <span style={{ fontWeight: 400, opacity: 0.7 }}>({champions.week})</span></h2>
          <p style={{ marginTop: 0, opacity: 0.85 }}>Her pazartesi haftanın en çok peynir toplayan 3 faresi ödüllendirilir — oyunda <b>/haftalik</b> ile puanını gör.</p>
          <table className="tbl">
            <thead>
              <tr><th>Sıra</th><th>Oyuncu</th><th className="num">Haftalık Peynir</th><th>Ödül</th></tr>
            </thead>
            <tbody>
              {champions.winners.slice().sort((a, b) => (a.rank || 9) - (b.rank || 9)).map((w, i) => (
                <tr key={`${w.name}-${i}`}>
                  <td style={{ width: 52 }}><span className={`lb-rank r${w.rank || i + 1}`}>{medals[(w.rank || i + 1) - 1] || w.rank}</span></td>
                  <td><b>{w.name}</b>{w.rank === 1 ? ' 👑' : null}</td>
                  <td className="num">{nf(w.score)}</td>
                  <td>{championPrizes[(w.rank || i + 1) - 1] || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {podium.length > 0 && (
        <div className="lb-podium">
          {podiumCards.map(([p, place], idx) => (
            <div key={String(p._id)} className={`podium-card p${place + 1}${user && user.playerName === p.playerName ? ' me' : ''}`}>
              <div className="p-medal">{medals[place]}</div>
              <div className="p-name">{p.playerName}</div>
              <div className="p-val">{nf(p[def.field])}</div>
            </div>
          ))}
        </div>
      )}
      {user && myRank && myRank > 50 && (
        <div className="lb-metab">📈 <b>{user.playerName}</b>, bu kategoride <b>#{nf(myRank)}</b> sıradasın — ilk 50&apos;ye girmek için oynamaya devam!</div>
      )}
      <div className="panel tight" style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr><th>Sıra</th><th>Oyuncu</th><th className="num">{def.label}</th></tr>
          </thead>
          <tbody>
            {docs.map((d2, i) => (
              <tr key={String(d2._id)} className={user && user.playerName === d2.playerName ? 'me' : ''}>
                <td style={{ width: 52 }}>
                  <span className={`lb-rank r${i + 1}`}>{i < 3 ? medals[i] : i + 1}</span>
                </td>
                <td><b>{d2.playerName}</b>{user && user.playerName === d2.playerName ? <span> <span className="badge pinned">sen</span></span> : null}</td>
                <td className="num">{nf(d2[def.field])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ textAlign: 'center' }}><Link className="btn btn-play" href="/play">🧀 Listeye girmek için oyna!</Link></p>
    </>
  );
}
