// tfm-tr.gz içindeki tfmnews_50-54 (oyun içi Yenilikler penceresi) bloklarını
// website/content/updates.json'daki son 5 güncellemeyle değiştirir.
// Blok formatı: tfmnews_N=<sayı>,<görsel-url>\n<başlık>\n<tarih>\n\n<içerik>
// Her koşuda çağrılabilir: önce updates.json okunur, sonra dil dosyası yeniden üretilir.
import zlib from 'node:zlib';
import fs from 'node:fs';

const LANG_SRC = '/var/www/hobbymice/res/langues/tfm-tr.gz';
const UPDATES = '/root/projects/transformice/website/content/updates.json';
const IMAGE = 'https://hobbymice.com.tr/assets/logo.png';

const updates = JSON.parse(fs.readFileSync(UPDATES, 'utf8')).entries.slice(0, 5);
if (!updates.length) {
  console.error('updates.json boş — işlem yapılmadı');
  process.exit(1);
}

let text = zlib.inflateSync(fs.readFileSync(LANG_SRC)).toString('utf8');

// mevcut tfmnews_XX bloklarını bul ve sil (satır: tfmnews_N=<...> bir sonraki \n[anahtar]= ya da sona kadar)
const keyRe = /(?:^|\n)tfmnews_\d+=[\s\S]*?(?=\n[A-Za-z0-9_.]+=|$)/g;
text = text.replace(keyRe, '');
if (!text.endsWith('\n-\n')) text += '\n-\n';

const TR_MONTH = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
function trDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${TR_MONTH[m - 1]} ${y}`;
}

// en yeni = tfmnews_50 (istemci en günceli üstte gösterir)
const blocks = updates.map((e, i) => {
  const items = (e.items || []).map(x => '• ' + x.replace(/\n/g, ' ')).join('\n');
  const body = `${items}\n\nOyna: https://hobbymice.com.tr/play`;
  return `tfmnews_${50 + i}=10,${IMAGE}\n${e.title}\n${trDate(e.date)}\n\n${body}`;
});

text += blocks.join('\n-\n') + '\n-\n';

const out = zlib.deflateSync(Buffer.from(text, 'utf8'), { level: 9 });
fs.writeFileSync(LANG_SRC, out);

const verify = zlib.inflateSync(fs.readFileSync(LANG_SRC)).toString('utf8');
const count = (verify.match(/tfmnews_\d+ =|tfmnews_\d+=/g) || []).length;
console.log('yazıldı:', out.length, 'bayt | tfmnews blok:', count, '| ilk başlık:', updates[0].title);
