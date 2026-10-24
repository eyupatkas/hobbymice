package org.transformice.luapi.functions.system;

// Imports
import org.luaj.vm2.Varargs;
import org.luaj.vm2.lib.VarArgFunction;
import org.transformice.Room;

public final class SY_disableChatCommandDisplay extends VarArgFunction {
    private final Room room;

    public SY_disableChatCommandDisplay(Room room) {
        this.room = room;
    }

    /**
     * Invokes the system.disableChatCommandDisplay() function.
     * Resmi API semantigi: command nil ise TUM komut gizlemesi acilir/kapanir
     * (cannonup "system.disableChatCommandDisplay(nil, true)", hardcamp/infected
     * argumansiz cagiriyor — eskisi nil'i hata mesajiyla reddediyordu).
     * @param args The arguments.
     * @return NIL.
     */
    @Override
    public Varargs invoke(Varargs args) {
        if (this.room.luaDebugLib != null && !this.room.luaDebugLib.checkTestCode()) {
            boolean activate = args.isnil(2) || args.toboolean(2);
            if (args.isnil(1)) {
                this.room.setDisableAllChatCommandsDisplay(activate);
            } else {
                String command = args.tojstring(1);
                if (activate) {
                    if (this.room.getDisabledChatCommandsDisplay().size() < 100 && !this.room.getDisabledChatCommandsDisplay().contains(command)) {
                        this.room.getDisabledChatCommandsDisplay().add(command);
                    }

                } else if (this.room.getDisabledChatCommandsDisplay().contains(command)) {
                    this.room.getDisabledChatCommandsDisplay().remove(command);
                }
            }
        }

        return NIL;
    }
}
