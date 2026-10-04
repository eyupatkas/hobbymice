import './globals.css';
import { getUser } from '../lib/session';
import Header, { Footer } from './_components/Chrome';
import ChatWidget from './_components/ChatWidget';
import VisitTracker from './_components/VisitTracker';

export const metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://hobbymice.com.tr'),
  title: 'HobbyMice — Peynirin Peşinde! | Tarayıcıda Oyna',
  description: 'HobbyMice: Transformice tabanlı ücretsiz çevrimiçi fare oyunu. İndirmeden tarayıcıda oyna, arkadaşlarınla peynir kap.',
  icons: { icon: '/assets/favicon.png' },
  alternates: { types: { 'application/rss+xml': '/rss.xml' } },
  openGraph: {
    site_name: 'HobbyMice',
    images: ['/assets/logo.png'],
  },
};

export default async function RootLayout({ children }) {
  const user = await getUser();
  const publicUser = user ? { playerName: user.playerName, staff: user.staff } : null;
  return (
    <html lang="tr">
      <body>
        <Header user={publicUser} />
        <main className="wrap">{children}</main>
        <Footer user={publicUser} />
        <ChatWidget user={publicUser} />
        <VisitTracker />
      </body>
    </html>
  );
}
