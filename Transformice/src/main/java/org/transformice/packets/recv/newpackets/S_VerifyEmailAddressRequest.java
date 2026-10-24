package org.transformice.packets.recv.newpackets;

// Imports
import org.bytearray.ByteArray;
import org.transformice.Client;
import org.transformice.libraries.JakartaMail;
import org.transformice.libraries.MailTemplates;
import org.transformice.libraries.SrcRandom;
import org.transformice.packets.RecvPacket;

// Packets
import org.transformice.packets.send.informations.C_SendEmailAddressCode;

@SuppressWarnings("unused")
public final class S_VerifyEmailAddressRequest implements RecvPacket {
    @Override
    public void handle(Client client, int fingerPrint, ByteArray data) {
        if(client.isGuest() || client.getAccount().isVerifiedEmail()) return;

        String emailAddress = data.readString();
        if(!emailAddress.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
            client.sendPacket(new C_SendEmailAddressCode(emailAddress, 8));
            return;
        }

        client.tmpEmailAddress = emailAddress;
        client.tmpEmailAddressCode = SrcRandom.generateNumberAndLetters(7);
        client.setCodeSentTime(System.currentTimeMillis());

        boolean isSent = JakartaMail.sendMessageHtml(client.tmpEmailAddress, "HobbyMice — E-posta Doğrulama Kodu",
                MailTemplates.verificationCode(client.tmpEmailAddressCode, "E-posta adresini doğrulaman gerekiyor."),
                "HobbyMice e-posta doğrulama kodun: " + client.tmpEmailAddressCode);
        client.sendPacket(new C_SendEmailAddressCode(emailAddress, (isSent) ? 5 : 4));
    }

    @Override
    public int getC() {
        return 149;
    }

    @Override
    public int getCC() {
        return 30;
    }

    @Override
    public boolean isLegacyPacket() {
        return false;
    }
}