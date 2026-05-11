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
  const profile = hero.profile;

  return (
    <section className="hero container" id={hero.id}>
      <HeroParticles />
      <div className="hero-grid">
        <div className="hero-copy-block">
          {profile && (
            <div className="hero-profile">
              <img className="hero-profile-avatar" src={profile.avatar} alt={profile.nickname} />
              <div className="hero-profile-content">
                <strong className="hero-profile-name">{profile.nickname}</strong>
                {profile.headline && <p className="hero-profile-headline">{profile.headline}</p>}
                {profile.intro && <p className="hero-profile-intro">{profile.intro}</p>}
                <div className="hero-profile-socials">
                  {profile.socials.map((social) => (
                    <a
                      key={`${social.label}-${social.url}`}
                      href={social.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={social.label}
                      title={social.label}
                    >
                      <span className="hero-social-icon" aria-hidden="true">{social.icon}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
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
