import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '../../lib/session';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Yönetim — HobbyMice', robots: { index: false, follow: false } };

const TABS = [
  ['/admin', '📊 Özet'],
  ['/admin/oyuncular', '👥 Oyuncular'],
  ['/admin/forum', '💬 Forum'],
  ['/admin/blog', '📝 Blog'],
  ['/admin/blog/bot', '🤖 Blog Botu'],
];

export default async function AdminLayout({ children }) {
  const user = await getUser();
  if (!user) redirect('/giris?geri=%2Fadmin');
  if (!user.staff) {
    return (
      <div className="panel" style={{ maxWidth: 460, margin: '80px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 44 }}>🚫</div>
        <h1>Yetkin yok</h1>
        <p className="muted">Bu sayfa yalnızca yöneticilere açıktır.</p>
        <p><Link className="btn btn-ghost" href="/">Ana sayfaya dön</Link></p>
      </div>
    );
  }
  return (
    <>
      <div className="admin-tabs">
        {TABS.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
      </div>
      {children}
    </>
  );
}
