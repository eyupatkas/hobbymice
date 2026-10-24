package org.transformice.command.commands.player;

// Imports
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import org.transformice.Application;
import org.transformice.Client;
import org.transformice.Server;
import org.transformice.command.Command;
import org.transformice.command.CommandHandler;
import org.transformice.packets.send.chat.C_ServerMessage;

@Command(
        name = "cark",
        usage = "",
        description = "Daily free fortune wheel: cheese, strawberries and gifts.",
        aliases = {"carkifelek", "wheel"}
)
@SuppressWarnings("unused")
public final class Cark implements CommandHandler {
    // Cark dilimleri: [aciklama, agirlik, peynir, cilek] — hediye dilimi ayri yurutulur.
    private static final String[][] SEGMENTS = {
            {"🧀 25 peynir", "24", "25", "0"},
            {"🧀 50 peynir", "20", "50", "0"},
            {"🧀 100 peynir", "12", "100", "0"},
            {"🎁 Sürpriz hediye", "16", "0", "0"},
            {"🍓 1 çilek", "14", "0", "1"},
            {"🧀 50 peynir + 🍓 1 çilek", "8", "50", "1"},
            {"🍓 3 çilek", "4", "0", "3"},
            {"🧀 250 peynir", "1", "250", "0"},
            {"🍓 10 çilek — JACKPOT!", "1", "0", "10"},
    };

    @Override
    public void execute(Client player, Server server, List<String> args) {
        if (player.isGuest()) {
            CommandHandler.sendServerMessage(player, "<N>Misafir hesaplar çarkı çeviremez — ücretsiz kayıt ol, çark senin! 🐭</N>");
            return;
        }

        String today = java.time.LocalDate.now().toString();
        if (today.equals(player.getAccount().getLastWheelSpin())) {
            CommandHandler.sendServerMessage(player, "<N>🎡 Bugünün çarkı çevrildi! Yarın tekrar gel — </N><VP>/cark</VP> <N>ücretsizdir, her gün bir kez.</N>");
            return;
        }

        player.getAccount().setLastWheelSpin(today);

        int totalWeight = 0;
        for (String[] seg : SEGMENTS) totalWeight += Integer.parseInt(seg[1]);
        int roll = ThreadLocalRandom.current().nextInt(totalWeight);
        int picked = 0;
        for (int i = 0; i < SEGMENTS.length; i++) {
            roll -= Integer.parseInt(SEGMENTS[i][1]);
            if (roll < 0) {
                picked = i;
                break;
            }
        }

        // Renkli cark animasyonu: donus mesajlari 0.8/1.6 sn sonra, sonuc 2.4 sn sonra.
        CommandHandler.sendServerMessage(player, "<J>🎡 Çarkıfelek dönüyor...</J> <BL>·</BL><G>·</G><VP>·</VP><BL>·</BL><G>·</G><VP>·</VP>");
        java.util.Timer spinTimer = new java.util.Timer("wheel-spin-" + player.getPlayerName(), true);
        final int segIndex = picked;
        String[] seg = SEGMENTS[segIndex];
        int[] stage = {0};
        spinTimer.scheduleAtFixedRate(new java.util.TimerTask() {
            @Override
            public void run() {
                try {
                    stage[0]++;
                    if (stage[0] == 1) {
                        CommandHandler.sendServerMessage(player, "<VP>🎡 Tak... tak... tak...</VP> <G>Çark yavaşlıyor!</G>");
                    } else if (stage[0] == 2) {
                        int cheese = Integer.parseInt(seg[2]);
                        int strawberries = Integer.parseInt(seg[3]);
                        if (cheese > 0) {
                            player.getAccount().setShopCheeses(player.getAccount().getShopCheeses() + cheese);
                        }
                        if (strawberries > 0) {
                            player.getAccount().setShopStrawberries(player.getAccount().getShopStrawberries() + strawberries);
                        }
                        if (cheese == 0 && strawberries == 0) {
                            // Surpriz hediye: envanter erisilemez eski/bozuk hesaplarda
                            // peynire donusur — oyuncu daima bir odul alir.
                            try {
                                String[] gifts = {"800", "801", "2254", "2261"};
                                String gift = gifts[ThreadLocalRandom.current().nextInt(gifts.length)];
                                int count = 1 + ThreadLocalRandom.current().nextInt(2);
                                player.getParseInventoryInstance().addConsumable(gift, count, true);
                                CommandHandler.sendServerMessage(player, String.format(
                                        "<font size='14'><VP>🎁 Çark durdu: </VP><J>Sürpriz hediye!</J></font> <N>Kazandın: </N><VP>%d adet eşya</VP> <N>(envanterinde)</N>", count));
                            } catch (Exception giftError) {
                                player.getAccount().setShopCheeses(player.getAccount().getShopCheeses() + 40);
                                CommandHandler.sendServerMessage(player,
                                        "<font size='14'><VP>🎁 Çark durdu: </VP><J>Sürpriz hediye!</J></font> <N>Envanterin dolu göründü — hediyen </N><VP>🧀 +40 peynir</VP> <N>olarak verildi!</N>");
                            }
                        } else if (strawberries >= 10) {
                            CommandHandler.sendServerMessage(player, String.format(
                                    "<font size='16'><R>🌟</R><J>✨ ÇARK DURDU: </J><VP>JACKPOT!</VP><J> ✨</J><R>🌟</R></font> <N>Kazandın: </N><VP>🍓 %d çilek!</VP>", strawberries));
                            player.grantCustomTitlePublic(627); // "Şanslı Fare"
                            announceJackpot(server, player);
                        } else {
                            String prize = (cheese > 0 ? "🧀 " + cheese + " peynir" : "") + (strawberries > 0 ? "🍓 " + strawberries + " çilek" : (cheese > 0 ? "" : ""));
                            CommandHandler.sendServerMessage(player, String.format(
                                    "<font size='14'><VP>🎡 Çark durdu!</VP></font> <N>Kazandın: </N><J>%s</J>", prize));
                        }
                        player.getAccount().save();
                        Application.getLogger().info(String.format("[Cark] %s kazandi: seg=%d", player.getPlayerName(), segIndex));
                        this.cancel();
                    }
                } catch (Exception e) {
                    Application.getLogger().warn("[Cark] Animasyon hatasi: " + e.getMessage());
                    this.cancel();
                }
            }
        }, 800L, 800L);
    }

    /**
     * Jackpot duyurusu: tum sunucuya renkli mesaj gider.
     */
    private void announceJackpot(Server server, Client winner) {
        String msg = String.format("<R>🌟</R> <J>JACKPOT!</J> <VP>%s</VP> <N>çarkıfelekten </N><VP>🍓 10 çilek</VP> <N>kazandı! Sıra sende: </N><J>/cark</J> <R>🌟</R>", winner.getPlayerName());
        for (Client c : server.getPlayers().values()) {
            c.sendPacket(new C_ServerMessage(true, msg));
        }
    }
}
