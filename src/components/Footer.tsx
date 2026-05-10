import type { SiteConfig } from '../site.config';

export function Footer({ config }: { config: SiteConfig }) {
  return (
    <footer className="footer container">
      <p>© {new Date().getFullYear()} {config.brand.name} · Mobile Engineer</p>
      <p>{config.footer.rightText}</p>
    </footer>
  );
}
