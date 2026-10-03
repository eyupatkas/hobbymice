import { getDb } from '../../lib/db';

export const dynamic = 'force-dynamic';

const SITE = process.env.SITE_URL || 'https://hobbymice.com.tr';

export async function GET() {
  const d = getDb();
  const [posts, topics, tagAgg] = await Promise.all([
    d.collection('blog_posts').find({ status: 'published' }).sort({ publishedAt: -1 }).limit(1000)
      .project({ slug: 1, publishedAt: 1, updatedAt: 1 }).toArray(),
    d.collection('forum_topics').find({ status: { $ne: 'deleted' } }).sort({ lastActivity: -1 }).limit(500)
      .project({ _id: 1, slug: 1, lastActivity: 1 }).toArray(),
    d.collection('blog_posts').aggregate([
      { $match: { status: 'published' } }, { $unwind: '$tags' },
      { $group: { _id: '$tags', n: { $sum: 1 } } },
      { $sort: { n: -1 } }, { $limit: 30 },
    ]).toArray(),
  ]);
  const w3 = v => new Date(v).toISOString().slice(0, 10);
  const entries = [
    ['/', '1.0', 'daily', null], ['/play', '0.9', 'daily', null], ['/launcher', '0.9', 'weekly', null],
    ['/forum', '0.8', 'hourly', null],
    ['/blog', '0.9', 'daily', null], ['/siralama', '0.7', 'daily', null],
    ...tagAgg.map(t => [`/blog/etiket/${encodeURIComponent(t._id)}`, '0.5', 'weekly', null]),
    ...posts.map(p => [`/blog/${p.slug}`, '0.8', 'weekly', w3(p.updatedAt || p.publishedAt)]),
    ...topics.map(t => [`/forum/konu/${t._id}-${t.slug}`, '0.6', 'daily', w3(t.lastActivity)]),
  ];
  const lines = entries.map(([u, pr, freq, lm]) =>
    `  <url><loc>${SITE}${u}</loc><changefreq>${freq}</changefreq><priority>${pr}</priority>${lm ? `<lastmod>${lm}</lastmod>` : ''}</url>`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${lines.join('\n')}
</urlset>`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=300' },
  });
}
