package com.fintech.platform.ledgerfacade.controller;

import com.fintech.platform.ledgerfacade.dto.TransferRequest;
import com.fintech.platform.ledgerfacade.dto.TransferResponse;
import com.fintech.platform.ledgerfacade.services.TransferService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TransferController {

    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @GetMapping("/health")
    public String healthCheck() {
        return "{\"status\":\"UP\"}";
    }

    @PostMapping("/transfers")
    public TransferResponse createTransfer(@RequestBody TransferRequest request) {
        return transferService.createTransfer(request);
    }
}
