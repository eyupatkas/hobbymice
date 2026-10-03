'use strict';
// /profil yönlendirme sorununu izole teşhis.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage();
  pg.on('response', r => {
    if (r.status() >= 300 || r.url().includes('profil') || r.url().includes('logout'))
      console.log(r.status(), r.request().method(), r.url(), '->', r.headers().location || '');
  });
  const B = 'https://hobbymice.com.tr';
  await pg.goto(B + '/giris', { waitUntil: 'domcontentloaded' });
  await pg.fill('input[name=user]', 'info@in3dex.com');
  await pg.fill('input[name=password]', process.env.HM_TEST_PASS);
  await Promise.all([
    pg.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}),
    pg.click('button.btn-play'),
  ]);
  console.log('login sonrası:', pg.url());
  await pg.goto(B + '/profil', { waitUntil: 'domcontentloaded' });
  console.log('profil sonrası:', pg.url());
  console.log('h1:', await pg.locator('h1').first().textContent().catch(() => 'yok'));
  await b.close();
})().catch(e => { console.error('HATA:', e); process.exit(1); });
