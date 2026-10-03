'use strict';
// Yeniden tasarlanan sayfaların ekran görüntüleri (görsel kontrol için).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const s = n => pg.screenshot({ path: `/tmp/hm_shots/${n}.png` });
  const B = 'https://hobbymice.com.tr';
  const go = async u => {
    await pg.goto(u, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await pg.waitForTimeout(1200);
  };
  await go(B + '/forum'); await s('20-forum');
  await go(B + '/siralama'); await s('21-siralama');
  await go(B + '/blog'); await s('22-blog');
  await go(B + '/'); await s('23-anasayfa');
  await go(B + '/giris');
  await pg.fill('input[name=user]', 'info@in3dex.com');
  await pg.fill('input[name=password]', process.env.HM_TEST_PASS);
  await Promise.all([pg.waitForURL(u => !u.pathname.includes('giris')).catch(() => {}), pg.click('button.btn-play')]);
  await pg.waitForTimeout(1500);
  await go(B + '/forum'); await s('24-forum-girili');
  await go(B + '/profil'); await s('25-profil');
  await b.close();
})().catch(e => { console.error('HATA:', e.message); process.exit(1); });
