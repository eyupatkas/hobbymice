package org.transformice.command.commands.player;

// Imports
import java.util.List;
import org.transformice.Client;
import org.transformice.Server;
import org.transformice.command.Command;
import org.transformice.command.CommandHandler;
import org.transformice.database.collections.Account;
import org.transformice.database.embeds.Quest;

@Command(
        name = "gorev",
        usage = "",
        description = "Shows your daily quests and their progress.",
        aliases = {"gorevler", "quests"}
)
@SuppressWarnings("unused")
public final class Gorev implements CommandHandler {
    private static final String[] MISSION_NAMES = {
            null,                 // 0: yok
            "🧀 Peynir topla",             // 1
            "🙏 Şaman olarak fare kurtar",  // 2
            "🕳️ Şaman olarak peyniri deliğe ulaştır", // 3
            "🏁 Racing turunu bitir",       // 4
            "🎈 Defilante turunu bitir",    // 5
            "🛒 Markette eşya satın al",    // 6
            "🌟 Şaman olarak tur başlat",   // 7
    };

    @Override
    public void execute(Client player, Server server, List<String> args) {
        Account account = player.getAccount();
        List<Quest> missions = account.getPlayerMissions();
        if (player.isGuest() || missions == null || missions.isEmpty()) {
            CommandHandler.sendServerMessage(player, "<N>Günlük görevler oyuna ilk girişinde hazırlanır — bir tur oyna ve tekrar dene! 🐭</N>");
            return;
        }

        StringBuilder panel = new StringBuilder();
        panel.append("<font size='14'><J>📋 Günün Görevleri</J></font> <N>— tamamla, peynir kazan; peynir görevleri </N><VP>🍓 çilek görevini</VP> <N>de büyütür!</N><br><br>");

        int completed = 0;
        for (Quest quest : missions) {
            if (quest.getId() == 60801) {
                // Cilek gorevi: diger gorevler tamamlaninca ilerler; dolunca cilek verir.
                panel.append("<VP>🍓 Çilek Sepeti</VP> <BL>—</BL> <J>").append(Math.min(quest.getMissionCollected(), quest.getMissionTotal()))
                        .append("</J><N>/</N><J>").append(quest.getMissionTotal())
                        .append("</J> <N>görev → </N><VP>+").append(quest.getMissionPrize()).append(" çilek</VP><br>");
                continue;
            }
            String name = quest.getId() > 0 && quest.getId() < MISSION_NAMES.length ? MISSION_NAMES[(int) quest.getId()] : ("❓ Görev #" + quest.getId());
            boolean done = quest.getMissionCollected() >= quest.getMissionTotal();
            if (done) completed++;
            int barLen = 8;
            int filled = Math.min(barLen, (quest.getMissionCollected() * barLen) / Math.max(1, quest.getMissionTotal()));
            StringBuilder bar = new StringBuilder();
            for (int i = 0; i < barLen; i++) {
                bar.append(i < filled ? (done ? "<VP>▰</VP>" : "<J>▰</J>") : "<N>▱</N>");
            }
            panel.append(done ? "<VP>" : "<V>").append(name).append("</").append(done ? "VP" : "V").append("> <BL>—</BL> ")
                    .append(bar).append(" <J>").append(Math.min(quest.getMissionCollected(), quest.getMissionTotal()))
                    .append("</J><N>/</N><J>").append(quest.getMissionTotal())
                    .append("</J> <N>→ </N><VP>+").append(quest.getMissionPrize()).append(" peynir</VP>")
                    .append(done ? " <R>✓</R>" : "")
                    .append("<br>");
        }

        panel.append("<br>");
        if (completed >= missions.size() - (hasStrawberry(missions) ? 1 : 0) && completed > 0) {
            panel.append("<font size='14'><R>🏆</R><J>TÜM GÜNLÜK GÖREVLER TAMAM!</J><R>🏆</R></font> <N>Yarın yeni görevler seni bekliyor.</N><br>");
        } else {
            panel.append("<N>İpucu: görevler vanilla odalarda, modlarda ve markette otomatik ilerler.</N><br>");
        }
        CommandHandler.sendLogMessage(player, 0, panel.toString());
    }

    private static boolean hasStrawberry(List<Quest> missions) {
        for (Quest q : missions) {
            if (q.getId() == 60801) return true;
        }
        return false;
    }
}
