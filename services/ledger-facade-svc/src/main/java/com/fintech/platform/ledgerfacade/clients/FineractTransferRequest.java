package com.fintech.platform.ledgerfacade.clients;

public record FineractTransferRequest(String fromAccountId, String toAccountId, double amount) {}
