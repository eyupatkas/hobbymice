import { t } from '../../../lib/i18n';

export default function HowToPlay({ lang = 'tr' }) {
  const STEPS = [
    {
      num: 1,
      title: t(lang, 'how.s1t'),
      desc: t(lang, 'how.s1d'),
    },
    {
      num: 2,
      title: t(lang, 'how.s2t'),
      desc: t(lang, 'how.s2d'),
    },
    {
      num: 3,
      title: t(lang, 'how.s3t'),
      desc: t(lang, 'how.s3d'),
    },
  ];

  const CONTROLS = [
    { keys: ['W', 'A', 'S', 'D'], label: t(lang, 'how.c1') },
    { keys: ['↓', 'S'], label: t(lang, 'how.c2') },
    { keys: ['Boşluk'], label: t(lang, 'how.c3') },
    { keys: ['1-9'], label: t(lang, 'how.c4') },
  ];

  const headTitle = t(lang, 'how.title').split('**');

  return (
    <section id="nasil" className="home-section" aria-labelledby="nasil-heading">
      <div className="section-head">
        <h2 id="nasil-heading">
          {headTitle[0]}<b>{headTitle[1]}</b>
        </h2>
        <p>
          {t(lang, 'how.sub')}
        </p>
      </div>

      <div className="steps-grid">
        {STEPS.map((s) => (
          <div key={s.num} className="step-card">
            <span className="step-num">{s.num}</span>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="controls-panel">
        {CONTROLS.map((c, i) => (
          <div key={i} className="ctrl-item">
            <div className="ctrl-keys">
              {c.keys.map((k, ki) => (
                <span key={ki} className="k-badge">
                  {k}
                </span>
              ))}
            </div>
            <span className="ctrl-text">{c.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
