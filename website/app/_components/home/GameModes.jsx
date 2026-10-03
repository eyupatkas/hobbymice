const MODES = [
  {
    ico: '🧀',
    tag: 'Klasik Mod',
    title: 'Vanilla Odaları',
    desc: 'Orijinal Transformice haritaları. Şamanın kurduğu tahta ve köprülerle peynire ulaş, deliğe dön ve kabilene puan kazandır.',
  },
  {
    ico: '⚡',
    tag: 'PVP & Refleks',
    title: 'Survivor',
    desc: 'Kızgın şaman gülleler fırlatıyor! Zeminlerden ustaca kaç, şamanın saldırılarını savuştur ve ayakta kalan son fare sen ol.',
  },
  {
    ico: '🏁',
    tag: 'Hız Parkuru',
    title: 'Racing',
    desc: 'Şaman yok, yardım yok, yalnızca saf hız! Engelleri rekor sürede aşarak fare deliğine ilk giren ol ve First unvanını kap.',
  },
  {
    ico: '🧗',
    tag: 'Ustalık Testi',
    title: 'Bootcamp',
    desc: 'Wall-jump, corner-jump ve zorlu tırmanma teknikleri gerektiren ekstrem parkurlar. Sabır ve mutlak ustalık gerektirir.',
  },
];

export default function GameModes() {
  return (
    <section id="modlar" className="home-section" aria-labelledby="modes-heading">
      <div className="section-head">
        <h2 id="modes-heading">
          Her Tarza Uygun <b>Oyun Modları</b>
        </h2>
        <p>
          Tek bir modla sınırlı kalma! İster arkadaşlarınla yarış, ister hayatta kal, ister şaman yeteneklerini konuştur.
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
