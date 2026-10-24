package org.transformice.command.commands.player;

// Imports
import java.util.List;
import java.util.Map;
import org.transformice.Client;
import org.transformice.Server;
import org.transformice.command.Command;
import org.transformice.command.CommandHandler;
import org.transformice.command.CommandLoader;

@Command(
        name = "help",
        description = "Lists all the commands you can use, in your language.",
        aliases = {"yardim", "komutlar", "?", "h"}
)
@SuppressWarnings("unused")
public final class Help implements CommandHandler {
    // Komut aciklamalari ulke diline gore. Burada olmayanlar Ingilizce (annotation)
    // gosterilir; yeni dil eklemek icin yeni harita eklemek yeterli.
    private static final Map<String, String> TR = Map.ofEntries(
            Map.entry("help", "Kullanabileceğin komutları listeler."),
            Map.entry("yardim", "Kullanabileceğin komutları listeler."),
            Map.entry("ping", "Sunucuya ping süreni gösterir."),
            Map.entry("online", "Çevrimiçi oyuncu ve oda sayısını gösterir."),
            Map.entry("saat", "Sunucu saatini gösterir."),
            Map.entry("time", "Hesabındaki toplam oynama süresini gösterir."),
            Map.entry("info", "Sunucu bilgilerini gösterir."),
            Map.entry("profile", "Profil kartını gösterir."),
            Map.entry("mort", "Odadaki ölüm sayılarını gösterir."),
            Map.entry("title", "Unvanlarını listeler veya seçer."),
            Map.entry("totem", "Totemini gösterir."),
            Map.entry("resettotem", "Totemini sıfırlar."),
            Map.entry("tutorial", "Eğitim haritasına döner."),
            Map.entry("vanilla", "Vanilla odaya gider."),
            Map.entry("racing", "Racing odaya gider."),
            Map.entry("survivor", "Survivor odaya gider."),
            Map.entry("bootcamp", "Bootcamp odaya gider."),
            Map.entry("defilante", "Defilante odaya gider."),
            Map.entry("mulodrome", "Mulodrome odaya gider."),
            Map.entry("editor", "Harita editörünü açar."),
            Map.entry("pw", "Kabile evi şifresini ayarlar."),
            Map.entry("skip", "Haritayı atlama oyu verir."),
            Map.entry("avatar", "Avatarını değiştirir."),
            Map.entry("codecadeau", "Hediye kodu kullanır."),
            Map.entry("luahelp", "Lua betik yardımını gösterir."),
            Map.entry("yetkililer", "Tüm oyun yetkililerini listeler."),
            Map.entry("event", "Hafta sonu etkinliğini ve kalan süreyi gösterir."),
            Map.entry("etkinlik", "Hafta sonu etkinliğini ve kalan süreyi gösterir."),
            Map.entry("top", "Sunucunun en iyi 5 oyuncusunu gösterir (/top cheese|first)."),
            Map.entry("cark", "Günde bir kez ücretsiz çarkıfelek çevirir — peynir, çilek ve hediyeler."),
            Map.entry("carkifelek", "Günde bir kez ücretsiz çarkıfelek çevirir — peynir, çilek ve hediyeler."),
            Map.entry("gorev", "Günün görevlerini ve ilerlemenizi renkli panelde gösterir."),
            Map.entry("basarim", "Başarımlarınızı ve ilerlemenizi renkli panelde gösterir — eşikler peynir ödülü açar."),
            Map.entry("basarimlar", "Başarımlarınızı ve ilerlemenizi renkli panelde gösterir — eşikler peynir ödülü açar."),
            Map.entry("haftalik", "Haftalık peynir yarışmasını ve ilk 5'i gösterir."),
            Map.entry("c", "Kabile sohbetine yazar."),
            Map.entry("w", "Bir oyuncuya özel mesaj yazar."),
            Map.entry("t", "Kabile sohbetini açar/kapatır."),
            Map.entry("chat", "Sohbet odası açar/katılır."),
            Map.entry("friend", "Arkadaşlık isteklerini yönetir."),
            Map.entry("npp", "Sonraki haritayı gösterir (mapcrew)."),
            Map.entry("np", "Sonraki haritayı ayarlar (mapcrew)."),
            Map.entry("musique", "Odada müzik çalar."),
            Map.entry("langue", "Oyun dilini değiştirir."),
            Map.entry("resetpassword", "Şifreni değiştirir."),
            Map.entry("campaign", "Etkinlik kampanyasını gösterir."),
            Map.entry("shopping", "Mağazayı açar."),
            Map.entry("planchede", "Kalıpları gösterir."),
            Map.entry("montre", "İzleme modunu açar."),
            Map.entry("buff", "Etkinlik buff'larını gösterir."),
            Map.entry("sy", "Ruh eşini gösterir."),
            Map.entry("hdv", "Pazar yerini gösterir."),
            Map.entry("trad", "Çeviri aracını açar."),
            Map.entry("money", "Mağaza bakiyelerini gösterir."),
            Map.entry("rename", "Bir hesabın adını değiştirir (moderasyon) — çevrimiçi oyuncu yeniden bağlanmalı."),
            Map.entry("isimdegistir", "Bir hesabın adını değiştirir (moderasyon) — çevrimiçi oyuncu yeniden bağlanmalı.")
    );

    @Override
    public void execute(Client player, Server server, List<String> args) {
        CommandLoader loader = server.getCommandHandler();
        String lang = (player.getCountryLangue() == null || player.getCountryLangue().isEmpty()) ? "en" : player.getCountryLangue().toLowerCase();
        boolean useTr = lang.equals("tr");

        StringBuilder list = new StringBuilder();
        list.append("<font size='14'><")
            .append(useTr ? "VP" : "BV")
            .append(">HobbyMice</VP> <N>— ")
            .append(useTr ? "kullanabileceğin komutlar" : "commands you can use")
            .append(":</N></font><br><br>");

        int count = 0;
        for (Command annotation : loader.getAnnotations().values()) {
            if (!loader.checkPermission(annotation.permission(), player)) {
                continue; // yetkisi olmayan komut listelenmez
            }

            String name = annotation.name();
            String description = translate(annotation.description(), name, useTr);
            String usage = annotation.usage();
            list.append("<VP>/").append(name).append("</VP> ");
            if (!usage.isEmpty()) {
                list.append("<N>").append(usage).append("</N> ");
            }
            list.append("<BL>").append(description).append("</BL><br>");
            count++;
        }

        list.append("<br><N>").append(count).append(useTr ? " komut — detay için yöneticilere sorabilirsin." : " commands — ask staff members for details.").append("</N>");
        CommandHandler.sendLogMessage(player, 0, list.toString());
    }

    /**
     * Picks the description in the player's language (TR sozlugu, degilse annotation).
     * @param descriptions The annotation description array.
     * @param name The command name.
     * @param useTr Whether to use the Turkish dictionary.
     * @return The translated description.
     */
    private static String translate(String[] descriptions, String name, boolean useTr) {
        String base = (descriptions != null && descriptions.length > 0) ? descriptions[0] : "";
        if (!useTr) {
            return base;
        }

        return TR.getOrDefault(name, base);
    }
}
