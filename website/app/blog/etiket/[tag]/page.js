import Link from 'next/link';
import { getDb } from '../../../../lib/db';
import { fmtDate, excerpt, toInt } from '../../../../lib/util';

export const dynamic = 'force-dynamic';

const PER_PAGE = 10;

export async function generateMetadata({ params }) {
  const { tag } = await params;
  const t = decodeURIComponent(tag).slice(0, 40);
  return {
    title: `${t} etiketli yazılar — HobbyMice Blog`,
    description: `HobbyMice blogunda ${t} etiketiyle işaretlenmiş tüm yazılar.`,
  };
}

export default async function BlogTagPage({ params, searchParams }) {
  const { tag } = await params;
  const sp = await searchParams;
  const t = decodeURIComponent(tag).slice(0, 40);
  const page = Math.max(1, toInt(sp.sayfa, 1));
  const d = getDb();
  const q = { status: 'published', tags: t };
  const total = await d.collection('blog_posts').countDocuments(q);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const posts = await d.collection('blog_posts').find(q).sort({ publishedAt: -1 })
    .skip((page - 1) * PER_PAGE).limit(PER_PAGE).toArray();

  return (
    <>
      <div className="pagehead"><h1>Etiket: {t}</h1><p>{total} yazı bulundu.</p></div>
      {posts.length ? (
        <div className="cardlist">
          {posts.map(p => (
            <div className="postcard" key={String(p._id)}>
              <h3><Link href={`/blog/${p.slug}`}>{p.emoji ? p.emoji + ' ' : ''}{p.title}</Link></h3>
              <div className="meta">{fmtDate(p.publishedAt)} · {p.author || 'HobbyMice'}</div>
              <p>{p.excerpt || excerpt(p.content, 160)}</p>
            </div>
          ))}
        </div>
      ) : <div className="panel muted">Bu etikette yazı yok.</div>}
      {totalPages > 1 && (
        <div className="pager">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .map(p => (
              <Link key={p} className={'pg' + (p === page ? ' cur' : '')} href={`/blog/etiket/${encodeURIComponent(t)}?sayfa=${p}`}>{p}</Link>
            ))}
        </div>
      )}
    </>
  );
}
