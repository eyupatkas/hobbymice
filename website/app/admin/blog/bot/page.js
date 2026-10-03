import { getDb } from '../../../../lib/db';
import { fmtDateTime } from '../../../../lib/util';
import { triggerBot } from '../../../../lib/admin-actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Blog Botu — HobbyMice Admin', robots: { index: false, follow: false } };

export default async function BlogBotPage() {
  const d = getDb();
  const [state, logs] = await Promise.all([
    d.collection('blog_state').find({}).sort({ okCount: -1 }).toArray(),
    d.collection('blog_log').find({}).sort({ ts: -1 }).limit(40).toArray(),
  ]);
  return (
    <>
      <div className="pagehead">
        <h1>🤖 Blog Botu</h1>
        <p>Bot OpenRouter üzerinden <b>ücretsiz modellerle</b> çalışır: kendi başına konu bulur, mevcut yazılarla
        benzeyen konuları eler, makaleyi üretip yayınlar. Sistem zamanlayıcısı her 6 saatte bir çalıştırır;
        aşağıdan istediğin an tetikleyebilirsin.</p>
      </div>
      <div className="panel">
        <form action={triggerBot}>
          <button className="btn btn-play">🚀 Şimdi üret</button>
          <span className="muted small" style={{ marginLeft: 10 }}>Arka planda çalışır; sonucu aşağıdaki kayıtlardan izle (30-120 sn).</span>
        </form>
      </div>
      <h2>Model durumu</h2>
      <div className="panel tight" style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr><th>Model</th><th className="num">Başarılı</th><th className="num">Hata</th><th>Soğuma</th><th>Son hata</th></tr>
          </thead>
          <tbody>
            {state.length ? state.map(s => (
              <tr key={s.model}>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.model}</td>
                <td className="num">{s.okCount || 0}</td>
                <td className="num">{s.failures || 0}</td>
                <td>{s.cooldownUntil && s.cooldownUntil > new Date() ? fmtDateTime(s.cooldownUntil) : '—'}</td>
                <td className="muted small">{s.lastError || '—'}</td>
              </tr>
            )) : <tr><td colSpan={5} className="muted">Henüz model kullanılmadı</td></tr>}
          </tbody>
        </table>
      </div>
      <h2>Son işlemler</h2>
      <div className="botlog">
        {logs.length ? logs.map((l, i) => (
          <div key={i} className={l.status === 'ok' ? 'ok' : l.status === 'fail' ? 'fail' : 'info'}>
            {fmtDateTime(l.ts)} [{l.status}] {l.msg}
          </div>
        )) : <div className="info">kayıt yok</div>}
      </div>
    </>
  );
}
