package com.fintech.platform.ledgerfacade.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

// Using a placeholder DTO for the Fineract transfer request
record FineractTransferRequest(String fromAccountId, String toAccountId, double amount) {}

@FeignClient(name = "fineract-client", url = "${fineract.api.url}")
public interface FineractClient {

    @PostMapping("/transfers")
    void createTransfer(@RequestBody FineractTransferRequest request);
}
