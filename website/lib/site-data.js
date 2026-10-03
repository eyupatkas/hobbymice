'use strict';
// 领域数据：论坛分类 / 排行榜定义 / 权限助手。
const CAT_INFO = {
  'Duyurular': { emoji: '📢', desc: 'Sunucu duyuruları, güncellemeler ve bakım bilgileri.' },
  'Genel Sohbet': { emoji: '💬', desc: 'Oyun ve her şey üzerine serbest sohbet.' },
  'Rehberler': { emoji: '📖', desc: 'Oyuncuların hazırladığı ipuçları ve kılavuzlar.' },
  'Şaman Akademisi': { emoji: '🧙', desc: 'Şaman taktikleri, zor haritalar ve kurtarma sırları.' },
  'Harita Editörü': { emoji: '🗺️', desc: 'Harita yapımı, editör ipuçları ve harita tanıtımları.' },
  'Mod Odaları': { emoji: '🏁', desc: 'Survivor, Racing, Bootcamp ve Defilante taktikleri.' },
  'Etkinlikler': { emoji: '🎉', desc: 'Topluluk etkinlikleri ve turnuvalar.' },
  'Kabile İlanları': { emoji: '🏠', desc: 'Kabile arayanlar ve kabile ilanları.' },
  'Tanışma': { emoji: '👋', desc: 'Yeni mısın? Gel, kendini tanıt!' },
  'Öneriler': { emoji: '💡', desc: 'Sunucu için fikir ve önerileriniz.' },
  'Hata Bildirimi': { emoji: '🐛', desc: 'Hataları bildirin, çabuk düzeltelim.' },
};
const FORUM_CATS = Object.keys(CAT_INFO);
const catInfo = label => CAT_INFO[label] || { emoji: '💬', desc: '' };

const LB_DEFS = {
  peynir: { field: 'cheeseCount', label: 'Peynir', emoji: '🧀', desc: 'Toplam götürülen peynir sayısı. Oyundaki ana ilerleme göstergesi — her delikten çıkan peynir bir adım daha yaklaştırır.' },
  first: { field: 'firstCount', label: 'First', emoji: '🥇', desc: 'Haritaya ilk giren fare olma sayısı. Hız ve refleks ödülü — haritayı okuyan ilk isen first senindir.' },
  bootcamp: { field: 'bootcampCount', label: 'Bootcamp', emoji: '🏁', desc: 'Tamamlanan bootcamp eğitimleri. Zorlu parkurlarda sabır ve ustalık ister.' },
  kurtarma: { field: 'normalSaves', label: 'Kurtarma', emoji: '🐭', desc: 'Şaman olarak normal modda deliğe ulaştırılan fare sayısı. Gerçek şamanlık budur.' },
  zor: { field: 'hardSaves', label: 'Zor Kurtarma', emoji: '💪', desc: 'Hard modda kurtarılan fare sayısı. Usta şamanların oyun alanı — tek can, tek şans.' },
};

function canModerate(user) { return !!(user && user.staff); }
function isOwnerOf(user, doc) { return !!(user && doc && String(user.accountId) === String(doc.authorId)); }
function topicUrl(t) { return `/forum/konu/${t._id}-${t.slug}`; }

// 记录 ID：严格 24 位十六进制（URL 中可带 -slug 后缀）
function parseId(v) {
  const s = String(v == null ? '' : v);
  if (s.length < 24) return null;
  const head = s.slice(0, 24);
  const rest = s.slice(24);
  if (rest !== '' && rest[0] !== '-') return null;
  for (let i = 0; i < 24; i++) {
    const ch = head[i];
    const okHex = (ch >= '0' && ch <= '9') || (ch >= 'a' && ch <= 'f');
    if (!okHex) return null;
  }
  return head;
}

module.exports = { CAT_INFO, FORUM_CATS, catInfo, LB_DEFS, canModerate, isOwnerOf, topicUrl, parseId };
