'use strict';
// IndexNow ping araci (Bing/Yandex/Seznam — ucretsiz aninda indeksleme).
// Kullanim:
//   node scripts/indexnow-ping.mjs                 -> sitemap.xml'deki tum URL'leri gonderir
//   node scripts/indexnow-ping.mjs /play /blog/x   -> belirli yollari gonderir
// blogbot.js yeni yazi sonrasi tek URL ping icin pingIndexNow(urls) cagirir.
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const HOST = 'https://hobbymice.com.tr';
const KEY = '553ae0f720d0cd6444b364791faba241';

export async function pingIndexNow(urls) {
  const list = (Array.isArray(urls) ? urls : [urls]).map((u) => (u.startsWith('http') ? u : HOST + u));
  if (!list.length) return { sent: 0 };
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: 'hobbymice.com.tr', key: KEY, keyLocation: `${HOST}/${KEY}.txt`, urlList: list.slice(0, 10000) }),
    });
    return { sent: list.length, status: res.status, ok: res.status >= 200 && res.status < 300 };
  } catch (e) {
    return { sent: list.length, ok: false, error: String(e?.message || e) };
  }
}

async function sitemapUrls() {
  const xml = await fetch(`${HOST}/sitemap.xml`).then((r) => r.text());
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  let urls;
  const args = process.argv.slice(2);
  if (args.length) {
    urls = args;
  } else {
    const xml = await fetch(`${HOST}/sitemap.xml`).then((r) => r.text());
    urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  }
  const result = await pingIndexNow(urls);
  console.log('IndexNow:', JSON.stringify(result), `(${urls.length} URL)`);
}
