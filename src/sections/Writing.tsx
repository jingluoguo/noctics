import { getWritingItems } from '../lib/content';
import type { WritingContentItem } from '../lib/content';
import type { SiteConfig } from '../site.config';
import { withBaseAssetUrl } from '../lib/asset';

type WritingProps = {
  config: SiteConfig;
  items?: WritingContentItem[];
  listPage?: number;
  moreHref?: string;
  moreLabel?: string;
  activeTag?: string | null;
  availableTags?: string[];
  tagHrefBuilder?: (tag: string | null) => string;
  detailTag?: string | null;
};

function withTag(path: string, tag?: string | null) {
  if (!tag) return path;
  return `${path}?tag=${encodeURIComponent(tag)}`;
}

export function Writing({
  config,
  items,
  listPage,
  moreHref,
  moreLabel,
  activeTag,
  availableTags = [],
  tagHrefBuilder,
  detailTag
}: WritingProps) {
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
      {tagHrefBuilder && availableTags.length > 0 && (
        <div className="tag-filter">
          <a className={`tag-filter-chip ${!activeTag ? 'is-active' : ''}`} href={tagHrefBuilder(null)}>
            全部
          </a>
          {availableTags.map((tag) => (
            <a
              key={`${section.id}-tag-${tag}`}
              className={`tag-filter-chip ${activeTag === tag ? 'is-active' : ''}`}
              href={tagHrefBuilder(tag)}
            >
              #{tag}
            </a>
          ))}
        </div>
      )}
      <div className="article-shell">
        {visibleItems.length > 0 ? (
          visibleItems.map((post) => (
            <article key={post.slug} className="article-item">
              <a
                className="article-link"
                href={withTag(`#/writing/${post.slug}${listPage ? `/page/${listPage}` : ''}`, detailTag)}
              >
                <span className="article-cover-wrap" style={{ ['--cover-ar' as string]: section.coverAspectRatio ?? '16 / 9' }}>
                  {post.cover ? (
                    <img className="article-cover" src={withBaseAssetUrl(post.cover)} alt={post.title} loading="lazy" />
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
          ))
        ) : (
          <div className="filter-empty">当前标签下暂无文章</div>
        )}
      </div>
    </section>
  );
}
