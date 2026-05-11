import { MouseTilt } from '../components/MouseTilt';
import { getPhotographyItems } from '../lib/content';
import type { SiteConfig } from '../site.config';

export function Photography({ config }: { config: SiteConfig }) {
  const section = config.sections.photography;
  const items = getPhotographyItems();

  return (
    <section className="container section" id={section.id}>
      <h2>{section.title}</h2>
      <div className="photo-masonry">
        {items.map((item) => (
          <MouseTilt key={item.title} className="photo-block tilt-card">
            {item.image ? (
              <img className={`photo-image photo-${item.h}`} src={item.image} alt={item.title} loading="lazy" />
            ) : (
              <div className={`photo-placeholder photo-${item.tone} photo-${item.h}`} />
            )}
            <figcaption>{item.title}</figcaption>
          </MouseTilt>
        ))}
      </div>
    </section>
  );
}
