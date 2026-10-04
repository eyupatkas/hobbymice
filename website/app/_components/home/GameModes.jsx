import { t } from '../../../lib/i18n';

export default function GameModes({ lang = 'tr' }) {
  const MODES = [
    {
      ico: '🧀',
      tag: t(lang, 'modes.m1tag'),
      title: t(lang, 'modes.m1t'),
      desc: t(lang, 'modes.m1d'),
    },
    {
      ico: '⚡',
      tag: t(lang, 'modes.m2tag'),
      title: t(lang, 'modes.m2t'),
      desc: t(lang, 'modes.m2d'),
    },
    {
      ico: '🏁',
      tag: t(lang, 'modes.m3tag'),
      title: t(lang, 'modes.m3t'),
      desc: t(lang, 'modes.m3d'),
    },
    {
      ico: '🧗',
      tag: t(lang, 'modes.m4tag'),
      title: t(lang, 'modes.m4t'),
      desc: t(lang, 'modes.m4d'),
    },
  ];

  const headTitle = t(lang, 'modes.title').split('**');

  return (
    <section id="modlar" className="home-section" aria-labelledby="modes-heading">
      <div className="section-head">
        <h2 id="modes-heading">
          {headTitle[0]}<b>{headTitle[1]}</b>
        </h2>
        <p>
          {t(lang, 'modes.sub')}
        </p>
      </div>

      <div className="modes-grid">
        {MODES.map((m, idx) => (
          <div key={idx} className="mode-card">
            <div className="mode-top">
              <span className="mode-ico">{m.ico}</span>
              <span className="mode-tag">{m.tag}</span>
            </div>
            <h3>{m.title}</h3>
            <p>{m.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
