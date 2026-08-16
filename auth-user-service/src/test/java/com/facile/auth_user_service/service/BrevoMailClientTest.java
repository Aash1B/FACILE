package com.facile.auth_user_service.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;

class BrevoMailClientTest {

    @Test
    void sendsTransactionalEmailToBrevo() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        BrevoMailClient client = new BrevoMailClient(restTemplate, "test-key", "sender@example.com", "Facile");

        server.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("api-key", "test-key"))
                .andExpect(header("Accept", MediaType.APPLICATION_JSON_VALUE))
                .andExpect(content().json("""
                    {
                      "sender": { "name": "Facile", "email": "sender@example.com" },
                      "to": [{ "email": "user@example.com" }],
                      "subject": "Facile verification code",
                      "htmlContent": "<p>123456</p>"
                    }
                    """))
                .andRespond(withStatus(HttpStatus.CREATED));

        client.send("user@example.com", "Facile verification code", "<p>123456</p>");

        server.verify();
    }

    @Test
    void convertsBrevoClientErrorToEmailDeliveryException() {
        assertBrevoFailure(HttpStatus.BAD_REQUEST);
    }

    @Test
    void convertsBrevoServerErrorToEmailDeliveryException() {
        assertBrevoFailure(HttpStatus.BAD_GATEWAY);
    }

    @Test
    void convertsNetworkFailureToEmailDeliveryException() {
        RestTemplate restTemplate = mock(RestTemplate.class);
        when(restTemplate.exchange(
                eq("https://api.brevo.com/v3/smtp/email"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Void.class)
        )).thenThrow(new ResourceAccessException("timeout"));
        BrevoMailClient client = new BrevoMailClient(restTemplate, "test-key", "sender@example.com", "Facile");

        assertThrows(EmailDeliveryException.class,
                () -> client.send("user@example.com", "Subject", "<p>Body</p>"));
    }

    @Test
    void rejectsMissingApiKey() {
        assertThrows(IllegalStateException.class,
                () -> new BrevoMailClient(new RestTemplate(), "", "sender@example.com", "Facile"));
    }

    @Test
    void rejectsMissingSenderEmail() {
        assertThrows(IllegalStateException.class,
                () -> new BrevoMailClient(new RestTemplate(), "test-key", "", "Facile"));
    }

    @Test
    void rejectsMissingSenderName() {
        assertThrows(IllegalStateException.class,
                () -> new BrevoMailClient(new RestTemplate(), "test-key", "sender@example.com", ""));
    }

    private void assertBrevoFailure(HttpStatus status) {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        BrevoMailClient client = new BrevoMailClient(restTemplate, "test-key", "sender@example.com", "Facile");
        server.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(status));

        assertThrows(EmailDeliveryException.class,
                () -> client.send("user@example.com", "Subject", "<p>Body</p>"));
        server.verify();
    }
}
