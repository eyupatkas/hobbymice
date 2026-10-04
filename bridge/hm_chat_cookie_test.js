'use strict';
// Eyup oturumuyla sohbet widget'ini gercek tarayicida test eder (cookie injection).
const { chromium } = require('playwright');
const { MongoClient } = require('mongodb');

const TOKEN = process.argv[2];
const BASE = 'https://hobbymice.com.tr';

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--disable-gpu'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addCookies([{ name: 'hm_session', value: TOKEN, domain: 'hobbymice.com.tr', path: '/' }]);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text().slice(0, 150)); });
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + String(e).slice(0, 150)));

  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);

  const loggedIn = await page.evaluate(() => document.body.innerText.includes('Giriş Yap') ? 'giris-linki-var' : 'giris-yapilmis');
  console.log('oturum durumu:', loggedIn);

  await page.click('#hmchat-btn');
  await page.waitForTimeout(1500);
  const panelVisible = !!(await page.$('#hmchat-panel:not(.hide)'));
  const panelText = await page.evaluate(() => (document.getElementById('hmchat-panel') || {}).innerText || '');
  console.log('panel gorunur:', panelVisible, '| icerik:', JSON.stringify(panelText.slice(0, 160)));

  const friendItem = await page.$('.hmc-item');
  if (!friendItem) {
    console.log('SONUC: arkadas listesi YOK — WS/auth/UI sorunu. Konsol hatalari:', errors.slice(0, 4));
    await browser.close();
    process.exit(0);
  }
  await friendItem.click();
  await page.waitForTimeout(1200);
  await page.fill('#hmc-input', 'otomatik sohbet testi ' + Date.now());
  await page.click('.hmc-send');
  await page.waitForTimeout(2500);

  const bubbles = await page.evaluate(() => [...document.querySelectorAll('.hmc-bub')].map(b => b.innerText.replace(/\n/g, ' ').slice(0, 60)));
  console.log('sohbet balonlari:', JSON.stringify(bubbles));

  const mc = new MongoClient('mongodb://127.0.0.1:27017');
  await mc.connect();
  const last = await mc.db('transformice3').collection('chat_messages').find({ from: 'Eyup#5973' }).sort({ ts: -1 }).limit(1).toArray();
  console.log('DB son mesaj:', last[0] ? (last[0].to + ' | ' + new Date(last[0].ts).toISOString() + ' | ' + last[0].body.slice(0, 40)) : 'YOK');
  await mc.close();

  console.log('konsol hatalari:', errors.length ? errors.slice(0, 4) : 'yok');
  await browser.close();
})().catch(e => { console.error('TEST HATASI:', String(e).slice(0, 300)); process.exit(1); });
