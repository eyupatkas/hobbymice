import { t } from '../../../lib/i18n';

export default function GameFeatures({ lang = 'tr' }) {
  const FEATURES = [
    {
      ico: '🌐',
      title: t(lang, 'feat.f1t'),
      desc: t(lang, 'feat.f1d'),
    },
    {
      ico: '⚔️',
      title: t(lang, 'feat.f2t'),
      desc: t(lang, 'feat.f2d'),
    },
    {
      ico: '🗺️',
      title: t(lang, 'feat.f3t'),
      desc: t(lang, 'feat.f3d'),
    },
    {
      ico: '🧀',
      title: t(lang, 'feat.f4t'),
      desc: t(lang, 'feat.f4d'),
    },
  ];

  const headTitle = t(lang, 'feat.title').split('**');

  return (
    <section id="ozellikler" className="home-section" aria-labelledby="feat-heading">
      <div className="section-head">
        <h2 id="feat-heading">
          {headTitle[0]}<b>{headTitle[1]}</b>
        </h2>
        <p>
          {t(lang, 'feat.sub')}
        </p>
      </div>

      <div className="features-grid">
        {FEATURES.map((item, idx) => (
          <article key={idx} className="feat-card">
            <div className="feat-ico">{item.ico}</div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
