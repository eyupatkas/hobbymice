export default function ServerStats({ stats }) {
  const defaultStats = [
    {
      ico: '🧀',
      val: stats?.cheese || '1.250.000+',
      lbl: 'Toplanan Peynir',
    },
    {
      ico: '🐭',
      val: stats?.players || '5.000+',
      lbl: 'Kayıtlı Fare',
    },
    {
      ico: '🗺️',
      val: '10.000+',
      lbl: 'Özgün Harita',
    },
    {
      ico: '⚡',
      val: '%99.9',
      lbl: 'Kesintisiz Uptime',
    },
  ];

  return (
    <section className="home-stats-section" aria-label="Sunucu İstatistikleri">
      <div className="home-stats-grid">
        {defaultStats.map((st, i) => (
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
