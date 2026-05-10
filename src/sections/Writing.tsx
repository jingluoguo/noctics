import { getWritingItems } from '../lib/content';
import type { SiteConfig } from '../site.config';

export function Writing({ config }: { config: SiteConfig }) {
  const section = config.sections.writing;
  const items = getWritingItems();

  return (
    <section className="container section" id={section.id}>
      <h2>{section.title}</h2>
      <div className="article-shell">
        {items.map((post) => (
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
