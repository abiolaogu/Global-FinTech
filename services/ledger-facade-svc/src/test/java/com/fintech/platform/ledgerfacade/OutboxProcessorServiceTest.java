package com.fintech.platform.ledgerfacade;

import com.fintech.platform.ledgerfacade.model.OutboxMessage;
import com.fintech.platform.ledgerfacade.repositories.OutboxMessageRepository;
import com.fintech.platform.ledgerfacade.services.KafkaEventPublisher;
import com.fintech.platform.ledgerfacade.services.OutboxProcessorService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OutboxProcessorServiceTest {

    @Mock
    private OutboxMessageRepository outboxMessageRepository;

    @Mock
    private KafkaEventPublisher kafkaEventPublisher;

    @InjectMocks
    private OutboxProcessorService outboxProcessorService;

    @Test
    void processOutboxMessages_whenMessagesExist_publishesAndMarksAsProcessed() {
        // Given
        OutboxMessage message1 = new OutboxMessage("transfer", "tx1", "transfer.created", "{}");
        OutboxMessage message2 = new OutboxMessage("deposit", "dep1", "deposit.created", "{}");
        when(outboxMessageRepository.findByProcessedAtIsNull()).thenReturn(List.of(message1, message2));

        // When
        outboxProcessorService.processOutboxMessages();

        // Then
        verify(kafkaEventPublisher, times(1)).publish("fintech.transfer.events", "tx1", "{}");
        verify(kafkaEventPublisher, times(1)).publish("fintech.deposit.events", "dep1", "{}");

        verify(outboxMessageRepository, times(1)).save(message1);
        verify(outboxMessageRepository, times(1)).save(message2);
    }
}
