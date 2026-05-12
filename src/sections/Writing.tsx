import { getWritingItems } from '../lib/content';
import type { WritingContentItem } from '../lib/content';
import type { SiteConfig } from '../site.config';

type WritingProps = {
  config: SiteConfig;
  items?: WritingContentItem[];
  listPage?: number;
  moreHref?: string;
  moreLabel?: string;
};

export function Writing({ config, items, listPage, moreHref, moreLabel }: WritingProps) {
  const section = config.sections.writing;
  const visibleItems = items ?? getWritingItems();

  return (
    <section className="container section" id={section.id}>
      <div className="section-head">
        <h2>{section.title}</h2>
        {moreHref && moreLabel ? (
          <a className="section-more" href={moreHref}>
            {moreLabel}
          </a>
        ) : null}
      </div>
      <div className="article-shell">
        {visibleItems.map((post) => (
          <article key={post.slug} className="article-item">
            <a className="article-link" href={`#/writing/${post.slug}${listPage ? `/page/${listPage}` : ''}`}>
              <span className="article-cover-wrap" style={{ ['--cover-ar' as string]: section.coverAspectRatio ?? '16 / 9' }}>
                {post.cover ? (
                  <img className="article-cover" src={post.cover} alt={post.title} loading="lazy" />
                ) : (
                  <span className="article-cover-fallback">{post.title}</span>
                )}
              </span>
              <span className="article-main">
                <strong>{post.title}</strong>
                {(post.updatedAt || post.category || post.tags?.length || post.wordCount > 0) && (
                  <span className="article-meta">
                    {post.updatedAt && <span className="item-updated-at">更新于 {post.updatedAt}</span>}
                    {post.wordCount > 0 && (
                      <span className="item-updated-at">
                        {post.wordCount} 字 · 预计 {post.readingMinutes} 分钟
                      </span>
                    )}
                    {post.category && <span className="article-category">{post.category}</span>}
                    {post.tags?.map((tag) => (
                      <span key={`${post.title}-${tag}`} className="article-tag">
                        #{tag}
                      </span>
                    ))}
                  </span>
                )}
                <span className="article-summary">{post.summary}</span>
              </span>
              <span className="article-cta">{section.ctaLabel}</span>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
