import { savePost } from '../../../../lib/admin-actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Yeni Yazı — HobbyMice Admin', robots: { index: false, follow: false } };

export default function BlogYeniPage() {
  return (
    <>
      <div className="pagehead"><h1>Yeni Yazı</h1></div>
      <div className="panel">
        <form action={savePost}>
          <div className="frow">
            <div className="field"><label>Başlık</label><input type="text" name="title" required maxLength={120} /></div>
            <div className="field"><label>Slug (boş = başlıktan)</label><input type="text" name="slug" placeholder="otomatik" /></div>
          </div>
          <div className="frow">
            <div className="field"><label>Emoji</label><input type="text" name="emoji" defaultValue="🧀" maxLength={8} /></div>
            <div className="field"><label>Etiketler (virgülle)</label><input type="text" name="tags" /></div>
          </div>
          <div className="field"><label>Özet</label><textarea name="excerpt" style={{ minHeight: 70 }} maxLength={300} /></div>
          <div className="field">
            <label>İçerik (HTML)</label>
            <textarea name="content" style={{ minHeight: 340 }} />
            <div className="hint">İzinli etiketler: h2 h3 p ul ol li strong em a blockquote table — script/iframe otomatik temizlenir.</div>
          </div>
          <div className="field">
            <label>Durum</label>
            <select name="status">
              <option value="published">Yayında</option>
              <option value="draft">Taslak</option>
            </select>
          </div>
          <button className="btn btn-play">💾 Kaydet</button>
          <a className="btn btn-ghost" href="/admin/blog">Geri</a>
        </form>
      </div>
    </>
  );
}
