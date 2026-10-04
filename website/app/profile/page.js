import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Oyun ici oyuncu kartindaki "Profil" baglantisi bu yolu acar
// (orn. /profile?pr=Ares%232611) — genel oyuncu profiline yonlenir.
export default async function ProfileRedirect({ searchParams }) {
  const sp = await searchParams;
  const pr = sp.pr ? String(sp.pr) : '';
  redirect('/oyuncu?pr=' + encodeURIComponent(pr));
}
