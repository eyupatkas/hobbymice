import { getUser } from '../../lib/session';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Giriş Yap — HobbyMice',
  description: 'HobbyMice forum ve bloguna oyun hesabınla giriş yap.',
  robots: { index: false, follow: false },
};

export default async function GirisPage({ searchParams }) {
  const sp = await searchParams;
  const hata = sp.hata === '1';
  const user = await getUser();
  if (user) {
    // 已登录则直接回首页（或 geri 目标由前端链接处理）
    return (
      <div className="login-box">
        <div className="panel">
          <h1>Zaten girişlisin 🧀</h1>
          <p className="muted small">{user.playerName} olarak giriş yapılmış.</p>
          <a className="btn btn-play" href="/">Ana Sayfaya Dön</a>
        </div>
      </div>
    );
  }
  return (
    <div className="login-box">
      <div className="panel">
        <h1>Giriş Yap 🧀</h1>
        <p className="muted small" style={{ marginBottom: 16 }}>
          Forum ve blog için <b>oyun hesabınla</b> giriş yap.
          Hesabın yok mu? <a href="/play">Oyunda Create Account</a> ile 30 saniyede oluştur.
        </p>
        {hata && <div className="err">Kullanıcı adı/e-posta veya şifre hatalı. Oyunda girdiğin bilgilerle gir.</div>}
        <form method="post" action="/api/login">
          <input type="hidden" name="geri" value={typeof sp.geri === 'string' ? sp.geri : '/'} />
          <div className="field">
            <label>Kullanıcı adı veya e-posta</label>
            <input type="text" name="user" required autoFocus autoComplete="username" placeholder="Nick#1234 veya e-posta" />
          </div>
          <div className="field">
            <label>Şifre</label>
            <input type="password" name="password" required autoComplete="current-password" />
          </div>
          <button className="btn btn-play" style={{ width: '100%', justifyContent: 'center' }}>Giriş Yap</button>
        </form>
      </div>
    </div>
  );
}
