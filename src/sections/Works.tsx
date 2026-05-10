import { MouseTilt } from '../components/MouseTilt';
import { getWorkItems } from '../lib/content';
import type { SiteConfig } from '../site.config';

export function Works({ config }: { config: SiteConfig }) {
  const section = config.sections.works;
  const items = getWorkItems();

  return (
    <section className="container section" id={section.id}>
      <h2>{section.title}</h2>
      <div className="card-grid">
        {items.map((app) => (
          <MouseTilt
            key={app.name}
            className={`card tilt-card ${app.website ? 'work-card-clickable' : ''}`}
            onClick={app.website ? () => window.open(app.website, '_blank', 'noopener,noreferrer') : undefined}
            onKeyDown={
              app.website
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      window.open(app.website, '_blank', 'noopener,noreferrer');
                    }
                  }
                : undefined
            }
          >
            <div className="work-link" role={app.website ? 'link' : undefined} tabIndex={app.website ? 0 : undefined}>
              <div className="work-head">
                {app.logo ? (
                  <img className="work-logo" src={app.logo} alt={`${app.name} logo`} />
                ) : (
                  <div className="work-logo work-logo-fallback" aria-hidden="true">
                    {app.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <h3>{app.name}</h3>
              </div>
              <p>{app.desc}</p>
              <span>{app.stack}</span>
              {app.platforms?.length ? (
                <div className="work-platforms">
                  {app.platforms.map((platform) => (
                    <a
                      key={`${app.name}-${platform.name}`}
                      className="work-platform-link"
                      href={platform.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {platform.name}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </MouseTilt>
        ))}
      </div>
    </section>
  );
}
