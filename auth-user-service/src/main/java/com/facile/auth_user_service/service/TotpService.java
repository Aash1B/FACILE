package com.facile.auth_user_service.service;

import org.springframework.stereotype.Service;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

@Service
public class TotpService {

    public String generateSecretKey() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[20];
        random.nextBytes(bytes);
        return encodeBase32(bytes);
    }

    public String getQrCodeUrl(String email, String secret) {
        return "otpauth://totp/Facile:" + email + "?secret=" + secret + "&issuer=Facile";
    }

    public boolean verifyCode(String secret, String codeStr) {
        if (codeStr == null || codeStr.length() != 6) {
            return false;
        }
        int code;
        try {
            code = Integer.parseInt(codeStr);
        } catch (NumberFormatException e) {
            return false;
        }
        
        long timeWindow = System.currentTimeMillis() / 1000 / 30;
        
        // Check window of -1, 0, +1 to account for clock drift
        for (int i = -1; i <= 1; i++) {
            if (calculateCode(secret, timeWindow + i) == code) {
                return true;
            }
        }
        return false;
    }

    private int calculateCode(String secret, long time) {
        byte[] key = decodeBase32(secret);
        byte[] data = ByteBuffer.allocate(8).putLong(time).array();
        try {
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key, "RAW"));
            byte[] hash = mac.doFinal(data);
            int offset = hash[hash.length - 1] & 0xF;
            long truncatedHash = 0;
            for (int i = 0; i < 4; ++i) {
                truncatedHash <<= 8;
                truncatedHash |= (hash[offset + i] & 0xFF);
            }
            truncatedHash &= 0x7FFFFFFF;
            truncatedHash %= 1000000;
            return (int) truncatedHash;
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error calculating TOTP", e);
        }
    }

    private static String encodeBase32(byte[] bytes) {
        String allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        StringBuilder sb = new StringBuilder();
        int val = 0;
        int count = 0;
        for (byte b : bytes) {
            val = (val << 8) | (b & 0xFF);
            count += 8;
            while (count >= 5) {
                sb.append(allowed.charAt((val >> (count - 5)) & 31));
                count -= 5;
            }
        }
        if (count > 0) {
            sb.append(allowed.charAt((val << (5 - count)) & 31));
        }
        return sb.toString();
    }

    private static byte[] decodeBase32(String base32) {
        String allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        base32 = base32.toUpperCase().replaceAll("[^A-Z2-7]", "");
        int len = base32.length();
        int byteLen = (len * 5) / 8;
        byte[] bytes = new byte[byteLen];
        int buffer = 0;
        int bitsLeft = 0;
        int count = 0;
        for (int i = 0; i < len; i++) {
            int val = allowed.indexOf(base32.charAt(i));
            if (val < 0) continue;
            buffer = (buffer << 5) | val;
            bitsLeft += 5;
            if (bitsLeft >= 8) {
                bytes[count++] = (byte) ((buffer >> (bitsLeft - 8)) & 0xFF);
                bitsLeft -= 8;
            }
        }
        return bytes;
    }
}
