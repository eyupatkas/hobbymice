import { getDb } from '../../../../lib/db';
import { toInt } from '../../../../lib/util';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const limit = Math.min(6, Math.max(1, toInt(new URL(req.url).searchParams.get('limit'), 3)));
  const posts = await getDb().collection('blog_posts').find({ status: 'published' })
    .sort({ publishedAt: -1 }).limit(limit)
    .project({ title: 1, slug: 1, excerpt: 1, emoji: 1, publishedAt: 1, _id: 0 }).toArray();
  return Response.json(
    { ok: true, posts: posts.map(p => ({ ...p, publishedAt: p.publishedAt.toISOString() })) },
    { headers: { 'Cache-Control': 'no-cache' } },
  );
}
