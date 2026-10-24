import { cookies } from 'next/headers';
import { getUser } from '../../lib/session';
import { t } from '../../lib/i18n';
import AccountGuide from '../_components/AccountGuide';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const lang = ((await cookies()).get('hm_lang')?.value || 'tr').toLowerCase();
  return {
    title: t(lang, 'login.metaTitle'),
    description: t(lang, 'login.metaDesc'),
    robots: { index: false, follow: false },
  };
}

export default async function GirisPage({ searchParams }) {
  const sp = await searchParams;
  const hata = sp.hata === '1';
  const lang = ((await cookies()).get('hm_lang')?.value || 'tr').toLowerCase();
  const user = await getUser();
  if (user) {
    // 已登录则直接回首页（或 geri 目标由前端链接处理）
    return (
      <div className="login-box">
        <div className="panel">
          <h1>{t(lang, 'login.alreadyHeading')}</h1>
          <p className="muted small">{t(lang, 'login.loggedInAs').replace('{n}', user.playerName)}</p>
          <a className="btn btn-play" href="/">{t(lang, 'login.backHome')}</a>
        </div>
      </div>
    );
  }
  return (
    <div className="login-box">
      <div className="panel">
        <h1>{t(lang, 'login.heading')}</h1>
        <p className="muted small" style={{ marginBottom: 16 }}>
          {t(lang, 'login.intro')} <a href="/play">{t(lang, 'login.createInGame')}</a>
        </p>
        {hata && <div className="err">{t(lang, 'login.error')}</div>}
        <form method="post" action="/api/login">
          <input type="hidden" name="geri" value={typeof sp.geri === 'string' ? sp.geri : '/'} />
          <div className="field">
            <label>{t(lang, 'login.userLabel')}</label>
            <input type="text" name="user" required autoFocus autoComplete="username" placeholder={t(lang, 'login.userPlaceholder')} />
          </div>
          <div className="field">
            <label>{t(lang, 'login.passLabel')}</label>
            <input type="password" name="password" required autoComplete="current-password" />
          </div>
          <button className="btn btn-play" style={{ width: '100%', justifyContent: 'center' }}>{t(lang, 'login.submit')}</button>
        </form>
      </div>
      {/* Hesap olusturma rehberi: rumuz bicim kontrolu + sifre gucu olcer (tamami client-side, i18n'li). */}
      <AccountGuide />
    </div>
  );
}
