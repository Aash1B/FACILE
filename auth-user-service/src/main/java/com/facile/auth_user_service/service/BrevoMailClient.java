package com.facile.auth_user_service.service;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class BrevoMailClient {

    private static final String BREVO_EMAIL_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String senderEmail;
    private final String senderName;

    @Autowired
    public BrevoMailClient(
            RestTemplateBuilder restTemplateBuilder,
            @Value("${BREVO_API_KEY:}") String apiKey,
            @Value("${BREVO_SENDER_EMAIL:}") String senderEmail,
            @Value("${BREVO_SENDER_NAME:}") String senderName) {
        this(
                restTemplateBuilder
                        .connectTimeout(Duration.ofSeconds(5))
                        .readTimeout(Duration.ofSeconds(10))
                        .build(),
                apiKey,
                senderEmail,
                senderName
        );
    }

    BrevoMailClient(RestTemplate restTemplate, String apiKey, String senderEmail, String senderName) {
        this.restTemplate = restTemplate;
        this.apiKey = requireConfiguration(apiKey, "BREVO_API_KEY");
        this.senderEmail = requireConfiguration(senderEmail, "BREVO_SENDER_EMAIL");
        this.senderName = requireConfiguration(senderName, "BREVO_SENDER_NAME");
    }

    public void send(String recipientEmail, String subject, String htmlContent) {
        BrevoEmailRequest request = new BrevoEmailRequest(
                new Sender(senderName, senderEmail),
                List.of(new Recipient(recipientEmail)),
                subject,
                htmlContent
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("api-key", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        try {
            ResponseEntity<Void> response = restTemplate.exchange(
                    BREVO_EMAIL_ENDPOINT,
                    HttpMethod.POST,
                    new HttpEntity<>(request, headers),
                    Void.class
            );
            if (!response.getStatusCode().is2xxSuccessful()) {
                log.warn("Brevo rejected an email request with HTTP {}", response.getStatusCode().value());
                throw new EmailDeliveryException("Brevo rejected the email request with HTTP " + response.getStatusCode().value());
            }
        } catch (HttpStatusCodeException exception) {
            log.warn("Brevo rejected an email request with HTTP {}", exception.getStatusCode().value());
            throw new EmailDeliveryException(
                "Brevo rejected the email request with HTTP " + exception.getStatusCode().value(),
                exception
            );
        } catch (ResourceAccessException exception) {
            log.warn("Brevo email request failed due to a timeout or network error");
            throw new EmailDeliveryException("Brevo email request timed out or could not reach the provider", exception);
        } catch (RestClientException exception) {
            log.warn("Brevo email request failed with {}", exception.getClass().getSimpleName());
            throw new EmailDeliveryException("Brevo email request failed", exception);
        }
    }

    private static String requireConfiguration(String value, String variableName) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Missing required email configuration: " + variableName);
        }
        return value.trim();
    }

    private record BrevoEmailRequest(
            Sender sender,
            List<Recipient> to,
            String subject,
            String htmlContent) {
    }

    private record Sender(String name, String email) {
    }

    private record Recipient(String email) {
    }
}
