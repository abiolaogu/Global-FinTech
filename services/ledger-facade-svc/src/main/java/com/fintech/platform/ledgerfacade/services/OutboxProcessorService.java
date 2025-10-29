package com.fintech.platform.ledgerfacade.services;

import com.fintech.platform.ledgerfacade.model.OutboxMessage;
import com.fintech.platform.ledgerfacade.repositories.OutboxMessageRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class OutboxProcessorService {

    private final OutboxMessageRepository outboxMessageRepository;
    private final KafkaEventPublisher kafkaEventPublisher;

    public OutboxProcessorService(OutboxMessageRepository outboxMessageRepository, KafkaEventPublisher kafkaEventPublisher) {
        this.outboxMessageRepository = outboxMessageRepository;
        this.kafkaEventPublisher = kafkaEventPublisher;
    }

    @Scheduled(fixedDelay = 10000) // Poll every 10 seconds
    @Transactional
    public void processOutboxMessages() {
        List<OutboxMessage> messages = outboxMessageRepository.findByProcessedAtIsNull();
        for (OutboxMessage message : messages) {
            // Topic name could be based on aggregateType, e.g., "fintech.transfer.events"
            String topic = "fintech." + message.getAggregateType() + ".events";

            kafkaEventPublisher.publish(topic, message.getAggregateId(), message.getPayload());

            message.setProcessedAt(Instant.now());
            outboxMessageRepository.save(message);
        }
    }
}
