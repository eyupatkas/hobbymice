import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../../lib/db';
import { getUser } from '../../../../../lib/session';
import { FORUM_CATS, canModerate, isOwnerOf, parseId } from '../../../../../lib/site-data';
import { editTopic } from '../../../../../lib/forum-actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Konuyu Düzenle — HobbyMice', robots: { index: false, follow: false } };

export default async function KonuDuzenlePage({ params }) {
  const { idslug } = await params;
  const idStr = parseId(idslug);
  const t = idStr ? await getDb().collection('forum_topics').findOne({ _id: new ObjectId(idStr) }) : null;
  if (!t || t.status === 'deleted') notFound();
  const user = await getUser();
  if (!canModerate(user) && !isOwnerOf(user, t)) {
    return <div className="panel muted">Yetkin yok.</div>;
  }
  return (
    <>
      <div className="pagehead"><h1>Konuyu Düzenle</h1></div>
      <div className="panel" style={{ maxWidth: 720 }}>
        <form action={editTopic}>
          <input type="hidden" name="id" value={String(t._id)} />
          <div className="field">
            <label>Başlık</label>
            <input type="text" name="title" defaultValue={t.title} required maxLength={120} />
          </div>
          <div className="field">
            <label>Kategori</label>
            <select name="category" defaultValue={t.category || 'Genel Sohbet'}>
              {FORUM_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Mesaj</label>
            <textarea name="body" defaultValue={t.body} required maxLength={8000} />
          </div>
          <button className="btn btn-play">Kaydet</button>
          <Link className="btn btn-ghost" href={`/forum/konu/${t._id}-${t.slug}`}>Vazgeç</Link>
        </form>
      </div>
    </>
  );
}
