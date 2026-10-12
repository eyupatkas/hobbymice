# HobbyMice Geliştirme Fikir Havuzu (Backlog)

Otomatik geliştirme görevi her koşuda buradan sıradaki en değerli işi seçer.
Tamamlananlar "BİTTİ (tarih)" ile işaretlenir; yeni fikir/bug keşfedildikçe buraya eklenir.

Öncelik: [BUG] gerçek hata > [DENGESIZLIK] oyun deneyimi sorunu > [ÖZELLİK] yeni işlev > [ALTYAPI] bakım/izleme.

## Güvenlik

- [GÜVENLİK] Login deneme sınırı bağlantı-başına (100/connection, reconnect ile sıfırlanıyor) → hesap-başına ek deneme gecikmesi/backoff eklenebilir (127.0.0.1 köprü kullanıcılarını etkilemeyecek şekilde).
- [MODERASYON] Küfür/hakaret filtresi — **KISMEN BİTTİ (2026-10-12)**: bad_words.json dolduruldu (boştu!) + S_RegisterAccount rumuz kontrolü eklendi (iç repo `b9aa76a`). KALAN (admin kararı): hakaret içeren MEVCUT hesabın ismi değiştirilmeli/askıya alınmalı (W41 şampiyonu olduğu için ödül+künye de geri alınabilir) — oyun içi isim değişikliği/ceza aracı henüz yok, DB dokunuşu admin'e ait.
- [GÜVENLİK] Admin hesabı + staff 2FA — **BİTTİ (2026-10-03)**: SMTP kuruldu (mice@in3dex.com, localhost:587+STARTTLS), enable_staff_2FA_verification=true; admin e-postası info@in3dex.com'a kod düşer. İsteğe bağlı: Eyup'un e-postası oyun içinden gerçek kişisel adrese değiştirilebilir.
- [GÜVENLİK-BİLGİ] Şifreler artık PBKDF2 (BİTTİ 2026-10-03); eski hesaplar ilk girişte yükselir.
- [İYİLEŞTİRME] Doğrulama kodlarına geçerlilik süresi — **BİTTİ (2026-10-03)**: Client.isCodeExpired(), tüm kod/2FA üretim-doğrulama noktalarına 10 dk geçerlilik.
- [İYİLEŞTİRME] /top misafir (*Souris_*) filtresi — **BİTTİ (2026-10-03)**; JVM stack bayrağı (override.conf) — **BİTTİ (2026-10-03)**; bekçiye yedek tazelik kontrolü (26 saat) — **BİTTİ (2026-10-03)**.
- [İYİLEŞTİRME] MailTemplates: site logo görseli eklenebilir (CID embed ile) — şimdilik emoji başlık kullanılıyor (webmail uyumu).

## Oyun içi (Transformice/, Java)

- [ÖZELLİK] Çarkıfelek (/cark) — **BİTTİ (2026-10-04)**: günlük ücretsiz, 9 dilim, jackpot duyurulu, T_627 unvanlu.
- [ÖZELLİK] Görev paneli (/gorev) — **BİTTİ (2026-10-04)**: gömülü ParseDailyQuests'in renkli sohbet paneli.
- [ÖZELLİK] Haftalık peynir yarışması (/haftalik + pazartesi ödül daemon'u + weekly_winners) — **BİTTİ (2026-10-04)**; ilk gerçek ödül dağıtımı 2026-10-05 pazartesi journal'dan izlenmeli.
- [ÖZELLİK] /siralama sayfasına "Haftanın Şampiyonları" bölümü (weekly_winners koleksiyonundan) — **BİTTİ (2026-10-08)**: son dağıtım haftasının madalya+skor+ödül tablosu; koleksiyon boşken gizli (ilk ödüllü pazartesinden sonra otomatik görünür).
- [ÖZELLİK] Çarkıfelek görselleştirmesi: istemci tarafı çark animasyonu (C_Image paketleriyle çark çizimi) — komut/sohbet animasyonu yeterli olursa düşük öncelik.
- [ÖZELLİK] Günlük giriş ödülü — **BİTTİ (2026-10-03, kullanıcı test etti)**: 15-45 peynir, seri çarpanı, chat bildirimi.
- [ÖZELLİK] /online, /saat komutları — **BİTTİ (2026-10-03)**.
- [ÖZELLİK] /help (yetkiye göre filtre + dil desteği, log penceresi) ve /yetkililer (ad>rol, online durumu) — **BİTTİ (2026-10-03, oyun içi görünüm kullanıcı teyidi bekliyor)**.
- [ÖZELLİK] Oyun analitiği veri hattı (server_stats, dakikalık) — **BİTTİ (2026-10-03)**; site admin analitik sayfasına bağlı.
- [ÖZELLİK] Bootcamp / Racing / Defilante özel oda modları — **BİTTİ (2026-10-08, canlı doğrulandı)**: oda yönlendirme + kategori havuzları (racing=17, defilante=18, bootcamp=13/3) hazır; giriş çökmesi kökten düzeltildi. Çökmenin kökü racing'e özgü paket DEĞİL, Decoder off-by-one'ydı (bkz. HATA-KÖK-NEDEN): oda kuruluş patlamasındaki istemci paketi TCP sınırına denk gelince sunucu decoder'ı patlıyor, bağlantı ölünce istemci "Incorrect version" gösteriyordu. Canlı Ruffle testi: racing @1433 / bootcamp @1936 / defilante @2355 — üçü de raunt akışıyla sorunsuz (bridge/hm_roommode_test.mjs).
- [ÖZELLİK] Şaman rütbesi rozetleri: first sayısına göre oda içi etiket.
- [NOT] "Powers eksik API'leri" işi DÜŞTÜ (2026-10-08): powers.lua eksik system.*/ui.*/tfm.exec.* fonksiyonlarını KENDİ içinde tanımlıyor (satır 1177-1240: tfm.exec.position=function(n), system.players=function(trdArg), system.start=function(n)…); modül çerçevesi gömülü, sunucu tarafı implementasyon gerekmiyor.
- [BUG-ADAYI] Loglardaki tekrarlayan exception/stack izlerini bulup kökten düzelt.
- [DENGESIZLIK] Vanilla harita rotasyonunda aynı haritanın art arda gelmesini engelle (son N harita geçmişi) — **BİTTİ (2026-10-03)**: ölü referans-guard düzeltildi, oda başına son 10 harita geçmişi (vanilla + kategori yolları).
- [BUG] (0,19) işleyisiz paket seli: saniyede ~120k WARN + 918 CLOSE-WAIT — **BİTTİ (2026-10-03)**: 5 sn log throttle + 10sn/30 paket eşiğinde bağlantı kapatma (ClientHandler/Client).
- [GÜVENLİK] exceptionCaught log-sel kapısı (bozuk paket başına ERROR+stack) — **BİTTİ (2026-10-03)**: 5 sn throttle + 10sn/10 exception'da bağlantı kapatma.
- [GÜVENLİK] Şifreler düz token olarak saklanıyordu (pass-the-hash) — **BİTTİ (2026-10-03)**: PBKDF2-HMAC-SHA256 (120k) sarmalama, oyun+site aynı format, ilk girişte şeffaf geçiş.
- [ALTYAPI] log4j rootLogger DEBUG kalmış (Mongo debug satırları journal'a yazıyor) → INFO'ya çekilip yeniden derlenmeli (bkz. log4j.properties + deploy.sh).
- [İZLEME] (0,19) seli tekrarlarsa kaynak IP'yi tespit et (journal + ss); gerekirse köprüyü bozmayan geçici IP throttle ekle.
- [ALTYAPI] İç repo Mimosa L3 kapısı AŞILDI (2026-10-08): upstream-tools ağaçtan çıkarılınca iç repo commit'i geçti (Decoder turu 4e1b171); dış repo docs/watchdog commit'i de geçti (60a8628). KALAN: dış repo WEBSITE commit'i ön-existing bulgulara takılıyor (Chrome.jsx:54/111 fetch('/api/logout') — tarayıcı-içi relatif çağrı, SSRF değil; blogbot.js sunucu-içi bot, saldırgan girdisi yok — false-positive ağırlıklı). Site değişiklikleri canlıda ama commit'siz: ya Mimosa'ya website kapsamı ayarlanmalı ya bulgular elle belgelenmeli (yanlış-pozitif savunması), sonra yeniden commit.
- [ÖZELLİK] /top oyun içi sıralama komutu — **BİTTİ (2026-10-03)**: /top cheese|first, madalyalı top 5, findBest10PlayersByCriteria yeniden kullanıldı.
- [ÖZELLİK] Ana sayfa canlı "şu an oyunda" sayacı + tüm istatistikler gerçek — **BİTTİ (2026-10-03)**: ServerStats server_stats/account aggregate/mapeditor sayısından besleniyor.
- [ALTYAPI] MongoDB günlük yedekleme — **BİTTİ (2026-10-03)**: mongodump (tools 100.11.0) + hobbymice-backup.timer 04:00 + 7 gün saklama + dryRun restore testi.
- [KOZMETİK] /top listesinde guest (*Souris_*) hesapları filtrele; findBest10PlayersByCriteria'ya "sadece kayıtlı" seçeneği eklenebilir.
- [ÖZELLİK] Oyun içi harita oylama/atlama — **BİTTİ (2026-10-12, projector E2E ile kanıtlandı)**: /atla (alias /haritaatla; /skip müzik komutuna ait) — Room.addSkipVote çoğunluk oylaması (>½, tek kişilik odada anında), raunt başına 1 oy, kabile/modül odalarında kapalı. Kayıtlı hesaplar için; misafirler istemci kısıtıyla komut gönderemiyor (bkz. istemci komut tablosu maddesi).
- [ÖZELLİK] İstemci komut tablosuna özel komutların eklenmesi (client-build ameliyatı): 1.889 istemcisinin kendi tablosu (*pw/clavier/bug/room/salonauto/help/sp) dışındaki komutları misafirler HİÇ gönderemiyor (2026-10-12 keşfi; kayıtlı hesaplarda sorun yok). rabcdasm ile tabloya cark/gorev/haftalik/atla/online/saat vb. eklenirse misafirler de komut kullanabilir; 3 SWF varyantının yeniden üretilmesi + dağıtım gerekir.
- [BUG] S_VerifyAccountByNickAndEmail (şifremi unuttum) giriş-öncesi NPE — **BİTTİ (2026-10-12)**: null-guard; (28,40) login ekranından geldiğinde account null olabiliyordu.

## Web sitesi (website/, Next.js)

- [ÖZELLİK] Ana sayfa ekonomi şeridi (EcoBanner) + renkli stat kartları + /oyuncu görev paneli — **BİTTİ (2026-10-04)**: i18n 103 anahtar × 4 dil; hero animasyon denemesi background-clip:text'i bozduğu için geri alındı (not: metin maskeli gradyanlara animasyon konmaz).
- [ÖZELLİK] Güncellemeler sayfası (/guncellemeler + content/updates.json) — **BİTTİ (2026-10-03)**; KURAL: her deploy sonrası oyuncu-dostu giriş eklenir (günlüğün başına yazıldı).
- [BUG] Sohbet 502: handleTyping async değil + .catch → tüm chat sunucusu çöküyordu — **BİTTİ (2026-10-03)**: Promise.resolve sarmalaması; tarayıcı testiyle kanıtlandı (bridge/hm_chat_cookie_test.js).
- [ÖZELLİK] Zorunlu i18n kapısı (eksik çeviri = build hatası) + chat/header/footer sözlüğü — **BİTTİ (2026-10-03)**: lib/i18n.js + scripts/check-i18n.js (npm run build'in başında). "Türkçe topluluk" ifadeleri → küresel dil (tüm sayfalar + eski statik dosyalar).
- [ÖZELLİK] Ana sayfa bölüm metinlerinin (Hero/Features/HowTo/Launcher vb.) lib/i18n.js'e taşınıp 4 dile çevrilmesi — kapı hazır, migrasyon kaldı.
- [ÖZELLİK] Admin analitik sayfası (oyun+site trafiği, gerçek veriler) — **BİTTİ (2026-10-03)**: /admin/analitik; kartlar, 24sa online eğrisi, 14 günlük giriş/kayıt/PV/tekil grafikleri, trafik kaynakları, popüler sayfalar, son girişler/kayıtlar. Site takibi Next sayfalarıyla sınırlı.
- [SEO] IndexNow kurulumu (key dosyası + blogbot ping + sitemap ping scripti) — **BİTTİ (2026-10-03)**; batch 202. Kalan: tek-URL ping'ler Bing negatif önbelleği yüzünden 403 — 24-48s içinde düzelmezse key yenilenecek (yeni key + yeni /{key}.txt).
- [SEO] KULLANICI İŞİ (5 dk): Google Search Console (search.google.com/search-console) + Bing Webmaster kaydı; sitemap.xml'i oradan gönder. Sunucu tarafı hazır (robots.txt sitemap'i işaret ediyor).
- [SEO] Blog yazılarına iç bağlama + FAQPage schema örneği (blogbot şablonuna) — sonraki içerik turunda.
- [ÖZELLİK] Sıralama (leaderboard) sayfası: Mongo'dan firsts/cheese sayısına göre ilk 20.
- [ÖZELLİK] Hesap oluşturma/kayıt sayfası iyileştirmeleri (şifre gücü, rumen kuralları).
- [BUG-ADAYI] E2E (bridge/hm_web_e2e.js) HM_TEST_PASS env'siz koşamıyor — test akışını env bağımsız hale getir.

## Altyapı / izleme

- [ALTYAPI] MongoDB günlük yedekleme (mongodump + sıkıştırma, /root/backups altına, 7 günlük saklama) — ÖN KOŞUL: mongodb-database-tools kurulu değil (apt'ta yok; fastdl.mongodb.org'dan indirilebilir), mongodump henüz yok.
- [KULLANICI KARARI] Disk %93 dolu (133G/150G): en büyük tüketiciler xml-entegrasyon 20G, /var/lib/postgresql 12G, /root/.local 9.5G — bunlar diğer projelerin verisi; hangileri temizlenecekse kullanıcı söylemeli.
- [ALTYAPI] ZCode otomasyonu: uygulama katmanı bozuk (buton + zamanlayıcı tetiklenmiyor, app v3.14.4). ZCode güncellenirse tekrar denenebilir; prompt tam metni hafızada (hobbymice-auto-dev-automation.md).
- [ALTYAPI] Watchdog genişletme: gunluk OYUN logu ozeti (ERROR sayimi), web uptime satiri, disk temizlik onerisi (journalctl vacuum onerisi otomatik).
- [ALTYAPI] Sağlık kontrolü scripti: servisler kapalıysa restart edip log dosyasına yazan watchdog.
- [ALTYAPI] Sunucu loglarında ERROR sayımını günlüğe yazan küçük istatistik.
- [HATA-KÖK-NEDEN] Decoder.java satır 57 off-by-one — **BİTTİ (2026-10-08, canlıda doğrulandı)**: kontrol `length+1`'e çekildi + markReaderIndex başa alındı (eski kodda <23 baytlık kısmi çerçevede resetReaderIndex() varsayılan 0'a sarıp akışı desync edebiliyordu) + 1 MB çerçeve tavani; deploy sonrası journal 0 exception/0 unhandled. racing/bootcamp/defilante giriş çökmesi de dahil aynı köktü.
- [SAĞLAMLAŞTIRMA] ClientHandler ölü-soket temizleyicisi — **BİTTİ (2026-10-08)**: Server'da 60 sn'lik idle sweeper (giriş yapmamış 5 dk / girişli 30 dk sessiz → kapat; Client.lastActivityTime her pakette güncellenir) — CLOSE-WAIT zombiler restart'sız temizlenir. Bonus: unhandled-packet uyarısı bağlantı başına 5 dk susturucu + kaynak IP'li (yavaş-damla bot seli bitti).
- [İZLEME] Watchdog'a güvenlik kontrolleri EKLENDİ (2026-10-08): fail2ban ban sayısı, nginx 10dk istek seli, oyun portu bağlanti/syn seli, zombi 'Unhandled packet' seli — OZET satırında bans/nx10dk/oyunest/unhandled10dk izleniyor.

## Tamamlananlar

(henüz yok)

## Yol Haritası (2026-10-03 planı) — 5/5 TURDA BİTTİ

### Oyun içi (öncelik sırasıyla)
1. [ÖZELLİK] Etkinlik hafta sonları — **BİTTİ (2026-10-03)**: otomatik rotasyon (Halloween/Fishing/Ninja/Hugging) + duyuru + /event. Kalan: NPC/collectible efektlerinin açılması (adventure config bağımlılığı çözülünce).
2. [ÖZELLİK] Şaman rozetleri — **BİTTİ (2026-10-03)**: eşik bazlı açılım (10/50 first → #1/#2, 500/2000 kurtarma → #3/#4) + otomatik takma + tebrik; görsel teyit kullanıcıda.
3. [ÖZELLİK] Oyun içi ilk-kez-giriş rehberi iyileştirmesi (tutorial sonrası komut ipuçları)
4. [KOZMETİK] /top guest filtresi — **BİTTİ**; "min oyun süresi" şartı da **BİTTİ (2026-10-11)**: findBest10PlayersByCriteria her iki yoluna playedTime ≥ 600 sn (10 dk) filtresi (iç repo `6811663`)

### Web sitesi
5. [SEO] Blog botuna FAQPage schema + iç bağlama — **BİTTİ (2026-10-03)**: bot 3'lü SSS üretir, yazı sayfasında açılır bölüm + FAQPage JSON-LD; etiket eşleşmezse son 3 yazı fallback.
6. [ÖZELLİK] Profil başarım rozetleri — **BİTTİ (2026-10-03)**: 9 başarım (peynir/first/kurtarma/seri/veteren), canlı hesaplama.
7. [İYİLEŞTİRME] LatestPosts tarih formatını dile göre göster

### Altyapı
8. [İZLEME] Bekçi oyuncu düşüş alarmı — **BİTTİ (2026-10-03)**: güncel online, 7 gün aynı saat ortalamasının %30 altına düşerse (baz ≥2) uyarı.


### Mod notu (2026-10-03) — **ÇÖZÜLDÜ (2026-10-04):** 9 modülün tamamı canlıda çalışıyor
- crowdsurf/powers (Init Error) ve pizzeria (system.exit/timer) denemeleri `.backups/2026-10-03-1500/broken-modules/` altında; kök neden: sunucu Lua ortamı ile resmî modüllerin beklentisi arasındaki fark (tfm.get.room alt alanları / OS sandbox şüphesi). ~~Çözülünce 3 modül geri gelir.~~ **Kök neden şuydu:** LuaJ hata mesajı modül kaynağının TAMAMINI gömüyordu ("Init Error : math.randomseed(os.time())" görüneni 1. satırın yankısıydı, asıl hata sonda); sırayla çözülenler: os tablosu (LUA_TABLE_OS), table.foreach/foreachi, os.date gerçek semantik, xmlMapInfo yarışı, system.disableChatCommandDisplay(nil), system.giveEventGift, cannonup eventPlayerLeft nil-guard'ları. 9/9 modül gerçek tarayıcı girişiyle sıfır hatada doğrulandı (bkz. GELISTIRME-GUNLUGU 2026-10-04).
- Cannonup/Hardcamp çalışıyor görünüyor (2h journal'da init hatasız) — oyuncu teyidi bekleniyor.
- [TEST] Kalan doğrulama: 2+ oyunculu senaryolar (infected enfeksiyon geçişi, pizzeria sipariş akışı, crowdsurf şaman devri) tek oyunculu testte dönmedi — gerçek oyuncu akışında izlenmeli; artık event hataları günlüğe düştüğü için sorun olursa "event hatasi" satırı yeterli teşhis verir.
