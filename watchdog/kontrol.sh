#!/bin/bash
# HobbyMice otomatik bekci (watchdog) — AI'siz, deterministik sunucu-side kontrol.
# hobbymice-watchdog.timer ile 10 dakikada bir calisir (2026-10-03, ZCode otomasyon
# tetiklemesi uygulama katmaninda calismadigi icin kuruldu).
# Yaptigi is: kapali servisi baslatir, web'u dogrular, sel/port/disk/gozlemci
# bulgularini OTOMATIK-KONTROL.log'a yazar, AI mudalesi gerektiren durumlari
# BEKLEYEN-IS.md'ye birakir.

LOG=/root/projects/transformice/OTOMATIK-KONTROL.log
PENDING=/root/projects/transformice/BEKLEYEN-IS.md
PENDING_TMP=/tmp/hobbymice-pending.$$

say() { echo "[$(date '+%F %T')] $*" >> "$LOG"; }

# 1) Servisler: kapaliysa logunu alip baslat
for s in hobbymice-mongodb transformice hobbymice-web hobbymice-chat hobbymice-bridge; do
    if ! systemctl is-active --quiet "$s"; then
        say "HATA: $s kapali — journal son 30 satir:"
        journalctl -u "$s" -n 30 --no-pager >> "$LOG" 2>&1
        if systemctl start "$s"; then
            sleep 3
            if systemctl is-active --quiet "$s"; then
                say "OK: $s baslatildi"
                echo "- Servis $s kendiliginden kapanmisti, watchdog $(date '+%T')'da restart etti; kok neden icin journalctl -u $s bak." >> "$PENDING_TMP"
            else
                say "HATA: $s baslatildi ama aktif degil"
                echo "- Servis $s restart sonrasi hala aktif degil (watchdog $(date '+%T'))." >> "$PENDING_TMP"
            fi
        else
            say "HATA: $s baslatilamadi"
            echo "- Servis $s baslatilamadi (watchdog $(date '+%T'))." >> "$PENDING_TMP"
        fi
    fi
done

# 2) Oyun portu dinliyor mu
if ! ss -ltn 2>/dev/null | grep -q ':11801 '; then
    say "HATA: 11801 dinlemiyor"
    echo "- Oyun portu 11801 dinlemiyor (servis aktif gorunse bile journalctl -u transformice incele)." >> "$PENDING_TMP"
fi

# 3) Paket seli dondu mu (son 10 dk isleyisiz paket sayisi)
FLOOD=$(journalctl -u transformice --since '-10 min' --no-pager 2>/dev/null | grep -c 'Unhandled packet')
if [ "$FLOOD" -gt 1000 ]; then
    say "UYARI: isleyisiz paket seli (10dk: $FLOOD)"
    echo "- (0,19) paket seli tekrar etti (son 10 dk: $FLOOD). Kaynak IP icin: journalctl -u transformice -o short | grep Unhandled | head" >> "$PENDING_TMP"
fi

# 4) Web sayfalari (-L: /play -> /play/ 301 slash yonlendirmesi normaldir)
for p in "/" "/play" "/launcher"; do
    CODE=$(curl -sL -o /dev/null -w '%{http_code}' --max-time 15 "https://hobbymice.com.tr$p")
    if [ "$CODE" != "200" ]; then
        say "UYARI: web $p -> $CODE"
        echo "- Web $p -> $CODE dondu (watchdog $(date '+%T'))." >> "$PENDING_TMP"
    fi
done

# 5) CLOSE-WAIT birikimi (baglanti sizinti belirtisi)
CW=$(ss -tn state close-wait '( sport = :11801 )' 2>/dev/null | tail -n +2 | wc -l)
if [ "$CW" -gt 200 ]; then
    say "UYARI: CLOSE-WAIT=$CW birikti"
    echo "- 11801 uzerinde $CW CLOSE-WAIT soket birikti (FD sizinti riski)." >> "$PENDING_TMP"
fi

# 5b) SMTP canli mi (2FA / e-posta dogrulama akislari buna bagli)
if ! timeout 5 bash -c 'exec 3<>/dev/tcp/127.0.0.1/587' 2>/dev/null; then
    say "UYARI: SMTP 587 yanit vermiyor (2FA ve e-posta akislari kesilir)"
    echo "- Postfix 587 yanit vermiyor: systemctl status postfix; 2FA/e-posta dogrulama akislari etkilenir." >> "$PENDING_TMP"
fi

# 5c) Gunluk yedek taze mi (26 saat icinde yeni arsiv yoksa veri riski)
LATEST_BACKUP=$(ls -1t /root/backups/mongo/hobbymice-*.archive.gz 2>/dev/null | head -1)
if [ -z "$LATEST_BACKUP" ]; then
    say "UYARI: hic MongoDB yedegi yok"
    echo "- MongoDB yedegi hic alinmamis: systemctl start hobbymice-backup.service ile ilk yedegi al." >> "$PENDING_TMP"
else
    BACKUP_AGE_H=$(( ($(date +%s) - $(stat -c%Y "$LATEST_BACKUP")) / 3600 ))
    if [ "$BACKUP_AGE_H" -gt 26 ]; then
        say "UYARI: son yedek $BACKUP_AGE_H saat eski ($LATEST_BACKUP)"
        echo "- Son MongoDB yedegi $BACKUP_AGE_H saat eski (normalde gunluk): hobbymice-backup.timer aktif mi, yedek.log'a bak." >> "$PENDING_TMP"
    fi
fi

# 5d) Oyuncu dusus alarmi: guncel online, onceki 7 gunun ayni saatindeki
# ortalamasinin %30'unun altina dustuyse (ve baz >=2 ise) haber ver.
PLAYER_STATS=$(cd /root/projects/transformice/website && timeout 20 node -e "
const { MongoClient } = require('mongodb');
(async () => {
  try {
    const c = new MongoClient('mongodb://127.0.0.1:27017', { serverSelectionTimeoutMS: 4000 });
    await c.connect();
    const col = c.db('transformice3').collection('server_stats');
    const cur = await col.find({}).sort({ ts: -1 }).limit(1).toArray();
    const current = cur[0] ? cur[0].players : null;
    const now = new Date();
    const h = now.getUTCHours();
    const samples = [];
    for (let d = 1; d <= 7; d++) {
      const dayStart = new Date(now.getTime() - d * 86400000);
      dayStart.setUTCHours(Math.max(0, h - 1), 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + 3 * 3600000);
      const agg = await col.aggregate([
        { \$match: { ts: { \$gte: Math.floor(dayStart.getTime() / 1000), \$lt: Math.floor(dayEnd.getTime() / 1000) } } },
        { \$group: { _id: null, avg: { \$avg: '\$players' } } },
      ]).toArray();
      if (agg[0]) samples.push(agg[0].avg);
    }
    const base = samples.length ? samples.reduce((a, b) => a + b, 0) / samples.length : 0;
    console.log((current == null ? -1 : current) + ' ' + base.toFixed(2));
    await c.close();
  } catch { console.log('-1 -1'); }
})();" 2>/dev/null)
CUR_PLAYERS=${PLAYER_STATS%% *}
BASE_PLAYERS=${PLAYER_STATS##* }
if [ "$CUR_PLAYERS" != "-1" ] && [ "$BASE_PLAYERS" != "-1" ]; then
    if [ "$(awk "BEGIN{print ($BASE_PLAYERS >= 2) ? 1 : 0}")" = "1" ] && [ "$(awk "BEGIN{print ($CUR_PLAYERS < $BASE_PLAYERS * 0.3) ? 1 : 0}")" = "1" ]; then
        say "UYARI: oyuncu dususu — su an $CUR_PLAYERS, 7 gunluk ayni saat ortalamasi $BASE_PLAYERS"
        echo "- Oyuncu sayisi normalin cok altinda (su an $CUR_PLAYERS, beklenen ~$BASE_PLAYERS): 11801 dinliyor mu, journal'da son hata ne?" >> "$PENDING_TMP"
    fi
fi

# 6) Disk kullanimi
USE=$(df --output=pcent / 2>/dev/null | tail -1 | tr -dc '0-9')
if [ -n "$USE" ] && [ "$USE" -gt 90 ]; then
    say "UYARI: kok disk %$USE dolu"
    echo "- Kok disk %$USE dolu — temizlik gerekli (journalctl --vacuum-size=500M, /root/backups eski yedekler)." >> "$PENDING_TMP"
fi

# 7) Ozet satiri
say "OZET: flood10dk=$FLOOD closewait=$CW disk=%${USE:-?} bekleyenis=$( [ -s "$PENDING_TMP" ] && echo VAR || echo yok )"

# 8) AI mudalesi gerektiren is varsa BEKLEYEN-IS.md'ye yaz, yoksa eski notu temizle
if [ -s "$PENDING_TMP" ]; then
    {
        echo "# Bekleyen is (watchdog, $(date '+%F %T'))"
        echo ""
        cat "$PENDING_TMP"
        echo ""
    } > "$PENDING"
else
    rm -f "$PENDING"
fi
rm -f "$PENDING_TMP"
