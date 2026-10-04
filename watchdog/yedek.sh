#!/bin/bash
# HobbyMice gunluk MongoDB yedegi — hobbymice-backup.timer ile gunde bir kez.
# transformice3 veritabanini gzip'li arsive yazar; 7 gunden eskileri siler.
# Log: /root/backups/mongo/yedek.log  |  Cikti: /root/backups/mongo/hobbymice-<tarih>.archive.gz

set -u
DIR=/root/backups/mongo
LOG="$DIR/yedek.log"
mkdir -p "$DIR"
say() { echo "[$(date '+%F %T')] $*" >> "$LOG"; }

STAMP=$(date '+%Y%m%d-%H%M')
OUT="$DIR/hobbymice-$STAMP.archive.gz"

if /opt/mongodb/bin/mongodump --uri="mongodb://127.0.0.1:27017/transformice3" --archive="$OUT" --gzip --quiet >> "$LOG" 2>&1; then
    SIZE=$(stat -c%s "$OUT" 2>/dev/null || echo 0)
    say "OK: $OUT (${SIZE} bayt)"
    if [ "$SIZE" -lt 10240 ]; then
        say "UYARI: yedek cok kucuk (${SIZE} bayt) — icerigi kontrol et"
    fi
else
    say "HATA: mongodump basarisiz — $OUT siliniyor"
    rm -f "$OUT"
fi

# 7 gunden eski yedekleri temizle
find "$DIR" -name 'hobbymice-*.archive.gz' -mtime +7 -delete 2>/dev/null
say "OZET: mevcut yedek sayisi=$(ls -1 "$DIR"/hobbymice-*.archive.gz 2>/dev/null | wc -l)"
