package org.transformice.command.commands.modo;

// Imports
import java.util.List;
import org.transformice.Application;
import org.transformice.Client;
import org.transformice.Server;
import org.transformice.command.Command;
import org.transformice.command.CommandHandler;
import org.transformice.database.DBUtils;
import org.transformice.database.collections.Account;
import org.transformice.database.collections.Stafflog;

// Packets
import org.transformice.packets.send.chat.C_ServerMessage;

@Command(
        name = "rename",
        usage = "[currentName] [newName]",
        description = "Renames an account (online or offline). Online players must reconnect afterwards.",
        aliases = {"isimdegistir"},
        permission = {Command.CommandPermission.MODERATOR, Command.CommandPermission.ADMINISTRATOR},
        requiredArgs = 2
)
@SuppressWarnings("unused")
public final class Rename implements CommandHandler {
    // Kayit rumuz kurallariyla AYNI desen (S_RegisterAccount): harf ile baslar,
    // harf/rakam/alt cizgi, 3-11 karakter, cift alt cizgi ve sondaki alt cizgi yasak.
    private static final String NICKNAME_PATTERN = "^(?=^(?:(?!.*_$).)*$)(?=^(?:(?!_{2,}).)*$)[A-Za-z][A-Za-z0-9_]{2,11}$";

    @Override
    public void execute(Client player, Server server, List<String> args) {
        String currentName = args.get(0);
        String newNameInput = args.get(1);

        // 1) Hedef hesabi bul: once tam ad; etiketsiz girildiyse "<ad>#xxxx" adaylari.
        Account target = server.getPlayerAccount(currentName);
        if (target == null) {
            List<Account> candidates = DBUtils.findAccountsByNameCandidates(currentName);
            if (candidates.isEmpty()) {
                CommandHandler.sendServerMessage(player, Application.getTranslationManager().get("invalidusername"));
                return;
            }
            if (candidates.size() > 1) {
                StringBuilder list = new StringBuilder("<R>Bu ada birden fazla hesap düşüyor — etiketle yaz:</R> ");
                for (Account candidate : candidates) {
                    list.append("<BV>").append(candidate.getPlayerName()).append("</BV> ");
                }
                CommandHandler.sendServerMessage(player, list.toString());
                return;
            }
            target = candidates.getFirst();
        }

        String oldName = target.getPlayerName();

        // 2) Yeni adin temel kismini (etiket oncesi) ayristir.
        String newBase = newNameInput;
        String newTag = "";
        if (newNameInput.contains("#")) {
            int tagIndex = newNameInput.indexOf('#');
            newBase = newNameInput.substring(0, tagIndex);
            newTag = newNameInput.substring(tagIndex + 1);
            if (!newTag.matches("\\d{4}")) {
                CommandHandler.sendServerMessage(player, "<R>Etiket 4 haneli olmalı (ör. Ahmet#1234).</R>");
                return;
            }
        } else if (oldName.contains("#")) {
            // Etiket verilmediyse mevcut etiket korunur.
            newTag = oldName.substring(oldName.indexOf('#') + 1);
        }

        // 3) Kayit kurallari: karakter seti + uzunluk + kufur filtresi (S_RegisterAccount ile ayni).
        if (!newBase.matches(NICKNAME_PATTERN) || newBase.length() > 11) {
            CommandHandler.sendServerMessage(player, "<R>Yeni ad gecersiz: 3-11 karakter, harf ile başlamalı, sadece harf/rakam/_ (çift _ ve sondaki _ yasak).</R>");
            return;
        }
        java.util.List<String> badWords = Application.getBadWordsConfig();
        if (badWords != null) {
            String baseLower = newBase.toLowerCase();
            for (String bad : badWords) {
                if (bad != null && !bad.isEmpty() && baseLower.contains(bad.toLowerCase())) {
                    CommandHandler.sendServerMessage(player, "<R>Yeni ad küfür/hakaret filtresine takıldı.</R>");
                    return;
                }
            }
        }

        String finalName = newBase + (newTag.isEmpty() ? "" : "#" + newTag);
        if (finalName.equals(oldName)) {
            CommandHandler.sendServerMessage(player, "<R>Hesap zaten bu isimde: <BV>" + finalName + "</BV></R>");
            return;
        }

        // 4) Cakisma kontrolu: ayni ada baska bir DB hesabi veya cevrimici oyuncu var mi.
        Account existing = DBUtils.findAccountByNickname(finalName);
        if (existing != null && existing.getId() != target.getId()) {
            CommandHandler.sendServerMessage(player, "<R>Bu ad zaten kayıtlı: <BV>" + finalName + "</BV> — başka bir etiket dene.</R>");
            return;
        }
        if (server.checkIsConnected(finalName)) {
            CommandHandler.sendServerMessage(player, "<R>Bu adla şu anda bir oyuncu çevrimiçi: <BV>" + finalName + "</BV> — çıkmasını bekle.</R>");
            return;
        }

        // 5) Islem: accounts.playerName guncellenir ve kaydedilir. Canli oturum
        // (oda oyuncu map'leri, arkadas listesi anahtarlari) elle dokunulmaz —
        // guvenli yol oyuncunun yeniden baglanmasidir.
        target.setPlayerName(finalName);
        target.save();

        // 6) Hedef cevrimiciyse yeni adini ve yeniden baglanma gereksinimini bildir.
        Client onlineTarget = server.getPlayers().get(oldName);
        if (onlineTarget != null && !onlineTarget.isGuest()) {
            onlineTarget.sendPacket(new C_ServerMessage(true, String.format(
                    "<ROSE>Hesabın <BV>%s</BV> adına değiştirildi!</ROSE> <N>Oyunu kapatıp yeni adınla </N><VP>%s</VP> <N>yeniden bağlan.</N>",
                    finalName, finalName)));
        }

        // 7) Islem kaydi: stafflog koleksiyonuna (Kick/Mute ile ayni desen).
        new Stafflog(player.getPlayerName(), "Rename", List.of(oldName, finalName));
        Application.getLogger().info(String.format("[Rename] %s -> %s (yapan: %s)", oldName, finalName, player.getPlayerName()));
        CommandHandler.sendServerMessage(player, String.format(
                "<VP>Hesap yeniden adlandırıldı: </VP><R>%s</R> <N>→</N> <BV>%s</BV>%s",
                oldName, finalName, onlineTarget != null ? " <N>(oyuncu çevrimiçi — yeniden bağlanması gerekiyor)</N>" : ""));
    }
}
