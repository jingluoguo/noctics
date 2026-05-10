import { MouseTilt } from '../components/MouseTilt';
import type { SiteConfig } from '../site.config';

export function Works({ config }: { config: SiteConfig }) {
  const section = config.sections.works;

  return (
    <section className="container section" id={section.id}>
      <h2>{section.title}</h2>
      <div className="card-grid">
        {section.items.map((app) => (
          <MouseTilt key={app.name} className="card tilt-card">
            <h3>{app.name}</h3>
            <p>{app.desc}</p>
            <span>{app.stack}</span>
          </MouseTilt>
        ))}
      </div>
    </section>
  );
}
