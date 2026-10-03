import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../../lib/db';
import { getUser } from '../../../../../lib/session';
import { canModerate, isOwnerOf, parseId } from '../../../../../lib/site-data';
import { editPost } from '../../../../../lib/forum-actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mesajı Düzenle — HobbyMice', robots: { index: false, follow: false } };

export default async function MesajDuzenlePage({ params }) {
  const { id } = await params;
  const idStr = parseId(id);
  const p = idStr ? await getDb().collection('forum_posts').findOne({ _id: new ObjectId(idStr) }) : null;
  if (!p) notFound();
  const user = await getUser();
  if (!canModerate(user) && !isOwnerOf(user, p)) {
    return <div className="panel muted">Yetkin yok.</div>;
  }
  return (
    <>
      <div className="pagehead"><h1>Cevabı Düzenle</h1></div>
      <div className="panel" style={{ maxWidth: 720 }}>
        <form action={editPost}>
          <input type="hidden" name="id" value={String(p._id)} />
          <textarea name="body" defaultValue={p.body} required maxLength={8000} />
          <div style={{ marginTop: 10 }}>
            <button className="btn btn-play">Kaydet</button>
            <Link className="btn btn-ghost" href={`/forum/konu/${p.topicId}`}>Vazgeç</Link>
          </div>
        </form>
      </div>
    </>
  );
}
