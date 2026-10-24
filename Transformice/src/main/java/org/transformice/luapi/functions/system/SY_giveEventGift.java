package org.transformice.luapi.functions.system;

// Imports
import org.luaj.vm2.LuaValue;
import org.luaj.vm2.Varargs;
import org.luaj.vm2.lib.VarArgFunction;
import org.transformice.Room;
import org.transformice.Application;

// Packets
import org.transformice.packets.send.lua.C_LuaMessage;

public final class SY_giveEventGift extends VarArgFunction {
    private final Room room;

    public SY_giveEventGift(Room room) {
        this.room = room;
    }

    /**
     * Invokes the system.giveEventGift() function.
     * Resmi API'de oyuncuya etkinlik hediyesi/unvani verir. pizzeria kazanan
     * oyuncuya "titre_pizza" anahtarli ozel unvani vermeye calisiyor; boyle bir
     * istemci unvani sunucuda tanimli degil. Fonksiyon yokken "attempt to call
     * nil" ile modul kazanan akisini olduruyordu — artik kibarca yoksayilir
     * (modul kendi duyurusunu yapmaya devam eder).
     * @param args The arguments (playerName, title).
     * @return NIL.
     */
    @Override
    public Varargs invoke(Varargs args) {
        if (this.room.luaDebugLib != null && !this.room.luaDebugLib.checkTestCode()) {
            if (args.isnil(1)) {
                if (this.room.luaAdmin != null) {
                    this.room.luaAdmin.sendPacket(new C_LuaMessage("system.giveEventGift : argument 1 can't be NIL."));
                }
            } else {
                String playerName = args.tojstring(1);
                String gift = args.isnil(2) ? "" : args.tojstring(2);
                Application.getLogger().info("Lua system.giveEventGift : {} (hediye '{}' — ozel unvan destegi yok, yoksayildi) [{}]",
                        playerName, gift, this.room.getRoomName());
            }
        }
        return NIL;
    }
}
