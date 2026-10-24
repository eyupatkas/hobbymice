package org.transformice.packets.recv.login;

// Imports
import java.util.List;
import java.util.stream.Collectors;
import org.bytearray.ByteArray;
import org.transformice.Application;
import org.transformice.Client;
import org.transformice.database.DBUtils;
import org.transformice.database.collections.Account;
import org.transformice.libraries.JakartaMail;
import org.transformice.libraries.MailTemplates;
import org.transformice.libraries.SrcRandom;
import org.transformice.packets.RecvPacket;

// Packets
import org.transformice.packets.send.login.C_AccountError;

@SuppressWarnings("unused")
public final class S_LoginAccount implements RecvPacket {
    // Hesap-başına brute-force yavaşlatıcı (2026-10-13): aynı hesap adında üst üste
    // hatalı deneme gelirse yanıt LOGIN_BACKOFF_MS gecikir. IP tabanlı throttle
    // kullanılamaz — köprü üzerinden gelen TÜM oyuncular 127.0.0.1'den görünür.
    // Başarılı girişte sayaç silinir; eşik 5 hata / 10 dk penceresi.
    private static final java.util.concurrent.ConcurrentHashMap<String, long[]> LOGIN_FAILURES = new java.util.concurrent.ConcurrentHashMap<>();
    private static final int LOGIN_FAIL_THRESHOLD = 5;
    private static final long LOGIN_FAIL_WINDOW_MS = 10 * 60_000L;
    private static final long LOGIN_BACKOFF_MS = 2_000L;

    private static void recordLoginFailure(String nickname) {
        String key = nickname == null ? "" : nickname.toLowerCase();
        long now = System.currentTimeMillis();
        LOGIN_FAILURES.compute(key, (k, v) -> {
            if (v == null || now - v[1] > LOGIN_FAIL_WINDOW_MS) {
                return new long[]{1, now};
            }
            v[0]++;
            v[1] = now;
            return v;
        });
        // pencere kapanan eski kayıtları hafızada birikmesin
        if (LOGIN_FAILURES.size() > 10_000) {
            LOGIN_FAILURES.entrySet().removeIf(en -> now - en.getValue()[1] > LOGIN_FAIL_WINDOW_MS);
        }
    }

    private static void applyLoginBackoffIfThrottled(String nickname) {
        String key = nickname == null ? "" : nickname.toLowerCase();
        long[] v = LOGIN_FAILURES.get(key);
        if (v != null && v[0] >= LOGIN_FAIL_THRESHOLD && System.currentTimeMillis() - v[1] <= LOGIN_FAIL_WINDOW_MS) {
            try {
                Thread.sleep(LOGIN_BACKOFF_MS);
            } catch (InterruptedException ignored) {
                Thread.currentThread().interrupt();
            }
        }
    }

    @Override
    public void handle(Client client, int fingerPrint, ByteArray data) {
        try {
            data = data.decryptIdentification(Application.getSwfInfo().packet_keys, "identification");
            String nickname = data.readString();
            String password = data.readString();
            String swfUrl = data.readString();
            String startRoom = data.readString();
            int authKey = data.readInt();
            int hardModeUnk = data.readShort();
            int loginMethod = data.readByte();
            String twoFactorAuth = data.readString();
            for (int i = 0; i < Application.getSwfInfo().login_keys.size(); i++) {
                authKey ^= Application.getSwfInfo().login_keys.get(i);
            }

            if((!Application.getSwfInfo().swf_url.isEmpty() && !Application.getSwfInfo().swf_url.equals(swfUrl)) || Application.getSwfInfo().authorization_key != authKey || hardModeUnk != 0x12 || loginMethod != 0x00) {
                Application.getLogger().info(String.format("[Connection] The IP address %s tried to login or register with unofficial swf.", client.getIpAddress()));
                client.closeConnection();
                return;
            }

            if(client.loginAttempts > Application.getPropertiesInfo().login_attempts) {
                Application.getLogger().warn(String.format("[DDOS] The ip %s has exceeded the maximum number of login attempts.", client.getIpAddress()));
                client.getServer().getTempBlackList().add(client.getIpAddress());
                client.closeConnection();
                return;
            }

            if(password.isEmpty()) {
                // guest login
                if(Application.getPropertiesInfo().beta_login) {
                    client.sendPacket(new C_AccountError(2));
                    return;
                }

                nickname = (nickname.isEmpty()) ? "*Souris_" + SrcRandom.generateNumber(5) : "*" + nickname.replaceAll("[^a-zA-Z0-9]", "");
                while(client.getServer().checkIsConnected(nickname)) {
                    nickname =  "*Souris_" + SrcRandom.generateNumber(5);
                }

                client.sendLogin(new Account(nickname, "", "", "", true), nickname, String.format("%c[Tutorial] %s", (char)3, nickname), false, true);
                return;
            }

            if(nickname.contains("@") && Application.getPropertiesInfo().allow_email) {
                applyLoginBackoffIfThrottled(nickname);
                List<Account> accountList = DBUtils.findAccountsByEmailPassword(nickname, password);
                if(accountList == null || accountList.isEmpty()) {
                    client.loginAttempts++;
                    recordLoginFailure(nickname);
                    client.sendPacket(new C_AccountError(2));
                    return;

                } else if(accountList.size() == 1) {
                    nickname = accountList.getFirst().getPlayerName();
                }
                else {
                    client.sendPacket(new C_AccountError(accountList.stream().map(Account::getPlayerName).collect(Collectors.joining("¤"))));
                    return;
                }
            }

            applyLoginBackoffIfThrottled(nickname);
            Account account = DBUtils.findAccountByLogin(nickname, password);
            if(account == null) {
                client.loginAttempts++;
                recordLoginFailure(nickname);
                client.sendPacket(new C_AccountError(2));
                return;
            }
            nickname = account.getPlayerName();
            LOGIN_FAILURES.remove(nickname.toLowerCase());

            if(client.getServer().checkIsConnected(nickname)) {
                client.loginAttempts++;
                client.sendPacket(new C_AccountError(1));
                return;
            }

            if(Application.getPropertiesInfo().enable_staff_2FA_verification) {
                if(!account.getLastIPAddress().equals(client.getIpAddress()) && !account.getStaffRoles().isEmpty() && !client.hasSent2FAEmail) {
                    client.hasSent2FAEmail = true;
                    client.token2FA = SrcRandom.generateNumberAndLetters(8);
                    client.setCodeSentTime(System.currentTimeMillis());
                    client.sendPacket(new C_AccountError(15, account.getEmailAddress()));
                    JakartaMail.sendMessageHtml(account.getEmailAddress(), "HobbyMice — Giriş Doğrulama Kodu",
                            MailTemplates.twoFactorCode(client.token2FA, client.getIpAddress()),
                            "HobbyMice giriş doğrulama kodun: " + client.token2FA + " (IP: " + client.getIpAddress() + ")");
                    return;
                }

                if(client.hasSent2FAEmail && (client.isCodeExpired() || !twoFactorAuth.equals(client.token2FA))) {
                    client.loginAttempts++;
                    client.sendPacket(new C_AccountError(2));
                    if(client.loginAttempts > 5) {
                        client.hasSent2FAEmail = false;
                    }
                    return;
                }
            }

            if(Application.getPropertiesInfo().beta_login) {
                if(account.getBetaInviter().isEmpty()) {
                    client.loginAttempts++;
                    client.sendPacket(new C_AccountError(2));
                    return;
                }
            }
            client.sendLogin(account, nickname, startRoom, false, false);

        } catch (Exception e) {
            // internal error
            client.sendPacket(new C_AccountError(6));
            throw new RuntimeException(e);
        }
    }

    @Override
    public int getC() {
        return 26;
    }

    @Override
    public int getCC() {
        return 8;
    }

    @Override
    public boolean isLegacyPacket() {
        return false;
    }
}