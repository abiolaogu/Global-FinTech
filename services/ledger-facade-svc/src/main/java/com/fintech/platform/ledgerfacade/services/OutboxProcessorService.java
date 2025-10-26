package com.fintech.platform.ledgerfacade.services;

import com.fintech.platform.ledgerfacade.model.OutboxMessage;
import com.fintech.platform.ledgerfacade.repositories.OutboxMessageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class OutboxProcessorService {

    private static final Logger log = LoggerFactory.getLogger(OutboxProcessorService.class);

    private final OutboxMessageRepository outboxMessageRepository;

    public OutboxProcessorService(OutboxMessageRepository outboxMessageRepository) {
        this.outboxMessageRepository = outboxMessageRepository;
    }

    @Scheduled(fixedDelay = 10000) // Poll every 10 seconds
    @Transactional
    public void processOutboxMessages() {
        List<OutboxMessage> messages = outboxMessageRepository.findByProcessedAtIsNull();
        for (OutboxMessage message : messages) {
            log.info("Publishing event: {} for aggregate: {}", message.getEventType(), message.getAggregateId());
            // TODO: Actually publish to Kafka

            message.setProcessedAt(Instant.now());
            outboxMessageRepository.save(message);
        }
    }
}
