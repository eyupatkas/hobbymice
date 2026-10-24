package org.transformice.command.commands.player;

// Imports
import java.util.List;
import java.util.Map;
import org.transformice.Application;
import org.transformice.Client;
import org.transformice.Server;
import org.transformice.command.Command;
import org.transformice.command.CommandHandler;
import org.transformice.database.collections.Account;

@Command(
        name = "basarim",
        usage = "",
        description = "Shows your achievements and their progress. Unlocks grant one-time cheese rewards.",
        aliases = {"basarimlar", "achievements"}
)
@SuppressWarnings("unused")
public final class Basarim implements CommandHandler {
    // Tetik tipleri: sayaclar artikarken Client/ParseSkills icinden cagrilir.
    public static final String TETIK_PEYNIR = "peynir";
    public static final String TETIK_FIRST = "first";
    public static final String TETIK_KURTARMA = "kurtarma";
    public static final String TETIK_BOOTCAMP = "bootcamp";
    public static final String TETIK_GIRIS_SERISI = "giris";
    public static final String TETIK_OYUN_SURESI = "sure";
    public static final String TETIK_SHAMAN_SEVIYE = "shaman";

    /**
     * Bir basarimin tanimi: oyuncu komutunun okudugu sabit tablonun satiri.
     * aciklamada saatCinsi=true ise panel degeri saat olarak gosterir.
     */
    private static final class Tanim {
        final String anahtar;
        final String ikon;
        final String ad;
        final String tetik;
        final int[] esikler;
        final int[] oduller; // esik basina tek seferlik peynir odulu (25-150)
        final boolean saatCinsi;

        Tanim(String anahtar, String ikon, String ad, String tetik, int[] esikler, int[] oduller, boolean saatCinsi) {
            this.anahtar = anahtar;
            this.ikon = ikon;
            this.ad = ad;
            this.tetik = tetik;
            this.esikler = esikler;
            this.oduller = oduller;
            this.saatCinsi = saatCinsi;
        }
    }

    // Basarim tablosu v1 (sabit): esikler artan sirada, oduller esik buyukluguyle 25-150 arasi.
    private static final Tanim[] TANIMLAR = {
            new Tanim("cheese", "🧀", "Peynir Topla", TETIK_PEYNIR,
                    new int[]{50, 200, 1000}, new int[]{25, 50, 150}, false),
            new Tanim("first", "🏁", "Birinci Ol", TETIK_FIRST,
                    new int[]{10, 50}, new int[]{25, 50}, false),
            new Tanim("saves", "🙏", "Fare Kurtar", TETIK_KURTARMA,
                    new int[]{25, 100}, new int[]{25, 50}, false),
            new Tanim("bootcamp", "🎓", "Bootcamp Bitir", TETIK_BOOTCAMP,
                    new int[]{10}, new int[]{25}, false),
            new Tanim("streak", "📅", "Giriş Serisi", TETIK_GIRIS_SERISI,
                    new int[]{3, 7}, new int[]{25, 50}, false),
            new Tanim("time", "⏳", "Oyun Süresi", TETIK_OYUN_SURESI,
                    new int[]{3600, 36000}, new int[]{25, 150}, true),
            new Tanim("shaman", "🌟", "Şaman Seviyesi", TETIK_SHAMAN_SEVIYE,
                    new int[]{10, 30}, new int[]{50, 150}, false),
    };

    // Kayit anahtari: "<anahtar>_<esik>" (orn. "cheese_200").
    private static String anahtarOf(Tanim t, int esik) {
        return t.anahtar + "_" + esik;
    }

    @Override
    public void execute(Client player, Server server, List<String> args) {
        if (player.isGuest() || player.getAccount() == null) {
            CommandHandler.sendServerMessage(player, "<N>Misafir hesapların başarımı olmaz — ücretsiz kayıt ol, madalyalar senin! 🐭</N>");
            return;
        }
        Account account = player.getAccount();
        Map<String, Long> acilan = account.getAchievements(); // null-safe lazy init

        int toplam = 0;
        for (Tanim t : TANIMLAR) toplam += t.esikler.length;

        StringBuilder panel = new StringBuilder();
        panel.append("<font size='14'><J>★ Başarımlar</J></font> <N>— eşikleri geç, peynir kazan! Açılan: </N><VP>")
                .append(acilan.size()).append("</VP><N>/</N><J>").append(toplam).append("</J><br><br>");

        for (Tanim t : TANIMLAR) {
            long deger = mevcutDeger(account, t);
            int tamamlanan = 0;
            int sonrakiIndex = -1;
            for (int i = 0; i < t.esikler.length; i++) {
                if (acilan.containsKey(anahtarOf(t, t.esikler[i]))) {
                    tamamlanan++;
                } else if (sonrakiIndex == -1) {
                    sonrakiIndex = i;
                }
            }

            if (sonrakiIndex == -1) {
                // Tum esikler acildi.
                panel.append("<VP>").append(t.ikon).append(" ").append(t.ad).append("</VP> <BL>—</BL> <J>")
                        .append(degerGoster(t, deger)).append("</J> <VP>✓ tamamlandı!</VP>");
            } else {
                int esik = t.esikler[sonrakiIndex];
                int barLen = 8;
                int filled = (int) Math.min(barLen, (deger * barLen) / Math.max(1, esik));
                StringBuilder bar = new StringBuilder();
                for (int i = 0; i < barLen; i++) {
                    bar.append(i < filled ? "<J>▰</J>" : "<N>▱</N>");
                }
                panel.append("<V>").append(t.ikon).append(" ").append(t.ad).append("</V> <BL>—</BL> ")
                        .append(bar).append(" <J>").append(degerGoster(t, Math.min(deger, esik))).append("</J><N>/</N><J>")
                        .append(degerGoster(t, esik)).append("</J> <N>→ </N><VP>+").append(t.oduller[sonrakiIndex]).append(" peynir</VP>");
                if (tamamlanan > 0) {
                    panel.append(" <J>✓").append(tamamlanan).append("/").append(t.esikler.length).append("</J>");
                }
            }
            panel.append("<br>");
        }

        panel.append("<br><N>Başarımlar oyun içinde otomatik ilerler; her eşik tek seferlik peynir ödülü açar. İyi şanslar! </N><VP>★</VP>");
        CommandHandler.sendLogMessage(player, 0, panel.toString());
    }

    /**
     * Sayaç artış noktalarından çağrılan ortak başarım kontrolü.
     * Sadece ilgili tetik tipinin eşiklerini tarar; açılan yeni eşikler için
     * renkli bildirim + peynir ödülü verir ve hesabı kaydeder (Cark deseni).
     * Her çağrı try/catch ile korunur — hata oyun akışını asla bozmaz.
     *
     * @param player Sayaçı artan oyuncu.
     * @param tetik Basarim.TETIK_* sabitlerinden biri.
     */
    public static void kontrol(Client player, String tetik) {
        try {
            if (player == null || player.isGuest() || player.getAccount() == null) {
                return;
            }
            Account account = player.getAccount();
            Map<String, Long> acilan = account.getAchievements(); // null-safe lazy init
            long simdiki = System.currentTimeMillis() / 1000L;

            for (Tanim t : TANIMLAR) {
                if (!t.tetik.equals(tetik)) {
                    continue;
                }
                long deger = mevcutDeger(account, t);
                for (int i = 0; i < t.esikler.length; i++) {
                    int esik = t.esikler[i];
                    String anahtar = anahtarOf(t, esik);
                    if (deger >= esik && !acilan.containsKey(anahtar)) {
                        acilan.put(anahtar, simdiki);
                        int odul = t.oduller[i];
                        account.setShopCheeses((account.getShopCheeses() == null ? 0 : account.getShopCheeses()) + odul);
                        account.save(); // odul sonrasi save — Cark desenindeki gibi
                        CommandHandler.sendServerMessage(player, String.format(
                                "<font size='14'><ROSE>★ Başarım açıldı: %s %s (%s)!</ROSE></font> <N>Ödül: </N><VP>+%d peynir</VP>",
                                t.ikon, t.ad, degerGoster(t, esik), odul));
                        Application.getLogger().info(String.format("[Basarim] %s acti: %s (+%d peynir)",
                                player.getPlayerName(), anahtar, odul));
                    }
                }
            }
        } catch (Exception e) {
            Application.getLogger().warn("[Basarim] Kontrol atlandi: " + e.getMessage());
        }
    }

    /**
     * Basarimin guncel degerini hesaptan null-safe okur.
     * Eski hesaplarda alanlar null gelebilir (Morphia) — 0 kabul edilir.
     */
    private static long mevcutDeger(Account account, Tanim t) {
        switch (t.anahtar) {
            case "cheese": return account.getCheeseCount() == null ? 0 : account.getCheeseCount();
            case "first": return account.getFirstCount() == null ? 0 : account.getFirstCount();
            case "saves": return account.getNormalSaves() == null ? 0 : account.getNormalSaves();
            case "bootcamp": return account.getBootcampCount() == null ? 0 : account.getBootcampCount();
            case "streak": return account.getDailyStreak() == null ? 0 : account.getDailyStreak();
            case "time": return account.getPlayedTime() == null ? 0 : account.getPlayedTime();
            case "shaman": return account.getShamanLevel() == null ? 0 : account.getShamanLevel();
            default: return 0;
        }
    }

    /**
     * Panel/bildirim icin degeri gosterir; saatCinsi tanimlarda saat olarak yazar.
     */
    private static String degerGoster(Tanim t, long deger) {
        if (!t.saatCinsi) {
            return String.valueOf(deger);
        }
        if (deger % 3600 == 0) {
            return (deger / 3600) + " sa";
        }
        return String.format("%.1f sa", deger / 3600.0);
    }
}
