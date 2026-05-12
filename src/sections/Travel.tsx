import { MouseTilt } from '../components/MouseTilt';
import { getTravelItems } from '../lib/content';
import type { TravelContentItem } from '../lib/content';
import type { SiteConfig } from '../site.config';
import { withBaseAssetUrl } from '../lib/asset';

type TravelProps = {
  config: SiteConfig;
  items?: TravelContentItem[];
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

export function Travel({
  config,
  items,
  listPage,
  moreHref,
  moreLabel,
  activeTag,
  availableTags = [],
  tagHrefBuilder,
  detailTag
}: TravelProps) {
  const section = config.sections.travel;
  const visibleItems = items ?? getTravelItems();

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
      <div className="split-layout">
        {visibleItems.length > 0 ? (
          visibleItems.map((trip) => (
            <MouseTilt key={trip.city} className="travel-item tilt-card">
              <a className="travel-link" href={withTag(`#/travel/${trip.slug}${listPage ? `/page/${listPage}` : ''}`, detailTag)}>
                <div className="travel-cover-wrap" style={{ ['--cover-ar' as string]: section.coverAspectRatio ?? '16 / 9' }}>
                  {trip.cover ? (
                    <img className="travel-cover" src={withBaseAssetUrl(trip.cover)} alt={trip.city} loading="lazy" />
                  ) : (
                    <span className="travel-cover-fallback">{trip.city}</span>
                  )}
                </div>
                <div className="travel-main">
                  <h3>{trip.city}</h3>
                  {(trip.date || trip.tags?.length) && (
                    <div className="travel-meta">
                      {trip.date && <span className="travel-date">{trip.date}</span>}
                      {trip.tags?.map((tag) => (
                        <span key={`${trip.city}-${tag}`} className="travel-tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="travel-summary">{trip.summary}</p>
                </div>
              </a>
            </MouseTilt>
          ))
        ) : (
          <div className="filter-empty">当前标签下暂无游记</div>
        )}
      </div>
    </section>
  );
}
