import { siteConfig } from '../site.config';

export function Header() {
  return (
    <header className="header container">
      <a className="brand" href="#top">
        <span className="brand-dot" aria-hidden="true" />
        <span>{siteConfig.brand.name}</span>
      </a>
      <nav className="top-nav">
        {siteConfig.nav.map((item) => (
          <a key={item.href} href={item.href}>{item.label}</a>
        ))}
      </nav>
    </header>
  );
}
