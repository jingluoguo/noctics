import { siteConfig } from '../site.config';

export function Footer() {
  return (
    <footer className="footer container">
      <p>© {new Date().getFullYear()} {siteConfig.brand.name} · Mobile Engineer</p>
      <p>{siteConfig.footer.rightText}</p>
    </footer>
  );
}
