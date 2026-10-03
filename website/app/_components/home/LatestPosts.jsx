import Link from 'next/link';
import { fmtDate } from '../../../lib/util';

export default function LatestPosts({ posts = [] }) {
  return (
    <section id="blogson" className="home-section" aria-labelledby="blog-heading">
      <div className="section-head">
        <h2 id="blog-heading">
          Blog ve Duyurulardan <b>Son Haberler</b>
        </h2>
        <p>
          Oyun güncellemeleri, şaman taktikleri, topluluk etkinlikleri ve kabile rehberleri.
        </p>
      </div>

      <div className="home-posts-grid">
        {posts && posts.length > 0 ? (
          posts.map((p) => (
            <article className="home-post-card" key={String(p._id)}>
              <span className="home-post-ico">{p.emoji || '🧀'}</span>
              <h3>
                <Link href={`/blog/${p.slug}`}>{p.title}</Link>
              </h3>
              <p>{p.excerpt}</p>
              <time className="home-post-date">{fmtDate(p.publishedAt)}</time>
            </article>
          ))
        ) : (
          <div className="empty-card">
            Henüz blog yazısı bulunmuyor. Yeni rehberler çok yakında burada olacak! 🧀
          </div>
        )}
      </div>

      <div className="home-posts-actions">
        <a className="btn btn-secondary" href="/blog">
          Tüm Yazıları Oku →
        </a>
        <a className="btn btn-secondary" href="/forum">
          Topluluk Forumuna Git →
        </a>
      </div>
    </section>
  );
}
