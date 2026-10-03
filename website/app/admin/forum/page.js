import Link from 'next/link';
import { getDb } from '../../../lib/db';
import { nf, timeAgo } from '../../../lib/util';
import { deleteTopic } from '../../../lib/forum-actions';

export const dynamic = 'force-dynamic';

export default async function AdminForumPage() {
  const topics = await getDb().collection('forum_topics').find({ status: { $ne: 'deleted' } })
    .sort({ lastActivity: -1 }).limit(50).toArray();
  return (
    <div className="panel tight" style={{ overflowX: 'auto' }}>
      <table className="tbl">
        <thead>
          <tr>
            <th>Konu</th><th>Yazar</th><th className="num">Cevap</th>
            <th className="num">Görüntülenme</th><th>Durum</th><th>Son</th><th />
          </tr>
        </thead>
        <tbody>
          {topics.length ? topics.map(t => (
            <tr key={String(t._id)}>
              <td><Link href={`/forum/konu/${t._id}-${t.slug}`}>{t.title}</Link></td>
              <td>{t.author}</td>
              <td className="num">{nf(t.replies)}</td>
              <td className="num">{nf(t.views)}</td>
              <td>
                {t.pinned ? <span className="badge pinned">sabit</span> : null}
                {t.locked ? <span className="badge locked">kilitli</span> : null}
              </td>
              <td className="muted small">{timeAgo(t.lastActivity)}</td>
              <td>
                <form action={deleteTopic}>
                  <input type="hidden" name="id" value={String(t._id)} />
                  <button className="btn btn-danger btn-sm">Sil</button>
                </form>
              </td>
            </tr>
          )) : <tr><td colSpan={7} className="muted">Konu yok</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
