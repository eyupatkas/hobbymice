'use client';
// 站点头/尾 + 语言下拉（客户端组件，标签字典与 hm_lang 持久化）。
import { useEffect, useState } from 'react';

const LANGS = [
  ['tr', '🇹🇷 Türkçe'],
  ['en', '🇬🇧 English'],
  ['fr', '🇫🇷 Français'],
  ['es', '🇪🇸 Español'],
];

const T = {
  tr: { home:'Ana Sayfa', forum:'Forum', blog:'Blog', rank:'Sıralama', play:'Oyna', play2:'Oyna',
        login:'Giriş Yap', logout:'Çıkış', account:'Hesabım', admin:'Yönetim', howto:'Nasıl Oynanır',
        download:'İndir', community:'Topluluk', game:'Oyun', accountH:'Hesap', sitemap:'Site Haritası', launcher:'Launcher' },
  en: { home:'Home', forum:'Forum', blog:'Blog', rank:'Ranking', play:'Play', play2:'Play',
        login:'Log in', logout:'Log out', account:'My account', admin:'Admin', howto:'How to Play',
        download:'Download', community:'Community', game:'Game', accountH:'Account', sitemap:'Sitemap', launcher:'Launcher' },
  fr: { home:'Accueil', forum:'Forum', blog:'Blog', rank:'Classement', play:'Jouer', play2:'Jouer',
        login:'Connexion', logout:'Déconnexion', account:'Mon compte', admin:'Admin', howto:'Comment jouer',
        download:'Télécharger', community:'Communauté', game:'Jeu', accountH:'Compte', sitemap:'Plan du site', launcher:'Launcher' },
  es: { home:'Inicio', forum:'Foro', blog:'Blog', rank:'Clasificación', play:'Jugar', play2:'Jugar',
        login:'Entrar', logout:'Salir', account:'Mi cuenta', admin:'Admin', howto:'Cómo jugar',
        download:'Descargar', community:'Comunidad', game:'Juego', accountH:'Cuenta', sitemap:'Mapa del sitio', launcher:'Launcher' },
};

function currentLang() {
  let l = null;
  try {
    l = localStorage.getItem('hm_lang');
    if (!l) {
      const nav = (navigator.language || 'tr').slice(0, 2).toLowerCase();
      l = ['tr', 'en', 'fr', 'es'].includes(nav) ? nav : 'tr';
    }
  } catch { l = 'tr'; }
  return ['tr', 'en', 'fr', 'es'].includes(l) ? l : 'tr';
}

export function useChromeLang() {
  const [lang, setLangState] = useState('tr');
  useEffect(() => { setLangState(currentLang()); }, []);
  const setLang = l => {
    try { localStorage.setItem('hm_lang', l); } catch { /* 私有模式 */ }
    setLangState(l);
  };
  const t = T[lang] || T.tr;
  return { lang, setLang, t };
}

export default function Header({ user }) {
  const { lang, setLang, t } = useChromeLang();
  const [menuOpen, setMenuOpen] = useState(false);

  function hmLogout() {
    fetch('/api/logout', { method: 'POST' }).then(() => { window.location.href = '/'; });
  }

  return (
    <header className="site-head">
      <div className="wrap head-in">
        <a className="brand" href="/"><img src="/assets/logo.png" alt="HobbyMice" /></a>
        <nav className="mainnav" aria-label="Ana menü">
          <a href="/">{t.home}</a>
          <a href="/forum">{t.forum}</a>
          <a href="/blog">{t.blog}</a>
          <a href="/siralama">{t.rank}</a>
          <a href="/launcher">{t.launcher}</a>
        </nav>
        <div className="head-tools">
          <details className="dd lang-dd">
            <summary aria-label="Dil seç"><span className="dd-ico">🌐</span><span>{lang.toUpperCase()}</span><span className="caret">▾</span></summary>
            <div className="dd-menu">
              {LANGS.map(([code, name]) => (
                <button key={code} type="button" className={code === lang ? 'cur' : ''} onClick={() => setLang(code)}>{name}</button>
              ))}
            </div>
          </details>
          <a className="btn-mini play" href="/play">🧀 {t.play}</a>
          {user ? (
            <details className="dd user-dd">
              <summary className="user-chip"><span className="avatar">🐭</span><b>{user.playerName}</b><span className="caret">▾</span></summary>
              <div className="dd-menu">
                <a href="/profil">🐭 {t.account}</a>
                {user.staff ? <a href="/admin">🛠️ {t.admin}</a> : null}
                <button type="button" onClick={hmLogout}>🚪 {t.logout}</button>
              </div>
            </details>
          ) : (
            <a className="btn-mini login" href="/giris">{t.login}</a>
          )}
          <details className="mnav" open={menuOpen}>
            <summary className="btn-mini" aria-label="Menü" onClick={e => { e.preventDefault(); setMenuOpen(v => !v); }}>☰</summary>
            <div className="dd-menu mnav-menu">
              <a href="/" onClick={() => setMenuOpen(false)}>{t.home}</a>
              <a href="/forum" onClick={() => setMenuOpen(false)}>{t.forum}</a>
              <a href="/blog" onClick={() => setMenuOpen(false)}>{t.blog}</a>
              <a href="/siralama" onClick={() => setMenuOpen(false)}>{t.rank}</a>
              <a href="/launcher" onClick={() => setMenuOpen(false)}>{t.launcher}</a>
              {!user && <a href="/giris" onClick={() => setMenuOpen(false)}>{t.login}</a>}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

export function Footer({ user }) {
  const { t } = useChromeLang();
  function hmLogout() {
    fetch('/api/logout', { method: 'POST' }).then(() => { window.location.href = '/'; });
  }
  return (
    <footer className="site-foot">
      <div className="wrap foot-grid">
        <div className="fcol fabout">
          <img src="/assets/logo.png" alt="HobbyMice" className="foot-logo" />
          <p>HobbyMice; Transformice tabanlı, Türkçe konuşan topluluğa hitap eden bağımsız bir hayran sunucusudur.
          Tarayıcıdan ya da bilgisayarından — indirmeden veya indirerek — tamamen ücretsiz oynanır.</p>
        </div>
        <div className="fcol">
          <h4>{t.game}</h4>
          <a href="/play">🧀 {t.play2}</a>
          <a href="/launcher">⬇ {t.launcher}</a>
          <a href="/dl/Hobby-Mice.zip">⬇ {t.download} (ZIP)</a>
          <a href="/siralama">🏆 {t.rank}</a>
          <a href="/#nasil">❓ {t.howto}</a>
        </div>
        <div className="fcol">
          <h4>{t.community}</h4>
          <a href="/forum">💬 {t.forum}</a>
          <a href="/blog">📝 {t.blog}</a>
          <a href="/rss.xml">📰 RSS</a>
          <a href="/sitemap.xml">🗺️ {t.sitemap}</a>
        </div>
        <div className="fcol">
          <h4>{t.accountH}</h4>
          {user ? (
            <>
              <a href="/profil">{t.account}</a>
              {user.staff ? <a href="/admin">{t.admin}</a> : null}
              <button type="button" className="linkbtn" onClick={hmLogout}>{t.logout}</button>
            </>
          ) : (
            <>
              <a href="/giris">{t.login}</a>
              <a href="/play">Hesap Oluştur</a>
            </>
          )}
        </div>
      </div>
      <div className="foot-bottom">
        <div className="wrap">
          © {new Date().getFullYear()} <b>HobbyMice</b> · hobbymice.com.tr — bağımsız bir hayran sunucusudur.<br />
          Transformice™ ve ilgili markaların sahibi Atelier 801&apos;dir. Bu site Atelier 801 ile bağlantılı değildir.
        </div>
      </div>
    </footer>
  );
}
