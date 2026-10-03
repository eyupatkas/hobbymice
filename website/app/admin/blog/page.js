import Link from 'next/link';
import { getDb } from '../../../lib/db';
import { fmtDateTime, nf } from '../../../lib/util';
import { deletePost } from '../../../lib/admin-actions';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  const posts = await getDb().collection('blog_posts').find({})
    .sort({ publishedAt: -1 }).limit(100).toArray();
  return (
    <>
      <div style={{ marginBottom: 14 }}>
        <Link className="btn btn-play btn-sm" href="/admin/blog/yeni">➕ Yeni Yazı</Link>
      </div>
      <div className="panel tight" style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr><th>Başlık</th><th>Durum</th><th>Kaynak</th><th>Tarih</th><th className="num">👁</th><th /></tr>
          </thead>
          <tbody>
            {posts.length ? posts.map(p => (
              <tr key={String(p._id)}>
                <td><Link href={`/blog/${p.slug}`}>{p.title}</Link></td>
                <td>{p.status === 'published' ? '✅ yayında' : '📝 taslak'}</td>
                <td>
                  {p.source === 'ai'
                    ? <span className="badge ai">AI · {String(p.model || '').replace(':free', '')}</span>
                    : 'manuel'}
                </td>
                <td className="muted small">{fmtDateTime(p.publishedAt)}</td>
                <td className="num">{nf(p.views)}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <Link className="btn btn-ghost btn-sm" href={`/admin/blog/${p._id}/duzenle`}>Düzenle</Link>
                  <form action={deletePost} style={{ display: 'inline' }}>
                    <input type="hidden" name="id" value={String(p._id)} />
                    <button className="btn btn-danger btn-sm">Sil</button>
                  </form>
                </td>
              </tr>
            )) : <tr><td colSpan={6} className="muted">Yazı yok. AI botunu kullan veya elle yazı ekle.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
