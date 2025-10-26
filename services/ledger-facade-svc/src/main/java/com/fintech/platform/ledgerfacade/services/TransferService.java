package com.fintech.platform.ledgerfacade.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fintech.platform.ledgerfacade.clients.FineractClient;
import com.fintech.platform.ledgerfacade.clients.FineractTransferRequest;
import com.fintech.platform.ledgerfacade.dto.TransferRequest;
import com.fintech.platform.ledgerfacade.dto.TransferResponse;
import com.fintech.platform.ledgerfacade.model.IdempotencyKey;
import com.fintech.platform.ledgerfacade.model.OutboxMessage;
import com.fintech.platform.ledgerfacade.repositories.IdempotencyKeyRepository;
import com.fintech.platform.ledgerfacade.repositories.OutboxMessageRepository;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransferService {

    private final IdempotencyKeyRepository idempotencyKeyRepository;
    private final OutboxMessageRepository outboxMessageRepository;
    private final FineractClient fineractClient;
    private final ObjectMapper objectMapper;

    public TransferService(IdempotencyKeyRepository idempotencyKeyRepository,
                           OutboxMessageRepository outboxMessageRepository,
                           FineractClient fineractClient,
                           ObjectMapper objectMapper) {
        this.idempotencyKeyRepository = idempotencyKeyRepository;
        this.outboxMessageRepository = outboxMessageRepository;
        this.fineractClient = fineractClient;
        this.objectMapper = objectMapper;
    }

    @Transactional
    @SneakyThrows
    public TransferResponse createTransfer(TransferRequest request) {
        // 1. Idempotency Check
        idempotencyKeyRepository.findById(request.idempotencyKey()).ifPresent(key -> {
            throw new IllegalStateException("Duplicate request with idempotency key: " + key.getId());
        });

        // 2. Save Idempotency Key
        idempotencyKeyRepository.save(new IdempotencyKey(request.idempotencyKey()));

        // 3. Call Fineract to create the transfer
        fineractClient.createTransfer(new FineractTransferRequest(
            request.sourceAccountId(),
            request.destinationAccountId(),
            request.amount().doubleValue()
        ));

        // 4. Save Outbox Message
        String transactionId = "dummy-tx-id"; // This would come from Fineract
        String payload = objectMapper.writeValueAsString(request);
        OutboxMessage outboxMessage = new OutboxMessage(
            "transfer",
            transactionId,
            "transfer.created",
            payload
        );
        outboxMessageRepository.save(outboxMessage);

        return new TransferResponse(transactionId, "COMPLETED");
    }
}
