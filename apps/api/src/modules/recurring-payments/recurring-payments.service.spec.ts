import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { RecurringPaymentsService } from "./recurring-payments.service";

describe("RecurringPaymentsService consumer protections", () => {
  const repository = {
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => value),
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const gateways = { initiatePayment: jest.fn() };
  const events = { emit: jest.fn() };
  const consentClient = {
    verifySubscriptionReceipt: jest.fn(async () => ({
      receiptHash: "canonical-hash",
    })),
    assertRecurringChargeAllowed: jest.fn(async () => undefined),
  };
  const originalEnvironment = process.env;

  const validDto = {
    userId: "11111111-1111-4111-8111-111111111111",
    merchantId: "22222222-2222-4222-8222-222222222222",
    name: "Premium plan",
    amount: "9.99",
    currency: "USD",
    frequency: "monthly" as const,
    startDate: new Date("2026-10-11T00:00:00Z"),
    paymentMethod: "card_token",
    paymentMethodToken: "tok_example",
    gatewayId: "33333333-3333-4333-8333-333333333333",
    provider: "example",
    consent: {
      accepted: true as const,
      acceptedAt: new Date("2026-10-11T00:00:00Z"),
      receiptId: "rcp_444444444444444444444444",
      termsVersion: "subscription-terms-2026-10-01",
      disclosureVersion: "renewal-disclosure-2026-10-01",
      disclosureArtifactHash: "ab".repeat(32),
      jurisdiction: "US-CA",
      cancellationMethod: "online-account",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnvironment, ENCRYPTION_KEY: "11".repeat(32) };
  });

  afterAll(() => {
    process.env = originalEnvironment;
  });

  function service() {
    return new RecurringPaymentsService(
      repository as any,
      gateways as any,
      events as any,
      consentClient as any,
    );
  }

  it("rejects subscription creation without affirmative consent", async () => {
    await expect(
      service().createRecurringPayment({
        ...validDto,
        consent: { ...validDto.consent, accepted: false as true },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it("persists the canonical consent receipt and exact renewal disclosure", async () => {
    const result = await service().createRecurringPayment(validDto);

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        consentReceiptId: validDto.consent.receiptId,
        consentCapturedAt: validDto.consent.acceptedAt,
        termsVersion: validDto.consent.termsVersion,
        disclosureVersion: validDto.consent.disclosureVersion,
        disclosureArtifactHash: validDto.consent.disclosureArtifactHash,
        jurisdiction: "US-CA",
        renewalDisclosure: expect.objectContaining({
          amount: "9.99",
          currency: "USD",
          frequency: "monthly",
          cancellationMethod: "online-account",
        }),
      }),
    );
    expect(result.consentDigest).toMatch(/^[a-f0-9]{64}$/);
    expect(consentClient.verifySubscriptionReceipt).toHaveBeenCalledWith(
      expect.objectContaining({
        receiptId: validDto.consent.receiptId,
        subjectId: validDto.userId,
        jurisdiction: "US-CA",
        noticeVersion: validDto.consent.disclosureVersion,
        artifactHash: validDto.consent.disclosureArtifactHash,
        collectedAt: validDto.consent.acceptedAt,
      }),
    );
  });

  it("fails closed when the Vault/KMS-provided encryption key is absent", async () => {
    delete process.env.ENCRYPTION_KEY;

    await expect(
      service().createRecurringPayment(validDto),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it("records cancellation evidence and emits the cancellation event", async () => {
    repository.findOne.mockResolvedValue({
      recurringPaymentId: "subscription-1",
      userId: validDto.userId,
      status: "active",
      nextPaymentDate: new Date(),
    });

    const result = await service().cancelRecurringPayment(
      "subscription-1",
      validDto.userId,
      "No longer needed",
    );

    expect(result.status).toBe("cancelled");
    expect(result.cancelledAt).toBeInstanceOf(Date);
    expect(events.emit).toHaveBeenCalledWith(
      "recurring_payment.cancelled",
      expect.objectContaining({
        recurringPaymentId: "subscription-1",
        userId: validDto.userId,
      }),
    );
  });

  it("cancels future charges immediately when canonical consent is withdrawn", async () => {
    const payment = {
      recurringPaymentId: "subscription-1",
      userId: validDto.userId,
      status: "active",
      nextPaymentDate: new Date(),
      failedPayments: 0,
      retryAttempts: 0,
      maxRetryAttempts: 3,
      consentReceiptId: validDto.consent.receiptId,
      consentCapturedAt: validDto.consent.acceptedAt,
      termsVersion: validDto.consent.termsVersion,
      disclosureVersion: validDto.consent.disclosureVersion,
      disclosureArtifactHash: validDto.consent.disclosureArtifactHash,
      jurisdiction: validDto.consent.jurisdiction,
      renewalDisclosure: { amount: validDto.amount },
      consentDigest: "ef".repeat(32),
    };
    repository.find.mockResolvedValueOnce([payment]);
    consentClient.assertRecurringChargeAllowed.mockRejectedValueOnce(
      new UnauthorizedException("withdrawn"),
    );

    await service().processDuePayments();

    expect(payment.status).toBe("cancelled");
    expect(payment.nextPaymentDate).toBeNull();
    expect(gateways.initiatePayment).not.toHaveBeenCalled();
    expect(events.emit).toHaveBeenCalledWith(
      "recurring_payment.consent_withdrawn",
      expect.objectContaining({ recurringPaymentId: "subscription-1" }),
    );
  });
});
