import Link from 'next/link';
import { t } from '../../../lib/i18n';
import { fmtDate } from '../../../lib/util';

export default function LatestPosts({ posts = [], lang = 'tr' }) {
  const headTitle = t(lang, 'posts.title').split('**');
  return (
    <section id="blogson" className="home-section" aria-labelledby="blog-heading">
      <div className="section-head">
        <h2 id="blog-heading">
          {headTitle[0]} <b>{headTitle[1]}</b>
        </h2>
        <p>
          {t(lang, 'posts.sub')}
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
              <time className="home-post-date">{fmtDate(p.publishedAt, lang)}</time>
            </article>
          ))
        ) : (
          <div className="empty-card">
            {t(lang, 'posts.empty')}
          </div>
        )}
      </div>

      <div className="home-posts-actions">
        <a className="btn btn-secondary" href="/blog">
          {t(lang, 'posts.all')}
        </a>
        <a className="btn btn-secondary" href="/forum">
          {t(lang, 'posts.forum')}
        </a>
      </div>
    </section>
  );
}
