package com.facile.payment_notification_service.dto;
import lombok.Data;
@Data public class GiftCardRedeemRequest { private String email; private String code; private String pin; }
