package org.transformice.connection;

// Imports
import java.util.Arrays;
import org.bytearray.ByteArray;
import org.jboss.netty.buffer.ChannelBuffer;
import org.jboss.netty.channel.Channel;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.handler.codec.frame.FrameDecoder;
import org.transformice.Application;

public class Decoder extends FrameDecoder {
    private static final byte[] POLICY_REQUEST = "<policy-file-request/>".getBytes();
    // Telde tek çerçeve için tavan: gerçek TFM paketleri küçüktür (en büyüğü
    // admin Lua/istatistik akışları, onlarca KB). Daha büyüğü bozuk/low-level
    // selektördür; çerçeve kuyruğunu şişirmeden bağlantıyı kapatır.
    private static final int MAX_FRAME_LENGTH = 1 << 20;

    @Override
    protected Object decode(ChannelHandlerContext context, Channel channel, ChannelBuffer buffer) {
        // İşaret BAŞTAN alınır: policy dalına girmeyen (<23 bayt) kısmi
        // çerçevelerde resetReaderIndex() varsayılan 0'a geri sarıp akışı
        // desync edebiliyordu.
        buffer.markReaderIndex();

        if (buffer.readableBytes() < 2) {
            return null;
        }

        if (buffer.readableBytes() >= POLICY_REQUEST.length + 1) {
            byte[] incoming = new byte[POLICY_REQUEST.length + 1];
            buffer.readBytes(incoming);
            if (Arrays.equals(Arrays.copyOf(incoming, POLICY_REQUEST.length), POLICY_REQUEST) && incoming[POLICY_REQUEST.length] == 0) {
                Application.getLogger().warn("Policy file request.");
                // Gerçek Flash istemci policy sonrasi AYNI baglanti uzerinden handshake gonderir;
                // baglanti kapatilmamali (Ruffle policy istegi hic gondermez, bu yuzden tarayicida gorunmez).
                channel.write("<cross-domain-policy><allow-access-from domain=\"*\" to-ports=\"*\" /></cross-domain-policy>\u0000");
                return null;
            }

            buffer.resetReaderIndex();
        }

        int length = 0;
        int shift = 0;
        while (true) {
            if (!buffer.readable()) {
                buffer.resetReaderIndex();
                return null;
            }

            byte b = buffer.readByte();
            length |= (b & 0x7F) << shift;
            if ((b & 0x80) == 0) {
                break;
            }

            shift += 7;
            if (shift > 28) {
                throw new RuntimeException("VLQ length field too long");
            }
        }

        // Tel biçimi: VLQ(length) + length bayt gövde + sondaki 01 baytı = length+1.
        // Eski kontrol `readableBytes() < length` olduğundan TCP segmenti tam paket
        // sınırına denk gelince son bayt henüz gelmemiş olurdu ve readBytes(length+1)
        // IndexOutOfBoundsException fırlatıyordu ("Need 39, maximum is 38") → bağlantı
        // ölümü + zombi oturum + Unhandled packet seli (racing/bootcamp oda düşmesi
        // dahil aynı kök). Eksik çerçeve beklemeYE dönüyor.
        if (length > MAX_FRAME_LENGTH || length < 0) {
            Application.getLogger().warn("Oversized frame (" + length + " bytes), closing " + channel.getRemoteAddress());
            buffer.clear();
            channel.close();
            return null;
        }

        if (buffer.readableBytes() < length + 1) {
            buffer.resetReaderIndex();
            return null;
        }

        byte[] packetData = new byte[length + 1];
        buffer.readBytes(packetData);
        return new ByteArray(packetData);
    }
}
