package org.transformice.command.commands.player;

// Imports
import java.util.List;
import org.transformice.Application;
import org.transformice.Client;
import org.transformice.Room;
import org.transformice.Server;
import org.transformice.command.Command;
import org.transformice.command.CommandHandler;

// Not: /skip muzik atlama komutu olarak alinmis durumda; harita atlama oylamasi /atla.
@Command(
        name = "atla",
        description = "Votes to skip the current map. When more than half of the room votes, the map changes.",
        aliases = {"haritaatla"}
)
@SuppressWarnings("unused")
public final class Atla implements CommandHandler {
    @Override
    public void execute(Client player, Server server, List<String> args) {
        Room room = player.getRoom();
        Application.getLogger().info("[Atla] cagri: " + player.getPlayerName()
                + " oda=" + (room == null ? "yok" : room.getRoomName())
                + " map=" + (room != null && room.getCurrentMap() != null ? room.getCurrentMap().mapCode : "null"));
        if (room == null) {
            CommandHandler.sendServerMessage(player, "<R>Henüz bir odada değilsin.</R>");
            return;
        }

        if (room.getCurrentMap() == null) {
            CommandHandler.sendServerMessage(player, "<R>Şu anda atlanacak bir harita yok.</R>");
            return;
        }

        if (room.isTribeHouse() || room.isMinigame() || room.isLuaMinigame()) {
            CommandHandler.sendServerMessage(player, "<R>Bu odada harita atlama oylaması yapılamaz.</R>");
            return;
        }

        room.addSkipVote(player);
    }
}
