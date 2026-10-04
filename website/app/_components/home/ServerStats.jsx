// Ana sayfa istatistikleri — TAMAMI GERÇEK veriler (app/page.js'ten gelir):
// online = oyun sunucusunun güncel server_stats örneği; players = kayıtlı hesap;
// cheese = hesaplardaki toplam peynir; maps = vanilla + topluluk haritası.
import { t } from '../../../lib/i18n';

export default function ServerStats({ stats, lang = 'tr' }) {
  const items = [
    {
      ico: '⚡',
      val: stats?.online != null ? String(stats.online) : '—',
      lbl: t(lang, 'stats.online'),
    },
    {
      ico: '🐭',
      val: stats?.players || '—',
      lbl: t(lang, 'stats.players'),
    },
    {
      ico: '🧀',
      val: stats?.cheese || '—',
      lbl: t(lang, 'stats.cheese'),
    },
    {
      ico: '🗺️',
      val: stats?.maps || '—',
      lbl: t(lang, 'stats.maps'),
    },
  ];

  return (
    <section className="home-stats-section" aria-label="Sunucu İstatistikleri">
      <div className="home-stats-grid">
        {items.map((st, i) => (
          <div key={i} className="stat-box">
            <div className="stat-box-ico">{st.ico}</div>
            <div className="stat-box-info">
              <span className="stat-box-val">{st.val}</span>
              <span className="stat-box-lbl">{st.lbl}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
