'use strict';
// Profil i18n dogrulamasi icin GECICI site oturumu: mint (olustur+token bas) / drop (sil).
// Kullanim: node hm-session-mint.js mint | node hm-session-mint.js drop <token>
const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');

const URI = process.env.HM_MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB = process.env.HM_MONGO_DB || 'transformice3';
const mode = process.argv[2];

(async () => {
  const c = new MongoClient(URI, { serverSelectionTimeoutMS: 5000 });
  await c.connect();
  const db = c.db(DB);

  if (mode === 'mint') {
    const acc = await db.collection('accounts').find({ playerName: '*HmTestBot#0001' })
      .limit(1).toArray();
    if (!acc.length) { console.log('KONUK-HESAP-YOK'); process.exit(1); }
    const token = crypto.randomBytes(32).toString('hex');
    await db.collection('site_sessions').insertOne({
      token,
      accountId: new ObjectId(acc[0]._id),
      playerName: acc[0].playerName,
      staff: false,
      roles: [],
      createdAt: new Date(),
      lastSeen: new Date(),
      ip: '127.0.0.1 (test)',
      ua: 'hm-session-mint (otomasyon dogrulamasi)',
    });
    console.log('TOKEN=' + token + ' | PLAYER=' + acc[0].playerName);
  } else if (mode === 'list') {
    const a = await db.collection('accounts').find({}, { projection: { playerName: 1, regDate: 1 } })
      .sort({ regDate: -1 }).limit(8).toArray();
    a.forEach(x => console.log((x.playerName || '?') + ' | reg=' + (x.regDate || 0)));
    console.log('TOPLAM=' + await db.collection('accounts').countDocuments({}));
    console.log('OTURUM=' + await db.collection('site_sessions').countDocuments({}));
  } else if (mode === 'keys') {
    const x = await db.collection('accounts').findOne({});
    console.log(Object.keys(x || {}).join(','));
  } else if (mode === 'mkacc') {
    const name = '*HmTestBot#0001';
    const old = await db.collection('accounts').findOne({ playerName: name });
    if (old) { console.log('ZATEN-VAR ' + old._id); process.exit(0); }
    const now = Math.floor(Date.now() / 1000);
    const r = await db.collection('accounts').insertOne({
      playerName: name, regDate: now,
      emailAddress: '', password: '', staffRoles: [], hasPublicAuthorization: false,
      cheeseCount: 42, firstCount: 3, bootcampCount: 1,
      normalSaves: 5, hardSaves: 2, divineSaves: 1, playedTime: 3600,
      dailyStreak: 5, playerMissions: [],
      inventory: [], shopItems: [], shopCheeses: [], shopStrawberries: [],
      titleList: [], friendList: [], ignoredList: [], playerSkills: [],
      shamanBadges: [], purchasedEmojis: [], shopBadges: [],
    });
    console.log('OLUSTU ' + r.insertedId);
  } else if (mode === 'rmacc') {
    const r = await db.collection('accounts').deleteOne({ playerName: '*HmTestBot#0001' });
    const r2 = await db.collection('site_sessions').deleteMany({ playerName: '*HmTestBot#0001' });
    console.log('HESAP-SIL=' + r.deletedCount + ' OTURUM-SIL=' + r2.deletedCount);
  } else {
    console.log('kullanim: mint | drop <token> | list | keys | mkacc | rmacc');
  }
  await c.close();
})().catch(e => { console.error('HATA', e.message); process.exit(1); });
