import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getDb } from '../../lib/db';
import { getUser } from '../../lib/session';
import { catInfo } from '../../lib/site-data';
import { fmtDateTime, nf, timeAgo } from '../../lib/util';
import { t } from '../../lib/i18n';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Hesabım — HobbyMice', robots: { index: false, follow: false } };

export default async function ProfilPage() {
  const lang = ((await cookies()).get('hm_lang')?.value || 'tr').toLowerCase();
  const user = await getUser();
  if (!user) redirect('/giris?geri=%2Fprofil');
  const d = getDb();
  const [acc, myTopics, replyCount] = await Promise.all([
    d.collection('accounts').findOne({ _id: user.accountId }),
    d.collection('forum_topics').find({ authorId: user.accountId, status: { $ne: 'deleted' } })
      .sort({ createdAt: -1 }).limit(5).toArray(),
    d.collection('forum_posts').countDocuments({ authorId: user.accountId }),
  ]);
  if (!acc) redirect('/api/logout');

  const stat = (v, l) => (
    <div className="stat" key={l}><div className="v">{nf(v)}</div><div className="l">{l}</div></div>
  );

  // Basarim rozetleri: hesap verisinden hesaplanir (oyunla ayni esik mantigi).
  const totalSaves = (acc.normalSaves || 0) + (acc.hardSaves || 0) + (acc.divineSaves || 0);
  const veteranDays = acc.regDate ? Math.floor((Date.now() - acc.regDate * 1000) / 86400000) : 0;
  const achievements = [
    { ico: '🧀', name: t(lang, 'prof.a1.name'), desc: t(lang, 'prof.a1.desc'), got: (acc.cheeseCount || 0) >= 100 },
    { ico: '🏆', name: t(lang, 'prof.a2.name'), desc: t(lang, 'prof.a2.desc'), got: (acc.cheeseCount || 0) >= 1000 },
    { ico: '🥇', name: t(lang, 'prof.a3.name'), desc: t(lang, 'prof.a3.desc'), got: (acc.firstCount || 0) >= 1 },
    { ico: '🎯', name: t(lang, 'prof.a4.name'), desc: t(lang, 'prof.a4.desc'), got: (acc.firstCount || 0) >= 10 },
    { ico: '🛡️', name: t(lang, 'prof.a5.name'), desc: t(lang, 'prof.a5.desc'), got: totalSaves >= 100 },
    { ico: '⚔️', name: t(lang, 'prof.a6.name'), desc: t(lang, 'prof.a6.desc'), got: totalSaves >= 500 },
    { ico: '🔥', name: t(lang, 'prof.a7.name'), desc: t(lang, 'prof.a7.desc'), got: (acc.dailyStreak || 0) >= 3 },
    { ico: '💎', name: t(lang, 'prof.a8.name'), desc: t(lang, 'prof.a8.desc'), got: (acc.dailyStreak || 0) >= 7 },
    { ico: '🎂', name: t(lang, 'prof.a9.name'), desc: t(lang, 'prof.a9.desc'), got: veteranDays >= 30 },
  ];
  const gotCount = achievements.filter(a => a.got).length;

  return (
    <>
      <div className="pagehead">
        <h1>🐭 {acc.playerName}</h1>
        <p className="muted">{t(lang, 'prof.intro')}</p>
      </div>
      <div className="stat-grid">
        {stat(acc.cheeseCount, `🧀 ${t(lang, 'player.cheese')}`)}
        {stat(acc.firstCount, `🥇 ${t(lang, 'player.first')}`)}
        {stat(acc.bootcampCount, `🏁 ${t(lang, 'player.bootcamp')}`)}
        {stat(acc.normalSaves, `🐭 ${t(lang, 'player.saves')}`)}
        {stat(acc.hardSaves, `💪 ${t(lang, 'prof.hardSaves')}`)}
        {stat(replyCount, `💬 ${t(lang, 'prof.forumReplies')}`)}
      </div>
      <h2>🏅 {t(lang, 'prof.achievements')} <span className="muted small">({gotCount}/{achievements.length})</span></h2>
      <div className="panel tight" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 10 }}>
        {achievements.map((a, i) => (
          <div key={i} style={{
            display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', borderRadius: 12,
            border: '1px solid ' + (a.got ? 'var(--cheese)' : 'var(--line)'),
            background: a.got ? 'rgba(255,204,64,.07)' : 'transparent',
            opacity: a.got ? 1 : 0.55,
          }} title={a.desc}>
            <span style={{ fontSize: 24, filter: a.got ? 'none' : 'grayscale(1)' }}>{a.ico}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{a.name}</div>
              <div className="muted" style={{ fontSize: 11.5 }}>{a.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <h2>{t(lang, 'prof.myTopics')}</h2>
      <div className="panel tight">
        <table className="tbl">
          <tbody>
            {myTopics.length ? myTopics.map(tp => (
              <tr key={String(tp._id)}>
                <td><Link href={`/forum/konu/${tp._id}-${tp.slug}`}>{tp.title}</Link></td>
                <td className="muted small">{catInfo(tp.category).emoji} {tp.category}</td>
                <td className="muted small" style={{ whiteSpace: 'nowrap' }}>{timeAgo(tp.createdAt, lang)}</td>
              </tr>
            )) : (
              <tr><td className="muted">{t(lang, 'prof.noTopics')} <Link href="/forum/yeni">{t(lang, 'prof.openFirst')}</Link></td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="panel tight">
        <p className="small muted">
          📧 {acc.emailAddress || '—'} · {t(lang, 'prof.registered')} {acc.regDate ? fmtDateTime(new Date(acc.regDate * 1000), lang) : '?'} · {t(lang, 'player.playTime').replace('{n}', Math.round((acc.playedTime || 0) / 60))}
        </p>
        <Link className="btn btn-ghost btn-sm" href="/siralama?tur=peynir">{t(lang, 'prof.rankWhere')}</Link>
      </div>
    </>
  );
}
