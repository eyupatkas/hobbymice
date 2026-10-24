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
        name = "top",
        usage = "[cheese|first]",
        description = "Shows the server's top 5 players (cheese or firsts).",
        aliases = {"siralama", "eniyiler"}
)
@SuppressWarnings("unused")
public final class Top implements CommandHandler {
    @Override
    public void execute(Client player, Server server, List<String> args) {
        String type = args.isEmpty() ? "cheese" : args.getFirst().toLowerCase();
        if (!type.equals("cheese") && !type.equals("first")) {
            CommandHandler.sendServerMessage(player, "<N>Kullanım:</N> <VP>/top cheese</VP> <N>veya</N> <VP>/top first</VP>");
            return;
        }

        String criteria = type.equals("first") ? "firstcount" : "cheesecount";
        String label = type.equals("first") ? "First" : "Peynir";
        List<Pair<Account, Integer>> top = DBUtils.findBest10PlayersByCriteria(criteria);

        StringBuilder list = new StringBuilder();
        list.append("<font size='14'><VP>HobbyMice</VP> <N>— en iyi ").append(label.toLowerCase()).append(" ustaları:</N></font><br><br>");
        String[] medals = {"🥇", "🥈", "🥉", "4.", "5."};
        int rank = 0;
        for (Pair<Account, Integer> entry : top) {
            Account account = entry.getFirst();
            if (account.getPlayerName().startsWith("*")) continue; // misafir hesaplar listeye girmez
            int value = entry.getSecond() == null ? 0 : entry.getSecond();
            if (value <= 0) continue;
            String medal = medals[rank];
            boolean isSelf = account.getPlayerName().equals(player.getPlayerName());
            list.append(medal).append(" ").append(isSelf ? "<VP><b>" : "<V>")
                .append(account.getPlayerName()).append(isSelf ? "</b></VP>" : "</V>")
                .append(" <BL>—</BL> <J>").append(value).append("</J> <N>").append(label.toLowerCase()).append("</N><br>");
            rank++;
            if (rank >= 5) break;
        }

        if (rank == 0) {
            list.append("<N>Henüz kimse puan toplamamış — ilk sıra senin olabilir!</N><br>");
        }

        list.append("<br><N>Değiştirmek için: </N><VP>/top cheese</VP> <N>/</N> <VP>/top first</VP>");
        CommandHandler.sendLogMessage(player, 0, list.toString());
    }
}
