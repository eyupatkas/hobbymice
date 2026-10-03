const FEATURES = [
  {
    ico: '🌐',
    title: 'Tarayıcıda Anında Oyna',
    desc: 'Flash yükleme derdine son! Modern tarayıcında Ruffle WebAssembly motoru ile Chrome, Edge, Firefox ve Safari üzerinden tek tıkla doğrudan oyuna gir.',
  },
  {
    ico: '⚔️',
    title: 'PVP & Özel Oyun Modları',
    desc: 'Survivor, Racing, Bootcamp, Defilante ve Lua mini oyunları. Şaman becerilerini geliştir, rakiplerini alt et ve sıralamada zirveye tırman.',
  },
  {
    ico: '🗺️',
    title: 'Sonsuz Harita & Editör',
    desc: 'Topluluk tarafından tasarlanan binlerce harita ve gelişmiş harita editörü. Kendi özgün parkurlarını oluştur, yayınla ve diğer farelerle paylaş.',
  },
  {
    ico: '🧀',
    title: 'Canlı Türkçe Topluluk',
    desc: 'Türkiye’nin en samimi fareleri burada! Kabile kur, sohbet et, klan savaşlarına katıl veya forumda taktiklerini ve rehberlerini paylaş.',
  },
];

export default function GameFeatures() {
  return (
    <section id="ozellikler" className="home-section" aria-labelledby="feat-heading">
      <div className="section-head">
        <h2 id="feat-heading">
          Neden <b>HobbyMice?</b>
        </h2>
        <p>
          Hızlı, güvenli ve nostaljik bir Transformice deneyimi için her detayı özenle hazırladık.
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
