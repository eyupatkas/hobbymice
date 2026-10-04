'use strict';
// Canlı sohbet sunucusu — Facebook tarzı widget'ın arka ucu.
// Oyundaki arkadaş listesini (accounts.friendList) kullanır; mesajlar
// chat_messages koleksiyonunda saklanır, çevrimdışıysa okunmamış olarak
// bir sonraki bağlanışta iletilir. Bağlantı: /ws/chat (nginx → 8010).
//
// Kimlik doğrulama: yükseltme isteğindeki oturum çerezi site_sessions'dan
// doğrulanır; hesap kimliği ACCOUNTS koleksiyonundan accountId+playerName
// ile BİRLİKTE okunur. Tüm hesap sorguları oturumun kendi accountId'sine
// bağlıdır (kullanıcı-binding); okundu işaretleme yalnızca kendine gelen
// mesajları etkiler.

const { WebSocketServer } = require('ws');
const { getDb } = require('./db');
const { readCookieValue, SESSION_COOKIE } = require('./session');

const online = new Map();   // playerName → Set<ws>
const clients = new Map();  // ws → { ws, playerName, accountId, friends, timer, msgs }

function send(ws, obj) {
  if (ws && ws.readyState === 1) {
    try { ws.send(JSON.stringify(obj)); } catch { /* bağlantı koptu */ }
  }
}

function isOnline(name) { return online.has(name) && online.get(name).size > 0; }

function totalUnread(playerName) {
  return getDb().collection('chat_messages').countDocuments({ to: playerName, read: false });
}

// Arkadaş listesi: sorgu oturum sahibinin kendi accountId'sine bağlıdır.
async function friendsWithMeta(accountId) {
  const acc = await getDb().collection('accounts').findOne(
    { _id: accountId }, { projection: { playerName: 1, friendList: 1 } });
  const own = acc ? acc.playerName : '';
  const names = (acc && Array.isArray(acc.friendList) ? acc.friendList : [])
    .filter(n => typeof n === 'string' && n.trim()).slice(0, 100);
  const unreadAgg = await getDb().collection('chat_messages').aggregate([
    { $match: { to: own, read: false } },
    { $group: { _id: '$from', n: { $sum: 1 } } },
  ]).toArray();
  const unread = {};
  for (const u of unreadAgg) unread[u._id] = u.n;
  return { own, names, unread };
}

function broadcastPresence(name, value) {
  for (const [, c] of clients) {
    if (c.friends.includes(name)) send(c.ws, { t: 'presence', name, value });
  }
}

async function pushFriends(ws) {
  const c = clients.get(ws);
  if (!c) return;
  const { own, names, unread } = await friendsWithMeta(c.accountId);
  c.playerName = own;
  c.friends = names;
  send(ws, {
    t: 'friends',
    list: names.map(n => ({ name: n, online: isOnline(n), unread: unread[n] || 0 })),
  });
}

// Yükseltme kimlik doğrulaması: çerezdeki oturum anahtarı site_sessions'da
// aranır; oturumun accountId'si ile hesap kaydı BİRLİKTE sorgulanır.
async function authenticateUpgrade(req) {
  const token = readCookieValue(req.headers.cookie, SESSION_COOKIE);
  if (!token) return null;
  const s = await getDb().collection('site_sessions')
    .find({ token }).limit(1).next();
  if (!s) return null;
  const acc = await getDb().collection('accounts')
    .findOne({ _id: s.accountId }, { projection: { playerName: 1 } });
  if (!acc) return null;
  return { playerName: acc.playerName, accountId: s.accountId };
}

async function handleMsg(c, m) {
  const to = String(m.to || '').slice(0, 40);
  const body = String(m.body || '').trim().slice(0, 500);
  if (!to || !body || to === c.playerName) return;
  const now = Date.now();
  c.msgs = c.msgs.filter(t => now - t < 10000);
  if (c.msgs.length >= 12) { send(c.ws, { t: 'error', error: 'Çok hızlı yazıyorsun.' }); return; }
  c.msgs.push(now);
  if (!c.friends.includes(to)) { send(c.ws, { t: 'error', error: 'Bu oyuncu arkadaş listenizde değil.' }); return; }

  const ts = new Date();
  await getDb().collection('chat_messages').insertOne({ from: c.playerName, to, body, ts, read: false });
  const targets = online.get(to);
  if (targets) {
    for (const t of targets) send(t, { t: 'msg', from: c.playerName, body, ts });
    for (const t of targets) send(t, { t: 'unread', total: await totalUnread(to) });
  }
  send(c.ws, { t: 'sent', to, body, ts });
}

async function handleRead(c, m) {
  const withWho = String(m.with || '').slice(0, 40);
  if (!withWho) return;
  // okundu işaretleme: yalnızca KENDİNE gelen mesajlar
  await getDb().collection('chat_messages').updateMany(
    { from: withWho, to: c.playerName, read: false }, { $set: { read: true } });
  send(c.ws, { t: 'unread', total: await totalUnread(c.playerName) });
}

function handleTyping(c, m) {
  const to = String(m.to || '').slice(0, 40);
  if (!to) return;
  const targets = online.get(to);
  if (targets) for (const t of targets) send(t, { t: 'typing', from: c.playerName });
}

function attach(server) {
  const wss = new WebSocketServer({ server, path: '/ws/chat' });

  wss.on('connection', async (ws, req) => {
    const chatUser = await authenticateUpgrade(req);
    if (!chatUser || !ws.send) {
      try { ws.close(); } catch { /* zaten kapalı */ }
      return;
    }
    const { playerName, accountId } = chatUser;
    // ws 引用必须存在 c 上：handleMsg/broadcastPresence 都经 c.ws 发送
    const c = { ws, playerName, accountId, friends: [], timer: null, msgs: [] };
    clients.set(ws, c);

    if (!online.has(playerName)) online.set(playerName, new Set());
    online.get(playerName).add(ws);
    broadcastPresence(playerName, true);

    (async () => {
      await pushFriends(ws);
      const unread = await getDb().collection('chat_messages')
        .find({ to: c.playerName, read: false }).sort({ ts: 1 }).limit(100).toArray();
      for (const m of unread) send(ws, { t: 'msg', from: m.from, body: m.body, ts: m.ts, offline: true });
      send(ws, { t: 'unread', total: await totalUnread(c.playerName) });
    })().catch(() => {});

    c.timer = setInterval(() => { pushFriends(ws).catch(() => {}); }, 30000);

    ws.on('message', data => {
      let m = null;
      try { m = JSON.parse(String(data)); } catch { return; }
      if (!m || typeof m.t !== 'string') return;
      // Promise.resolve sarimi: async olmayan handler (handleTyping) undefined
      // dondurur; uzerinden .catch cagirmak butun sunucuyu cokurturdu (502'ler).
      if (m.t === 'msg') Promise.resolve(handleMsg(c, m)).catch(e => console.error('[chat] handleMsg:', e.message));
      else if (m.t === 'read') Promise.resolve(handleRead(c, m)).catch(e => console.error('[chat] handleRead:', e.message));
      else if (m.t === 'typing') Promise.resolve(handleTyping(c, m)).catch(() => {});
    });

    ws.on('close', () => {
      clearInterval(c.timer);
      clients.delete(ws);
      const set = online.get(playerName);
      if (set) {
        set.delete(ws);
        if (!set.size) { online.delete(playerName); broadcastPresence(playerName, false); }
      }
    });
  });
}

module.exports = { attach, isOnline };
