'use strict';
// HobbyMice blog botu — tam otomatik içerik üretimi.
// Akış: ücretsiz modelleri keşfet → soğuma durumuna göre model seç →
// mevcut yazılarla benzemeyen konu öner (öneri de modelden gelir) →
// tam SEO makalesi üret (JSON) → HTML temizle → yayınla → IndexNow'a bildir.
// Tüm durum blog_state'te, tüm denemeler blog_log'ta saklanır.
//
// Kullanım: node blogbot.js [--status] [--dry]
// API anahtarı OPENROUTER_API_KEY ortam değişkeninden okunur.

const db = require('./lib/db');
const { listFreeModels, chat } = require('./lib/openrouter');
const { slugify } = require('./lib/util');
const { sanitizeHTML } = require('./lib/sanitize');

const SITE = process.env.SITE_URL || 'https://hobbymice.com.tr';
const KEY = process.env.OPENROUTER_API_KEY || '';
const SIMILARITY_LIMIT = 0.38;   // bu Jaccard benzerliğinin üstündeki konular reddedilir

// ---------------- yardımcılar ----------------

function normText(s) {
  const map = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u' };
  return String(s).toLowerCase()
    .replace(/[çğıöşü]/g, ch => map[ch])
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/).filter(w => w.length > 2);
}
function jaccard(a, b) {
  const A = new Set(a), B = new Set(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
}
function maxSimilarity(title, existingTitles) {
  const t = normText(title);
  let max = 0;
  for (const e of existingTitles) max = Math.max(max, jaccard(t, normText(e)));
  return max;
}

// Modelden JSON çıkar: kod çitlerini/öncü metni at, dengeli ilk {...} bloğunu al.
function extractJSON(text) {
  let t = String(text).trim().replace(/^```(?:json)?/i, '').replace(/```$/,'').trim();
  // 常见模型容错：智能引号、尾逗号
  const lenient = t
    .replace(/[\u201c\u201d]/g, '"').replace(/[\u2018\u2019]/g, "'")
    .replace(/,\s*([}\]])/g, '$1');
  const candidates = [t, lenient];
  for (const c of candidates) {
    const start = c.indexOf('{');
    if (start < 0) continue;
    let depth = 0, inStr = false, escp = false;
    for (let i = start; i < c.length; i++) {
      const ch = c[i];
      if (inStr) { if (escp) escp = false; else if (ch === '\\') escp = true; else if (ch === '"') inStr = false; continue; }
      if (ch === '"') inStr = true;
      else if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (!depth) {
          try { return JSON.parse(c.slice(start, i + 1)); } catch { break; }
        }
      }
    }
  }
  throw new Error('yanıtta geçerli JSON yok');
}

// ---------------- model durum yönetimi ----------------

async function loadState(col) {
  const docs = await col.find({}).toArray();
  const st = new Map();
  for (const d of docs) st.set(d.model, d);
  return st;
}
function modelAvailable(st, model) {
  const s = st.get(model);
  return !s || !s.cooldownUntil || s.cooldownUntil <= new Date();
}
function pickModels(models, st) {
  const avail = models.filter(m => modelAvailable(st, m.id));
  // 优先：少失败 → 真 ':free' 模型 → 长上下文
  avail.sort((a, b) => {
    const sa = st.get(a.id), sb = st.get(b.id);
    const fa = sa ? sa.failures : 0, fb = sb ? sb.failures : 0;
    if (fa !== fb) return fa - fb;
    if (!!a.free !== !!b.free) return a.free ? -1 : 1;
    return b.context - a.context;
  });
  return avail;
}

// 一次性绕过的永久问题（无配额、代理限制、模型不存在）：冷却 7 天。
function isPermanentError(msg) {
  return /agentic harnesses|Insufficient credits|purchase more|not a valid model|does not exist|No endpoints found/i.test(String(msg));
}

async function recordFailure(col, st, model, error) {
  const s = st.get(model) || { model, failures: 0, okCount: 0 };
  s.failures = (s.failures || 0) + 1;
  const permanent = isPermanentError(error);
  // 渐进冷却：30 分钟×错误次数，最多 24 小时；永久错误 7 天。
  const coolMs = permanent
    ? 7 * 24 * 3600 * 1000
    : Math.min(30 * 60 * 1000 * s.failures, 24 * 3600 * 1000);
  s.cooldownUntil = new Date(Date.now() + coolMs);
  s.lastError = String(error).slice(0, 300);
  s.lastErrorAt = new Date();
  st.set(model, s);
  await col.updateOne({ model }, { $set: s }, { upsert: true });
}
async function recordSuccess(col, st, model) {
  const s = st.get(model) || { model, failures: 0, okCount: 0 };
  s.okCount = (s.okCount || 0) + 1;
  s.failures = 0;
  s.cooldownUntil = null;
  s.lastOkAt = new Date();
  st.set(model, s);
  await col.updateOne({ model }, { $set: s }, { upsert: true });
}

// ---------------- 生成 ----------------

const SITE_CONTEXT = `Site: HobbyMice (hobbymice.com.tr) — Türkiye'nin Transformice tabanlı ücretsiz tarayıcı fare oyunu sunucusu (sürüm 1.889).
Oyuncular tarayıcıda (Ruffle) veya Windows launcher ile oynar. Modlar: vanilla, survivor, racing, bootcamp, defilante, lua modülleri, harita editörü, şaman mekaniği, kabile sistemi.
Site özellikleri: forum, blog, oyuncu sıralaması. Hedef kitle: Türkçe konuşan Transformice/hayran oyun oyuncuları.`;

async function proposeTopics(model, existingTitles, count = 5) {
  const existing = existingTitles.slice(0, 80).map(t => `- ${t}`).join('\n');
  const sys = `Sen bir oyun sitesi için SEO içerik stratejistisin. Sadece JSON döndür.`;
  const user = `${SITE_CONTEXT}

Sitede YAYINLANMIŞ olan konular (bunlara ÇOK BENZEYEN veya aynı konuları ASLA önerme):
${existing || '(henüz yazı yok)'}

Bugünün tarihi: ${new Date().toLocaleDateString('tr-TR')}. ${new Date().getFullYear()} yılındasın.

Görev: Sitenin blogu için ${count} adet YENİ, özgün blog yazı konusu öner.
Konular şunlardan biri olabilir: oyun rehberleri (şaman taktikleri, mod stratejileri), harita/editör ipuçları, topluluk/etkinlik fikirleri, oyun tarihi ve kültürü, SEO'su yüksek arama konuları ("transformice nasıl oynanır" gibi), güncel oyuncu ilgi alanları.
KURALLAR:
- Her konu yukarıdaki yayımlanmış listeyebenzerlik ölçüsüyle birbirinden ve mevcut yazılardan FARKLI olmalı.
- Konular Türkçe olmalı, arama motorlarında aranabilir ifadeler içermeli.
- Sadece şu JSON'u döndür: {"topics": ["konu 1", "konu 2", ...]}`;

  const r = await chat(KEY, model, [
    { role: 'system', content: sys },
    { role: 'user', content: user },
  ], { maxTokens: 800, temperature: 1.0, timeoutMs: 60000 });
  if (!r.ok) throw Object.assign(new Error(r.error), { retryable: r.retryable });
  const j = extractJSON(r.content);
  const topics = (j.topics || []).filter(t => typeof t === 'string' && t.trim().length > 8).map(t => t.trim());
  if (!topics.length) throw new Error('konu önerisi boş');
  return topics;
}

async function generateArticle(model, topic) {
  const sys = `Sen deneyimli bir Türkçe oyun blogu yazarısın. Yalnızca geçerli JSON döndürürsün, başka hiçbir metin yazmazsın.`;
  const user = `${SITE_CONTEXT}

Görev: "${topic}" konusu için kapsamlı bir blog yazısı yaz.
İstenen JSON biçimi:
{
  "title": "SEO dostu, dikkat çekici Türkçe başlık (55-70 karakter)",
  "slug": "kisa-cizgili-ingilizce-slug",
  "excerpt": "150-160 karakterlik özet",
  "tags": ["etiket1", "etiket2", ...3-5 adet Türkçe etiket],
  "emoji": "makaleyi temsil eden tek emoji",
  "content_html": "Makalenin TAM HTML gövdesi"
}

content_html KURALLARI:
- Sadece şu etiketler: <h2> <h3> <p> <ul> <ol> <li> <strong> <em> <a> <blockquote> <table> <tr> <td> <th>
- 900-1400 kelime; girişe, en az 3 <h2> bölüme ve sonuca sahip.
- HobbyMice sitesine ve /play, /forum, /blog, /siralama sayfalarına (https://hobbymice.com.tr/... tam adres) 2-4 iç bağlantı ekle.
- SEO: konuyle doğal biçimde ilgili anahtar kelimeler kullan (ör. "transformice", "hobbymice", "tarayıcıda oyna").
- Fazla ufak detaylara boğulma; akıcı, samimi, oyuncuya konuşan bir ton.`;

  const r = await chat(KEY, model, [
    { role: 'system', content: sys },
    { role: 'user', content: user },
  ], { maxTokens: 8000, temperature: 0.75, timeoutMs: 240000 });
  if (!r.ok) throw Object.assign(new Error(r.error), { retryable: r.retryable });
  const j = extractJSON(r.content);
  if (!j.title || !j.content_html) throw new Error('eksik alanlar (title/content_html)');
  const title = String(j.title).trim().slice(0, 120);
  const content = sanitizeHTML(j.content_html);
  if (content.replace(/<[^>]+>/g, '').length < 1200) throw new Error('içerik çok kısa');
  return {
    title,
    slug: slugify(j.slug || title),
    excerpt: String(j.excerpt || '').trim().slice(0, 200),
    tags: Array.isArray(j.tags) ? j.tags.map(t => String(t).trim()).filter(Boolean).slice(0, 5) : [],
    emoji: typeof j.emoji === 'string' && j.emoji.length <= 8 ? j.emoji : '🧀',
    content,
  };
}

async function uniqueSlug(posts, base) {
  let slug = base, i = 2;
  while (await posts.findOne({ slug })) slug = `${base}-${i++}`;
  return slug;
}

async function pingIndexNow(url) {
  const key = process.env.INDEXNOW_KEY || '';
  if (!key) return;
  try {
    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(SITE).host, key, keyLocation: `${SITE}/indexnow-${key}.txt`,
        urlList: [url],
      }),
      signal: AbortSignal.timeout(15000),
    });
  } catch (e) { /* bildirim başarısız olsa da yazı yayınlanmış sayılır */ }
}

// ---------------- ana akış ----------------

async function run({ dry = false } = {}) {
  await db.connect();
  const d = db.getDb();
  const posts = d.collection('blog_posts');
  const stateCol = d.collection('blog_state');
  const logCol = d.collection('blog_log');
  const log = (status, msg, extra = {}) =>
    logCol.insertOne({ ts: new Date(), status, msg: String(msg).slice(0, 500), ...extra });

  if (!KEY) { console.error('OPENROUTER_API_KEY yok'); await log('fail', 'OPENROUTER_API_KEY yok'); return { ok: false, error: 'OPENROUTER_API_KEY yok' }; }

  console.log('[1/5] Ücretsiz modeller alınıyor...');
  let models;
  try { models = await listFreeModels(KEY); }
  catch (e) { console.error('model listesi alınamadı:', e.message); await log('fail', 'model listesi: ' + e.message); return { ok: false, error: 'model listesi: ' + e.message }; }
  if (!models.length) { console.error('ücretsiz model bulunamadı'); await log('fail', 'ücretsiz model yok'); return { ok: false, error: 'ücretsiz model yok' }; }
  console.log(`      ${models.length} ücretsiz model var.`);

  const st = await loadState(stateCol);
  const queue = pickModels(models, st);
  if (!queue.length) { console.error('tüm modeller soğumada'); await log('fail', 'tüm modeller soğumada'); return { ok: false, error: 'tüm modeller soğumada' }; }

  // Mevcut başlıklar: yayınlanmış yazılar + son 30 günlük üretilmiş konular
  const existingTitles = (await posts.find({ status: 'published' }, { projection: { title: 1 } }).toArray()).map(p => p.title);
  const recentTopics = await logCol.find({
    ts: { $gte: new Date(Date.now() - 30 * 86400 * 1000) }, topic: { $exists: true },
  }, { projection: { topic: 1 } }).toArray();
  existingTitles.push(...recentTopics.map(l => l.topic));

  let usedModel = null;
  let article = null, chosenTopic = null;

  for (const m of queue.slice(0, 10)) {
    usedModel = m.id;
    console.log(`[2/5] Konu önerisi isteniyor (${m.id})...`);
    try {
      let topics = null, lastErr = null;
      // JSON 解析失败时同模型重试一次（模型有时会输出 "..." 占位）
      for (let attempt = 0; attempt < 2 && !topics; attempt++) {
        try { topics = await proposeTopics(m.id, existingTitles); }
        catch (e) {
          lastErr = e;
          if (!/JSON/i.test(String(e.message))) throw e;
        }
      }
      if (!topics) throw lastErr;
      let scored = topics.map(t => ({ t, sim: maxSimilarity(t, existingTitles) }))
        .sort((a, b) => a.sim - b.sim);
      let best = scored[0];
      if (best.sim >= SIMILARITY_LIMIT) {
        console.log(`      en iyi aday bile benzer (sim=${best.sim.toFixed(2)}), yeni tur isteniyor...`);
        topics = await proposeTopics(m.id, existingTitles.concat(topics));
        scored = topics.map(t => ({ t, sim: maxSimilarity(t, existingTitles) })).sort((a, b) => a.sim - b.sim);
        best = scored[0];
      }
      chosenTopic = best.t;
      console.log(`      konu: "${chosenTopic}" (benzerlik ${best.sim.toFixed(2)})`);
      await log('info', `konu seçildi: ${chosenTopic}`, { topic: chosenTopic, model: m.id });

      console.log(`[3/5] Makale üretiliyor (${m.id})...`);
      article = await generateArticle(m.id, chosenTopic);
      await recordSuccess(stateCol, st, m.id);
      break;
    } catch (e) {
      console.error(`      ${m.id} başarısız: ${e.message}`);
      await recordFailure(stateCol, st, m.id, e.message);
      await log('fail', `${m.id}: ${e.message}`, { model: m.id });
      usedModel = null;
      continue;
    }
  }

  if (!article) {
    console.error('[!] Hiçbir model işi tamamlayamadı.');
    await log('fail', 'tüm denemeler başarısız');
    return { ok: false, error: 'tüm denemeler başarısız' };
  }

  if (dry) {
    console.log('[dry] Yazı üretilmedi, içerik önizleme:');
    console.log('Başlık:', article.title);
    console.log('Slug:', article.slug, '| Etiketler:', article.tags.join(', '));
    console.log('Uzunluk:', article.content.length, 'bayt');
    return { ok: true, dry: true, title: article.title, slug: article.slug };
  }

  console.log('[4/5] Yayınlanıyor...');
  const now = new Date();
  const doc = {
    title: article.title,
    slug: await uniqueSlug(posts, article.slug),
    excerpt: article.excerpt,
    emoji: article.emoji,
    tags: article.tags,
    content: article.content,
    author: 'HobbyMice Bot',
    source: 'ai',
    model: usedModel,
    topic: chosenTopic,
    status: 'published',
    publishedAt: now,
    updatedAt: now,
    views: 0,
  };
  const r = await posts.insertOne(doc);
  const url = `${SITE}/blog/${doc.slug}`;
  console.log(`      yazı: ${url}`);
  await log('ok', `yayınlandı: ${article.title}`, { topic: chosenTopic, model: usedModel, slug: doc.slug, postId: String(r.insertedId) });

  console.log('[5/5] Arama motorlarına bildiriliyor (IndexNow)...');
  await pingIndexNow(url);
  console.log('Tamamlandı.');
  return { ok: true, title: article.title, slug: doc.slug, model: usedModel };
}

async function showStatus() {
  await db.connect();
  const d = db.getDb();
  const st = await loadState(d.collection('blog_state'));
  const models = KEY ? await listFreeModels(KEY) : [];
  console.log(`Ücretsiz model sayısı: ${models.length}`);
  for (const m of models.slice(0, 40)) {
    const s = st.get(m.id);
    const cool = s && s.cooldownUntil && s.cooldownUntil > new Date()
      ? ` [soğuma ${new Date(s.cooldownUntil).toLocaleString('tr-TR')}]` : '';
    const stat = s ? ` ok=${s.okCount || 0} fail=${s.failures || 0}${cool}` : '';
    console.log(`  ${m.id} (ctx ${m.context})${stat}`);
  }
  const logs = await d.collection('blog_log').find({}).sort({ ts: -1 }).limit(10).toArray();
  console.log('\nSon işlemler:');
  for (const l of logs) console.log(`  ${new Date(l.ts).toLocaleString('tr-TR')} [${l.status}] ${l.msg}`);
}

// CLI 入口：直接运行时（systemd timer / 手动）。作为模块 require 时仅导出函数。
if (require.main === module) {
  const dry = process.argv.includes('--dry');
  const status = process.argv.includes('--status');
  (async () => {
    try {
      if (status) await showStatus();
      else {
        const r = await run({ dry });
        if (!r || !r.ok) process.exitCode = 1;
      }
    } catch (e) {
      console.error('Beklenmeyen hata:', e);
      process.exitCode = 1;
    } finally {
      await db.close().catch(() => {});
    }
  })();
}

module.exports = { run, showStatus };
