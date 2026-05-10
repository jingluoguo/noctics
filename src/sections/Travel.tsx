import { MouseTilt } from '../components/MouseTilt';
import { getTravelItems } from '../lib/content';
import type { SiteConfig } from '../site.config';

export function Travel({ config }: { config: SiteConfig }) {
  const section = config.sections.travel;
  const items = getTravelItems();

  return (
    <section className="container section" id={section.id}>
      <h2>{section.title}</h2>
      <div className="split-layout">
        {items.map((trip) => (
          <MouseTilt key={trip.city} className="travel-item tilt-card">
            <a className="travel-link" href={`#/travel/${trip.slug}`}>
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
            </a>
          </MouseTilt>
        ))}
      </div>
    </section>
  );
}
