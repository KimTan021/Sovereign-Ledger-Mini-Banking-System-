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


    @Override
    public void sendAccountEmail(String recipientEmail, String firstName, String accountType, String accountNumber, String status) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(senderEmail, senderName);
            helper.setTo(recipientEmail);
            helper.setSubject(resolveAccountEmailSubject(status));
            helper.setText(buildAccountEmailBody(firstName, accountType, accountNumber, status), false);

            mailSender.send(message);
            System.out.println("Account " + status + " email sent to: " + recipientEmail);

        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            throw new RuntimeException("Failed to send account email: " + e.getMessage());
        }
    }

    private String resolveAccountEmailSubject(String status) {
        return switch (status) {
            case "Approved" -> "Your Sovereign Ledger Account Has Been Approved";
            case "Rejected" -> "Your Sovereign Ledger Account Request Has Been Rejected";
            default         -> "Update on Your Sovereign Ledger Account Request";
        };
    }

    private String buildAccountEmailBody(String firstName, String accountType, String accountNumber, String status) {
        return switch (status) {
            case "Approved" -> """
                Sovereign Ledger
                
                Hello %s,
                
                Great news! Your %s account request has been approved.
                
                Account Number: %s
                
                You can now log in to your Sovereign Ledger account and start using it.
                
                If you have any questions, please contact our support team.
                
                - Sovereign Ledger Team
                """.formatted(firstName, accountType, accountNumber);

            case "Rejected" -> """
                Sovereign Ledger
                
                Hello %s,
                
                Unfortunately, your %s account request has been rejected.
                
                If you believe this is a mistake or would like more information,
                please contact our support team.
                
                - Sovereign Ledger Team
                """.formatted(firstName, accountType);

            default -> """
                Sovereign Ledger
                
                Hello %s,
                
                There has been an update on your %s account request.
                Current status: %s
                
                Please contact our support team for more information.
                
                - Sovereign Ledger Team
                """.formatted(firstName, accountType, status);
        };
    }
}