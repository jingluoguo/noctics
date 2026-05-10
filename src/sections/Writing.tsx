import { siteConfig } from '../site.config';

export function Writing() {
  const section = siteConfig.sections.writing;

  return (
    <section className="container section" id={section.id}>
      <h2>{section.title}</h2>
      <div className="list-shell">
        {section.items.map((post) => (
          <a key={post} className="list-item" href="#">
            <span>{post}</span>
            <span>{section.ctaLabel}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
