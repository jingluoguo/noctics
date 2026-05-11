import { useEffect, useState } from 'react';
import { HeroParticles } from '../components/HeroParticles';
import type { SiteConfig } from '../site.config';

export function Hero({ config }: { config: SiteConfig }) {
  const [displayTitle, setDisplayTitle] = useState('');
  const [titleTypingDone, setTitleTypingDone] = useState(false);

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
  const title = hero.title;

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const characters = Array.from(title);

    if (prefersReducedMotion) {
      setDisplayTitle(title);
      setTitleTypingDone(true);
      return;
    }

    setDisplayTitle('');
    setTitleTypingDone(false);

    let index = 0;
    let timerId = window.setTimeout(function type() {
      index += 1;
      setDisplayTitle(characters.slice(0, index).join(''));

      if (index < characters.length) {
        const char = characters[index - 1];
        const delay = /[，。！？、,.!?]/.test(char) ? 150 : 42;
        timerId = window.setTimeout(type, delay);
      } else {
        setTitleTypingDone(true);
      }
    }, 500);

    return () => window.clearTimeout(timerId);
  }, [title]);

  return (
    <section className="hero container" id={hero.id}>
      <HeroParticles />
      <div className="hero-grid">
        <div className="hero-copy-block">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1 className="hero-title" aria-label={title}>
            <span className="hero-title-text">{displayTitle || '\u00A0'}</span>
            <span className={`hero-title-cursor ${titleTypingDone ? 'is-idle' : ''}`} aria-hidden="true" />
          </h1>
          <p className="hero-copy">{hero.subtitle}</p>
          <div className="hero-actions">
            <a href={hero.primaryAction.href} className="btn btn-solid">{hero.primaryAction.label}</a>
          </div>
        </div>
        {hero.showSculpture && (
          <div className="hero-sculpture" aria-hidden="true">
            <div className="hero-sculpture-glow" />
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
