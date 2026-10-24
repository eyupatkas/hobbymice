'use client';
// Hesap olusturma rehberi (/giris alt bolumu): rumuz bicim kontrolu + sifre gucu olcer.
// Tamamen yerel (client-side) — yazilan hicbir deger sunucuya GONDERILMEZ, hesap ACILMAZ.
// Kaba-soz listesi bilerek istemcide YOK: sunucu reddi icin yalnizca genel not gosterilir
// (gerçek reddetme oyun sunucusundaki S_RegisterAccount'ta yapilir).
import { useState } from 'react';
import { useChromeLang } from './Chrome';

// Sunucudaki rumuz kurallarinin aynisi (yalnizca bicim yardimi):
// ^[A-Za-z][A-Za-z0-9_]{2,11}$ + sonda _ yok + ardışık __ yok + toplam uzunluk <= 11.
// Geri donen deger: sorun yoksa null, sorun varsa cevrilmis hata metni.
function nickProblem(nick, t) {
  if (!/^[A-Za-z]/.test(nick)) return t('guide.nickErrFirst');
  if (/[^A-Za-z0-9_]/.test(nick)) return t('guide.nickErrChars');
  if (nick.length < 3 || nick.length > 11) return t('guide.nickErrLen').replace('{n}', String(nick.length));
  if (/_$/.test(nick)) return t('guide.nickErrTrailing');
  if (nick.indexOf('__') !== -1) return t('guide.nickErrDouble');
  return null;
}

// Sifre gucü puanı (0-5): uzunluk >= 6, buyuk/kucuk harf karisimi, rakam, sembol, uzunluk >= 10.
// Minimum kural: 6 karakterin altindaki HER sifre "zayif" sayilir (score'dan bagimsiz).
function passScore(p) {
  let s = 0;
  if (p.length >= 6) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  if (p.length >= 10) s++;
  return s;
}

const LEVELS = {
  weak: { pct: 33, color: '#e5484d', key: 'guide.strengthWeak' },
  medium: { pct: 66, color: '#f5a623', key: 'guide.strengthMedium' },
  strong: { pct: 100, color: '#46a758', key: 'guide.strengthStrong' },
};

export default function AccountGuide() {
  const { t } = useChromeLang();
  const [nick, setNick] = useState('');
  const [pass, setPass] = useState('');

  const nickErr = nick ? nickProblem(nick, t) : null;
  const score = pass ? passScore(pass) : 0;
  const tooShort = pass.length > 0 && pass.length < 6;
  const level = !pass ? null : (tooShort || score <= 1) ? 'weak' : score <= 3 ? 'medium' : 'strong';
  const lv = level ? LEVELS[level] : null;

  return (
    <div className="panel" style={{ marginTop: 16 }}>
      <h2 style={{ marginBottom: 8 }}>{t('guide.title')}</h2>
      <p className="muted small" style={{ marginBottom: 16 }}>{t('guide.intro')}</p>

      <div className="field">
        <label>{t('guide.nickLabel')}</label>
        <input
          type="text"
          value={nick}
          onChange={e => setNick(e.target.value)}
          placeholder={t('guide.nickPlaceholder')}
          autoComplete="off"
          maxLength={20}
          style={{ width: '100%' }}
        />
        <div className="small" style={{ marginTop: 6, color: nick ? (nickErr ? 'var(--danger, #ff9c9c)' : 'var(--ok, #7bd88f)') : undefined }}>
          {nick ? (nickErr || t('guide.nickOk')) : t('guide.nickEmpty')}
        </div>
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label>{t('guide.passLabel')}</label>
        <input
          type="password"
          value={pass}
          onChange={e => setPass(e.target.value)}
          autoComplete="new-password"
          style={{ width: '100%' }}
        />
        <div style={{
          height: 6, borderRadius: 4, marginTop: 8, overflow: 'hidden',
          background: 'rgba(255,255,255,.08)',
        }}>
          <div style={{
            height: '100%', width: lv ? lv.pct + '%' : 0,
            background: lv ? lv.color : 'transparent',
            transition: 'width .2s ease, background .2s ease',
          }} />
        </div>
        <div className="small" style={{ marginTop: 6 }}>
          {pass ? (
            <>
              <b style={{ color: lv.color }}>{t(lv.key)}</b>
              <span className="muted"> · {tooShort ? t('guide.passMin') : level === 'medium' ? t('guide.passOk') : level === 'weak' ? t('guide.passTips') : t('guide.passOk')}</span>
            </>
          ) : (
            <span className="muted">{t('guide.passEmpty')}</span>
          )}
        </div>
        <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>🔒 {t('guide.passHint')}</div>
      </div>

      <p className="muted" style={{ fontSize: 11.5, margin: '12px 0 0', borderTop: '1px solid var(--line)', paddingTop: 10 }}>
        ⚠️ {t('guide.nickBadword')}
      </p>
    </div>
  );
}
