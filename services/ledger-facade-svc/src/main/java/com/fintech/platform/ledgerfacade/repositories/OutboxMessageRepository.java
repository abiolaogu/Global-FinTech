package com.fintech.platform.ledgerfacade.repositories;

import com.fintech.platform.ledgerfacade.model.OutboxMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OutboxMessageRepository extends JpaRepository<OutboxMessage, Long> {
}
