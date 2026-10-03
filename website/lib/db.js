'use strict';
// MongoDB 连接 — 与游戏服共享 transformice3 库。
// 连接句柄挂在 globalThis 上：instrumentation 与页面 bundle 是不同模块副本，
// 必须共享同一实例。
const { MongoClient } = require('mongodb');

const URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.MONGO_DB || 'transformice3';
const g = globalThis;

async function connect() {
  if (!g.__hmConn) {
    g.__hmConn = (async () => {
      const client = new MongoClient(URI, { serverSelectionTimeoutMS: 5000 });
      await client.connect();
      g.__hmdb = client.db(DB_NAME);
      return g.__hmdb;
    })();
  }
  return g.__hmConn;
}

// 同步读取：instrumentation 在服务器启动时已 connect()。
function getDb() {
  if (!g.__hmdb) throw new Error('DB not connected');
  return g.__hmdb;
}

async function getDbAsync() {
  await connect();
  return g.__hmdb;
}

async function close() {
  if (g.__hmConn) {
    const c = await g.__hmConn.catch(() => null);
    if (c) await c.client?.close?.() ?? null;
  }
  g.__hmConn = null;
  g.__hmdb = null;
}

module.exports = { connect, getDb, getDbAsync, close };
