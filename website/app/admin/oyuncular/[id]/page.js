import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '../../../../lib/db';
import { STAFF_ROLES } from '../../../../lib/session';
import { PLAYER_FIELDS } from '../../../../lib/player-fields';
import { fmtDateTime } from '../../../../lib/util';
import { savePlayer, changePassword, deletePlayer } from '../../../../lib/admin-actions';

export const dynamic = 'force-dynamic';

function fieldInput(f, acc) {
  const v = acc[f.k];
  if (f.t === 'roles') {
    const roles = Array.isArray(v) ? v : [];
    return (
      <>
        {STAFF_ROLES.map(r => (
          <label key={r} className="checkline">
            <input type="checkbox" name={`role_${r}`} defaultChecked={roles.includes(r)} /> {r}
          </label>
        ))}
        <div className="hint">“Admin” tüm yetkileri açar (oyunun yetki kontrolü).</div>
      </>
    );
  }
  if (f.t === 'bool') {
    return (
      <label className="checkline">
        <input type="checkbox" name={`f_${f.k}`} defaultChecked={!!v} /> {f.l}
      </label>
    );
  }
  const val = f.t === 'intlist'
    ? (Array.isArray(v) ? v.join(',') : String(v == null ? '' : v))
    : String(v == null ? '' : v);
  const type = f.t === 'int' ? 'number' : 'text';
  return <input type={type} step="any" name={`f_${f.k}`} defaultValue={val} />;
}

export default async function OyuncuDuzenlePage({ params }) {
  const { id } = await params;
  const accId = Number.parseInt(id, 10);
  if (!Number.isFinite(accId)) notFound();
  const acc = await getDb().collection('accounts').findOne({ _id: accId });
  if (!acc) notFound();

  return (
    <>
      <div className="pagehead">
        <h1>👤 {acc.playerName}</h1>
        <p className="muted small">
          Kayıt: {acc.regDate ? fmtDateTime(new Date(acc.regDate * 1000)) : '?'} · ID: {String(acc._id)} · Son IP: {acc.lastIPAddress || '—'}
        </p>
      </div>
      <form action={savePlayer}>
        <input type="hidden" name="id" value={String(acc._id)} />
        {PLAYER_FIELDS.map(g => (
          <div className="fgrp" key={g.group}>
            <h3>{g.group}</h3>
            <div className="frow3">
              {g.fields.map(f => (
                <div className="field" key={f.k}>
                  <label>{f.l} <span className="muted small">({f.k})</span></label>
                  {fieldInput(f, acc)}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="panel tight">
          <button className="btn btn-play">💾 Kaydet</button>
          <Link className="btn btn-ghost" href="/admin/oyuncular">Geri</Link>
        </div>
      </form>

      <div className="panel">
        <h3>Şifre değiştir</h3>
        <p className="muted small">Oyun ve site girişi için aynı şifre geçerli olur. Oyuncu çevrimiçiyse yeniden girmesi gerekir.</p>
        <form action={changePassword} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input type="hidden" name="id" value={String(acc._id)} />
          <input type="text" name="password" required minLength={6} placeholder="Yeni şifre" style={{ maxWidth: 260 }} />
          <button className="btn btn-ghost btn-sm">Şifreyi değiştir</button>
        </form>
      </div>

      <div className="panel" style={{ borderColor: 'rgba(224,82,82,.5)' }}>
        <h3 style={{ color: 'var(--danger)' }}>Tehlikeli bölge</h3>
        <form action={deletePlayer}>
          <input type="hidden" name="id" value={String(acc._id)} />
          <label className="checkline">
            <input type="checkbox" name="onay" required /> Hesabı ve tüm site oturumlarını kalıcı olarak silmek istiyorum.
          </label>
          <div style={{ marginTop: 10 }}><button className="btn btn-danger btn-sm">Hesabı Sil</button></div>
        </form>
      </div>
    </>
  );
}
