// Tüm dil dosyalarının (tr/en/fr/es) tfmnews bloklarını updates.json'daki
// son 5 girişle değiştirir. Yeni numaralandırma: 54 = en yeni (istemci
// en yüksek numarayı en güncel haber olarak gösterir), 50 = en eski.
// TR: Türkçe içerik; EN/FR/ES: bu tur için İngilizce içerik.
// Çıktılar /var/www/hobbymice/res/langues/ altına yazılır (nginx local servis).
import zlib from 'node:zlib';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire('/root/projects/transformice/website/package.json');
const { MongoClient } = require('mongodb');

const OUT_DIR = '/var/www/hobbymice/res/langues';
const IMAGE = 'https://hobbymice.com.tr/assets/logo.png';
const TR_MONTH = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const EN_MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const updates = JSON.parse(fs.readFileSync('/root/projects/transformice/website/content/updates.json', 'utf8')).entries.slice(0, 5);

// EN karsiliklar (index bazli — updates.json sirasiyla birebir)
const EN_BY_INDEX = [
  {
    title: '🍕 New Pizzeria Module + In-Game Menu Refresh',
    date: '3 October 2026',
    body: '• 🍕 New module #pizzeria: take orders in the Mouse Village pizzeria and keep customers happy!\n• 📰 The in-game NEWS window now shows the posts from our Updates page (old announcements removed)\n• 🔗 The menu FORUM button now opens our community forum correctly\n• 👑 Admins now have a special pink star title\n\nPlay: https://hobbymice.com.tr/play',
  },
  {
    title: '🧟 Official Infected & Crowdsurf Are Here + Loop Fix',
    date: '3 October 2026',
    body: '• 🧟 #infected: the OFFICIAL infection module — first shaman infects everyone, last mouse standing wins!\n• 🏄 #crowdsurf: ride the crowd and reach the farthest spot!\n• 🔧 Fixed rapid map changing in modules: round wins now require 2+ players\n\nPlay: https://hobbymice.com.tr/play',
  },
  {
    title: '🏁 Mode Rooms Now Use Real Mode Maps + 3 New Mini-Games',
    date: '3 October 2026',
    body: '• 🏁 Racing, Survivor, Defilante and Bootcamp rooms now run REAL mode maps (600+ maps added) — no more vanilla fallback!\n• 🧛 #vampir: a random vampire tries to infect everyone — survive until the timer ends\n• 💣 #bomba: dodge the rain of explosions, last one standing wins\n• 🌀 #gravity: gravity keeps flipping — floor, ceiling, walls!\n\nPlay: https://hobbymice.com.tr/play',
  },
  {
    title: '🎨 Colored Custom Titles + 3 More Modes',
    date: '3 October 2026',
    body: '• 🎨 Titles refreshed with colors + 6 NEW custom titles (Cheese Hunter, First Master, Night Watch, Loyal Mouse, Founding Crew, HobbyMice Legend)\n• 🔫 #cannonup: official cannon chaos module\n• 🏋️ #hardcamp: harder bootcamp courses\n• ⚡ #powers: play with special powers\n\nPlay: https://hobbymice.com.tr/play',
  },
  {
    title: '🛡️ Connection Resilience Improved',
    date: '3 October 2026',
    body: '• 🎮 Game signals sent while not in a room are now gracefully ignored — fewer stuck states on sudden disconnects\n• 🧩 Covers emoji, emote, high-five, meep, shaman flight and ice conversion signals\n\nPlay: https://hobbymice.com.tr/play',
  },
];

function trDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${TR_MONTH[m - 1]} ${y}`;
}
function enDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${EN_MONTH[m - 1]} ${y}`;
}

function buildBlocks(lang) {
  return updates.map((e, i) => {
    const newsId = 54 - i; // 54 = en yeni
    const title = lang === 'tr' ? e.title : EN_BY_INDEX[i].title;
    const date = lang === 'tr' ? trDate(e.date) : enDate(e.date);
    const body = lang === 'tr'
      ? (e.items || []).map(x => '• ' + x.replace(/\n/g, ' ')).join('\n') + '\n\nOyna: https://hobbymice.com.tr/play'
      : EN_BY_INDEX[i].body;
    return `tfmnews_${newsId}=10,${IMAGE}\n${title}\n${date}\n\n${body}`;
  });
}

const SOURCES = {
  tr: '/var/www/hobbymice/res/langues/tfm-tr.gz',
  en: '/tmp/tfm-en.gz',
  fr: '/tmp/tfm-fr.gz',
  es: '/tmp/tfm-es.gz',
};

// fr/es kaynaklarini indir
for (const lang of ['fr', 'es']) {
  if (!fs.existsSync(SOURCES[lang])) {
    const res = await fetch(`https://hobbymice.com.tr/res/langues/tfm-${lang}.gz`);
    fs.writeFileSync(SOURCES[lang], Buffer.from(await res.arrayBuffer()));
  }
}

const NEWS_RE = /(?:^|\n)tfmnews_\d+=[\s\S]*?(?=\n[A-Za-z0-9_.]+=|$)/g;

for (const [lang, src] of Object.entries(SOURCES)) {
  let text = zlib.inflateSync(fs.readFileSync(src)).toString('utf8');
  text = text.replace(NEWS_RE, '');
  if (!text.endsWith('\n-\n')) text += '\n-\n';
  text += buildBlocks(lang).join('\n-\n') + '\n-\n';
  const out = zlib.deflateSync(Buffer.from(text, 'utf8'), { level: 9 });
  fs.writeFileSync(`${OUT_DIR}/tfm-${lang}.gz`, out);
  const verify = zlib.inflateSync(fs.readFileSync(`${OUT_DIR}/tfm-${lang}.gz`)).toString('utf8');
  const hasOld = verify.includes('Official Map Submission') || verify.includes('Scam Warning');
  console.log(`${lang}: yazildi ${out.length} bayt | eski haber kaldi: ${hasOld} | yeni blok: ${verify.includes('tfmnews_54=')}`);
}
