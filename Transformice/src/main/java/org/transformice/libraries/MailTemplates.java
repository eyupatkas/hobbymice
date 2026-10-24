package org.transformice.libraries;

/**
 * HobbyMice markali HTML e-posta sablonlari.
 * Harici gorsel KULLANMAZ (webmail istemcileri genelde engeller) — yalniz
 * CSS + emoji. Koyu tema: site paleti (#14101f zemin, #221b3a kart,
 * #372a5c cizgi, #ffcc40 peynir vurgusu).
 */
public final class MailTemplates {
    private static final String BG = "#14101f";
    private static final String CARD = "#221b3a";
    private static final String LINE = "#372a5c";
    private static final String CHEESE = "#ffcc40";
    private static final String TEXT = "#f3effc";
    private static final String MUTED = "#a99cc7";
    private static final String SITE = "https://hobbymice.com.tr";

    /**
     * Builds the branded email shell around the given inner content.
     * @param title The header title inside the card.
     * @param innerHtml The card body HTML (already safe/escaped by callers).
     * @return The full HTML document.
     */
    public static String wrap(String title, String innerHtml) {
        return "<!DOCTYPE html><html><body style=\"margin:0;padding:0;background:" + BG + ";font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;\">"
            + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:" + BG + ";padding:28px 12px;\"><tr><td align=\"center\">"
            + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:520px;background:" + CARD + ";border:1px solid " + LINE + ";border-radius:14px;overflow:hidden;\">"
            + "<tr><td style=\"background:" + BG + ";padding:18px 28px;border-bottom:1px solid " + LINE + ";\">"
            + "<span style=\"font-size:20px;font-weight:bold;color:" + CHEESE + ";\">&#129445; Hobby</span><span style=\"font-size:20px;font-weight:bold;color:" + TEXT + ";\">Mice</span>"
            + "<span style=\"font-size:12px;color:" + MUTED + ";\">&#160;&#160;transformice pvp</span>"
            + "</td></tr>"
            + "<tr><td style=\"padding:26px 28px;color:" + TEXT + ";\">"
            + "<div style=\"font-size:17px;font-weight:bold;margin-bottom:14px;color:" + CHEESE + ";\">" + title + "</div>"
            + innerHtml
            + "</td></tr>"
            + "<tr><td style=\"padding:16px 28px;border-top:1px solid " + LINE + ";color:" + MUTED + ";font-size:11px;line-height:1.6;\">"
            + "Bu e-postayi sen talep etmediysen yok sayabilirsin; hesabin guvende. &#160;•&#160; "
            + "<a href=\"" + SITE + "\" style=\"color:" + CHEESE + ";text-decoration:none;\">hobbymice.com.tr</a>"
            + "<br>&#129476; Peynirin kokusunu hisset!"
            + "</td></tr>"
            + "</table></td></tr></table></body></html>";
    }

    /**
     * Builds a verification-code email (e-posta dogrulama / sifre akislari).
     * @param code The 7-char verification code.
     * @param purposeTr The Turkish purpose line (e.g. "şifre sıfırlama için").
     * @return The full HTML document.
     */
    public static String verificationCode(String code, String purposeTr) {
        String inner = "<p style=\"margin:0 0 8px;font-size:14px;line-height:1.7;color:" + TEXT + ";\">Merhaba! &#129445;</p>"
            + "<p style=\"margin:0 0 18px;font-size:14px;line-height:1.7;color:" + TEXT + ";\">" + purposeTr + " Doğrulama kodun aşağıda:</p>"
            + codeBox(code)
            + "<p style=\"margin:18px 0 0;font-size:12px;line-height:1.7;color:" + MUTED + ";\">Kod kısa süreliğine geçerlidir ve tek kullanımlıktır.<br>Verification code — valid for a short time, single use.</p>";
        return wrap("Doğrulama Kodu", inner);
    }

    /**
     * Builds the staff 2FA device-verification email.
     * @param code The 8-char 2FA code.
     * @param ipAddress The IP address requesting the login.
     * @return The full HTML document.
     */
    public static String twoFactorCode(String code, String ipAddress) {
        String inner = "<p style=\"margin:0 0 8px;font-size:14px;line-height:1.7;color:" + TEXT + ";\">Merhaba yetkili! &#128274;</p>"
            + "<p style=\"margin:0 0 18px;font-size:14px;line-height:1.7;color:" + TEXT + ";\">Hesabına <b style=\"color:" + CHEESE + ";\">yeni bir cihazdan</b> giriş denendi. Bu sen değilsen kodu KİMSEYLE paylaşma; sen değilsen şifreni hemen değiştir.</p>"
            + codeBox(code)
            + "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-top:18px;width:100%;background:" + BG + ";border:1px solid " + LINE + ";border-radius:8px;\"><tr><td style=\"padding:10px 14px;font-size:12px;color:" + MUTED + ";\">"
            + "Giriş denenen IP: <span style=\"color:" + TEXT + ";font-family:monospace;\">" + escape(ipAddress) + "</span>"
            + "</td></tr></table>"
            + "<p style=\"margin:14px 0 0;font-size:12px;color:" + MUTED + ";\">Device verification code — enter it in the game to finish login.</p>";
        return wrap("Giriş Doğrulama (2FA)", inner);
    }

    private static String codeBox(String code) {
        return "<div style=\"text-align:center;margin:6px 0;\">"
            + "<span style=\"display:inline-block;background:" + BG + ";border:2px solid " + CHEESE + ";border-radius:12px;padding:14px 26px;font-family:Consolas,'Courier New',monospace;font-size:30px;letter-spacing:8px;color:" + CHEESE + ";font-weight:bold;\">" + escape(code) + "</span>"
            + "</div>";
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
