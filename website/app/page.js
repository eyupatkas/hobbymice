import { cookies } from 'next/headers';
import { getDb } from '../lib/db';
import { LANGS, t } from '../lib/i18n';
import HeroSection from './_components/home/HeroSection';
import ServerStats from './_components/home/ServerStats';
import EcoBanner from './_components/home/EcoBanner';
import GameFeatures from './_components/home/GameFeatures';
import GameModes from './_components/home/GameModes';
import HowToPlay from './_components/home/HowToPlay';
import LauncherSpotlight from './_components/home/LauncherSpotlight';
import LatestPosts from './_components/home/LatestPosts';
import PlayBand from './_components/home/PlayBand';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'HobbyMice — Peynirin Peşinde! | Tarayıcıda ve Bilgisayarda Oyna',
  description:
    'HobbyMice: Transformice tabanlı ücretsiz çevrimiçi fare oyunu. Tarayıcıda tek tıkla oyna veya launcher indir. PVP modları, kabileler ve binlerce harita seni bekliyor.',
  alternates: { canonical: '/' },
};

const HOME_JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://hobbymice.com.tr/#org',
      name: 'HobbyMice',
      url: 'https://hobbymice.com.tr/',
      logo: 'https://hobbymice.com.tr/assets/logo.png',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://hobbymice.com.tr/#site',
      url: 'https://hobbymice.com.tr/',
      name: 'HobbyMice',
      publisher: { '@id': 'https://hobbymice.com.tr/#org' },
      inLanguage: 'tr-TR',
    },
    {
      '@type': 'VideoGame',
      name: 'HobbyMice',
      url: 'https://hobbymice.com.tr/',
      image: 'https://hobbymice.com.tr/assets/logo.png',
      description:
        'Transformice tabanlı ücretsiz çevrimiçi multiplayer fare oyunu. Peynir taşı, şaman ol, kabile kur — tarayıcıda veya launcher ile oyna.',
      genre: ['MMO', 'Platform', 'Puzzle'],
      gamePlatform: ['Web Browser', 'Windows'],
      applicationCategory: 'Game',
      playMode: 'MultiPlayer',
      inLanguage: 'tr-TR',
      publisher: { '@id': 'https://hobbymice.com.tr/#org' },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY', availability: 'https://schema.org/InStock' },
    },
  ],
};

async function getHomePageData() {
  let posts = [];
  let stats = null;

  try {
    const db = getDb();
    const nowSec = Math.floor(Date.now() / 1000);
    const [fetchedPosts, accountCount, cheeseAgg, onlineDoc, mapsCount] = await Promise.all([
      db
        .collection('blog_posts')
        .find({ status: 'published' })
        .sort({ publishedAt: -1 })
        .limit(3)
        .toArray(),
      db
        .collection('accounts')
        .countDocuments()
        .catch(() => 0),
      db
        .collection('accounts')
        .aggregate([{ $group: { _id: null, total: { $sum: '$cheeseCount' } } }])
        .toArray()
        .catch(() => []),
      // Canlı online sayisi: oyun sunucusunun dakikalik ornekleri (60 sn tolerans)
      db
        .collection('server_stats')
        .find({ ts: { $gte: nowSec - 120 } })
        .sort({ ts: -1 })
        .limit(1)
        .toArray()
        .catch(() => []),
      db
        .collection('mapeditor')
        .countDocuments()
        .catch(() => 0),
    ]);

    posts = fetchedPosts || [];
    const totalCheese = cheeseAgg[0]?.total || 0;
    if (accountCount > 0 || totalCheese > 0) {
      stats = {
        players: accountCount.toLocaleString('tr-TR'),
        cheese: totalCheese.toLocaleString('tr-TR'),
        maps: (244 + mapsCount).toLocaleString('tr-TR'),
        online: onlineDoc[0]?.players ?? null,
      };
    }
  } catch {
    // DB bağlantısı henüz hazır değilse sessizce varsayılanlarla devam eder
  }

  return { posts, stats };
}

export default async function HomePage() {
  // Dil: Chrome (client) hm_lang'i localStorage + cookie'ye yazar; SSR buradan okur.
  const store = await cookies();
  const cookieLang = (store.get('hm_lang')?.value || 'tr').toLowerCase();
  const lang = LANGS.includes(cookieLang) ? cookieLang : 'tr';
  const { posts, stats } = await getHomePageData();

  return (
    <div className="home-wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_JSONLD).replace(/</g, '\\u003c') }}
      />
      <HeroSection lang={lang} />
      <ServerStats lang={lang} stats={stats} />
      <EcoBanner lang={lang} />
      <GameFeatures lang={lang} />
      <GameModes lang={lang} />
      <HowToPlay lang={lang} />
      <LauncherSpotlight lang={lang} />
      <LatestPosts lang={lang} posts={posts} />
      <PlayBand lang={lang} />
    </div>
  );
}
