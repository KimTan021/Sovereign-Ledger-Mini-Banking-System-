package com.sovereign_ledger.util;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;

public class AesEncryptionUtil {

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;  // 96 bits — GCM standard
    private static final int GCM_TAG_LENGTH = 128; // bits

    public static String encrypt(String data, String secretKey) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);
        SecretKeySpec keySpec = new SecretKeySpec(keyBytes, ALGORITHM);

        // Generate a random IV for every encryption
        byte[] iv = new byte[GCM_IV_LENGTH];
        new SecureRandom().nextBytes(iv);

        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, new GCMParameterSpec(GCM_TAG_LENGTH, iv));

        byte[] encryptedBytes = cipher.doFinal(data.getBytes());

        // Prepend IV to ciphertext so we can extract it during decryption
        byte[] combined = new byte[iv.length + encryptedBytes.length];
        System.arraycopy(iv, 0, combined, 0, iv.length);
        System.arraycopy(encryptedBytes, 0, combined, iv.length, encryptedBytes.length);

        return Base64.getEncoder().encodeToString(combined);
    }

    public static String decrypt(String encryptedData, String secretKey) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);
        SecretKeySpec keySpec = new SecretKeySpec(keyBytes, ALGORITHM);

        byte[] combined = Base64.getDecoder().decode(encryptedData);

        // Extract IV from the first 12 bytes
        byte[] iv = new byte[GCM_IV_LENGTH];
        byte[] ciphertext = new byte[combined.length - GCM_IV_LENGTH];
        System.arraycopy(combined, 0, iv, 0, iv.length);
        System.arraycopy(combined, iv.length, ciphertext, 0, ciphertext.length);

        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.DECRYPT_MODE, keySpec, new GCMParameterSpec(GCM_TAG_LENGTH, iv));

        return new String(cipher.doFinal(ciphertext));
    }
}