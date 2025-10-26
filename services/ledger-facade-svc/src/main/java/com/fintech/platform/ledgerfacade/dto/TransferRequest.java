package com.fintech.platform.ledgerfacade.dto;

import java.math.BigDecimal;
import java.util.UUID;

// Using records for immutable DTOs
public record TransferRequest(
    String sourceAccountId,
    String destinationAccountId,
    BigDecimal amount,
    String currency,
    UUID idempotencyKey
) {}
