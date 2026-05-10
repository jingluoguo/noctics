import { MouseTilt } from '../components/MouseTilt';
import type { SiteConfig } from '../site.config';

export function Photography({ config }: { config: SiteConfig }) {
  const section = config.sections.photography;

  return (
    <section className="container section" id={section.id}>
      <h2>{section.title}</h2>
      <div className="photo-masonry">
        {section.items.map((item) => (
          <MouseTilt key={item.title} className="photo-block tilt-card">
            <div className={`photo-placeholder photo-${item.tone} photo-${item.h}`} />
            <figcaption>{item.title}</figcaption>
          </MouseTilt>
        ))}
      </div>
    </section>
  );
}
