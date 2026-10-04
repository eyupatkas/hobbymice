import Link from 'next/link';
import { getDb } from '../../lib/db';
import { getUser } from '../../lib/session';
import { fmtDate, nf, excerpt, readingTime, toInt } from '../../lib/util';

export const dynamic = 'force-dynamic';

export const metadata = {
  alternates: { canonical: '/blog' },
  title: 'HobbyMice Blog — Rehberler, Taktikler ve Haberler',
  description: 'Transformice ve HobbyMice üzerine rehberler: şaman taktikleri, mod stratejileri, harita ipuçları ve topluluk haberleri.',
};

const PER_PAGE = 10;

export default async function BlogPage({ searchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, toInt(sp.sayfa, 1));
  const d = getDb();
  const q = { status: 'published' };
  const [total, posts, top, tagAgg] = await Promise.all([
    d.collection('blog_posts').countDocuments(q),
    d.collection('blog_posts').find(q).sort({ publishedAt: -1 })
      .skip((page - 1) * PER_PAGE).limit(PER_PAGE).toArray(),
    d.collection('blog_posts').find(q).sort({ views: -1 }).limit(5)
      .project({ title: 1, slug: 1, emoji: 1 }).toArray(),
    d.collection('blog_posts').aggregate([
      { $match: q }, { $unwind: '$tags' },
      { $group: { _id: '$tags', n: { $sum: 1 } } },
      { $sort: { n: -1 } }, { $limit: 20 },
    ]).toArray(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const [hero, ...rest] = posts;

  return (
    <>
      <div className="pagehead">
        <h1>Blog 📝</h1>
        <p>HobbyMice ekibinden rehberler, taktikler ve haberler. Yeni yazılar düzenli olarak eklenir.</p>
      </div>
      <div className="blog-wrap">
        <div className="blog-main">
          {page === 1 && hero && (
            <Link className="blog-hero" href={`/blog/${hero.slug}`}>
              <div className="cover">{hero.emoji || '🧀'}</div>
              <div className="bh-body">
                <div className="meta">
                  {fmtDate(hero.publishedAt)} · {hero.author || 'HobbyMice'}
                  {hero.source === 'ai' && <span> · <span className="badge ai">AI</span></span>}
                  {' '}· ⏱ {readingTime(hero.content)} dk okuma
                </div>
                <h2>{hero.title}</h2>
                <p>{hero.excerpt || excerpt(hero.content, 200)}</p>
                <span className="btn btn-ghost btn-sm">Yazıyı oku →</span>
              </div>
            </Link>
          )}
          {rest.length > 0 && (
            <div className="cardlist">
              {rest.map(p => (
                <div className="postcard" key={String(p._id)}>
                  <h3><Link href={`/blog/${p.slug}`}>{p.emoji ? p.emoji + ' ' : ''}{p.title}</Link></h3>
                  <div className="meta">
                    {fmtDate(p.publishedAt)} · {p.author || 'HobbyMice'}
                    {p.source === 'ai' && <span> · <span className="badge ai">AI</span></span>}
                    {' '}· ⏱ {readingTime(p.content)} dk okuma · 👁 {nf(p.views)}
                  </div>
                  <p>{p.excerpt || excerpt(p.content, 160)}</p>
                  {(p.tags || []).length > 0 && (
                    <div className="chips" style={{ marginTop: 10 }}>
                      {p.tags.map(t => <Link key={t} className="chip plain" href={`/blog/etiket/${encodeURIComponent(t)}`}>{t}</Link>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="pager">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .map(p => (
                  <Link key={p} className={'pg' + (p === page ? ' cur' : '')} href={`/blog?sayfa=${p}`}>{p}</Link>
                ))}
            </div>
          )}
        </div>
        <aside className="blog-side">
          <div className="sb-box">
            <h3>🔥 Popüler Yazılar</h3>
            {top.length ? top.map((p, i) => (
              <Link key={String(p._id)} className="sb-item" href={`/blog/${p.slug}`}>
                <span className="sb-n">{i + 1}</span><span>{p.emoji || '🧀'} {p.title}</span>
              </Link>
            )) : <p className="muted small">Henüz veri yok.</p>}
          </div>
          <div className="sb-box">
            <h3>🏷️ Etiketler</h3>
            <div className="chips">
              {tagAgg.map(t => (
                <Link key={t._id} className="chip plain" href={`/blog/etiket/${encodeURIComponent(t._id)}`}>{t._id} <small>({t.n})</small></Link>
              ))}
            </div>
          </div>
          <div className="sb-box cta">
            <h3>🧀 Oynamaya var mısın?</h3>
            <p className="small muted">Okudun, şimdi sırada peynir var.</p>
            <Link className="btn btn-play btn-sm" href="/play">Hemen Oyna</Link>
          </div>
          <div className="sb-box">
            <h3>📰 RSS</h3>
            <p className="small muted">Yeni yazıları kaçırmamak için:</p>
            <a className="btn btn-ghost btn-sm" href="/rss.xml">RSS ile takip et</a>
          </div>
        </aside>
      </div>
    </>
  );
}
