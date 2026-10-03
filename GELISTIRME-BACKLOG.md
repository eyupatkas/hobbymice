# HobbyMice Geliştirme Fikir Havuzu (Backlog)

Otomatik geliştirme görevi her koşuda buradan sıradaki en değerli işi seçer.
Tamamlananlar "BİTTİ (tarih)" ile işaretlenir; yeni fikir/bug keşfedildikçe buraya eklenir.

Öncelik: [BUG] gerçek hata > [DENGESIZLIK] oyun deneyimi sorunu > [ÖZELLİK] yeni işlev > [ALTYAPI] bakım/izleme.

## Oyun içi (Transformice/, Java)

- [ÖZELLİK] Günlük giriş ödülü: her gün ilk girişte peynir/firsts bonusu, üst üste giriş serisi çarpanı.
- [ÖZELLİK] Oyun içi `/ping`, `/saat`, `/online` komutları (mevcut komut mimarisine uyarak).
- [ÖZELLİK] Bootcamp / Racing / Defilante özel oda modları (harita kategorisi zaten DB'de mevcut, Room.selectMap filtresiyle).
- [ÖZELLİK] Şaman rütbesi rozetleri: first sayısına göre oda içi etiket.
- [BUG-ADAYI] Loglardaki tekrarlayan exception/stack izlerini bulup kökten düzelt.
- [DENGESIZLIK] Vanilla harita rotasyonunda aynı haritanın art arda gelmesini engelle (son N harita geçmişi).
- [BUG] (0,19) işleyisiz paket seli: saniyede ~120k WARN + 918 CLOSE-WAIT — **BİTTİ (2026-10-03)**: 5 sn log throttle + 10sn/30 paket eşiğinde bağlantı kapatma (ClientHandler/Client).
- [ALTYAPI] log4j rootLogger DEBUG kalmış (Mongo debug satırları journal'a yazıyor) → INFO'ya çekilip yeniden derlenmeli (bkz. log4j.properties + deploy.sh).
- [İZLEME] (0,19) seli tekrarlarsa kaynak IP'yi tespit et (journal + ss); gerekirse köprüyü bozmayan geçici IP throttle ekle.

## Web sitesi (website/, Next.js)

- [ÖZELLİK] Canlı oyuncu sayacı (11801'e TCP ping yapan küçük API route + ana sayfa rozeti).
- [ÖZELLİK] Sıralama (leaderboard) sayfası: Mongo'dan firsts/cheese sayısına göre ilk 20.
- [ÖZELLİK] Hesap oluşturma/kayıt sayfası iyileştirmeleri (şifre gücü, rumen kuralları).
- [BUG-ADAYI] E2E (bridge/hm_web_e2e.js) HM_TEST_PASS env'siz koşamıyor — test akışını env bağımsız hale getir.

## Altyapı / izleme

- [ALTYAPI] MongoDB günlük yedekleme (mongodump + sıkıştırma, /root/backups altına, 7 günlük saklama).
- [ALTYAPI] Sağlık kontrolü scripti: servisler kapalıysa restart edip log dosyasına yazan watchdog.
- [ALTYAPI] Sunucu loglarında ERROR sayımını günlüğe yazan küçük istatistik.

## Tamamlananlar

(henüz yok)
