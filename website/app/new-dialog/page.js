import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Oyun ici oyuncu kartindaki "Mesaj gonder" baglantisi bu yolu acar.
// Mesajlasma sitedeki arkadas sohbetiyle yapilir; hedef oyuncunun
// profiline yonlendirilir (profilde sohbet butonu vardir).
export default async function NewDialogRedirect({ searchParams }) {
  const sp = await searchParams;
  const ad = sp.ad ? String(sp.ad) : '';
  redirect('/oyuncu?pr=' + encodeURIComponent(ad));
}
