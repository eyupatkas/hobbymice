'use strict';
// Sohbet widget'ı tarayıcı testi.
// HM_C2: 2. kullanıcının hm_session çerezi (env), HM_TEST_PASS: 1. kullanıcı şifresi.
const { chromium } = require('playwright');

const BASE = 'https://hobbymice.com.tr';
const PASS = process.env.HM_TEST_PASS;
const C2 = process.env.HM_C2 || '';

(async () => {
  const results = [];
  const ok = (n, c, e) => { results.push((c ? '✅ ' : '❌ ') + n + (e ? ' — ' + e : '')); if (!c) process.exitCode = 1; };

  const b1 = await chromium.launch();
  const p1 = await b1.newPage({ viewport: { width: 1280, height: 900 } });
  const b2 = await chromium.launch();
  const p2 = await b2.newPage({ viewport: { width: 1280, height: 900 } });

  // 2. kullanıcı: çerezle gir, forumda dursun (WS bağlansın)
  if (C2) {
    await p2.goto(BASE + '/forum', { waitUntil: 'domcontentloaded' });
    await p2.evaluate(ck => { document.cookie = ck; }, C2);
    await p2.reload({ waitUntil: 'domcontentloaded' });
  }

  // 1. kullanıcı: giriş formuyla gir
  await p1.goto(BASE + '/giris', { waitUntil: 'domcontentloaded' });
  await p1.fill('input[name=user]', 'info@in3dex.com');
  await p1.fill('input[name=password]', PASS);
  await Promise.all([p1.waitForURL(u => !u.pathname.includes('giris')).catch(() => {}), p1.click('button.btn-play')]);
  await p1.waitForTimeout(1000);

  ok('sohbet butonu var', await p1.locator('#hmchat-btn').count() === 1);
  await p1.click('#hmchat-btn');
  await p1.waitForTimeout(800);
  ok('panel açıldı', await p1.locator('#hmchat-panel').isVisible());
  const items = await p1.locator('.hmc-item').count();
  ok('arkadaş listesinde kayıt var', items >= 1, items + ' kayıt');
  await p1.screenshot({ path: '/tmp/hm_shots/30-chat-liste.png' });

  await p1.locator('.hmc-item').first().dispatchEvent('click');
  const dump = await p1.evaluate(() => document.getElementById('hmchat-body')?.innerHTML?.slice(0, 250)).catch(e => 'evalHata:' + e.message);
  console.log('TIK ANI panel:', dump);
  await p1.fill('#hmc-input', 'widget canlı testi');
  await p1.click('.hmc-send');
  await p1.waitForTimeout(900);
  const bubbles = await p1.locator('.hmc-bub.mine').count();
  ok('mesaj balonu göründü (gönderen)', bubbles >= 1);
  await p1.screenshot({ path: '/tmp/hm_shots/31-chat-sohbet.png' });

  if (C2) {
    try {
      await p2.bringToFront();
      await p2.click('#hmchat-btn');
      await p2.waitForTimeout(800);
      const badge = await p2.locator('#hmchat-badge').textContent().catch(() => '');
      ok('2. kullanıcıda okunmamış rozet', badge && parseInt(badge) >= 1, 'rozet=' + badge);
      await p2.screenshot({ path: '/tmp/hm_shots/32-chat-bildirim.png' });
      await p2.locator('.hmc-item').first().dispatchEvent('click');
      await p2.waitForTimeout(700);
      const got = await p2.locator('.hmc-bub:not(.mine)').count();
      ok('2. kullanıcı mesajı görüyor', got >= 1);
      await p2.screenshot({ path: '/tmp/hm_shots/33-chat-alici.png' });
    } catch (e) {
      ok('2. kullanıcı akışı (opsiyonel)', false, e.message.split('\n')[0]);
    }
  }

  // misafirde giriş daveti
  const b3 = await chromium.launch();
  const p3 = await b3.newPage();
  await p3.goto(BASE + '/blog', { waitUntil: 'domcontentloaded' });
  await p3.click('#hmchat-btn');
  await p3.waitForTimeout(500);
  ok('misafirde giriş daveti', (await p3.locator('.hmc-login').count()) >= 1);
  await p3.screenshot({ path: '/tmp/hm_shots/34-chat-misafir.png' });

  await b1.close(); await b2.close(); await b3.close();
  console.log(results.join('\n'));
})().catch(e => { console.error('HATA:', e.message); process.exit(1); });
