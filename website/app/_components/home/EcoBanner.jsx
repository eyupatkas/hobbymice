// Ekonomi şeridi: çarkıfelek + günlük görevler + haftalık yarışma tanıtımı.
// Oyun içi /cark /gorev /haftalik komutlarını tanıtır (i18n'li, 4 dil).
import { t } from '../../../lib/i18n';

export default function EcoBanner({ lang = 'tr' }) {
  const rows = [
    { cls: 'eco-row-wheel', txt: t(lang, 'eco.wheel') },
    { cls: 'eco-row-quests', txt: t(lang, 'eco.quests') },
    { cls: 'eco-row-weekly', txt: t(lang, 'eco.weekly') },
  ];

  return (
    <section className="eco-banner" aria-label="HobbyMice Ekonomisi">
      <div className="eco-banner-head">
        <h2>{t(lang, 'eco.title')}</h2>
        <p>{t(lang, 'eco.desc')}</p>
      </div>
      <div className="eco-banner-rows">
        {rows.map((r, i) => (
          <div key={i} className={`eco-row ${r.cls}`}>
            {r.txt}
          </div>
        ))}
      </div>
    </section>
  );
}
