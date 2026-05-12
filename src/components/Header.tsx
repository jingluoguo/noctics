import type { SiteConfig } from '../site.config';

type HeaderProps = {
  config: SiteConfig;
  onSearchClick?: () => void;
};

export function Header({ config, onSearchClick }: HeaderProps) {
  return (
    <header className="header container">
      <a className="brand" href="#top">
        <span className="brand-dot" aria-hidden="true" />
        <span>{config.brand.name}</span>
      </a>
      <div className="top-nav-wrap">
        <nav className="top-nav">
          {config.nav.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>
        <button type="button" className="top-search-btn" onClick={onSearchClick} aria-label="打开搜索">
          <span aria-hidden="true">⌕</span>
        </button>
      </div>
    </header>
  );
}
