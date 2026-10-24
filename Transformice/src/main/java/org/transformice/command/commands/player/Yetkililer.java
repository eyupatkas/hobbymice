package org.transformice.command.commands.player;

// Imports
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.transformice.Client;
import org.transformice.Server;
import org.transformice.command.Command;
import org.transformice.command.CommandHandler;
import org.transformice.database.collections.Account;

@Command(
        name = "yetkililer",
        description = "Lists all the game staff members (online and offline).",
        aliases = {"staff", "ekip"}
)
@SuppressWarnings("unused")
public final class Yetkililer implements CommandHandler {
    // Rol hiyerarsisi: yuksekten dusuge; en yuksek rol "adi > rol" etiketi olarak gosterilir.
    private static final List<String> ROLE_ORDER = List.of(
            "Admin", "Sentinelle", "TrialModo", "Modo", "Arbitre", "MapCrew", "FunCorp", "LuaDev", "FashionSquad"
    );

    @Override
    public void execute(Client player, Server server, List<String> args) {
        List<Account> staff = org.transformice.database.DBUtils.findAllStaff();

        List<Account> online = new ArrayList<>();
        List<Account> offline = new ArrayList<>();
        for (Account account : staff) {
            if (server.checkIsConnected(account.getPlayerName())) {
                online.add(account);
            } else {
                offline.add(account);
            }
        }

        online.sort(Comparator.comparing(Account::getPlayerName, String.CASE_INSENSITIVE_ORDER));
        offline.sort(Comparator.comparing(Account::getPlayerName, String.CASE_INSENSITIVE_ORDER));

        StringBuilder list = new StringBuilder();
        list.append("<font size='14'><VP>HobbyMice</VP> <N>— yetkili ekibi:</N></font><br>");
        list.append("<N>Toplam ").append(staff.size()).append(" yetkili, şu an çevrimiçi: ").append(online.size()).append("</N><br><br>");

        if (!online.isEmpty()) {
            list.append("<J>ÇEVRİMİÇİ</J><br>");
            for (Account account : online) {
                list.append(formatStaff(account, server, true));
            }
            list.append("<br>");
        }

        if (!offline.isEmpty()) {
            list.append("<N>ÇEVRİMDIŞI</N><br>");
            for (Account account : offline) {
                list.append(formatStaff(account, server, false));
            }
        }

        CommandHandler.sendLogMessage(player, 0, list.toString());
    }

    private static String formatStaff(Account account, Server server, boolean isOnline) {
        String name = account.getPlayerName();
        String role = highestRole(account.getStaffRoles());
        String color = isOnline ? "<VP>" : "<N>";
        return color + "• " + name + "</N> <BL>></BL> <J>" + role + "</J> " + (isOnline ? "<VP>çevrimiçi</VP>" : "<BL>çevrimdışı</BL>") + "<br>";
    }

    private static String highestRole(List<String> roles) {
        for (String role : ROLE_ORDER) {
            if (roles.contains(role)) {
                return role;
            }
        }

        return roles.isEmpty() ? "?" : roles.getFirst();
    }
}
