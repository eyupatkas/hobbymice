'use strict';
// Canlı sohbet uçtan uca testi.
// Çerezler ortam değişkeniyle verilir (test dosyasında giriş yoktur):
//   HM_C1  → 1. kullanıcının hm_session çerezi
//   HM_C2  → 2. kullanıcının hm_session çerezi (yoksa tek taraf test edilir)
const WebSocket = require('/root/projects/transformice/website/node_modules/ws');

const BASE = 'wss://hobbymice.com.tr/ws/chat';
const C1 = process.env.HM_C1 || '';
const C2 = process.env.HM_C2 || '';

function connect(cookie, label) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(BASE, { headers: { Cookie: cookie } });
    const state = { ws, label, inbox: [], friends: null, unread: null };
    ws.on('message', d => {
      const m = JSON.parse(d);
      state.inbox.push(m);
      if (m.t === 'friends') state.friends = m.list;
      if (m.t === 'unread') state.unread = m.total;
    });
    ws.on('open', () => resolve(state));
    ws.on('error', reject);
  });
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
function lastOf(state, type, from) {
  return [...state.inbox].reverse().find(m => m.t === type && (!from || m.from === from));
}

(async () => {
  const results = [];
  const ok = (name, cond, extra) => {
    results.push((cond ? '✅' : '❌') + ' ' + name + (extra ? ' — ' + extra : ''));
    if (!cond) process.exitCode = 1;
  };

  const s1 = await connect(C1, 'kullanici1');
  ok('1. kullanıcı WS bağlandı', true);
  // arkadaş listesi bağlantıdan sonra asenkron gelir
  for (let i = 0; i < 20 && !s1.friends; i++) await wait(100);
  ok('arkadaş listesi: Testfare2#4380',
    JSON.stringify(s1.friends) === JSON.stringify([{ name: 'Testfare2#4380', online: false, unread: 0 }]),
    JSON.stringify(s1.friends));

  if (!C2) {
    console.log(results.join('\n'));
    console.log('ℹ HM_C2 verilmedi — tek taraf test edildi.');
    s1.ws.close();
    return;
  }

  let s2 = await connect(C2, 'kullanici2');
  ok('2. kullanıcı WS bağlandı', true);
  await wait(600);

  ok('presence bildirimi (çevrimiçi)',
    s1.inbox.some(m => m.t === 'presence' && m.name === 'Testfare2#4380' && m.value === true));

  s1.ws.send(JSON.stringify({ t: 'msg', to: 'Testfare2#4380', body: 'selam test mesajı 1' }));
  await wait(700);
  const got1 = lastOf(s2, 'msg', 'Eyup#5973');
  ok('çevrimiçi teslim (1→2)', got1 && got1.body === 'selam test mesajı 1');

  s2.ws.send(JSON.stringify({ t: 'msg', to: 'Eyup#5973', body: 'selam geriye 2' }));
  await wait(700);
  const got2 = lastOf(s1, 'msg', 'Testfare2#4380');
  ok('çevrimiçi teslim (2→1)', got2 && got2.body === 'selam geriye 2');

  s1.ws.send(JSON.stringify({ t: 'msg', to: 'Yabanci#0000', body: 'spam' }));
  await wait(500);
  ok('arkadaş olmayan reddi', s1.inbox.some(m => m.t === 'error' && /arkadaş/.test(m.error)));

  s2.ws.send(JSON.stringify({ t: 'read', with: 'Eyup#5973' }));
  await wait(600);
  ok('okundu sonrası unread=0', s2.unread === 0, 'unread=' + s2.unread);

  // Çevrimdışı teslim
  s2.ws.close();
  await wait(800);
  s1.ws.send(JSON.stringify({ t: 'msg', to: 'Testfare2#4380', body: 'çevrimdışı mesaj 3' }));
  await wait(600);
  s2 = await connect(C2, 'kullanici2-tekrar');
  await wait(900);
  const off = lastOf(s2, 'msg', 'Eyup#5973');
  ok('çevrimdışı teslim', off && off.body === 'çevrimdışı mesaj 3' && off.offline === true);

  s1.ws.close(); s2.ws.close();
  console.log(results.join('\n'));
  process.exit(process.exitCode || 0);
})().catch(e => { console.error('TEST HATASI:', e.message); process.exit(1); });
