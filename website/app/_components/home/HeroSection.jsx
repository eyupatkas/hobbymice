import Link from 'next/link';
import { t } from '../../../lib/i18n';
import DlInfo from '../DlInfoClient';

export { default as DlInfo } from '../DlInfoClient';

export default function HeroSection({ lang = 'tr' }) {
  const chips = [
    t(lang, 'hero.chipFree'),
    t(lang, 'hero.chipNoInstall'),
    t(lang, 'hero.chipVersion'),
    t(lang, 'hero.chipCommunity'),
  ];

  return (
    <section className="home-hero">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          <span>{t(lang, 'hero.badge')}</span>
        </div>

        <div className="hero-brand">
          <img className="hero-logo-img" src="/assets/logo.png" alt="HobbyMice" />
        </div>

        <h1 className="hero-title">
          <span>{t(lang, 'hero.title1')}</span>{' '}
          <span className="hero-title-highlight">{t(lang, 'hero.title2')}</span>
        </h1>

        <p className="hero-desc">
          {t(lang, 'hero.desc')}
        </p>

        <div className="hero-actions">
          <a className="btn btn-play hero-btn-play" href="/play">
            {t(lang, 'hero.btnPlay')}
          </a>
          <a className="btn btn-secondary hero-btn-dl" href="/launcher">
            {t(lang, 'hero.btnDownload')}
          </a>
        </div>

        <DlInfo />

        <div className="hero-chips">
          {chips.map((text, i) => (
            <span key={i} className="chip">
              {text}
            </span>
          ))}
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-card-frame">
          <div className="hero-img-inner">
            <img
              src="/assets/hero-bg.webp"
              alt="HobbyMice Dünyası"
              className="hero-img-element"
              loading="eager"
              width={560}
              height={420}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
