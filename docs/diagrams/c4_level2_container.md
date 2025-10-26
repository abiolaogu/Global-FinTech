```mermaid
C4Container
  title Container Diagram for Global Fintech Platform

  Person(retail_customer, "Retail Customer", "Uses the platform for personal banking, transfers, and crypto trading.")
  Person(business_customer, "Business Customer", "Uses the platform for corporate accounts, B2B payments, and treasury services.")

  System_Ext(card_networks, "Card Networks (Visa, Mastercard)", "Processes card payments and provides settlement.")
  System_Ext(kyc_provider, "KYC/AML Provider", "Provides identity verification and transaction monitoring services.")
  System_Ext(notification_gateway, "Notification Gateway", "Sends email, SMS, and push notifications.")
  System_Ext(banking_systems, "Banking Systems", "External banks for funding, withdrawals, and wire transfers.")
  System_Ext(crypto_liquidity, "Crypto Liquidity Provider", "External exchanges for cryptocurrency trading and liquidity.")

  Enterprise_Boundary(b, "Fintech Platform") {
    Container(mobile_app, "Mobile App", "Flutter", "Provides banking, crypto, and payment features on iOS and Android.")
    Container(web_app, "Web App", "Next.js", "Provides customer and admin web interfaces.")

    Container(api_gateway, "API Gateway", "Kong", "Routes all incoming API requests to the appropriate service. Handles auth, rate limiting.")

    System_Boundary(sb, "Backend Services") {
      Container(ledger_facade, "Ledger Facade Svc", "Java/Spring Boot", "Abstracts the core banking ledger.")
      Container(payments_switch, "Payments Switch Svc", "Java/j8583", "Handles ISO-8583 payment processing.")
      Container(fabric_bridge, "Fabric Bridge Svc", "Go/Java", "Interfaces with the Hyperledger Fabric network.")
      Container(crypto_custody, "Crypto Custody Svc", "Java/web3j", "Manages digital asset wallets and custody.")
      Container(kyc_svc, "KYC/KYB Svc", "Java", "Orchestrates customer identity verification.")
      Container(risk_engine, "Risk Engine Svc", "Python/FastAPI", "Performs real-time fraud and risk analysis.")
      Container(audit_svc, "Audit Trail Svc", "Java", "Logs all actions for audit and compliance.")
      Container(notification_svc, "Notification Svc", "Java", "Manages and sends notifications.")
    }

    System_Boundary(db, "Data Stores") {
        ContainerDb(postgres_db, "Primary Database", "PostgreSQL 15+", "Stores core transactional data (accounts, customers, transactions).")
        ContainerDb(redis_cache, "Cache", "Redis Cluster", "Caches session data, rates, and frequently accessed information.")
        ContainerDb(mongo_db, "Audit Log DB", "MongoDB", "Stores immutable audit logs.")
        ContainerDb(clickhouse_db, "Analytics DB", "ClickHouse", "Stores event streams for real-time analytics.")
    }

    Container(kafka, "Message Broker", "Apache Kafka", "Handles asynchronous event streaming between services.")
    Container(fineract, "Core Banking Ledger", "Apache Fineract 1.9+", "The canonical ledger for all fiat currency transactions.")
    Container(fabric_network, "Settlement & Asset Layer", "Hyperledger Fabric 2.5+", "Anchors proofs, attests KYC, and manages tokenized assets.")

  }

  ' Relationships
  Rel(retail_customer, mobile_app, "Uses")
  Rel(business_customer, web_app, "Uses")
  Rel(web_app, api_gateway, "Makes API calls", "HTTPS/GraphQL")
  Rel(mobile_app, api_gateway, "Makes API calls", "HTTPS/GraphQL")

  Rel(api_gateway, ledger_facade, "Forwards requests")
  Rel(api_gateway, payments_switch, "Forwards requests")
  Rel(api_gateway, crypto_custody, "Forwards requests")
  Rel(api_gateway, kyc_svc, "Forwards requests")

  Rel(ledger_facade, fineract, "Manages ledger entries via", "REST API")
  Rel(ledger_facade, postgres_db, "Reads/Writes data")
  Rel(ledger_facade, kafka, "Publishes events (e.g., transaction.created)")

  Rel(payments_switch, card_networks, "Sends/Receives transactions", "ISO-8583")
  Rel(payments_switch, kafka, "Publishes payment events")
  Rel(payments_switch, fabric_bridge, "Anchors settlement proof")

  Rel(crypto_custody, crypto_liquidity, "Executes trades", "API")
  Rel(crypto_custody, fabric_bridge, "Manages tokenized assets")

  Rel(kyc_svc, kyc_provider, "Performs checks", "REST API")
  Rel(kyc_svc, fabric_bridge, "Anchors KYC attestations")

  Rel(risk_engine, kafka, "Consumes transaction events")
  Rel(risk_engine, postgres_db, "Reads transaction history")

  Rel(audit_svc, kafka, "Consumes events from all services")
  Rel(audit_svc, mongo_db, "Writes audit logs")
  Rel(audit_svc, fabric_bridge, "Anchors audit log hashes")

  Rel(notification_svc, notification_gateway, "Sends notifications", "API")
  Rel(notification_svc, kafka, "Consumes notification request events")

  Rel_Back(kafka, clickhouse_db, "Streams events for analytics", "CDC")
```
