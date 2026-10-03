'use strict';
// 通用工具：slug、格式化、轻量标记、摘要。供页面组件与 blogbot 共用。

const SITE = process.env.SITE_URL || 'https://hobbymice.com.tr';

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function slugify(s) {
  const map = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u' };
  return String(s).trim().toLowerCase()
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, ch => map[ch] || ch)
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'konu';
}

function fmtDate(d) {
  if (!d) return '';
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}
function fmtDateTime(d) {
  if (!d) return '';
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toLocaleString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function timeAgo(d) {
  const dt = d instanceof Date ? d : new Date(d);
  const s = Math.max(1, (Date.now() - dt.getTime()) / 1000);
  if (s < 60) return 'az önce';
  if (s < 3600) return Math.floor(s / 60) + ' dk önce';
  if (s < 86400) return Math.floor(s / 3600) + ' sa önce';
  if (s < 2592000) return Math.floor(s / 86400) + ' gün önce';
  return fmtDate(dt);
}
function nf(n) { return Number(n || 0).toLocaleString('tr-TR'); }

// 论坛轻量标记：先转义再叠加 [b][i][u][quote] 与 URL。返回安全 HTML 字符串，
// 仅可与 dangerouslySetInnerHTML 一起使用。
function liteMarkup(text) {
  let t = esc(text);
  t = t.replace(/\[(b|i|u)\]([\s\S]*?)\[\/\1\]/gi, (m, tag, inner) => `<${tag}>${inner}</${tag}>`);
  t = t.replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, (m, inner) => `<blockquote>${inner.trim()}</blockquote>`);
  t = t.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" rel="nofollow noopener" target="_blank">$1</a>');
  t = t.replace(/\n/g, '<br>');
  return t;
}

function excerpt(text, len = 160) {
  const t = String(text || '').replace(/\[[^\]]*\]/g, ' ').replace(/\s+/g, ' ').trim();
  return t.length > len ? t.slice(0, len - 1).trimEnd() + '…' : t;
}

function readingTime(htmlContent) {
  const words = String(htmlContent || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

// 内部跳转地址校验（拒绝 //、\、..）
function safePath(p) {
  return typeof p === 'string' && p.startsWith('/') && !p.startsWith('//') && !p.includes('\\') && !p.includes('..') ? p : '/';
}

// 搜索用安全 regex（转义特殊字符）
function safeContainsRegex(q) {
  return new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
}

function toInt(v, d = 0) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
}

module.exports = { SITE, esc, slugify, fmtDate, fmtDateTime, timeAgo, nf, liteMarkup, excerpt, readingTime, safePath, safeContainsRegex, toInt };
