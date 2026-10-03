'use strict';
// 玩家可编辑字段规格 — 与游戏 Account 集合逐字段对应。
// int 值为 Number 游戏侧为 Int64，Mongo 会自动匹配。

const PLAYER_FIELDS = [
  { group: 'Kimlik', fields: [
    { k: 'playerName', l: 'Oyuncu adı', t: 'str' },
    { k: 'emailAddress', l: 'E-posta', t: 'str' },
    { k: 'isVerifiedEmail', l: 'E-posta doğrulanmış', t: 'bool' },
    { k: 'playerGender', l: 'Cinsiyet (0/1/2)', t: 'int' },
    { k: 'avatarId', l: 'Avatar ID', t: 'int' },
    { k: 'vipTime', l: 'VIP bitiş (unix)', t: 'int' },
    { k: 'playedTime', l: 'Oyun süresi (sn)', t: 'int' },
  ]},
  { group: 'Yetkiler', fields: [
    { k: 'staffRoles', l: 'Yetki rolleri', t: 'roles' },
  ]},
  { group: 'İstatistikler', fields: [
    { k: 'cheeseCount', l: '🧀 Peynir', t: 'int' },
    { k: 'firstCount', l: '🥇 First', t: 'int' },
    { k: 'bootcampCount', l: '🏁 Bootcamp', t: 'int' },
    { k: 'normalSaves', l: 'Kurtarma (normal)', t: 'int' },
    { k: 'normalSavesNoSkills', l: 'Kurtarma (numarasız)', t: 'int' },
    { k: 'hardSaves', l: 'Kurtarma (zor)', t: 'int' },
    { k: 'hardSavesNoSkill', l: 'Kurtarma (zor, numarasız)', t: 'int' },
    { k: 'divineSaves', l: 'Kurtarma (ilahi)', t: 'int' },
    { k: 'divineSavesNoSkill', l: 'Kurtarma (ilahi, numarasız)', t: 'int' },
    { k: 'shamanCheeseCount', l: 'Şaman peyniri', t: 'int' },
    { k: 'shamanLevel', l: 'Şaman seviyesi', t: 'int' },
    { k: 'shamanLevelXp', l: 'Şaman XP', t: 'int' },
    { k: 'adventurePoints', l: 'Macera puanı', t: 'int' },
  ]},
  { group: 'Rekabet modları', fields: [
    { k: 'racingStats', l: 'Racing [virgülle: giriş,zafer,...]', t: 'intlist' },
    { k: 'survivorStats', l: 'Survivor [virgülle]', t: 'intlist' },
    { k: 'defilanteStats', l: 'Defilante [virgülle]', t: 'intlist' },
  ]},
  { group: 'Mağaza & görünüm', fields: [
    { k: 'shopCheeses', l: 'Mağaza peyniri', t: 'int' },
    { k: 'shopStrawberries', l: 'Çilek', t: 'int' },
    { k: 'mouseColor', l: 'Fare rengi (int)', t: 'int' },
    { k: 'shamanColor', l: 'Şaman rengi (int)', t: 'int' },
    { k: 'shamanType', l: 'Şaman tipi', t: 'int' },
    { k: 'currentTitle', l: 'Aktif unvan', t: 'float' },
    { k: 'mouseLook', l: 'Fare görünümü', t: 'str' },
    { k: 'shamanLook', l: 'Şaman görünümü', t: 'str' },
  ]},
];

// 游戏账号 _id 为计数器数字（1,2,3…）
function parseAccountId(v) {
  const s = String(v == null ? '' : v);
  let ok = s.length >= 1 && s.length <= 15;
  for (let i = 0; ok && i < s.length; i++) {
    const ch = s[i];
    if (ch < '0' || ch > '9') ok = false;
  }
  return ok ? Number(s) : null;
}

module.exports = { PLAYER_FIELDS, parseAccountId };
