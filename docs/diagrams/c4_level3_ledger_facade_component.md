```mermaid
C4Component
  title Component Diagram for Ledger Facade Service

  Container(api_gateway, "API Gateway", "Kong", "Routes incoming API requests.")
  ContainerDb(postgres_db, "Primary Database", "PostgreSQL", "Stores idempotency keys and outbox messages.")
  Container(kafka, "Message Broker", "Apache Kafka", "Receives events published by the service.")
  Container(fineract, "Core Banking Ledger", "Apache Fineract", "The external fiat ledger system.")

  System_Boundary(b, "Ledger Facade Service") {
    Component(api_controller, "API Controller", "Spring Boot REST Controller", "Receives API calls from the API Gateway. Handles request validation.")
    Component(command_handler, "Command Handler", "Java/Spring Service", "Handles business logic for commands (e.g., create transfer). Ensures idempotency.")
    Component(fineract_client, "Fineract Client", "Java/Feign Client", "Manages all communication with the Apache Fineract API.")
    Component(outbox_processor, "Outbox Processor", "Java/Spring Scheduled Task", "Reads pending events from the outbox table and publishes them to Kafka.")
    Component(repository, "Repository", "Java/JPA", "Provides data access to the PostgreSQL database for idempotency and outbox tables.")
  }

  ' Relationships
  Rel(api_gateway, api_controller, "Forwards API calls", "HTTPS")
  Rel(api_controller, command_handler, "Invokes commands")
  Rel(command_handler, repository, "Checks for idempotency key and writes to outbox")
  Rel(command_handler, fineract_client, "Executes ledger operations")
  Rel(fineract_client, fineract, "Makes API calls to manage ledger", "REST API")
  Rel(outbox_processor, repository, "Reads pending messages from outbox")
  Rel(outbox_processor, kafka, "Publishes events", "Kafka Message")
```
