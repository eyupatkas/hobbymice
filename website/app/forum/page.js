import Link from 'next/link';
import { getDb } from '../../lib/db';
import { FORUM_CATS, catInfo } from '../../lib/site-data';
import { timeAgo, nf, excerpt, toInt } from '../../lib/util';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'HobbyMice Forum — Topluluk Merkezi',
  description: 'HobbyMice topluluk forumu: oyun rehberleri, şaman akademisi, mod taktikleri, kabile ilanları ve sohbet. Oyun hesabınla katıl!',
};

const PER_PAGE = 12;

export default async function ForumPage({ searchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, toInt(sp.sayfa, 1));
  const cat = FORUM_CATS.includes(sp.kategori) ? sp.kategori : null;
  const d = getDb();
  const q = { status: { $ne: 'deleted' } };
  if (cat) q.category = cat;

  const [total, countsAgg, topics] = await Promise.all([
    d.collection('forum_topics').countDocuments(q),
    d.collection('forum_topics').aggregate([
      { $match: { status: { $ne: 'deleted' } } },
      { $group: { _id: '$category', n: { $sum: 1 } } },
    ]).toArray(),
    d.collection('forum_topics').find(q)
      .sort({ pinned: -1, lastActivity: -1 })
      .skip((page - 1) * PER_PAGE).limit(PER_PAGE).toArray(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const counts = {};
  for (const c of countsAgg) counts[c._id] = c.n;

  return (
    <>
      <div className="pagehead">
        <h1>Forum 🧀</h1>
        <p>HobbyMice topluluğunun buluşma noktası. Soru sor, rehber paylaş, kabile ilanını ver — oyun hesabınla yaz.</p>
      </div>

      {!cat && (
        <div className="cat-cards">
          {FORUM_CATS.map(label => {
            const info = catInfo(label);
            return (
              <Link key={label} className="cat-card" href={`/forum?kategori=${encodeURIComponent(label)}`}>
                <div className="cat-ico">{info.emoji}</div>
                <div className="cat-body"><b>{label}</b><span>{info.desc}</span></div>
                <div className="cat-n">{nf(counts[label] || 0)}<small>konu</small></div>
              </Link>
            );
          })}
        </div>
      )}

      {cat && (
        <div className="panel cat-banner">
          <div className="cat-ico big">{catInfo(cat).emoji}</div>
          <div>
            <h2 style={{ margin: 0 }}>{cat}</h2>
            <p className="muted" style={{ margin: '4px 0 0' }}>{catInfo(cat).desc}</p>
          </div>
        </div>
      )}

      <div className="chips" style={{ margin: '14px 0' }}>
        <Link className={'chip' + (cat ? ' plain' : '')} href="/forum">Tümü</Link>
        {FORUM_CATS.map(c => (
          <Link key={c} className={'chip' + (cat === c ? '' : ' plain')} href={`/forum?kategori=${encodeURIComponent(c)}`}>
            {catInfo(c).emoji} {c}
          </Link>
        ))}
      </div>

      <div style={{ margin: '14px 0' }}>
        <Link className="btn btn-play" href="/forum/yeni">➕ Yeni Konu Aç</Link>
      </div>

      {topics.length ? (
        <div className="cardlist">
          {topics.map(t => (
            <div className="postcard" key={String(t._id)}>
              <h3>
                {t.pinned ? <span className="badge pinned">Sabit</span> : null}{' '}
                {t.locked ? <span className="badge locked">Kilitli</span> : null}{' '}
                <Link href={`/forum/konu/${t._id}-${t.slug}`}>{t.title}</Link>
              </h3>
              <div className="meta">
                {catInfo(t.category).emoji} {t.category || 'Genel Sohbet'} · {t.author} · {timeAgo(t.lastActivity || t.createdAt)}
                {' '}· 👁 {nf(t.views)} · 💬 {nf(t.replies)}
              </div>
              <p>{excerpt(t.body, 180)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="panel muted">Bu kategoride henüz konu yok. İlk konuyu sen aç! 🧀</div>
      )}

      {totalPages > 1 && (
        <div className="pager">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .map(p => (
              <Link key={p} className={'pg' + (p === page ? ' cur' : '')}
                href={`/forum?${cat ? 'kategori=' + encodeURIComponent(cat) + '&' : ''}sayfa=${p}`}>{p}</Link>
            ))}
        </div>
      )}
    </>
  );
}
