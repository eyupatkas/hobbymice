'use server';
// 管理端写操作（Server Actions）：玩家编辑/改密/删除、博客 CRUD、bot 触发。
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';
import { getDb } from './db';
import { getUser, gamePasswordHash, audit, STAFF_ROLES } from './session';
import { PLAYER_FIELDS } from './player-fields';
import { sanitizeHTML } from './sanitize';
import { slugify, toInt } from './util';

let botRunning = false;

async function requireAdmin() {
  const user = await getUser();
  if (!user) redirect('/giris?geri=%2Fadmin');
  if (!user.staff) redirect('/');
  return user;
}

function oid(idStr) {
  try { return new ObjectId(String(idStr)); } catch { return null; }
}

// ---------------- 玩家 ----------------

export async function savePlayer(formData) {
  const user = await requireAdmin();
  const id = formData.get('id');
  const accId = Number.parseInt(id, 10);
  if (!Number.isFinite(accId)) redirect('/admin/oyuncular');
  const d = getDb();
  const acc = await d.collection('accounts').findOne({ _id: accId });
  if (!acc) redirect('/admin/oyuncular');

  const set = {};
  for (const g of PLAYER_FIELDS) for (const f of g.fields) {
    if (f.t === 'roles') {
      const roles = STAFF_ROLES.filter(r => formData.get(`role_${r}`) === 'on');
      if (JSON.stringify(roles) !== JSON.stringify(Array.isArray(acc.staffRoles) ? acc.staffRoles : [])) set.staffRoles = roles;
      continue;
    }
    const v = formData.get(`f_${f.k}`);
    if (v == null) continue;
    if (f.t === 'bool') {
      const b = v === 'on';
      if (!!acc[f.k] !== b) set[f.k] = b;
    } else if (f.t === 'int') {
      const n = parseInt(v, 10);
      if (Number.isFinite(n) && n !== acc[f.k]) set[f.k] = n;
    } else if (f.t === 'float') {
      const n = parseFloat(v);
      if (Number.isFinite(n) && n !== acc[f.k]) set[f.k] = n;
    } else if (f.t === 'intlist') {
      const arr = String(v).split(',').map(s => toInt(s.trim(), 0));
      const cur = Array.isArray(acc[f.k]) ? acc[f.k] : [];
      if (JSON.stringify(arr) !== JSON.stringify(cur)) set[f.k] = arr;
    } else {
      const s = String(v).slice(0, 200);
      if (s !== String(acc[f.k] == null ? '' : acc[f.k])) set[f.k] = s;
    }
  }
  if (Object.keys(set).length) {
    await d.collection('accounts').updateOne({ _id: acc._id }, { $set: set });
    audit(user.playerName, 'oyuncu-duzenle', acc.playerName, Object.keys(set).join(','));
  }
  revalidatePath(`/admin/oyuncular/${acc._id}`);
  redirect(`/admin/oyuncular/${acc._id}`);
}

export async function changePassword(formData) {
  const user = await requireAdmin();
  const accId = Number.parseInt(formData.get('id'), 10);
  const pw = String(formData.get('password') || '');
  if (!Number.isFinite(accId) || pw.length < 6) redirect('/admin/oyuncular');
  const d = getDb();
  const acc = await d.collection('accounts').findOne({ _id: accId });
  if (!acc) redirect('/admin/oyuncular');
  await d.collection('accounts').updateOne({ _id: acc._id }, { $set: { password: gamePasswordHash(pw) } });
  await d.collection('site_sessions').deleteMany({ accountId: acc._id });
  audit(user.playerName, 'oyuncu-sifre-degistir', acc.playerName, '');
  redirect(`/admin/oyuncular/${acc._id}`);
}

export async function deletePlayer(formData) {
  const user = await requireAdmin();
  const accId = Number.parseInt(formData.get('id'), 10);
  if (!Number.isFinite(accId)) redirect('/admin/oyuncular');
  const d = getDb();
  const acc = await d.collection('accounts').findOne({ _id: accId });
  if (!acc) redirect('/admin/oyuncular');
  if (formData.get('onay') !== 'on') redirect(`/admin/oyuncular/${acc._id}`);
  await d.collection('accounts').deleteOne({ _id: acc._id });
  await d.collection('site_sessions').deleteMany({ accountId: acc._id });
  audit(user.playerName, 'oyuncu-sil', acc.playerName, 'HESAP SİLİNDİ');
  revalidatePath('/admin/oyuncular');
  redirect('/admin/oyuncular');
}

// ---------------- 博客 ----------------

export async function savePost(formData) {
  const user = await requireAdmin();
  const d = getDb();
  const idStr = String(formData.get('id') || '');
  const title = String(formData.get('title') || '').trim().slice(0, 120);
  if (title.length < 4) redirect(idStr ? '/admin/blog' : '/admin/blog/yeni');
  const doc = {
    title,
    slug: slugify(formData.get('slug') || title) || 'yazi',
    emoji: String(formData.get('emoji') || '🧀').slice(0, 8),
    tags: String(formData.get('tags') || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 6),
    excerpt: String(formData.get('excerpt') || '').trim().slice(0, 300),
    content: sanitizeHTML(formData.get('content')),
    status: formData.get('status') === 'draft' ? 'draft' : 'published',
    updatedAt: new Date(),
  };
  if (idStr && oid(idStr)) {
    await d.collection('blog_posts').updateOne({ _id: oid(idStr) }, { $set: doc });
    audit(user.playerName, 'blog-duzenle', title, '');
  } else {
    let slug = doc.slug, i = 2;
    while (await d.collection('blog_posts').findOne({ slug })) slug = `${doc.slug}-${i++}`;
    await d.collection('blog_posts').insertOne({
      ...doc, slug,
      author: user.playerName, source: 'manual',
      publishedAt: new Date(), views: 0,
    });
    audit(user.playerName, 'blog-ekle', title, slug);
  }
  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  redirect('/admin/blog');
}

export async function deletePost(formData) {
  const user = await requireAdmin();
  const _id = oid(formData.get('id'));
  if (!_id) redirect('/admin/blog');
  const p = await getDb().collection('blog_posts').findOne({ _id });
  if (p) {
    await getDb().collection('blog_posts').deleteOne({ _id });
    audit(user.playerName, 'blog-sil', p.title, '');
  }
  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  redirect('/admin/blog');
}

export async function triggerBot() {
  const user = await requireAdmin();
  if (!botRunning) {
    botRunning = true;
    console.log('blogbot: admin tetiklemesi ile başladı');
    import('../blogbot').then(m => m.run())
      .catch(e => console.error('blogbot hatası:', e))
      .finally(() => { botRunning = false; });
    audit(user.playerName, 'blog-bot-tetiklendi', 'süreç içi', '');
  }
  revalidatePath('/admin/blog/bot');
  redirect('/admin/blog/bot');
}
