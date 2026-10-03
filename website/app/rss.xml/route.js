import { getDb } from '../../lib/db';
import { esc, excerpt } from '../../lib/util';

export const dynamic = 'force-dynamic';

export async function GET() {
  const posts = await getDb().collection('blog_posts').find({ status: 'published' })
    .sort({ publishedAt: -1 }).limit(30).toArray();
  const SITE = 'https://hobbymice.com.tr';
  const items = posts.map(p => `
    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE}/blog/${esc(p.slug)}</link>
      <guid isPermaLink="true">${SITE}/blog/${esc(p.slug)}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <description>${esc(p.excerpt || excerpt(p.content, 250))}</description>
    </item>`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>HobbyMice Blog</title>
<link>${SITE}/blog</link>
<description>Transformice tabanlı HobbyMice sunucusundan rehberler ve haberler</description>
<language>tr</language>
${items.join('\n')}
</channel></rss>`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=600' },
  });
}
