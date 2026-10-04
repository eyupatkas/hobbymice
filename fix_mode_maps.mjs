// Mod kategorilerini duzeltir: Maps.db'de Perma 10/11/13/17/18 olan haritalar
// eski import'ta kategori 5'e indirgenmisti. Bu script:
//   - Bu haritalari mapeditor'da dogru kategoriye gunceller (var olan mapCode),
//   - DB'de hic olmayanlari yeni kayit olarak ekler.
// Calistiktan sonra oyun restart GEREKMEZ (selectMap her turda canli sorgular).
import { DatabaseSync } from 'node:sqlite';
import { createRequire } from 'node:module';
const require = createRequire('/root/projects/transformice/website/package.json');
const { MongoClient } = require('mongodb');

const MAPS_DB = '/tmp/Maps.db';
const MAX_XML = 200 * 1024;
const MODE_PERMAS = [10, 11, 13, 17, 18];

function validMap(xml) {
  if (!xml || xml.length > MAX_XML) return false;
  const head = xml.slice(0, 512).toUpperCase();
  if (head.includes('<!DOCTYPE') || head.includes('<!ENTITY')) return false;
  if (xml.length < 50) return false;
  return xml.trimStart().startsWith('<C>') && xml.includes('<Z>');
}

const db = new DatabaseSync(MAPS_DB);
const client = new MongoClient('mongodb://127.0.0.1:27017');
await client.connect();
const col = client.db('transformice3').collection('mapeditor');
const counters = client.db('transformice3').collection('counters');

async function nextId() {
  const r = await counters.findOneAndUpdate(
    { _id: 'lastMapCode' },
    { $inc: { value: 1 } },
    { upsert: true, returnDocument: 'after' },
  );
  return r.value;
}

let reclassified = 0;
let inserted = 0;
const seen = new Set();

const stmt = db.prepare('SELECT Name, Code, XML, YesVotes, NoVotes, Perma, Player FROM maps WHERE Perma = ? AND Code > 0 ORDER BY Code');
for (const perma of MODE_PERMAS) {
  for (const row of stmt.all(perma)) {
    const code = Number(row.Code);
    const xml = row.XML || '';
    if (!code || !validMap(xml)) continue;
    if (seen.has(code)) continue;
    seen.add(code);

    const existing = await col.countDocuments({ mapCode: code });
    if (existing > 0) {
      const r = await col.updateMany({ mapCode: code }, { $set: { mapCategory: perma } });
      reclassified += r.modifiedCount;
    } else {
      const who = String(row.Player || row.Name || 'Bilinmeyen').trim().slice(0, 40) || 'Bilinmeyen';
      const mid = await nextId();
      await col.insertOne({
        _id: mid, mapCode: code, mapCategory: perma,
        mapAuthor: who, mapXML: xml,
        mapYesVotes: Number(row.YesVotes || 0), mapNoVotes: Number(row.NoVotes || 0),
      });
      inserted++;
    }
  }
}

console.log(`yeniden siniflandirilan: ${reclassified}, yeni eklenen: ${inserted}`);
for (const cat of MODE_PERMAS) {
  console.log(`kategori ${cat}: ${await col.countDocuments({ mapCategory: cat })}`);
}
await client.close();
