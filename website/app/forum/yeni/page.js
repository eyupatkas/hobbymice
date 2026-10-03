import { getUser } from '../../../lib/session';
import { FORUM_CATS } from '../../../lib/site-data';
import { createTopic } from '../../../lib/forum-actions';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Yeni Konu — HobbyMice Forum', robots: { index: false, follow: false } };

export default async function YeniKonuPage() {
  const user = await getUser();
  if (!user) {
    return (
      <div className="panel muted" style={{ maxWidth: 480, margin: '40px auto', textAlign: 'center' }}>
        <p>Konu açmak için <a href="/giris?geri=%2Fforum%2Fyeni">giriş yap</a>.</p>
      </div>
    );
  }
  return (
    <>
      <div className="pagehead"><h1>Yeni Konu Aç</h1></div>
      <div className="panel" style={{ maxWidth: 720 }}>
        <form action={createTopic}>
          <div className="field">
            <label>Başlık</label>
            <input type="text" name="title" required maxLength={120} placeholder="Konu başlığın" />
          </div>
          <div className="field">
            <label>Kategori</label>
            <select name="category">
              {FORUM_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Mesajın</label>
            <textarea name="body" required maxLength={8000}
              placeholder="Ne anlatmak istiyorsun? Biçimlendirme: [b]kalın[/b], [i]yalın[/i], [quote]alıntı[/quote]" />
            <div className="hint">[b]kalın[/b] · [i]yalın[/i] · [u]altı çizili[/u] · [quote]alıntı[/quote] — HTML kullanılamaz.</div>
          </div>
          <button className="btn btn-play">Konuyu Aç</button>
          <a className="btn btn-ghost" href="/forum">Vazgeç</a>
        </form>
      </div>
    </>
  );
}
