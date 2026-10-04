// Market unvan adlari (T_115-126) tum dillerde farkli-lastirilir.
// Eski isimler erken unvanlarin kopyasiydi (Hos Fare ★★★ spam).
import zlib from 'node:zlib';
import fs from 'node:fs';

const NAMES = {
  tr: ['Alışverişkolik', 'Şık Fare', 'Koleksiyoner', 'Market Ustası', 'Modacı', 'Prestijli Fare', 'Zengin Fare', 'Kraliyet Müşteri', 'Market Efsanesi', 'Mağaza Kraliçesi', 'Platin Fare', 'Elmas Fare'],
  en: ['Shopper', 'Stylish Mouse', 'Collector', 'Shop Master', 'Fashionista', 'Prestigious Mouse', 'Wealthy Mouse', 'Royal Customer', 'Shop Legend', 'Store Queen', 'Platinum Mouse', 'Diamond Mouse'],
  fr: ['Client fidèle', 'Souris chic', 'Collectionneur', 'Maître du magasin', 'Fashion', 'Souris prestige', 'Souris riche', 'Client royal', 'Légende du magasin', 'Reine du magasin', 'Souris platine', 'Souris diamant'],
  es: ['Comprador', 'Ratón elegante', 'Coleccionista', 'Maestro de la tienda', 'Fashion', 'Ratón prestigioso', 'Ratón rico', 'Cliente real', 'Leyenda de la tienda', 'Reina de la tienda', 'Ratón platino', 'Ratón diamante'],
};

for (const lang of Object.keys(NAMES)) {
  const path = `/var/www/hobbymice/res/langues/tfm-${lang}.gz`;
  let text = zlib.inflateSync(fs.readFileSync(path)).toString('utf8');
  let changed = 0;
  NAMES[lang].forEach((name, i) => {
    const key = 'T_' + (115 + i) + '=';
    const re = new RegExp('(^|\\n)-?' + key + '[^\\n-]*');
    if (re.test(text)) {
      text = text.replace(re, (m, pre) => pre + key + name);
      changed++;
    }
  });
  fs.writeFileSync(path, zlib.deflateSync(Buffer.from(text, 'utf8'), { level: 9 }));
  console.log(lang + ': ' + changed + ' market unvani yenilendi');
}
