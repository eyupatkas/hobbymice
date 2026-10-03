import Link from 'next/link';

export default function LauncherSpotlight() {
  const launcherPerks = [
    '⚡ Yüksek FPS & Akıcı Performans',
    '🔄 Otomatik Sürüm Güncellemesi',
    '🎶 Özel Giriş Müzikleri & Sesler',
    '🛡️ Kurulum Gerektirmez (Taşınabilir ZIP)',
  ];

  return (
    <section className="home-section" aria-label="Masaüstü Launcher">
      <div className="launcher-spotlight">
        <div className="launcher-info">
          <h3>
            Masaüstü Deneyimi: <b>HobbyMice Launcher</b>
          </h3>
          <p>
            Daha akıcı bir oyun, kusursuz klavye tepki süresi ve özel ses efektleri için
            özel olarak geliştirilen resmi Windows Launcher ile oyna. İndir, ZIP&apos;ten çıkar ve doğrudan çalıştır!
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
              ⬇ Launcher İndir (Windows)
            </a>
            <span className="launcher-subtext">
              Sürüm 1.889 &middot; Windows 7 / 8 / 10 / 11 &middot;{' '}
              <Link href="/launcher">Ayrıntılar ve kurulum →</Link>
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
          <figcaption>Resmi HobbyMice Launcher — ana ekran</figcaption>
        </figure>
      </div>
    </section>
  );
}
