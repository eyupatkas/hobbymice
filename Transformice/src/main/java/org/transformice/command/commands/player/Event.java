package org.transformice.command.commands.player;

// Imports
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import org.transformice.Client;
import org.transformice.Server;
import org.transformice.command.Command;
import org.transformice.command.CommandHandler;

@Command(
        name = "event",
        description = "Shows the current weekend event and when it ends.",
        aliases = {"etkinlik"}
)
@SuppressWarnings("unused")
public final class Event implements CommandHandler {
    @Override
    public void execute(Client player, Server server, List<String> args) {
        String ev = server.getActiveWeekendEvent();
        if (ev != null) {
            String maps = "";
            for (int code : server.getWeekendEventMaps(ev)) {
                maps += (maps.isEmpty() ? "" : ", ") + "@" + code;
            }
            CommandHandler.sendLogMessage(player, 0,
                    "<font size='14'><J>🎉 Hafta sonu etkinliği: " + ev + "</J></font><br><br>"
                    + "<N>Bu hafta sonu vanilla odalarda her 3. harita etkinlik haritasıdır: " + maps + "</N><br>"
                    + "<N>Kalan süre: </N><VP>~" + server.getWeekendEventHoursRemaining() + " saat</VP><br><br>"
                    + "<BL>Haftaya başka bir etkinlik seni bekliyor — her hafta doner!</BL>");
            return;
        }

        LocalDate today = LocalDate.now();
        LocalDate friday = today;
        while (friday.getDayOfWeek() != DayOfWeek.FRIDAY) {
            friday = friday.plusDays(1);
        }
        int week = friday.get(java.time.temporal.WeekFields.ISO.weekOfWeekBasedYear());
        String[] events = {"Halloween", "Fishing", "Ninja", "Hugging"};
        String next = events[week % events.length];

        long days = java.time.temporal.ChronoUnit.DAYS.between(today, friday);
        CommandHandler.sendLogMessage(player, 0,
                "<font size='14'><N>Şu an etkinlik yok — hafta sonlarını bekle! 🎉</N></font><br><br>"
                + "<N>Sıradaki etkinlik: </N><VP>" + next + "</VP><br>"
                + "<N>Başlangıç: </N><J>Cuma 00:00</J> <N>(" + days + " gün sonra)</N><br>"
                + "<BL>Cuma-Pazar arası vanilla odalarda her 3. harita etkinlik haritası olur.</BL>");
    }
}
