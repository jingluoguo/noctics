import type { SiteConfig } from '../site.config';

type FriendLinksProps = {
  config: SiteConfig;
};

export function FriendLinks({ config }: FriendLinksProps) {
  const section = config.sections.links;

  if (!section.items.length) return null;

  return (
    <section className="container section" id={section.id}>
      <div className="section-head">
        <h2>{section.title}</h2>
      </div>
      <div className="friend-links-grid">
        {section.items.map((item) => (
          <a
            key={item.url}
            className="friend-link-card"
            href={item.url}
            target="_blank"
            rel="noreferrer noopener"
          >
            <div className="friend-link-head">
              {item.avatar ? <img className="friend-link-avatar" src={item.avatar} alt={item.name} loading="lazy" /> : null}
              <strong>{item.name}</strong>
            </div>
            {item.desc ? <span>{item.desc}</span> : null}
            <em>{item.url}</em>
          </a>
        ))}
      </div>
    </section>
  );
}
