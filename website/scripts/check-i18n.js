'use strict';
// i18n zorunluluk kapisi: build oncesi calisir, tek eksik ceviri bile
// build'i dusurur ("npm run build" bu scripti once kosar).
const { validateTranslations } = require('../lib/i18n');

try {
  const summary = validateTranslations();
  console.log(`i18n OK: ${summary.keys} anahtar x ${summary.langs} dil — eksik yok`);
} catch (err) {
  console.error('\ni18n HATASI: ' + err.message);
  console.error('Tum dilleri tamamla (lib/i18n.js) ve tekrar dene.\n');
  process.exit(1);
}
