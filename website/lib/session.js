'use strict';
// 认证与会话：密码算法与游戏服完全一致
// （SHA256hex(密码) + 32 字节固定 salt → SHA256 → base64）。
// 会话存 site_sessions 集合，页面经 next/headers cookies() 读取。
const crypto = require('crypto');
const { headers } = require('next/headers');
const { getDb } = require('./db');

const SALT = Buffer.from([
  0xF7, 0x1A, 0xA6, 0xDE, 0x8F, 0x17, 0x76, 0xA8, 0x03, 0x9D, 0x32, 0xB8,
  0xA1, 0x56, 0xB2, 0xA9, 0x3E, 0xDD, 0x43, 0x9D, 0xC5, 0xDD, 0xCE, 0x56,
  0xD3, 0xB7, 0xA4, 0x05, 0x4A, 0x0D, 0x08, 0xB0,
]);

const SESSION_COOKIE = 'hm_session';
const SESSION_DAYS = 14;
const STAFF_ROLES = ['Admin', 'Sentinelle', 'Modo', 'Arbitre', 'MapCrew', 'FunCorp', 'LuaDev', 'FashionSquad'];

function gamePasswordHash(pw) {
  const h1 = crypto.createHash('sha256').update(String(pw), 'utf8').digest('hex');
  return crypto.createHash('sha256')
    .update(Buffer.concat([Buffer.from(h1, 'utf8'), SALT]))
    .digest('base64');
}

function isAdminAccount(acc) {
  const roles = Array.isArray(acc.staffRoles) ? acc.staffRoles : [];
  return roles.includes('Admin');
}

// IP 限速：5 分钟 10 次
const attempts = new Map();
function loginAllowed(ip) {
  const now = Date.now();
  const list = (attempts.get(ip) || []).filter(t => now - t < 5 * 60 * 1000);
  attempts.set(ip, list);
  return list.length < 10;
}
function loginRecordFail(ip) {
  const list = attempts.get(ip) || [];
  list.push(Date.now());
  attempts.set(ip, list);
}

async function verifyLogin(user, password) {
  const hash = gamePasswordHash(password);
  return getDb().collection('accounts').findOne({
    $or: [{ playerName: String(user) }, { emailAddress: String(user).toLowerCase() }],
    password: hash,
  }) || null;
}

async function createSession(acc, meta = {}) {
  const token = crypto.randomBytes(32).toString('hex');
  await getDb().collection('site_sessions').insertOne({
    token,
    accountId: acc._id,
    playerName: acc.playerName,
    staff: isAdminAccount(acc),
    roles: Array.isArray(acc.staffRoles) ? acc.staffRoles : [],
    createdAt: new Date(),
    lastSeen: new Date(),
    ip: String(meta.ip || '').slice(0, 60),
    ua: String(meta.ua || '').slice(0, 200),
  });
  return token;
}

async function destroySession(token) {
  if (!token) return;
  await getDb().collection('site_sessions').deleteOne({ token });
}

function readCookieValue(raw, name) {
  for (const part of String(raw).split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

async function userFromToken(token) {
  if (!token) return null;
  const d = getDb();
  const s = await d.collection('site_sessions').findOne({ token });
  if (!s) return null;
  const acc = await d.collection('accounts').findOne({ _id: s.accountId });
  if (!acc) {
    await d.collection('site_sessions').deleteOne({ token });
    return null;
  }
  if (acc.playerName !== s.playerName) {
    await d.collection('site_sessions').updateOne(
      { token }, { $set: { playerName: acc.playerName, staff: isAdminAccount(acc), roles: acc.staffRoles || [] } });
  }
  return {
    token,
    accountId: acc._id,
    playerName: acc.playerName,
    staff: isAdminAccount(acc),
    roles: Array.isArray(acc.staffRoles) ? acc.staffRoles : [],
  };
}

// 服务端组件 / Server Action 内读取当前用户
async function getUser() {
  const jar = await headers();
  const token = readCookieValue(jar.get('cookie') || '', SESSION_COOKIE);
  if (!token) return null;
  try { return await userFromToken(token); } catch { return null; }
}

async function audit(user, action, target, details) {
  getDb().collection('admin_log').insertOne({
    ts: new Date(), actor: user || '?',
    action, target: String(target), details: String(details || '').slice(0, 500),
  }).catch(() => {});
}

module.exports = {
  gamePasswordHash, verifyLogin, createSession, destroySession, userFromToken,
  getUser, readCookieValue, isAdminAccount, loginAllowed, loginRecordFail, audit,
  SESSION_COOKIE, SESSION_DAYS, STAFF_ROLES,
};
