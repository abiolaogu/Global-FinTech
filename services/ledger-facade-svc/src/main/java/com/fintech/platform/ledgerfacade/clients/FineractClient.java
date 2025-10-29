package com.fintech.platform.ledgerfacade.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "fineract-client", url = "${fineract.api.url}")
public interface FineractClient {

    @PostMapping("/transfers")
    FineractTransferResponse createTransfer(@RequestBody FineractTransferRequest request);
}
