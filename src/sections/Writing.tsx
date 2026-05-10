import { getWritingItems } from '../lib/content';
import type { WritingContentItem } from '../lib/content';
import type { SiteConfig } from '../site.config';

type WritingProps = {
  config: SiteConfig;
  items?: WritingContentItem[];
  moreHref?: string;
  moreLabel?: string;
};

export function Writing({ config, items, moreHref, moreLabel }: WritingProps) {
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
            <a className="article-link" href={`#/writing/${post.slug}`}>
              <span>
                <strong>{post.title}</strong>
                {(post.category || post.tags?.length) && (
                  <span className="article-meta">
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
              <span>{section.ctaLabel}</span>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
