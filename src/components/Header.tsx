import type { SiteConfig } from '../site.config';

export function Header({ config }: { config: SiteConfig }) {
  return (
    <header className="header container">
      <a className="brand" href="#top">
        <span className="brand-dot" aria-hidden="true" />
        <span>{config.brand.name}</span>
      </a>
      <nav className="top-nav">
        {config.nav.map((item) => (
          <a key={item.href} href={item.href}>{item.label}</a>
        ))}
      </nav>
    </header>
  );
}
