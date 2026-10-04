import Link from 'next/link';
import { t } from '../../../lib/i18n';

export default function LauncherSpotlight({ lang = 'tr' }) {
  const launcherPerks = [
    t(lang, 'launcher.perk1'),
    t(lang, 'launcher.perk2'),
    t(lang, 'launcher.perk3'),
    t(lang, 'launcher.perk4'),
  ];

  const headTitle = t(lang, 'launcher.title').split('**');

  return (
    <section className="home-section" aria-label="Masaüstü Launcher">
      <div className="launcher-spotlight">
        <div className="launcher-info">
          <h3>
            {headTitle[0]} <b>{headTitle[1]}</b>
          </h3>
          <p>
            {t(lang, 'launcher.desc')}
          </p>
          <div className="launcher-features">
            {launcherPerks.map((perk, idx) => (
              <span key={idx} className="launcher-feature-item">
                {perk}
              </span>
            ))}
          </div>
          <div className="launcher-cta-box">
            <a className="btn btn-play" href="/dl/Hobby-Mice.zip">
              {t(lang, 'launcher.btn')}
            </a>
            <span className="launcher-subtext">
              {t(lang, 'launcher.version')}{' '}
              <Link href="/launcher">{t(lang, 'launcher.details')}</Link>
            </span>
          </div>
        </div>

        <figure className="launcher-shot">
          <img
            src="/assets/hobbymice-launcher.webp"
            alt="HobbyMice launcher ana ekranı: gün batımlı harita üzerinde OYNA düğmesi ve sunucu çevrimiçi göstergesi"
            width="1089"
            height="592"
            loading="lazy"
          />
          <figcaption>{t(lang, 'launcher.figcap')}</figcaption>
        </figure>
      </div>
    </section>
  );
}
