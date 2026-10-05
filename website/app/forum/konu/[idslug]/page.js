import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../lib/db';
import { getUser } from '../../../../lib/session';
import { canModerate, isOwnerOf, parseId } from '../../../../lib/site-data';
import { liteMarkup, nf, fmtDateTime, timeAgo, excerpt } from '../../../../lib/util';
import { replyTopic, deleteTopic, togglePin, toggleLock, deletePost } from '../../../../lib/forum-actions';

export const dynamic = 'force-dynamic';

function safeOid(s) {
  try { return new ObjectId(s); } catch { return null; }
}

export async function generateMetadata({ params }) {
  const { idslug } = await params;
  const idStr = parseId(idslug);
  const t = idStr ? await getDb().collection('forum_topics').findOne({ _id: safeOid(idStr) }) : null;
  return {
    title: t ? `${t.title} — HobbyMice Forum` : 'Konu — HobbyMice Forum',
    description: t ? excerpt(t.body, 155) : undefined,
    robots: t ? undefined : { index: false, follow: false },
  };
}

export default async function KonuPage({ params }) {
  const { idslug } = await params;
  const lang = ((await cookies()).get('hm_lang')?.value || 'tr').toLowerCase();
  const idStr = parseId(idslug);
  const t = idStr ? await getDb().collection('forum_topics').findOne({ _id: safeOid(idStr) }) : null;
  if (!t || t.status === 'deleted') notFound();

  const d = getDb();
  d.collection('forum_topics').updateOne({ _id: t._id }, { $inc: { views: 1 } }).catch(() => {});
  const [posts, user] = await Promise.all([
    d.collection('forum_posts').find({ topicId: t._id }).sort({ createdAt: 1 }).toArray(),
    getUser(),
  ]);
  const mod = canModerate(user);
  const owner = isOwnerOf(user, t);
  const canEditTopic = mod || owner;

  return (
    <>
      <div className="breadcrumb">
        <Link href="/forum">Forum</Link> › <Link href={`/forum?kategori=${encodeURIComponent(t.category || 'Genel Sohbet')}`}>{t.category || 'Genel Sohbet'}</Link>
      </div>
      <div className="panel">
        <h1>
          {t.pinned ? <span className="badge pinned">Sabit</span> : null}{' '}
          {t.locked ? <span className="badge locked">Kilitli</span> : null}{' '}
          {t.title}
        </h1>
        <div className="meta muted small" style={{ margin: '6px 0 14px' }}>
          {t.author} · {fmtDateTime(t.createdAt, lang)} · 👁 {nf(t.views)} · 💬 {nf(t.replies)}
        </div>
        <div className="article body" style={{ fontSize: 15 }}
          dangerouslySetInnerHTML={{ __html: liteMarkup(t.body) }} />
        {canEditTopic && (
          <div className="share" style={{ marginBottom: 0 }}>
            <form action={togglePin} style={{ display: 'inline' }}>
              <input type="hidden" name="id" value={String(t._id)} />
              <button className="btn btn-ghost btn-sm">{t.pinned ? 'Sabiti kaldır' : '📌 Sabitle'}</button>
            </form>
            <form action={toggleLock} style={{ display: 'inline' }}>
              <input type="hidden" name="id" value={String(t._id)} />
              <button className="btn btn-ghost btn-sm">{t.locked ? 'Kilidi aç' : '🔒 Kilitle'}</button>
            </form>
            <Link className="btn btn-ghost btn-sm" href={`/forum/konu/${t._id}/duzenle`}>✏️ Düzenle</Link>
            <form action={deleteTopic} style={{ display: 'inline' }}>
              <input type="hidden" name="id" value={String(t._id)} />
              <button className="btn btn-danger btn-sm">🗑 Sil</button>
            </form>
          </div>
        )}
      </div>

      <h2>{posts.length} Cevap</h2>
      {posts.length === 0 && <p className="muted">Henüz cevap yok.</p>}
      {posts.map(p => {
        const canEdit = mod || isOwnerOf(user, p);
        return (
          <div className="msg" key={String(p._id)}>
            <div className="who"><b>{p.author}</b><span>{timeAgo(p.createdAt, lang)}</span></div>
            <div className="body" dangerouslySetInnerHTML={{ __html: liteMarkup(p.body) }} />
            {canEdit && (
              <div className="acts">
                <Link href={`/forum/mesaj/${p._id}/duzenle`}>düzenle</Link>
                <form action={deletePost}>
                  <input type="hidden" name="id" value={String(p._id)} />
                  <button>sil</button>
                </form>
              </div>
            )}
          </div>
        );
      })}

      {t.locked && !mod ? (
        <div className="panel muted">🔒 Bu konu kilitli, yeni cevap yazılamaz.</div>
      ) : user ? (
        <div className="panel">
          <h3 style={{ marginBottom: 12 }}>Cevap Yaz</h3>
          <form id="reply-form" action={replyTopic}>
            <input type="hidden" name="id" value={String(t._id)} />
            <textarea name="body" required maxLength={8000} placeholder="Cevabın..." />
            <div style={{ marginTop: 10 }}><button className="btn btn-play">Cevapla</button></div>
          </form>
        </div>
      ) : (
        <div className="panel muted">
          Cevap yazmak için <Link href={`/giris?geri=${encodeURIComponent(`/forum/konu/${t._id}-${t.slug}`)}`}>giriş yap</Link>.
        </div>
      )}
    </>
  );
}
