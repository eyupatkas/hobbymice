'use strict';
// HobbyMice canlı site uçtan uca görsel testi.
//
// İki mod vardır:
// 1) OKUMA MODU (varsayılan): HM_TEST_PASS verilmezse YALNIZCA okuma-düzeyi
//    kontroller koşar — ana sayfa 200, giriş formu görünürlüğü, /siralama render.
//    HESAP OLUŞTURMA / GİRİŞ / VERİ YAZMA yapılmaz (güvenli, env'siz koşulabilir).
// 2) TAM MOD: HM_TEST_PASS verilirse eski tam akış koşar —
//    giriş → admin paneli → oyuncu düzenleme → forum (konu+cevap) → blog → ana sayfa.
//    (Not: kayıt ucu sitede yoktur; hesaplar oyundan açılır — bu script hesap YARATMAZ.)
// Her adımda ekran görüntüsü /tmp/hm_shots/ altına kaydedilir.
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = process.env.HM_TEST_BASE || 'https://hobbymice.com.tr';
const OUT = '/tmp/hm_shots';
const USER = 'info@in3dex.com';
const PASS = process.env.HM_TEST_PASS; // yoksa OKUMA MODU

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png`, fullPage: false });
  const results = [];
  const ok = (name, cond, extra = '') => {
    results.push(`${cond ? '✅' : '❌'} ${name}${extra ? ' — ' + extra : ''}`);
    if (!cond) process.exitCode = 1;
  };

  if (!PASS) {
    // ---- OKUMA MODU: yazma yok, giriş yok, sadece sayfa sağlığı ----
    // 1) Ana sayfa 200 + render
    const resp = await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    await shot('r1-anasayfa');
    ok('ana sayfa 200', !!resp && resp.status() === 200, 'status=' + (resp ? resp.status() : 'yok'));
    ok('ana sayfa render', (await page.content()).includes('HobbyMice'));

    // 2) Giriş formu görünürlüğü (form DOLDURULMAZ — yalnızca görünür mü bakılır)
    await page.goto(`${BASE}/giris`, { waitUntil: 'domcontentloaded' });
    await shot('r2-giris-formu');
    ok('giriş formu görünür', await page.locator('form input[name=user]').isVisible());
    ok('şifre alanı görünür', await page.locator('form input[name=password]').isVisible());

    // 3) Sıralama sayfası render (salt okunur sorgu)
    await page.goto(`${BASE}/siralama?tur=peynir`, { waitUntil: 'domcontentloaded' });
    await shot('r3-siralama');
    const tbl = await page.locator('table').count();
    ok('sıralama tablosu render', tbl > 0, tbl + ' tablo');

    console.log('[OKUMA MODU] HM_TEST_PASS verilmedi — yazma testleri atlandı (tam akış için env ver).');
    console.log(results.join('\n'));
    await browser.close();
    return;
  }

  // ---- TAM MOD (HM_TEST_PASS ile): eski tam akış ----
  // 1) Giriş sayfası (giriş sonrası /admin'e yönlendirme isteniyor)
  await page.goto(`${BASE}/giris?geri=%2Fadmin`, { waitUntil: 'domcontentloaded' });
  await shot('01-giris');
  ok('giriş sayfası açıldı', (await page.title()).includes('Giriş'));

  // 2) Formu doldur ve gönder
  await page.fill('input[name=user]', USER);
  await page.fill('input[name=password]', PASS);
  await Promise.all([
    page.waitForURL('**/admin', { timeout: 10000 }).catch(() => {}),
    page.click('button.btn-play'),
  ]);
  await page.waitForLoadState('domcontentloaded');
  await shot('02-admin-ozet');
  ok('giriş sonrası /admin', page.url().includes('/admin'), page.url());
  ok('yönetim paneli başlığı', await page.locator('h1:has-text("Panel")').count() > 0 || (await page.content()).includes('Kayıtlı oyuncu'));

  // 3) Oyuncu düzenleme sayfası
  await page.goto(`${BASE}/admin/oyuncular?q=Eyup`, { waitUntil: 'domcontentloaded' });
  await shot('03-oyuncu-arama');
  ok('oyuncu arama sonucu', (await page.content()).includes('Eyup#5973'));
  await page.goto(`${BASE}/admin/oyuncular/3`, { waitUntil: 'domcontentloaded' });
  await shot('04-oyuncu-duzenle');
  const cheeseVal = await page.inputValue('input[name=f_cheeseCount]');
  ok('peynir alanı dolu', cheeseVal !== '', 'değer=' + cheeseVal);
  ok('Admin rolü işaretli', await page.isChecked('input[name=role_Admin]'));

  // 4) Forum: konu aç
  await page.goto(`${BASE}/forum/yeni`, { waitUntil: 'domcontentloaded' });
  await shot('05-forum-yeni');
  await page.fill('input[name=title]', 'Tarayıcı Testi: Merhaba Dünya');
  await page.selectOption('select[name=category]', 'Genel Sohbet');
  await page.fill('textarea[name=body]', 'Bu konu otomatik tarayıcı testinde açıldı. [b]Kalın[/b] biçimlendirme de çalışıyor.');
  await Promise.all([
    page.waitForURL('**/forum/konu/**', { timeout: 10000 }).catch(() => {}),
    page.click('button.btn-play'),
  ]);
  await page.waitForLoadState('domcontentloaded');
  await shot('06-forum-konu');
  ok('konu sayfası açıldı', page.url().includes('/forum/konu/'), page.url());
  ok('konu gövdesi görünür', (await page.content()).includes('otomatik tarayıcı testinde'));

  // 5) Forum: cevap yaz
  await page.fill('textarea[name=body]', 'Ve işte ilk cevap!');
  await Promise.all([
    page.waitForLoadState('domcontentloaded').catch(() => {}),
    page.click('#reply-form button.btn-play'),
  ]);
  await page.waitForLoadState('domcontentloaded');
  await shot('07-forum-cevap');
  ok('cevap görünüyor', (await page.content()).includes('Ve işte ilk cevap!'));

  // 6) Blog listesi + AI yazısı
  await page.goto(`${BASE}/blog`, { waitUntil: 'domcontentloaded' });
  await shot('08-blog-liste');
  ok('blog listesi', (await page.content()).includes('Kabile'));

  // 7) Sıralama sayfası
  await page.goto(`${BASE}/siralama?tur=peynir`, { waitUntil: 'domcontentloaded' });
  await shot('09-siralama');
  ok('sıralama tablosu', (await page.content()).includes('Eyup#5973'));

  // 8) Ana sayfa (blog widget'ı)
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForTimeout(800);
  await shot('10-anasayfa');
  const homeCards = await page.locator('#blogson .card').count();
  ok('ana sayfa blog widget\'ı', homeCards > 0, homeCards + ' kart');

  // 9) Çıkış
  await page.evaluate(() => fetch('/api/logout', { method: 'POST' }));
  console.log(results.join('\n'));
  await browser.close();
})().catch(e => { console.error('TEST HATASI:', e.message); process.exit(1); });
