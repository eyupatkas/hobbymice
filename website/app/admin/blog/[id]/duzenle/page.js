import { notFound } from 'next/navigation';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../../lib/db';
import { savePost } from '../../../../../lib/admin-actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Yazıyı Düzenle — HobbyMice Admin', robots: { index: false, follow: false } };

export default async function BlogDuzenlePage({ params }) {
  const { id } = await params;
  let p = null;
  try {
    p = await getDb().collection('blog_posts').findOne({ _id: new ObjectId(id) });
  } catch { p = null; }
  if (!p) notFound();

  return (
    <>
      <div className="pagehead"><h1>Yazıyı Düzenle</h1></div>
      <div className="panel">
        <form action={savePost}>
          <input type="hidden" name="id" value={String(p._id)} />
          <div className="frow">
            <div className="field"><label>Başlık</label><input type="text" name="title" required maxLength={120} defaultValue={p.title} /></div>
            <div className="field"><label>Slug</label><input type="text" name="slug" defaultValue={p.slug} /></div>
          </div>
          <div className="frow">
            <div className="field"><label>Emoji</label><input type="text" name="emoji" defaultValue={p.emoji || '🧀'} maxLength={8} /></div>
            <div className="field"><label>Etiketler (virgülle)</label><input type="text" name="tags" defaultValue={(p.tags || []).join(', ')} /></div>
          </div>
          <div className="field"><label>Özet</label><textarea name="excerpt" style={{ minHeight: 70 }} maxLength={300} defaultValue={p.excerpt || ''} /></div>
          <div className="field">
            <label>İçerik (HTML)</label>
            <textarea name="content" style={{ minHeight: 340 }} defaultValue={p.content || ''} />
          </div>
          <div className="field">
            <label>Durum</label>
            <select name="status" defaultValue={p.status}>
              <option value="published">Yayında</option>
              <option value="draft">Taslak</option>
            </select>
          </div>
          <button className="btn btn-play">💾 Kaydet</button>
          <a className="btn btn-ghost" href="/admin/blog">Geri</a>
        </form>
      </div>
    </>
  );
}
