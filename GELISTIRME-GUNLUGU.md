# HobbyMice Sürekli Geliştirme Günlüğü

Bu dosya, 5 saatte bir çalışan otomatik geliştirme görevi tarafından güncellenir.
Her koşuda: tarih damgası, ne yapıldı, hangi dosyalar değişti, nasıl doğrulandı, bilinen risk.

Biçim:

```
## 2026-10-03 14:00 — <kısa başlık>
- Ne yapıldı: ...
- Değişen dosyalar: ...
- Doğrulama: ... (test çıktısı özeti)
- Risk / not: ...
```

---

## 2026-10-03 07:55 — İşleyisiz paket seli koruması (log taşması + FD sızıntısı düzeltmesi)
- Ne yapıldı: Sunucu, işleyicisi olmayan (0,19) paketlerini saniyede ~120 bin adet WARN olarak logluyordu (journald 30 sn'de ~3,6M mesajı bastırıyordu) ve seli gönderen bağlantıları kapatmıyordu → 918 CLOSE-WAIT soket + 1119 FD birikmişti. ClientHandler'a (a) global 5 sn'de bir WARN sınırı, (b) bağlantı başına 10 sn penceresinde 30+ bilinmeyen pakette bağlantıyı sunucu tarafında kapatma koruması eklendi. Sayaçlar Client üzerinde tutulur (ClientHandler tüm bağlantılarda paylaşılan tek örnek).
- Değişen dosyalar: Transformice/src/main/java/org/transformice/connection/ClientHandler.java, Transformice/src/main/java/org/transformice/Client.java (+2 alan). Yedek: .backups/2026-10-03-0748/
- Doğrulama: deploy.sh ile derlendi+dağıtıldı, servis aktif, 11801 dinliyor; log hacmi 15 sn'de 2 satıra düştü (öncesi sn'de ~120k); CLOSE-WAIT 918→0; FD 1119→78; bridge test_wss.js "KOPRU CALISIYOR"; journald baskılama satırı kalmadı. Oyuncu 0 iken deploy yapıldı (kesinti etkisi yok).
- Risk / not: Sel kaynağı (dış IP'ler: 94.120.68.254, 188.119.52.90 vb.) tekrar bağlanırsa artık bağlantı 31. bilinmeyen pakette kapanır; uyarı en fazla 12/dk. log4j rootLogger hâlâ DEBUG (Mongo debug logları journal'a yazıyor) — backlog'a eklendi.

