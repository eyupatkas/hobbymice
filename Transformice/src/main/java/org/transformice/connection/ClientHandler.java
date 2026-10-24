package org.transformice.connection;

// Imports
import java.net.InetSocketAddress;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.ChannelStateEvent;
import org.jboss.netty.channel.ExceptionEvent;
import org.jboss.netty.channel.MessageEvent;
import org.jboss.netty.channel.SimpleChannelHandler;
import org.bytearray.ByteArray;
import org.transformice.Application;
import org.transformice.Client;
import org.transformice.Server;
import org.transformice.packets.PacketStruct;

public final class ClientHandler extends SimpleChannelHandler {
    private final Server server;
    private long lastExceptionLogTime;

    public ClientHandler(Server server) {
        this.server = server;
    }

    @Override
    public void channelClosed(ChannelHandlerContext context, ChannelStateEvent e) {
        Client client = (Client) context.getChannel().getAttachment();
        if (client != null) {
            client.closeConnection();
        }

        this.server.removeClientSession(context.getChannel());
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, ExceptionEvent e) {
        // Zararsiz kopmalar (oyuncu sekmeyi kapatirken Connection reset / Broken pipe)
        // hata DEGILDIR: sessizce baglantiyi kapat, log ve sel sayaci derlemeden gec.
        Throwable cause = e.getCause();
        if (cause instanceof java.net.SocketException
                || (cause != null && cause.getCause() instanceof java.net.SocketException)) {
            ctx.getChannel().close();
            return;
        }

        // Paket-exception seli korumasi: bozuk paket basina ERROR + stack yazilabiliyordu
        // (dünkü (0,19) selinin ayni sinifi). Uyari global 5 sn'de bir sinirlandi;
        // 10 sn'de 10+ exception ureten baglanti sunucu tarafindan kapatilir.
        long now = System.currentTimeMillis();
        Client client = (Client) ctx.getChannel().getAttachment();
        if (client != null) {
            if (now - client.getExceptionWindowStart() > 10_000L) {
                client.setExceptionWindowStart(now);
                client.setExceptionInWindow(0);
            }
            client.setExceptionInWindow(client.getExceptionInWindow() + 1);
            if (client.getExceptionInWindow() > 10) {
                ctx.getChannel().close();
            }
        }

        if (now - this.lastExceptionLogTime > 5_000L) {
            this.lastExceptionLogTime = now;
            Application.getLogger().error(Application.getTranslationManager().get("packeterror"), e.getCause());
        }
    }

    @Override
    public void messageReceived(ChannelHandlerContext context, MessageEvent e) {
        if (!(e.getMessage() instanceof ByteArray packet)) {
            return;
        }

        // Gecici blacklist diyagnostik icin tutuluyor — KOPRUYU KULLANAN TUM
        // OYUNCULAR ayni IP'den (127.0.0.1) geldigi icin burada ASLA
        // baglanti KAPATILMAZ; tek tetiklenen oyuncu herkesi kilitleyerdi.
        if(!this.server.getTempBlackList().isEmpty() && System.currentTimeMillis() - this.server.getLastBlacklistClear() > 15 * 60 * 1000L) {
            this.server.getTempBlackList().clear();
            this.server.setLastBlacklistClear(System.currentTimeMillis());
        }

        Client client = (Client) context.getChannel().getAttachment();
        if (client == null) {
            this.server.addClientSession(context.getChannel());
            client = (Client) context.getChannel().getAttachment();
        }

        // Baglanti canlilik izi — Server idle-connection temizleyicisi buna gore
        // oluluk/zombi oturumlari (CLOSE-WAIT) restart'siz kapatir.
        client.setLastActivityTime(System.currentTimeMillis());

        // Cok kisa/bozuk paket: header icin min 3 bayt (fingerPrint+C+CC) yoksa
        // sessizce yoksay — header okumasi NoSuchElementException firlatiyordu
        // (journal 2026-10-07 10:47 / 16:01 sondasiyla yeniden uretildi).
        if (packet.getLength() < 3) {
            return;
        }

        int fingerPrint = packet.readUnsignedByte();
        int C = packet.readUnsignedByte();
        int CC = packet.readUnsignedByte();
        boolean isLegacy = false;
        if(C == 1 && CC == 1) {
            // Legacy kafa: uzunluk(2) + C + CC icin en az 4 bayt daha gerekli.
            if (packet.getLength() < 4) {
                return;
            }
            isLegacy = true;
            packet.readShort(); // packet length
            C = packet.readByte();
            CC = packet.readByte();
            if(packet.getLength() > 0) packet.readByte(); // 01
        }

        if(this.server.getBlacklistedPackets().contains(((C << 8) | (CC & 0xFF)))) {
            return;
        }

        var handler = client.getServer().getPacketHandler().getHandlers().get(new PacketStruct(((C << 8) | (CC & 0xFF)), isLegacy));
        if (handler != null) {
            // Oda-zorunlu paket aileleri (room/*, player/*): odasiz istemciden gelirse
            // yoksay — handler'lar getRoom()'un null olmadigini varsayarak NPE uretiyor
            // (S_PlayerSync firtinasi, 2026-10-03). S_EnterRoom istisna: oda YOKKEN
            // odaya girisi saglayan paket odadir.
            String handlerPkg = handler.getClass().getPackage().getName();
            if (client.getRoom() == null
                    && (handlerPkg.startsWith("org.transformice.packets.recv.player") || handlerPkg.endsWith(".room"))
                    && !handler.getClass().getSimpleName().equals("S_EnterRoom")) {
                return;
            }
            Application.getLogger().debug(Application.getTranslationManager().get("receivedpacket", isLegacy ? "[Legacy]" : "", client.getIpAddress(), C, CC));
            handler.handle(client, fingerPrint, packet);
        } else {
            // Bilinmeyen paket seli korumasi: isleyicisiz paket her mesajda WARN
            // basiyordu (sn'de ~120k log + CLOSE-WAIT/FD birikimi). Global 5 sn
            // susturucu yavas damlayan kaynagi (10 sn'de 1 paketlik bot) hic
            // durdurmuyordu; uyari artik BAGLANTI basina 5 dk'da bir ve kaynak
            // IP'yi gosterir. 10 sn/30+ paket kapatma esigi aynen korunur.
            long now = System.currentTimeMillis();
            if (now - client.getUnhandledWindowStart() > 10_000L) {
                client.setUnhandledWindowStart(now);
                client.setUnhandledInWindow(0);
            }
            client.setUnhandledInWindow(client.getUnhandledInWindow() + 1);
            if (client.getUnhandledInWindow() > 30) {
                context.getChannel().close();
            } else if (now - client.getLastUnhandledWarnTime() > 5 * 60_000L) {
                client.setLastUnhandledWarnTime(now);
                Application.getLogger().warn(Application.getTranslationManager().get("unhandledpacket", isLegacy ? "[Legacy]" : "", C, CC) + " <- " + client.getIpAddress());
            }
        }
    }
}