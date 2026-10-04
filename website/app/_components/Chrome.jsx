'use client';
// 站点头/尾 + 语言下拉（客户端组件，标签字典 lib/i18n.js — 缺译会在构建时报错）。
import { useEffect, useState } from 'react';
import { t as strictT, validateTranslations } from '../../lib/i18n';

const LANGS = [
  ['tr', '🇹🇷 Türkçe'],
  ['en', '🇬🇧 English'],
  ['fr', '🇫🇷 Français'],
  ['es', '🇪🇸 Español'],
];

if (process.env.NODE_ENV !== 'production') {
  validateTranslations(); // gelistirme aninda da eksik ceviri yakalansin
}

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
  // Katı çeviri: eksik anahtar render'da da hata firlatir (sessiz fallback yok).
  const t = (key) => strictT(lang, key);
  useEffect(() => {
    const l = currentLang();
    setLangState(l);
    // Sunucu bilesenleri (ana sayfa bölümleri) cookie'den okur — localStorage ile esitle.
    document.cookie = `hm_lang=${l};path=/;max-age=31536000;samesite=lax`;
  }, []);
  const setLang = l => {
    try { localStorage.setItem('hm_lang', l); } catch { /* 私有模式 */ }
    document.cookie = `hm_lang=${l};path=/;max-age=31536000;samesite=lax`;
    setLangState(l);
    // Sunucu tarafindan render edilen ana sayfa bölümleri yeni dilde gelsin.
    window.location.reload();
  };
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
          <a href="/">{t('nav.home')}</a>
          <a href="/forum">{t('nav.forum')}</a>
          <a href="/blog">{t('nav.blog')}</a>
          <a href="/siralama">{t('nav.rank')}</a>
          <a href="/guncellemeler">{t('nav.updates')}</a>
          <a href="/launcher">{t('nav.launcher')}</a>
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
          <a className="btn-mini play" href="/play">🧀 {t('nav.play')}</a>
          {user ? (
            <details className="dd user-dd">
              <summary className="user-chip"><span className="avatar">🐭</span><b>{user.playerName}</b><span className="caret">▾</span></summary>
              <div className="dd-menu">
                <a href="/profil">🐭 {t('nav.account')}</a>
                {user.staff ? <a href="/admin">🛠️ {t('nav.admin')}</a> : null}
                <button type="button" onClick={hmLogout}>🚪 {t('nav.logout')}</button>
              </div>
            </details>
          ) : (
            <a className="btn-mini login" href="/giris">{t('nav.login')}</a>
          )}
          <details className="mnav" open={menuOpen}>
            <summary className="btn-mini" aria-label="Menü" onClick={e => { e.preventDefault(); setMenuOpen(v => !v); }}>☰</summary>
            <div className="dd-menu mnav-menu">
              <a href="/" onClick={() => setMenuOpen(false)}>{t('nav.home')}</a>
              <a href="/forum" onClick={() => setMenuOpen(false)}>{t('nav.forum')}</a>
              <a href="/blog" onClick={() => setMenuOpen(false)}>{t('nav.blog')}</a>
              <a href="/siralama" onClick={() => setMenuOpen(false)}>{t('nav.rank')}</a>
              <a href="/launcher" onClick={() => setMenuOpen(false)}>{t('nav.launcher')}</a>
              {!user && <a href="/giris" onClick={() => setMenuOpen(false)}>{t('nav.login')}</a>}
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
          <p>{t('foot.about')}</p>
        </div>
        <div className="fcol">
          <h4>{t('nav.game')}</h4>
          <a href="/play">🧀 {t('nav.play')}</a>
          <a href="/launcher">⬇ {t('nav.launcher')}</a>
          <a href="/dl/Hobby-Mice.zip">⬇ {t('nav.download')} (ZIP)</a>
          <a href="/siralama">🏆 {t('nav.rank')}</a>
          <a href="/guncellemeler">📰 {t('nav.updates')}</a>
          <a href="/#nasil">❓ {t('nav.howto')}</a>
        </div>
        <div className="fcol">
          <h4>{t('nav.community')}</h4>
          <a href="/forum">💬 {t('nav.forum')}</a>
          <a href="/blog">📝 {t('nav.blog')}</a>
          <a href="/rss.xml">📰 RSS</a>
          <a href="/sitemap.xml">🗺️ {t('nav.sitemap')}</a>
        </div>
        <div className="fcol">
          <h4>{t('nav.accountH')}</h4>
          {user ? (
            <>
              <a href="/profil">{t('nav.account')}</a>
              {user.staff ? <a href="/admin">{t('nav.admin')}</a> : null}
              <button type="button" className="linkbtn" onClick={hmLogout}>{t('nav.logout')}</button>
            </>
          ) : (
            <>
              <a href="/giris">{t('nav.login')}</a>
              <a href="/play">{t('nav.createAccount')}</a>
            </>
          )}
        </div>
      </div>
      <div className="foot-bottom">
        <div className="wrap">
          © {new Date().getFullYear()} <b>HobbyMice</b> · hobbymice.com.tr — {t('foot.fan')}.<br />
          {t('foot.rights')}
        </div>
      </div>
    </footer>
  );
}
