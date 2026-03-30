package com.sovereign_ledger.service.service_implementation;

import com.sovereign_ledger.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImplementation implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    @Value("${brevo.sender.name}")
    private String senderName;

    public EmailServiceImplementation(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendOtpEmail(String recipientEmail, String otpCode, String purpose) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(senderEmail, senderName);
            helper.setTo(recipientEmail);
            helper.setSubject(resolveSubject(purpose));
            helper.setText(buildEmailBody(recipientEmail, otpCode, purpose), false);

            mailSender.send(message);
            System.out.println("Email sent successfully to: " + recipientEmail);

        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
        }
    }

    private String resolveSubject(String purpose) {
        return switch (purpose) {
            case "EMAIL_VERIFICATION" -> "Verify your Sovereign Ledger account";
            case "FUND_TRANSFER"      -> "Confirm your fund transfer";
            default                   -> "Your OTP Code";
        };
    }

    private String buildEmailBody(String recipientEmail, String otpCode, String purpose) {
        String action = switch (purpose) {
            case "EMAIL_VERIFICATION" -> "verify your email address";
            case "FUND_TRANSFER"      -> "confirm your fund transfer";
            default                   -> "complete your request";
        };

        return """
                Sovereign Ledger
                
                Hello %s,
                
                Use the OTP below to %s:
                
                %s
                
                This code expires in 5 minutes.
                Do not share this code with anyone.
                
                If you did not request this, please ignore this email.
                
                - Sovereign Ledger Team
                """.formatted(recipientEmail, action, otpCode);
    }
}