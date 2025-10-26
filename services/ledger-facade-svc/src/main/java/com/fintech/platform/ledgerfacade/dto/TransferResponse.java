package com.fintech.platform.ledgerfacade.dto;

public record TransferResponse(
    String transactionId,
    String status
) {}
