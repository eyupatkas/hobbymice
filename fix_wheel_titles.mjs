// Carkifelek + haftalik yarisma ozel unvanlari (T_626, T_627) 4 dile eklenir.
// Mevcut satir YOKSA T_625 satirinin ardina eklenir (id'ler sunucu grantCustomTitle ile eslesir).
import zlib from 'node:zlib';
import fs from 'node:fs';

const TITLES = {
  tr: {
    626: '<J>★ Şampiyon Fare ★</J>',
    627: '<VP>★ Şanslı Fare ★</VP>',
  },
  en: {
    626: '<J>★ Weekly Champion ★</J>',
    627: '<VP>★ Lucky Mouse ★</VP>',
  },
  fr: {
    626: '<J>★ Champion de la Semaine ★</J>',
    627: '<VP>★ Souris Chanceuse ★</VP>',
  },
  es: {
    626: '<J>★ Campeón Semanal ★</J>',
    627: '<VP>★ Ratón Afortunado ★</VP>',
  },
};

for (const lang of Object.keys(TITLES)) {
  const path = `/var/www/hobbymice/res/langues/tfm-${lang}.gz`;
  let text = zlib.inflateSync(fs.readFileSync(path)).toString('utf8');
  let changed = 0;
  for (const [id, name] of Object.entries(TITLES[lang])) {
    const key = `T_${id}=`;
    const re = new RegExp('(^|\\n)-?' + key + '[^\\n-]*');
    if (re.test(text)) {
      text = text.replace(re, (m, pre) => pre + key + name);
      changed++;
    } else {
      const anchor = text.search(/(^|\n)-?T_625=[^\n-]*/);
      if (anchor < 0) {
        text += `\n${key}${name}`;
      } else {
        const lineEnd = text.indexOf('\n', anchor + 1);
        const at = lineEnd < 0 ? text.length : lineEnd;
        text = text.slice(0, at) + `\n${key}${name}` + text.slice(at);
      }
      changed++;
    }
  }
  fs.writeFileSync(path, zlib.deflateSync(Buffer.from(text, 'utf8'), { level: 9 }));
  console.log(lang + ': ' + changed + ' unvan yazildi (T_626/T_627)');
}
