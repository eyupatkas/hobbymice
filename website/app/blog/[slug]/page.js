import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '../../../lib/db';
import { fmtDate, nf, readingTime } from '../../../lib/util';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await getDb().collection('blog_posts').findOne({ slug: String(slug).slice(0, 100), status: 'published' });
  if (!p) return { title: 'Yazı — HobbyMice Blog' };
  return {
    title: `${p.title} — HobbyMice Blog`,
    description: p.excerpt || undefined,
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: {
      type: 'article',
      title: p.title,
      description: p.excerpt || undefined,
      publishedTime: p.publishedAt?.toISOString?.() || undefined,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const d = getDb();
  const p = await d.collection('blog_posts').findOne({ slug: String(slug).slice(0, 100), status: 'published' });
  if (!p) notFound();
  d.collection('blog_posts').updateOne({ _id: p._id }, { $inc: { views: 1 } }).catch(() => {});
  const related = (p.tags || []).length
    ? await d.collection('blog_posts').find({ status: 'published', tags: { $in: p.tags }, _id: { $ne: p._id } })
        .sort({ publishedAt: -1 }).limit(3).toArray()
    : [];
  // İç bağlama yedeği: etiket eşleşmesi yoksa en son 3 yazı linklenir.
  const fallbackRelated = related.length < 3
    ? await d.collection('blog_posts')
        .find({ status: 'published', _id: { $ne: p._id } })
        .sort({ publishedAt: -1 }).limit(3 - related.length).toArray()
    : [];
  const relatedAll = [...related, ...fallbackRelated];
  const faq = Array.isArray(p.faq) ? p.faq.filter(f => f?.q && f?.a) : [];
  const url = `https://hobbymice.com.tr/blog/${p.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    headline: p.title, description: p.excerpt || undefined, url,
    datePublished: p.publishedAt, dateModified: p.updatedAt || p.publishedAt,
    author: { '@type': 'Organization', name: p.author || 'HobbyMice' },
    publisher: { '@type': 'Organization', name: 'HobbyMice', logo: { '@type': 'ImageObject', url: 'https://hobbymice.com.tr/assets/logo.png' } },
    mainEntityOfPage: url,
  };
  const faqJsonLd = faq.length ? {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(f => ({
      '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }} />}
      <div className="breadcrumb"><Link href="/blog">Blog</Link> › {p.title}</div>
      <div className="panel article">
        <div className="cover">{p.emoji || '🧀'}</div>
        <h1 style={{ marginBottom: 8 }}>{p.title}</h1>
        <div className="meta muted small" style={{ marginBottom: 18 }}>
          {fmtDate(p.publishedAt)} · {p.author || 'HobbyMice'}
          {p.source === 'ai' && <span> · <span className="badge ai">AI Editör</span></span>}
          {' '}· ⏱ {readingTime(p.content)} dk okuma · 👁 {nf((p.views || 0) + 1)}
        </div>
        {/* 内容在入库时经白名单清洗 */}
        <div dangerouslySetInnerHTML={{ __html: p.content }} />
        {faq.length > 0 && (
          <div style={{ marginTop: 26 }}>
            <h2 style={{ fontSize: 19 }}>Sık Sorulan Sorular</h2>
            {faq.map((f, i) => (
              <details key={i} style={{ borderTop: '1px solid var(--line)', padding: '10px 4px' }} open={i === 0}>
                <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 14.5 }}>{f.q}</summary>
                <p style={{ margin: '8px 0 2px', lineHeight: 1.7, fontSize: 14 }}>{f.a}</p>
              </details>
            ))}
          </div>
        )}
      </div>
      <div className="share">
        <span>Paylaş:</span>
        <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(p.title)}`} target="_blank" rel="noopener">𝕏</a>
        <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(p.title)}%20${encodeURIComponent(url)}`} target="_blank" rel="noopener">💬</a>
        <a href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(p.title)}`} target="_blank" rel="noopener">✈️</a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener">f</a>
      </div>
      {(p.tags || []).length > 0 && (
        <div className="chips">
          {p.tags.map(t => <Link key={t} className="chip" href={`/blog/etiket/${encodeURIComponent(t)}`}>#{t}</Link>)}
        </div>
      )}
      {relatedAll.length > 0 && (
        <>
          <h2>Benzer Yazılar</h2>
          <div className="cardlist">
            {relatedAll.map(r => (
              <div className="postcard" key={String(r._id)}>
                <h3><Link href={`/blog/${r.slug}`}>{r.title}</Link></h3>
                <div className="meta">{fmtDate(r.publishedAt)}</div>
                <p>{r.excerpt || ''}</p>
              </div>
            ))}
          </div>
        </>
      )}
      <p style={{ marginTop: 26 }}><Link className="btn btn-play" href="/play">🧀 Hemen Oyna</Link></p>
    </>
  );
}
