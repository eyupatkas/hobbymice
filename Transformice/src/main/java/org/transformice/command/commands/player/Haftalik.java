package org.transformice.command.commands.player;

// Imports
import java.util.List;
import org.transformice.Client;
import org.transformice.Server;
import org.transformice.command.Command;
import org.transformice.command.CommandHandler;
import org.transformice.database.DBUtils;
import org.transformice.database.collections.Account;
import org.transformice.libraries.Pair;

@Command(
        name = "haftalik",
        usage = "",
        description = "Weekly cheese contest: your progress and the top 5 of this week.",
        aliases = {"weekly", "hafta"}
)
@SuppressWarnings("unused")
public final class Haftalik implements CommandHandler {
    @Override
    public void execute(Client player, Server server, List<String> args) {
        String weekKey = Client.currentWeekKey();
        List<Pair<Account, Integer>> top = DBUtils.findBestWeeklyPlayers(weekKey);

        StringBuilder panel = new StringBuilder();
        panel.append("<font size='14'><R>🏁</R> <J>Haftalik Peynir Yarışması</J> <R>🏁</R></font> <N>— hafta: </N><VP>")
                .append(weekKey).append("</VP><br><br>");

        String[] medals = {"🥇", "🥈", "🥉", "4.", "5."};
        int rank = 0;
        for (Pair<Account, Integer> entry : top) {
            Account account = entry.getFirst();
            int value = entry.getSecond() == null ? 0 : entry.getSecond();
            if (value <= 0) continue;
            boolean isSelf = account.getPlayerName().equals(player.getPlayerName());
            panel.append(medals[rank]).append(" ").append(isSelf ? "<VP><b>" : "<V>")
                    .append(account.getPlayerName()).append(isSelf ? "</b></VP>" : "</V>")
                    .append(" <BL>—</BL> <J>").append(value).append("</J> <N>peynir</N><br>");
            rank++;
            if (rank >= 5) break;
        }
        if (rank == 0) {
            panel.append("<N>Henüz kimse peynir toplamadı — bu haftanın birincisi sen olabilirsin!</N><br>");
        }

        if (!player.isGuest()) {
            Account me = player.getAccount();
            int myCheese = me.getWeeklyCheese() == null ? 0 : me.getWeeklyCheese();
            int myFirst = me.getWeeklyFirst() == null ? 0 : me.getWeeklyFirst();
            panel.append("<br><N>Senin bu haftan: </N><J>").append(myCheese)
                    .append("</J> <N>peynir</N> <BL>·</BL> <J>").append(myFirst)
                    .append("</J> <N>first</N> <BL>·</BL> <N>liderle farkın: </N><VP>+</VP>")
                    .append(Math.max(0, (rank > 0 ? top.get(0).getSecond() : 0) - myCheese)).append("<br>");
        }

        panel.append("<br><VP>✨ Ödüller:</VP> <N>pazartesi 00:05'te ilk 3: </N><J>3/2/1 çilek + unvan</J> <N>(1. sıra: </N><R>🏆 Şampiyon Fare</R><N>)</N><br>");
        CommandHandler.sendLogMessage(player, 0, panel.toString());
    }
}
