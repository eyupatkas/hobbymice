// tfm-tr.gz dil dosyasını düzenler: mevcut unvanları renklendirir ve
// HobbyMice özel unvanlarını (T_619+) ekler. Çıktı: local nginx dizini.
// Geri alma: orijinal proxied dosya nginx'te duruyor; local dosyayı silmek yeterli.
import zlib from 'node:zlib';
import fs from 'node:fs';

const SRC = '/tmp/tfm-tr.gz';
const OUT = '/var/www/hobbymice/res/langues/tfm-tr.gz';
const BACKUP = '/root/projects/transformice/.backups/2026-10-03-1400/tfm-tr-original.gz';
fs.copyFileSync(SRC, BACKUP);

let text = zlib.inflateSync(fs.readFileSync(SRC)).toString('utf8');

// --- 1) Mevcut unvanları renklendir (satır bazlı birebir değişim) ---
const RECOLORS = {
  T_0: '<N>Minik Fare</N>',
  T_5: '<CH>Açgözlü Fare</CH>',
  T_6: '<J>Peyniri Buldum!</J>',
  T_7: '<J>Evet Peynir! ^-^</J>',
  T_8: '<VP>Peynirrrrr!</VP>',
  T_9: '<VP>Hızlı Fare</VP>',
  T_10: '<J>Çevik Fare</J>',
  T_11: '<R>Korsan Fare</R>',
  T_12: '<VI>Ninja Fare</VI>',
};
for (const [key, value] of Object.entries(RECOLORS)) {
  const re = new RegExp('(^|\\n)-?' + key + '=[^\\n-]*');
  if (!re.test(text)) {
    console.error('UYARI: bulunamadı:', key);
    continue;
  }
  text = text.replace(re, (m, pre) => pre + key + '=' + value);
}

// --- 2) HobbyMice özel unvanları (sunucu bu id'leri eşiklerde verir) ---
const CUSTOM = {
  T_619: '<J>Peynir Avcısı</J>',   // 100 peynir
  T_620: '<VP>First Ustası</VP>',  // 10 first
  T_621: '<R>Gece Nöbeti</R>',     // günlük seri 3
  T_622: '<CH>Sadık Fare</CH>',    // günlük seri 7
  T_623: '<J>Kurucu Kadro</J>',    // 30+ gün üye
  T_624: '<VI>HobbyMice Efsanesi</VI>', // 1000 peynir
};
for (const [key, value] of Object.entries(CUSTOM)) {
  if (new RegExp('(^|\\n)-?' + key + '=').test(text)) {
    console.error('UYARI: id zaten var, atlandı:', key);
    continue;
  }
  text = text + '\n-\n' + key + '=' + value;
}

// --- 3) Aynı sıkıştırma biçimiyle yaz (zlib deflate) ---
const out = zlib.deflateSync(Buffer.from(text, 'utf8'), { level: 9 });
fs.mkdirSync('/var/www/hobbymice/res/langues', { recursive: true });
fs.writeFileSync(OUT, out);

// doğrulama: geri açıp kontrol
const verify = zlib.inflateSync(fs.readFileSync(OUT)).toString('utf8');
console.log('yazıldı:', OUT, out.length, 'bayt | doğrulama T_619:', verify.includes('T_619=<J>Peynir Avcısı</J>'), '| T_0:', verify.includes('T_0=<N>Minik Fare</N>'));
