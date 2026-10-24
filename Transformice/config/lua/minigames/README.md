# HobbyMice Modülleri (Lua minigame'ler)

Oyun içinde `#moduladı` odası açarak (ör. `/room #vampir`) başlatılır.
Oda adı harflerden oluşmalı (ASCII): `#vampir`, `#infected`, `#bomba`...

| Oda | Mod | Açıklama | Kaynak |
|-----|-----|----------|--------|
| `#infected`   | Infected (resmî)   | Klasik enfeksiyon: ilk şaman dokunduğunu bulaştırır, son hayatta kalan kazanır. | Bolodefchoco (Lautenschlager portu) |
| `#cannonup`   | Cannonup (resmî)   | Top yağmuru altında hayatta kal, cannonlarla rakipleri savur. | resmî port |
| `#hardcamp`   | Hardcamp           | Zorlaştırılmış bootcamp: checkpoint'li ekstrem parkur. | semi-official port |
| `#vampir`     | Vampir             | Rastgele bir vampir dokunduğunu bulaştırır; süre bitene dek dayanan kazanır. | HobbyMice |
| `#bomba`      | Bomba Yağmuru      | Gökyüzünden rastgele patlamalar yağar; son hayatta kalan kazanır. | HobbyMice |
| `#gravity`    | Yerçekimi Kaosu    | Yerçekimi sürekli değişir (tavan/duvar/ağır/hafif); son hayatta kalan kazanır. | HobbyMice |

Bilinen durumdaki (çalışması onaylanmış) modüller yukarıdadır. `crowdsurf`, `powers`, `pizzeria`
deneme sürümlerinde init/runtime hatası verdikleri için `.backups/2026-10-03-1500/broken-modules/`
altına çekildi; eksik Lua API'leri implement edilince geri gelir.
