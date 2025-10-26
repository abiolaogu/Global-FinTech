package com.fintech.platform.ledgerfacade;

import com.fintech.platform.ledgerfacade.dto.TransferRequest;
import com.fintech.platform.ledgerfacade.model.IdempotencyKey;
import com.fintech.platform.ledgerfacade.repositories.IdempotencyKeyRepository;
import com.fintech.platform.ledgerfacade.services.TransferService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransferServiceTest {

    @Mock
    private IdempotencyKeyRepository idempotencyKeyRepository;

    @InjectMocks
    private TransferService transferService;

    @Test
    void createTransfer_whenKeyExists_throwsException() {
        // Given
        UUID idempotencyKey = UUID.randomUUID();
        TransferRequest request = new TransferRequest("a", "b", BigDecimal.ONE, "USD", idempotencyKey);
        when(idempotencyKeyRepository.findById(idempotencyKey)).thenReturn(Optional.of(new IdempotencyKey(idempotencyKey)));

        // When & Then
        assertThrows(IllegalStateException.class, () -> transferService.createTransfer(request));
    }
}
