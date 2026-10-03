const STEPS = [
  {
    num: 1,
    title: 'Tarayıcıda Başla veya İndir',
    desc: 'Hemen OYNA butonuna basarak doğrudan tarayıcında açabilir ya da daha yüksek FPS için Windows Launcher sürümünü indirebilirsin.',
  },
  {
    num: 2,
    title: 'Ücretsiz Profilini Oluştur',
    desc: 'Oyun açıldığında kullanıcı adını belirle ve Create Account ile hesabını anında kaydet. E-posta zorunluluğu yok, 30 saniyede hazırsın!',
  },
  {
    num: 3,
    title: 'Peyniri Kap & Şaman Ol!',
    desc: 'Ok tuşlarıyla engelleri aş, dev peyniri sırtla ve deliğe dön. Sıran geldiğinde şaman olup arkadaşlarına köprü kur, onları kurtar!',
  },
];

const CONTROLS = [
  { keys: ['W', 'A', 'S', 'D'], label: 'veya Yön Tuşları ile Hareket & Zıplama' },
  { keys: ['↓', 'S'], label: 'Eğilme & Fare Deliğine Giriş' },
  { keys: ['Boşluk'], label: 'Görünmez Nesne / Şaman Seçimi' },
  { keys: ['1-9'], label: 'Şaman Eşya Kısayolları' },
];

export default function HowToPlay() {
  return (
    <section id="nasil" className="home-section" aria-labelledby="nasil-heading">
      <div className="section-head">
        <h2 id="nasil-heading">
          Nasıl <b>Oynanır?</b>
        </h2>
        <p>
          Transformice oynamak hiç bu kadar kolay olmamıştı. Sadece üç basit adımda peynirin peşine düşebilirsin.
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
