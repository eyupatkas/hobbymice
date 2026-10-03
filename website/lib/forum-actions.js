'use server';
// 论坛全部写操作（Server Actions）。
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';
import { getDb } from './db';
import { getUser, audit } from './session';
import { FORUM_CATS, canModerate, isOwnerOf, parseId } from './site-data';
import { slugify } from './util';

async function requireUser() {
  const user = await getUser();
  if (!user) redirect('/giris?geri=%2Fforum');
  return user;
}

function oid(idStr) {
  try { return new ObjectId(idStr); } catch { return null; }
}

async function loadTopic(idStr) {
  const _id = oid(idStr);
  if (!_id) return null;
  return getDb().collection('forum_topics').findOne({ _id }) || null;
}

export async function createTopic(formData) {
  const user = await requireUser();
  const title = String(formData.get('title') || '').trim().slice(0, 120);
  const body = String(formData.get('body') || '').trim().slice(0, 8000);
  const category = FORUM_CATS.includes(formData.get('category')) ? formData.get('category') : 'Genel Sohbet';
  if (title.length < 4 || body.length < 5) redirect('/forum/yeni');
  const now = new Date();
  const slug = slugify(title);
  const r = await getDb().collection('forum_topics').insertOne({
    title, slug, category, body,
    author: user.playerName, authorId: user.accountId,
    createdAt: now, updatedAt: now, lastActivity: now,
    replies: 0, views: 0, pinned: false, locked: false, status: 'open',
  });
  audit(user.playerName, 'forum.konu-ac', String(r.insertedId), title);
  revalidatePath('/forum');
  redirect(`/forum/konu/${r.insertedId}-${slug}`);
}

export async function replyTopic(formData) {
  const user = await requireUser();
  const idStr = parseId(formData.get('id'));
  if (!idStr) redirect('/forum');
  const t = await loadTopic(idStr);
  if (!t || t.status === 'deleted') redirect('/forum');
  if (t.locked && !canModerate(user)) redirect(`/forum/konu/${t._id}-${t.slug}`);
  const body = String(formData.get('body') || '').trim().slice(0, 8000);
  if (body.length < 2) redirect(`/forum/konu/${t._id}-${t.slug}`);
  const now = new Date();
  await getDb().collection('forum_posts').insertOne({
    topicId: t._id, body, author: user.playerName, authorId: user.accountId, createdAt: now, updatedAt: now,
  });
  await getDb().collection('forum_topics').updateOne(
    { _id: t._id }, { $set: { lastActivity: now }, $inc: { replies: 1 } });
  revalidatePath(`/forum/konu/${t._id}-${t.slug}`);
  redirect(`/forum/konu/${t._id}-${t.slug}`);
}

export async function editTopic(formData) {
  const user = await requireUser();
  const idStr = parseId(formData.get('id'));
  if (!idStr) redirect('/forum');
  const t = await loadTopic(idStr);
  if (!t || t.status === 'deleted') redirect('/forum');
  if (!canModerate(user) && !isOwnerOf(user, t)) redirect(`/forum/konu/${t._id}-${t.slug}`);
  const title = String(formData.get('title') || '').trim().slice(0, 120);
  const body = String(formData.get('body') || '').trim().slice(0, 8000);
  const category = FORUM_CATS.includes(formData.get('category')) ? formData.get('category') : (t.category || 'Genel Sohbet');
  if (title.length < 4 || body.length < 5) redirect(`/forum/konu/${t._id}/duzenle`);
  const slug = slugify(title);
  await getDb().collection('forum_topics').updateOne(
    { _id: t._id },
    { $set: { title, body, category, slug, updatedAt: new Date() } });
  audit(user.playerName, 'forum.konu-duzenle', String(t._id), title);
  revalidatePath('/forum');
  redirect(`/forum/konu/${t._id}-${slug}`);
}

export async function deleteTopic(formData) {
  const user = await requireUser();
  const idStr = parseId(formData.get('id'));
  if (!idStr) redirect('/forum');
  const t = await loadTopic(idStr);
  if (!t) redirect('/forum');
  if (!canModerate(user) && !isOwnerOf(user, t)) redirect(`/forum/konu/${t._id}-${t.slug}`);
  await getDb().collection('forum_topics').updateOne({ _id: t._id }, { $set: { status: 'deleted', pinned: false } });
  await getDb().collection('forum_posts').deleteMany({ topicId: t._id });
  audit(user.playerName, 'forum.konu-sil', String(t._id), t.title);
  revalidatePath('/forum');
  redirect('/forum');
}

export async function togglePin(formData) {
  const user = await requireUser();
  if (!canModerate(user)) redirect('/forum');
  const t = await loadTopic(parseId(formData.get('id')));
  if (!t) redirect('/forum');
  await getDb().collection('forum_topics').updateOne({ _id: t._id }, { $set: { pinned: !t.pinned } });
  audit(user.playerName, 'forum.konu-sabit', String(t._id), t.title);
  revalidatePath('/forum');
  redirect(`/forum/konu/${t._id}-${t.slug}`);
}

export async function toggleLock(formData) {
  const user = await requireUser();
  if (!canModerate(user)) redirect('/forum');
  const t = await loadTopic(parseId(formData.get('id')));
  if (!t) redirect('/forum');
  await getDb().collection('forum_topics').updateOne({ _id: t._id }, { $set: { locked: !t.locked } });
  audit(user.playerName, 'forum.konu-kilit', String(t._id), t.title);
  revalidatePath('/forum');
  redirect(`/forum/konu/${t._id}-${t.slug}`);
}

async function loadEditablePost(idStr, user) {
  const _id = oid(idStr);
  if (!_id) { redirect('/forum'); }
  const p = await getDb().collection('forum_posts').findOne({ _id });
  if (!p) { redirect('/forum'); }
  if (!canModerate(user) && !isOwnerOf(user, p)) redirect(`/forum/konu/${p.topicId}`);
  return p;
}

export async function editPost(formData) {
  const user = await requireUser();
  const p = await loadEditablePost(parseId(formData.get('id')), user);
  const body = String(formData.get('body') || '').trim().slice(0, 8000);
  if (body.length < 2) redirect(`/forum/mesaj/${p._id}/duzenle`);
  await getDb().collection('forum_posts').updateOne({ _id: p._id }, { $set: { body, updatedAt: new Date() } });
  audit(user.playerName, 'forum.mesaj-duzenle', String(p._id), '');
  redirect(`/forum/konu/${p.topicId}`);
}

export async function deletePost(formData) {
  const user = await requireUser();
  const p = await loadEditablePost(parseId(formData.get('id')), user);
  await getDb().collection('forum_posts').deleteOne({ _id: p._id });
  await getDb().collection('forum_topics').updateOne({ _id: p.topicId }, { $inc: { replies: -1 } });
  audit(user.playerName, 'forum.mesaj-sil', String(p._id), '');
  redirect(`/forum/konu/${p.topicId}`);
}
