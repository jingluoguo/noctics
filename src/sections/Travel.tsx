import { MouseTilt } from '../components/MouseTilt';
import { siteConfig } from '../site.config';

export function Travel() {
  const section = siteConfig.sections.travel;

  return (
    <section className="container section" id={section.id}>
      <h2>{section.title}</h2>
      <div className="split-layout">
        {section.items.map((trip) => (
          <MouseTilt key={trip.city} className="travel-item tilt-card">
            <h3>{trip.city}</h3>
            <p>{trip.note}</p>
          </MouseTilt>
        ))}
      </div>
    </section>
  );
}
