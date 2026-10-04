import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getDb } from '../../lib/db';
import { getUser } from '../../lib/session';
import { catInfo } from '../../lib/site-data';
import { fmtDateTime, nf, timeAgo } from '../../lib/util';

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
    { ico: '🧀', name: 'Peynir Sever', desc: '100 peynir topla', got: (acc.cheeseCount || 0) >= 100 },
    { ico: '🏆', name: 'Peynir Kralı', desc: '1.000 peynir topla', got: (acc.cheeseCount || 0) >= 1000 },
    { ico: '🥇', name: 'İlk First', desc: 'İlk firstünü al', got: (acc.firstCount || 0) >= 1 },
    { ico: '🎯', name: 'First Avcısı', desc: '10 first topla', got: (acc.firstCount || 0) >= 10 },
    { ico: '🛡️', name: 'Kaptan Şaman', desc: 'Toplam 100 kurtarma', got: totalSaves >= 100 },
    { ico: '⚔️', name: 'Efsane Şaman', desc: 'Toplam 500 kurtarma', got: totalSaves >= 500 },
    { ico: '🔥', name: 'Serinin Gücü', desc: '3 gün üst üste giriş (günlük ödül serisi)', got: (acc.dailyStreak || 0) >= 3 },
    { ico: '💎', name: 'Sadık Fare', desc: '7 gün üst üste giriş', got: (acc.dailyStreak || 0) >= 7 },
    { ico: '🎂', name: 'Erken Dönem', desc: '30+ gündür oyundasın', got: veteranDays >= 30 },
  ];
  const gotCount = achievements.filter(a => a.got).length;

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
      <h2>🏅 Başarımlar <span className="muted small">({gotCount}/{achievements.length})</span></h2>
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
      <h2>Konularım</h2>
      <div className="panel tight">
        <table className="tbl">
          <tbody>
            {myTopics.length ? myTopics.map(t => (
              <tr key={String(t._id)}>
                <td><Link href={`/forum/konu/${t._id}-${t.slug}`}>{t.title}</Link></td>
                <td className="muted small">{catInfo(t.category).emoji} {t.category}</td>
                <td className="muted small" style={{ whiteSpace: 'nowrap' }}>{timeAgo(t.createdAt, lang)}</td>
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
