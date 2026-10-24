package org.transformice.command.commands.player;

// Imports
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.transformice.Client;
import org.transformice.Server;
import org.transformice.command.Command;
import org.transformice.command.CommandHandler;

@Command(
        name = "saat",
        description = "Shows the current server time.",
        aliases = {"clock"}
)
@SuppressWarnings("unused")
public final class Saat implements CommandHandler {
    @Override
    public void execute(Client player, Server server, List<String> args) {
        String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm"));
        CommandHandler.sendServerMessage(player, String.format("<J>Sunucu saati:</J> <VP>%s</VP>", now));
    }
}
