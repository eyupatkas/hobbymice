package org.transformice.packets.recv.informations;

// Imports
import org.bytearray.ByteArray;
import org.transformice.Client;
import org.transformice.database.DBUtils;
import org.transformice.database.collections.Account;
import org.transformice.libraries.JakartaMail;
import org.transformice.libraries.MailTemplates;
import org.transformice.libraries.SrcRandom;
import org.transformice.packets.RecvPacket;

// Packets
import org.transformice.packets.send.informations.C_SendEmailAddressCode;

@SuppressWarnings("unused")
public final class S_VerifyAccountByNickAndEmail implements RecvPacket {
    @Override
    public void handle(Client client, int fingerPrint, ByteArray data) {
        // Bu paket LOGIN EKRANINDAN da gelir (şifremi unuttum akışı) — hesap
        // null olabilir; eski kod isVerifiedEmail()'i hesapsız Client'ta
        // çağırıp NPE atıyordu (journal 2026-10-05 ×2, 2026-10-11).
        if (client.isGuest()) return;
        if (client.getAccount() != null && client.getAccount().isVerifiedEmail()) return;

        String nickname = data.readString();
        String email = data.readString();
        Account myAccount = DBUtils.findAccountByNickname(nickname);
        if(myAccount == null || !myAccount.getEmailAddress().equals(email)) {
            client.sendPacket(new C_SendEmailAddressCode(email, 8));
            return;
        }

        client.tmpEmailAddress = email;
        client.tmpEmailAddressCode = SrcRandom.generateNumberAndLetters(7);
        client.setCodeSentTime(System.currentTimeMillis());

        boolean isSent = JakartaMail.sendMessageHtml(client.tmpEmailAddress, "HobbyMice — Şifre Sıfırlama Kodu",
                MailTemplates.verificationCode(client.tmpEmailAddressCode, "Hesabın için <b style=\"color:#ffcc40;\">şifre sıfırlama</b> talebinde bulunuldu."),
                "HobbyMice şifre sıfırlama doğrulama kodun: " + client.tmpEmailAddressCode);
        client.sendPacket(new C_SendEmailAddressCode(email, (isSent) ? 10 : 4));
    }

    @Override
    public int getC() {
        return 28;
    }

    @Override
    public int getCC() {
        return 40;
    }

    @Override
    public boolean isLegacyPacket() {
        return false;
    }
}