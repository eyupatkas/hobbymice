import Link from 'next/link';
import DlInfo from '../DlInfoClient';

export { default as DlInfo } from '../DlInfoClient';

export default function HeroSection() {
  const chips = [
    '✓ Tamamen Ücretsiz',
    '✓ Kurulum Gerektirmez (Ruffle)',
    '✓ Sürüm 1.889 Güncel',
    '✓ %100 Türkçe Topluluk',
  ];

  return (
    <section className="home-hero">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          <span>HobbyMice Sunucusu Aktif &middot; v1.889</span>
        </div>

        <div className="hero-brand">
          <img className="hero-logo-img" src="/assets/logo.png" alt="HobbyMice" />
        </div>

        <h1 className="hero-title">
          <span>Peynirin Peşinde</span>{' '}
          <span className="hero-title-highlight">Efsanevi Bir Macera!</span>
        </h1>

        <p className="hero-desc">
          HobbyMice, sevimli farelerin peynir kapıp deliğe koştuğu, dostlukların ve
          kızgın şamanların buluştuğu ücretsiz çevrimiçi oyundur. İndirmeye gerek yok — tarayıcında tek tıkla başla!
        </p>

        <div className="hero-actions">
          <a className="btn btn-play hero-btn-play" href="/play">
            ▶ HEMEN OYNA
          </a>
          <a className="btn btn-secondary hero-btn-dl" href="/launcher">
            ⬇ Bilgisayara İndir (Launcher)
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
            />
          </div>
          <div className="hero-card-bar">
            <span className="hero-card-tag">🧀 Resmi Launcher &amp; Web</span>
            <span className="hero-card-sub">Atelier 801 Fan Projesi</span>
          </div>
        </div>
      </div>
    </section>
  );
}
