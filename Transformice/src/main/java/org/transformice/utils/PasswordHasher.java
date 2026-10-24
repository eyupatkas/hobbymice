package org.transformice.utils;

// Imports
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

/**
 * Hesap sifrelerini PBKDF2-HMAC-SHA256 ile saklar (yavas hash — DB sizsa bile
 * client token'i dogrudan oynatma/pass-the-hash ve hizli offline kirma engellenir).
 *
 * Format: pbkdf2$<iterations>$<saltBase64>$<hashBase64>
 * Uyumluluk: ayni format web tarafi (website/lib/session.js hashAccountPassword)
 * tarafindan da uretilir/dogrulanir; eski kayitlar (client token duz deger)
 * verify()'da seffaf kabul edilir ve giris sonrasi hash'e gecirilir.
 */
public final class PasswordHasher {
    private static final int ITERATIONS = 120_000;
    private static final int SALT_LENGTH = 16;
    private static final int KEY_LENGTH = 32;
    private static final String PREFIX = "pbkdf2$";
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Hashes the given password (client password token) with PBKDF2.
     * @param password The password token to hash.
     * @return The stored hash string.
     */
    public static String hash(String password) {
        byte[] salt = new byte[SALT_LENGTH];
        RANDOM.nextBytes(salt);
        byte[] derived = pbkdf2(password, salt, ITERATIONS);
        return PREFIX + ITERATIONS + "$" + Base64.getEncoder().encodeToString(salt) + "$" + Base64.getEncoder().encodeToString(derived);
    }

    /**
     * Checks whether the stored value is already in PBKDF2 format.
     * @param stored The stored password value.
     * @return True if the value is a PBKDF2 hash.
     */
    public static boolean isHashed(String stored) {
        return stored != null && stored.startsWith(PREFIX);
    }

    /**
     * Verifies the given password token against the stored value.
     * Legacy (duz metin / eski client token) degerler duz karsilastirma ile kabul edilir.
     * @param password The password token to check.
     * @param stored The stored value.
     * @return True if the token matches.
     */
    public static boolean verify(String password, String stored) {
        if (stored == null || password == null) {
            return false;
        }

        if (!isHashed(stored)) {
            return MessageDigest.isEqual(stored.getBytes(StandardCharsets.UTF_8), password.getBytes(StandardCharsets.UTF_8));
        }

        try {
            String[] parts = stored.split("\\$");
            int iterations = Integer.parseInt(parts[1]);
            byte[] salt = Base64.getDecoder().decode(parts[2]);
            byte[] expected = Base64.getDecoder().decode(parts[3]);
            byte[] actual = pbkdf2(password, salt, iterations);
            return MessageDigest.isEqual(expected, actual);
        } catch (Exception e) {
            return false;
        }
    }

    private static byte[] pbkdf2(String password, byte[] salt, int iterations) {
        try {
            PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, iterations, KEY_LENGTH * 8);
            return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
        } catch (Exception e) {
            throw new IllegalStateException("PBKDF2 unavailable", e);
        }
    }
}
