package org.transformice.luapi.functions.os;

// Imports
import java.util.Calendar;
import java.util.TimeZone;
import org.luaj.vm2.LuaTable;
import org.luaj.vm2.LuaValue;
import org.luaj.vm2.Varargs;
import org.luaj.vm2.lib.VarArgFunction;

public final class OS_date extends VarArgFunction {
    private static final String[] DAYS_SHORT = {"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"};
    private static final String[] DAYS_LONG = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
    private static final String[] MONTHS_SHORT = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
    private static final String[] MONTHS_LONG = {"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"};

    /**
     * Invokes the os.date() function with REAL strftime-style semantics:
     * os.date("*t") returns a table, "%m/%d/%H..." specifiers are rendered.
     * Eski implementasyon format argumanini yok sayiyordu ve sabit string
     * donuyordu — buna bagli olarak moduller (cannonup) init'te oliyordu.
     * @param args The arguments (format, time table).
     * @return The formatted date string or date table.
     */
    @Override
    public Varargs invoke(Varargs args) {
        Calendar cal = Calendar.getInstance();
        boolean isUtc = false;
        String fmt = "%c";

        if (!args.isnil(1)) {
            fmt = args.tojstring(1);
            if (fmt.startsWith("!")) {
                isUtc = true;
                fmt = fmt.substring(1);
            }
            if (fmt.startsWith("*t")) {
                applyTable(cal, args.arg(2));
                return dateTable(cal);
            }
        }
        applyTable(cal, args.arg(2));
        return LuaValue.valueOf(render(fmt, cal));
    }

    private void applyTable(Calendar cal, LuaValue t) {
        if (t.isnil() || !t.istable()) return;
        cal.set(Calendar.YEAR, t.get("year").toint());
        cal.set(Calendar.MONTH, t.get("month").toint() - 1);
        cal.set(Calendar.DAY_OF_MONTH, t.get("day").toint());
        cal.set(Calendar.HOUR_OF_DAY, t.get("hour").toint());
        cal.set(Calendar.MINUTE, t.get("min").toint());
        cal.set(Calendar.SECOND, t.get("sec").toint());
    }

    private LuaValue dateTable(Calendar cal) {
        LuaTable t = LuaValue.tableOf();
        t.set("year", cal.get(Calendar.YEAR));
        t.set("month", cal.get(Calendar.MONTH) + 1);
        t.set("day", cal.get(Calendar.DAY_OF_MONTH));
        t.set("hour", cal.get(Calendar.HOUR_OF_DAY));
        t.set("min", cal.get(Calendar.MINUTE));
        t.set("sec", cal.get(Calendar.SECOND));
        t.set("wday", cal.get(Calendar.DAY_OF_WEEK));
        t.set("yday", cal.get(Calendar.DAY_OF_YEAR));
        t.set("isdst", LuaValue.FALSE);
        return t;
    }

    private String render(String fmt, Calendar cal) {
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < fmt.length(); i++) {
            char c = fmt.charAt(i);
            if (c != '%') {
                out.append(c);
                continue;
            }
            if (i + 1 >= fmt.length()) break;
            char spec = fmt.charAt(++i);
            switch (spec) {
                case 'Y' -> out.append(cal.get(Calendar.YEAR));
                case 'y' -> out.append(String.format("%02d", cal.get(Calendar.YEAR) % 100));
                case 'm' -> out.append(String.format("%02d", cal.get(Calendar.MONTH) + 1));
                case 'd' -> out.append(String.format("%02d", cal.get(Calendar.DAY_OF_MONTH)));
                case 'H' -> out.append(String.format("%02d", cal.get(Calendar.HOUR_OF_DAY)));
                case 'I' -> out.append(String.format("%02d", cal.get(Calendar.HOUR) == 0 ? 12 : cal.get(Calendar.HOUR)));
                case 'M' -> out.append(String.format("%02d", cal.get(Calendar.MINUTE)));
                case 'S' -> out.append(String.format("%02d", cal.get(Calendar.SECOND)));
                case 'p' -> out.append(cal.get(Calendar.AM_PM) == Calendar.AM ? "AM" : "PM");
                case 'a' -> out.append(DAYS_SHORT[cal.get(Calendar.DAY_OF_WEEK) - 1]);
                case 'A' -> out.append(DAYS_LONG[cal.get(Calendar.DAY_OF_WEEK) - 1]);
                case 'b', 'h' -> out.append(MONTHS_SHORT[cal.get(Calendar.MONTH)]);
                case 'B' -> out.append(MONTHS_LONG[cal.get(Calendar.MONTH)]);
                case 'w' -> out.append(cal.get(Calendar.DAY_OF_WEEK) - 1);
                case 'j' -> out.append(String.format("%03d", cal.get(Calendar.DAY_OF_YEAR)));
                case 'U' -> out.append(String.format("%02d", cal.get(Calendar.WEEK_OF_YEAR)));
                case 'c' -> out.append(render("%a %b %d %H:%M:%S %Y", cal));
                case 'x' -> out.append(render("%d/%m/%y", cal));
                case 'X' -> out.append(render("%H:%M:%S", cal));
                case '%' -> out.append('%');
                default -> {
                    out.append('%').append(spec);
                }
            }
        }
        return out.toString();
    }
}
