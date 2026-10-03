import Link from 'next/link';
import { getDb } from '../../lib/db';
import { fmtDateTime, nf } from '../../lib/util';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const d = getDb();
  const [players, topics, msgs, posts, activeSessions, recentLog] = await Promise.all([
    d.collection('accounts').countDocuments({}),
    d.collection('forum_topics').countDocuments({ status: { $ne: 'deleted' } }),
    d.collection('forum_posts').countDocuments({}),
    d.collection('blog_posts').countDocuments({}),
    d.collection('site_sessions').countDocuments({ lastSeen: { $gte: new Date(Date.now() - 15 * 60 * 1000) } }),
    d.collection('admin_log').find({}).sort({ ts: -1 }).limit(12).toArray(),
  ]);
  return (
    <>
      <div className="stat-grid">
        <div className="stat"><div className="v">{nf(players)}</div><div className="l">Kayıtlı oyuncu</div></div>
        <div className="stat"><div className="v">{nf(topics)}</div><div className="l">Forum konusu</div></div>
        <div className="stat"><div className="v">{nf(msgs)}</div><div className="l">Forum cevabı</div></div>
        <div className="stat"><div className="v">{nf(posts)}</div><div className="l">Blog yazısı</div></div>
        <div className="stat"><div className="v">{nf(activeSessions)}</div><div className="l">Aktif oturum (15dk)</div></div>
      </div>
      <h2>Son yönetim işlemleri</h2>
      <div className="panel tight">
        <table className="tbl">
          <tbody>
            {recentLog.length ? recentLog.map((l, i) => (
              <tr key={i}>
                <td style={{ whiteSpace: 'nowrap' }} className="muted small">{fmtDateTime(l.ts)}</td>
                <td><b>{l.actor}</b></td>
                <td>{l.action}</td>
                <td className="muted small">{l.target} {l.details}</td>
              </tr>
            )) : <tr><td className="muted">Henüz kayıt yok</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="muted small">Geliştirme notu: Discord webhook / oyun-içi duyuru entegrasyonları <Link href="/admin/blog/bot">bot sekmesinde</Link> genişletilecek.</p>
    </>
  );
}
