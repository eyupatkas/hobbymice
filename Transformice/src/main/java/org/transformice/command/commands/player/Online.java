package org.transformice.command.commands.player;

// Imports
import java.util.List;
import org.transformice.Client;
import org.transformice.Server;
import org.transformice.command.Command;
import org.transformice.command.CommandHandler;

@Command(
        name = "online",
        description = "Shows how many players are currently online.",
        aliases = {"cevrimici"}
)
@SuppressWarnings("unused")
public final class Online implements CommandHandler {
    @Override
    public void execute(Client player, Server server, List<String> args) {
        int players = server.getPlayers().size();
        int rooms = server.getRoomsCount();
        CommandHandler.sendServerMessage(player, String.format("<VP>%d oyuncu</VP> çevrimiçi — <J>%d oda</J> açık. 🐭", players, rooms));
    }
}
