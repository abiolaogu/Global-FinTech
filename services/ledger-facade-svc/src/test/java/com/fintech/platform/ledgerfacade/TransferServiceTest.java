package com.fintech.platform.ledgerfacade;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fintech.platform.ledgerfacade.clients.FineractClient;
import com.fintech.platform.ledgerfacade.clients.FineractTransferRequest;
import com.fintech.platform.ledgerfacade.dto.TransferRequest;
import com.fintech.platform.ledgerfacade.model.IdempotencyKey;
import com.fintech.platform.ledgerfacade.model.OutboxMessage;
import com.fintech.platform.ledgerfacade.repositories.IdempotencyKeyRepository;
import com.fintech.platform.ledgerfacade.repositories.OutboxMessageRepository;
import com.fintech.platform.ledgerfacade.services.TransferService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransferServiceTest {

    @Mock
    private IdempotencyKeyRepository idempotencyKeyRepository;
    @Mock
    private OutboxMessageRepository outboxMessageRepository;
    @Mock
    private FineractClient fineractClient;
    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private TransferService transferService;

    @Captor
    private ArgumentCaptor<OutboxMessage> outboxMessageCaptor;
    @Captor
    private ArgumentCaptor<FineractTransferRequest> fineractRequestCaptor;

    @Test
    void createTransfer_whenKeyExists_throwsException() {
        // Given
        UUID idempotencyKey = UUID.randomUUID();
        TransferRequest request = new TransferRequest("a", "b", BigDecimal.ONE, "USD", idempotencyKey);
        when(idempotencyKeyRepository.findById(idempotencyKey)).thenReturn(Optional.of(new IdempotencyKey(idempotencyKey)));

        // When & Then
        assertThrows(IllegalStateException.class, () -> transferService.createTransfer(request));
    }

    @Test
    void createTransfer_whenSuccessful_callsFineractAndSavesOutbox() {
        // Given
        UUID idempotencyKey = UUID.randomUUID();
        TransferRequest request = new TransferRequest("source-acc", "dest-acc", BigDecimal.TEN, "USD", idempotencyKey);
        when(idempotencyKeyRepository.findById(idempotencyKey)).thenReturn(Optional.empty());

        // When
        transferService.createTransfer(request);

        // Then
        verify(fineractClient).createTransfer(fineractRequestCaptor.capture());
        assertEquals("source-acc", fineractRequestCaptor.getValue().fromAccountId());
        assertEquals("dest-acc", fineractRequestCaptor.getValue().toAccountId());
        assertEquals(10.0, fineractRequestCaptor.getValue().amount());

        verify(outboxMessageRepository).save(outboxMessageCaptor.capture());
        assertEquals("transfer.created", outboxMessageCaptor.getValue().getEventType());
    }
}
