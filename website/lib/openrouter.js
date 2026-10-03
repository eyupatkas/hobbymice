'use strict';
// OpenRouter 客户端：免费模型发现 + 对话补全。端点固定，密钥走环境变量。
const BASE = 'https://openrouter.ai/api/v1';

function headers(key) {
  return {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.SITE_URL || 'https://hobbymice.com.tr',
    'X-Title': 'HobbyMice Blog Bot',
  };
}

// 免费模型：id 以 ':free' 结尾，或 prompt/completion 计价为 0；仅保留文本输出模型。
async function listFreeModels(key) {
  const r = await fetch(`${BASE}/models`, { headers: headers(key), signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`models HTTP ${r.status}`);
  const j = await r.json();
  const free = (j.data || []).filter(m => {
    const id = m.id || '';
    const isFree = id.endsWith(':free') ||
      (String((m.pricing || {}).prompt) === '0' && String((m.pricing || {}).completion) === '0');
    if (!isFree) return false;
    const out = ((m.architecture || {}).output_modality) || ['text'];
    return out.includes('text');
  }).map(m => ({
    id: m.id,
    context: m.context_length || 0,
    name: m.name || m.id,
    free: (m.id || '').endsWith(':free'),
  }));
  free.sort((a, b) => b.context - a.context);
  return free;
}

// 单次对话补全；返回 {ok, content} | {ok:false, retryable, code, error}
async function chat(key, model, messages, { maxTokens = 4000, temperature = 0.8, timeoutMs = 180000 } = {}) {
  try {
    const r = await fetch(`${BASE}/chat/completions`, {
      method: 'POST',
      headers: headers(key),
      body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const text = await r.text();
    let j = null;
    try { j = JSON.parse(text); } catch { /* non-json */ }
    if (!r.ok) {
      const msg = (j && j.error && (j.error.message || j.error.code)) || text.slice(0, 200) || `HTTP ${r.status}`;
      const retryable = r.status === 429 || r.status === 402 || r.status === 408 || r.status >= 500;
      return { ok: false, retryable, code: r.status, error: String(msg).slice(0, 300) };
    }
    const choice = j && j.choices && j.choices[0];
    const content = choice && choice.message && choice.message.content;
    if (!content) return { ok: false, retryable: true, code: r.status, error: '空响应' };
    return { ok: true, content };
  } catch (e) {
    const retryable = e.name === 'TimeoutError' || e.name === 'AbortError' || /network|fetch failed|ECONN/i.test(String(e));
    return { ok: false, retryable, code: 0, error: String(e.message || e).slice(0, 300) };
  }
}

module.exports = { listFreeModels, chat };
