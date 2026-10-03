import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDb } from '../../lib/db';
import { getUser } from '../../lib/session';
import { catInfo } from '../../lib/site-data';
import { fmtDateTime, nf, timeAgo } from '../../lib/util';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Hesabım — HobbyMice', robots: { index: false, follow: false } };

export default async function ProfilPage() {
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

  return (
    <>
      <div className="pagehead">
        <h1>🐭 {acc.playerName}</h1>
        <p className="muted">Hesabın hem oyunda hem sitede bu. İstatistikler oyun veritabanından canlı gelir.</p>
      </div>
      <div className="stat-grid">
        {stat(acc.cheeseCount, '🧀 Peynir')}
        {stat(acc.firstCount, '🥇 First')}
        {stat(acc.bootcampCount, '🏁 Bootcamp')}
        {stat(acc.normalSaves, '🐭 Kurtarma')}
        {stat(acc.hardSaves, '💪 Zor Kurtarma')}
        {stat(replyCount, '💬 Forum cevabı')}
      </div>
      <h2>Konularım</h2>
      <div className="panel tight">
        <table className="tbl">
          <tbody>
            {myTopics.length ? myTopics.map(t => (
              <tr key={String(t._id)}>
                <td><Link href={`/forum/konu/${t._id}-${t.slug}`}>{t.title}</Link></td>
                <td className="muted small">{catInfo(t.category).emoji} {t.category}</td>
                <td className="muted small" style={{ whiteSpace: 'nowrap' }}>{timeAgo(t.createdAt)}</td>
              </tr>
            )) : (
              <tr><td className="muted">Henüz konu açmamışsın. <Link href="/forum/yeni">İlk konunu aç!</Link></td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="panel tight">
        <p className="small muted">
          📧 {acc.emailAddress || '—'} · Kayıt: {acc.regDate ? fmtDateTime(new Date(acc.regDate * 1000)) : '?'} · Oyun süresi: {Math.round((acc.playedTime || 0) / 60)} dk
        </p>
        <Link className="btn btn-ghost btn-sm" href="/siralama?tur=peynir">🏆 Sıralamada neredeyim?</Link>
      </div>
    </>
  );
}
