import { t } from '../../../lib/i18n';

export default function PlayBand({ lang = 'tr' }) {
  return (
    <section className="home-section" aria-label="Hemen Oyna Çağrısı">
      <div className="playband">
        <h2>{t(lang, 'band.title')}</h2>
        <p>
          {t(lang, 'band.desc')}
        </p>
        <a className="btn btn-play" href="/play">
          {t(lang, 'band.btn')}
        </a>
      </div>
    </section>
  );
}
