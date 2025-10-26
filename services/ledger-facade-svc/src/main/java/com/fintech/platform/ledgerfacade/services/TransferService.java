package com.fintech.platform.ledgerfacade.services;

import com.fintech.platform.ledgerfacade.dto.TransferRequest;
import com.fintech.platform.ledgerfacade.dto.TransferResponse;
import com.fintech.platform.ledgerfacade.model.IdempotencyKey;
import com.fintech.platform.ledgerfacade.repositories.IdempotencyKeyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransferService {

    private final IdempotencyKeyRepository idempotencyKeyRepository;

    public TransferService(IdempotencyKeyRepository idempotencyKeyRepository) {
        this.idempotencyKeyRepository = idempotencyKeyRepository;
    }

    @Transactional
    public TransferResponse createTransfer(TransferRequest request) {
        // 1. Idempotency Check
        idempotencyKeyRepository.findById(request.idempotencyKey()).ifPresent(key -> {
            throw new IllegalStateException("Duplicate request with idempotency key: " + key.getId());
        });

        // 2. Save Idempotency Key
        idempotencyKeyRepository.save(new IdempotencyKey(request.idempotencyKey()));

        // 3. TODO: Call Fineract to create the transfer

        // 4. TODO: Save Outbox Message

        return new TransferResponse("dummy-tx-id", "PENDING");
    }
}
