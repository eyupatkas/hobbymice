import Link from 'next/link';
import { cookies } from 'next/headers';
import { getDb } from '../../lib/db';
import { fmtDateTime, nf, timeAgo } from '../../lib/util';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const name = sp.pr ? String(sp.pr) : '';
  return {
    title: name ? `${name} — Oyuncu Profili | HobbyMice` : 'Oyuncu Profili | HobbyMice',
    robots: { index: false, follow: false },
  };
}

export default async function OyuncuPage({ searchParams }) {
  const lang = ((await cookies()).get('hm_lang')?.value || 'tr').toLowerCase();
  const sp = await searchParams;
  const name = sp.pr ? String(sp.pr) : '';
  const d = getDb();

  const acc = name ? await d.collection('accounts').findOne({ playerName: name }) : null;

  if (!acc) {
    return (
      <div className="panel" style={{ maxWidth: 560, margin: '60px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>🐭</div>
        <h1>Oyuncu bulunamadı</h1>
        <p className="muted">{name ? `«${name}» adında kayıtlı bir fare yok.` : 'Oyuncu belirtilmedi.'}</p>
        <p><Link className="btn btn-play btn-sm" href="/play">🧀 Hemen Oyna</Link></p>
      </div>
    );
  }

  const [topics, posts, firstPlace] = await Promise.all([
    d.collection('forum_topics').countDocuments({ authorId: acc._id, status: { $ne: 'deleted' } }),
    d.collection('forum_posts').countDocuments({ authorId: acc._id }),
    acc._id ? d.collection('accounts').countDocuments({
      $or: [
        { firstCount: { $gt: acc.firstCount || 0 } },
      ],
    }) : Promise.resolve(0),
  ]);

  const totalSaves = (acc.normalSaves || 0) + (acc.hardSaves || 0) + (acc.divineSaves || 0);
  const regDate = acc.regDate ? new Date(acc.regDate * 1000) : null;

  // Oyun ekonomisi: günlük görevler + haftalik yarisma + carkifelek durumu.
  const MISSION_NAMES = {
    1: '🧀 Peynir topla', 2: '🙏 Şaman olarak fare kurtar', 3: '🕳️ Peyniri deliğe ulaştır',
    4: '🏁 Racing turunu bitir', 5: '🎈 Defilante turunu bitir', 6: '🛒 Markette eşya satın al', 7: '🌟 Şaman olarak tur başlat',
  };
  const quests = (acc.playerMissions || []).filter(q => q._id !== 60801);
  const strawberry = (acc.playerMissions || []).find(q => q._id === 60801);
  const wheelDone = acc.lastWheelSpin === new Date().toISOString().slice(0, 10);
  const thisWeek = (() => {
    // ISO 8601 hafta anahtari — sunucudaki WeekFields.ISO ile ayni ("2026-W40").
    const now = new Date();
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
  })();
  const weeklyActive = acc.weekKey === thisWeek;

  const stat = (v, l) => (
    <div className="stat" key={l}><div className="v">{nf(v)}</div><div className="l">{l}</div></div>
  );

  return (
    <>
      <div className="pagehead">
        <h1>🐭 {acc.playerName}</h1>
        <p className="muted">
          {regDate ? `Katılım: ${fmtDateTime(regDate, lang)}` : ''} · Oyun süresi: {Math.round((acc.playedTime || 0) / 60)} dk
        </p>
      </div>

      <div className="stat-grid">
        {stat(acc.cheeseCount, '🧀 Peynir')}
        {stat(acc.firstCount, '🥇 First')}
        {stat(acc.bootcampCount, '🏁 Bootcamp')}
        {stat(acc.racingStats?.[2], '🏁 Racing')}
        {stat(totalSaves, '🛡️ Kurtarma')}
        {stat(acc.shamanLevel, '⭐ Şaman Seviyesi')}
      </div>

      <h2>Forum Etkinliği</h2>
      <div className="stat-grid">
        {stat(topics, '💬 Konuları')}
        {stat(posts, '💬 Cevapları')}
      </div>

      {(quests.length > 0 || weeklyActive) && (
        <>
          <h2>🎈 Oyun Ekonomisi</h2>
          <div className="panel tight" style={{ padding: 16 }}>
            {quests.length > 0 && (
              <div className="quest-panel">
                {quests.map(q => {
                  const done = (q.missionCollected || 0) >= q.missionTotal;
                  const pct = Math.min(100, Math.round(((q.missionCollected || 0) / Math.max(1, q.missionTotal)) * 100));
                  return (
                    <div className={`quest-row${done ? ' done' : ''}`} key={String(q._id)}>
                      <span className="quest-name">{MISSION_NAMES[q._id] || `❓ Görev #${q._id}`}{done ? ' ✅' : ''}</span>
                      <div className="quest-bar"><div className="quest-fill" style={{ width: `${pct}%` }} /></div>
                      <span className="quest-count">{Math.min(q.missionCollected || 0, q.missionTotal)}/{q.missionTotal} → +{q.missionPrize} 🧀</span>
                    </div>
                  );
                })}
                {strawberry && (
                  <div className="quest-row">
                    <span className="quest-name">🍓 Çilek Sepeti</span>
                    <div className="quest-bar">
                      <div className="quest-fill" style={{ width: `${Math.min(100, Math.round(((strawberry.missionCollected || 0) / Math.max(1, strawberry.missionTotal)) * 100))}%`, background: 'linear-gradient(90deg,#ff5e9c,#ff9ec2)' }} />
                    </div>
                    <span className="quest-count">{Math.min(strawberry.missionCollected || 0, strawberry.missionTotal)}/{strawberry.missionTotal} görev → +{strawberry.missionPrize} 🍓</span>
                  </div>
                )}
              </div>
            )}
            <p style={{ margin: '12px 0 0', fontSize: 13.5 }}>
              <span className="quest-wheel">🎡 Çarkıfelek: {wheelDone ? 'bugün çevrildi ✓ (yarın yenisi)' : 'bugün çevrilmemi — /cark ile ücretsiz döndür!'}</span>
              <br />
              <span className="quest-weekly">🏁 Haftalık yarışma: {weeklyActive ? `${nf(acc.weeklyCheese || 0)} peynir · ${nf(acc.weeklyFirst || 0)} first (hafta ${thisWeek})` : `bu hafta henüz peynir yok (hafta ${thisWeek})`}</span>
            </p>
          </div>
        </>
      )}

      <h2>Son Konuları</h2>
      <div className="panel tight">
        <table className="tbl">
          <tbody>
            {(await d.collection('forum_topics').find({ authorId: acc._id, status: { $ne: 'deleted' } })
              .sort({ createdAt: -1 }).limit(5).toArray()).map(t => (
              <tr key={String(t._id)}>
                <td><Link href={`/forum/konu/${t._id}-${t.slug}`}>{t.title}</Link></td>
                <td className="muted small" style={{ whiteSpace: 'nowrap' }}>{timeAgo(t.createdAt, lang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 20 }}>
        <Link className="btn btn-play" href="/play">🧀 Bu fareyle oynamak için hemen katıl!</Link>
      </p>
    </>
  );
}
