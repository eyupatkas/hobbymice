import { getDb } from '../lib/db';
import HeroSection from './_components/home/HeroSection';
import ServerStats from './_components/home/ServerStats';
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
};

async function getHomePageData() {
  let posts = [];
  let stats = null;

  try {
    const db = getDb();
    const [fetchedPosts, userCount] = await Promise.all([
      db
        .collection('blog_posts')
        .find({ status: 'published' })
        .sort({ publishedAt: -1 })
        .limit(3)
        .toArray(),
      db
        .collection('users')
        .countDocuments()
        .catch(() => 0),
    ]);

    posts = fetchedPosts || [];
    if (userCount > 0) {
      stats = {
        players: userCount.toLocaleString('tr-TR') + '+',
        cheese: '1.250.000+',
      };
    }
  } catch {
    // DB bağlantısı henüz hazır değilse sessizce varsayılanlarla devam eder
  }

  return { posts, stats };
}

export default async function HomePage() {
  const { posts, stats } = await getHomePageData();

  return (
    <div className="home-wrap">
      <HeroSection />
      <ServerStats stats={stats} />
      <GameFeatures />
      <GameModes />
      <HowToPlay />
      <LauncherSpotlight />
      <LatestPosts posts={posts} />
      <PlayBand />
    </div>
  );
}
