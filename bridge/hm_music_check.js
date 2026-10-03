'use strict';
// Giriş ekranı müziği kanıtı: /play sayfasında Ruffle istemcisi intro.mp3'ü
// ister; yanıtta nam-nam boyutu (5701425 B) görünmeli.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({
    args: ['--autoplay-policy=no-user-gesture-required'],
  });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  let introStatus = null;
  p.on('response', async r => {
    if (r.url().includes('/res/audio/')) {
      const body = await r.body().catch(() => null);
      const entry = { url: r.url().slice(r.url().indexOf('/res/')), status: r.status(), bytes: body ? body.length : null };
      console.log('audio isteği:', JSON.stringify(entry));
      if (r.url().includes('intro.mp3')) introStatus = entry;
    }
  });
  await p.goto('https://hobbymice.com.tr/play/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  // Ruffle + SWF + giriş ekranı başlatması için uzun süre
  await p.waitForTimeout(60000);
  await p.screenshot({ path: '/tmp/hm_shots/40-play-giris.png' });
  if (introStatus && introStatus.bytes === 5701425) {
    console.log('✅ Giriş ekranı NAM-NAM müziğini çekiyor (5701425 bayt)');
  } else if (introStatus) {
    console.log('⚠ intro.mp3 çekildi ama boyut farklı:', JSON.stringify(introStatus));
  } else {
    console.log('⚠ İstemci intro.mp3 isteği gözlenmedi (otomatik ses politikası engellemiş olabilir); dosya yine de override ile servis ediliyor.');
  }
  await b.close();
})().catch(e => { console.error('HATA:', e.message); process.exit(1); });
