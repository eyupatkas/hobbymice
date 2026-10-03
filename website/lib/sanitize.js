'use strict';
// HTML 清洗白名单（AI 生成与管理员输入共用）。
const { esc } = require('./util');

function sanitizeHTML(html) {
  let t = String(html || '');
  t = t.replace(/<\s*(script|style|iframe|object|embed|form|input|link|meta)[\s\S]*?(<\/\s*\1\s*>|>)/gi, '');
  t = t.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  t = t.replace(/(href|src)\s*=\s*("|')\s*(javascript|data|vbscript):[^"']*\2/gi, '$1="#"');
  const allowed = new Set(['H2','H3','H4','P','UL','OL','LI','STRONG','EM','B','I','U','A','BLOCKQUOTE','CODE','PRE','BR','HR','TABLE','THEAD','TBODY','TR','TD','TH','SPAN','DIV']);
  t = t.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^>]*)?)\/?>/g, (m, tag) => {
    if (!allowed.has(tag.toUpperCase())) return '';
    if (m.startsWith('</')) return `</${tag.toLowerCase()}>`;
    if (tag.toUpperCase() === 'A') {
      const href = /\shref\s*=\s*("([^"]*)"|'([^']*)')/i.exec(m);
      const u = href ? (href[2] || href[3] || '') : '';
      const safe = /^https?:\/\//i.test(u) ? u : '#';
      return `<a href="${esc(safe)}" rel="noopener">`;
    }
    return `<${tag.toLowerCase()}>`;
  });
  return t.slice(0, 12000);
}

module.exports = { sanitizeHTML };
