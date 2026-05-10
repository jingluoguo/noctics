import { useEffect } from 'react';
import { HeroParticles } from '../components/HeroParticles';
import type { SiteConfig } from '../site.config';

export function Hero({ config }: { config: SiteConfig }) {
  useEffect(() => {
    const root = document.documentElement;

    const onMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      root.style.setProperty('--hx', x.toFixed(3));
      root.style.setProperty('--hy', y.toFixed(3));
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const hero = config.hero;

  return (
    <section className="hero container" id={hero.id}>
      <HeroParticles />
      <div className="hero-grid">
        <div className="hero-copy-block">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1>{hero.title}</h1>
          <p className="hero-copy">{hero.subtitle}</p>
          <div className="hero-actions">
            <a href={hero.primaryAction.href} className="btn btn-solid">{hero.primaryAction.label}</a>
          </div>
        </div>
        {hero.showSculpture && (
          <div className="hero-sculpture" aria-hidden="true">
            <div className="orb orb-a" />
            <div className="orb orb-b" />
            <div className="orb orb-c" />
            <div className="orb-core" />
          </div>
        )}
      </div>
    </section>
  );
}
