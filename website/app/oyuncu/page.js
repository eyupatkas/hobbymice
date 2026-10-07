import Link from 'next/link';
import { cookies } from 'next/headers';
import { getDb } from '../../lib/db';
import { fmtDateTime, nf, timeAgo } from '../../lib/util';
import { t } from '../../lib/i18n';

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
        <h1>{t(lang, 'player.notFound.title')}</h1>
        <p className="muted">{name ? t(lang, 'player.notFound.named').replace('{n}', name) : t(lang, 'player.notFound.unspecified')}</p>
        <p><Link className="btn btn-play btn-sm" href="/play">{t(lang, 'player.playNow')}</Link></p>
      </div>
    );
  }

  const [topics, posts, firstPlace, recentTopics] = await Promise.all([
    d.collection('forum_topics').countDocuments({ authorId: acc._id, status: { $ne: 'deleted' } }),
    d.collection('forum_posts').countDocuments({ authorId: acc._id }),
    acc._id ? d.collection('accounts').countDocuments({
      $or: [
        { firstCount: { $gt: acc.firstCount || 0 } },
      ],
    }) : Promise.resolve(0),
    d.collection('forum_topics').find({ authorId: acc._id, status: { $ne: 'deleted' } })
      .sort({ createdAt: -1 }).limit(5).toArray(),
  ]);

  const totalSaves = (acc.normalSaves || 0) + (acc.hardSaves || 0) + (acc.divineSaves || 0);
  const regDate = acc.regDate ? new Date(acc.regDate * 1000) : null;

  // Oyun ekonomisi: günlük görevler + haftalik yarisma + carkifelek durumu.
  const MISSION_NAMES = {
    1: t(lang, 'player.mission.1'), 2: t(lang, 'player.mission.2'), 3: t(lang, 'player.mission.3'),
    4: t(lang, 'player.mission.4'), 5: t(lang, 'player.mission.5'), 6: t(lang, 'player.mission.6'),
    7: t(lang, 'player.mission.7'),
  };
  const quests = (acc.playerMissions || []).filter(q => q._id !== 60801);
  const strawberry = (acc.playerMissions || []).find(q => q._id === 60801);
  const wheelDone = acc.lastWheelSpin === new Date().toISOString().slice(0, 10);
  const thisWeek = (() => {
    // ISO 8601 hafta anahtari — sunucudaki WeekFields.ISO ile ayni ("2026-W40").
    const now = new Date();
    const d2 = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = d2.getUTCDay() || 7;
    d2.setUTCDate(d2.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d2.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((d2 - yearStart) / 86400000) + 1) / 7);
    return `${d2.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
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
          {regDate ? `${t(lang, 'player.joined')} ${fmtDateTime(regDate, lang)}` : ''} · {t(lang, 'player.playTime').replace('{n}', Math.round((acc.playedTime || 0) / 60))}
        </p>
      </div>

      <div className="stat-grid">
        {stat(acc.cheeseCount, `🧀 ${t(lang, 'player.cheese')}`)}
        {stat(acc.firstCount, `🥇 ${t(lang, 'player.first')}`)}
        {stat(acc.bootcampCount, `🏁 ${t(lang, 'player.bootcamp')}`)}
        {stat(acc.racingStats?.[2], `🏁 ${t(lang, 'player.racing')}`)}
        {stat(totalSaves, `🛡️ ${t(lang, 'player.saves')}`)}
        {stat(acc.shamanLevel, `⭐ ${t(lang, 'player.shamanLevel')}`)}
      </div>

      <h2>{t(lang, 'player.forumActivity')}</h2>
      <div className="stat-grid">
        {stat(topics, `💬 ${t(lang, 'player.topics')}`)}
        {stat(posts, `💬 ${t(lang, 'player.replies')}`)}
      </div>

      {(quests.length > 0 || weeklyActive) && (
        <>
          <h2>{t(lang, 'player.economy')}</h2>
          <div className="panel tight" style={{ padding: 16 }}>
            {quests.length > 0 && (
              <div className="quest-panel">
                {quests.map(q => {
                  const done = (q.missionCollected || 0) >= q.missionTotal;
                  const pct = Math.min(100, Math.round(((q.missionCollected || 0) / Math.max(1, q.missionTotal)) * 100));
                  return (
                    <div className={`quest-row${done ? ' done' : ''}`} key={String(q._id)}>
                      <span className="quest-name">{MISSION_NAMES[q._id] || t(lang, 'player.mission.unknown').replace('{n}', q._id)}{done ? ' ✅' : ''}</span>
                      <div className="quest-bar"><div className="quest-fill" style={{ width: `${pct}%` }} /></div>
                      <span className="quest-count">{Math.min(q.missionCollected || 0, q.missionTotal)}/{q.missionTotal} → +{q.missionPrize} 🧀</span>
                    </div>
                  );
                })}
                {strawberry && (
                  <div className="quest-row">
                    <span className="quest-name">{t(lang, 'player.strawberryBasket')}</span>
                    <div className="quest-bar">
                      <div className="quest-fill" style={{ width: `${Math.min(100, Math.round(((strawberry.missionCollected || 0) / Math.max(1, strawberry.missionTotal)) * 100))}%`, background: 'linear-gradient(90deg,#ff5e9c,#ff9ec2)' }} />
                    </div>
                    <span className="quest-count">{Math.min(strawberry.missionCollected || 0, strawberry.missionTotal)}/{strawberry.missionTotal} {t(lang, 'player.missionUnit')} → +{strawberry.missionPrize} 🍓</span>
                  </div>
                )}
              </div>
            )}
            <p style={{ margin: '12px 0 0', fontSize: 13.5 }}>
              <span className="quest-wheel">{t(lang, 'player.wheel.label')} {wheelDone ? t(lang, 'player.wheel.done') : t(lang, 'player.wheel.notToday')}</span>
              <br />
              <span className="quest-weekly">{t(lang, 'player.weekly.label')} {weeklyActive ? `${nf(acc.weeklyCheese || 0)} ${t(lang, 'player.cheese')} · ${nf(acc.weeklyFirst || 0)} ${t(lang, 'player.first')} (${t(lang, 'player.week')} ${thisWeek})` : `${t(lang, 'player.weekly.none')} (${t(lang, 'player.week')} ${thisWeek})`}</span>
            </p>
          </div>
        </>
      )}

      <h2>{t(lang, 'player.latestTopics')}</h2>
      <div className="panel tight">
        <table className="tbl">
          <tbody>
            {recentTopics.map(t2 => (
              <tr key={String(t2._id)}>
                <td><Link href={`/forum/konu/${t2._id}-${t2.slug}`}>{t2.title}</Link></td>
                <td className="muted small" style={{ whiteSpace: 'nowrap' }}>{timeAgo(t2.createdAt, lang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 20 }}>
        <Link className="btn btn-play" href="/play">{t(lang, 'player.joinCta')}</Link>
      </p>
    </>
  );
}
