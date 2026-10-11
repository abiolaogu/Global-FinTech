import { RecurringPaymentsController } from "./recurring-payments.controller";

describe("RecurringPaymentsController response minimization", () => {
  it("does not return encrypted payment material or internal evidence digests", async () => {
    const service = {
      createRecurringPayment: jest.fn(async (input) => ({
        recurringPaymentId: "recurring-1",
        userId: input.userId,
        merchantId: input.merchantId,
        status: "active",
        paymentMethod: "card_token",
        paymentMethodEncrypted: "iv:ciphertext:tag",
        authorizationCode: "provider-secret",
        consentDigest: "ab".repeat(32),
        disclosureArtifactHash: "cd".repeat(32),
        metadata: { internalRiskSignal: "do-not-return" },
      })),
    };
    const controller = new RecurringPaymentsController(service as any);

    const response = await controller.createRecurringPayment(
      { user: { user_id: "user-1" } },
      {
        merchantId: "merchant-1",
        name: "Plan",
        amount: "9.99",
        currency: "USD",
        frequency: "monthly",
        startDate: new Date("2026-10-11T00:00:00Z"),
        paymentMethod: "card_token",
        paymentMethodToken: "tokenized-value",
        gatewayId: "gateway-1",
        provider: "example",
        consent: {
          accepted: true,
          acceptedAt: new Date("2026-10-11T00:00:00Z"),
          receiptId: "rcp_444444444444444444444444",
          termsVersion: "terms-v1",
          disclosureVersion: "disclosure-v1",
          disclosureArtifactHash: "cd".repeat(32),
          jurisdiction: "US-CA",
          cancellationMethod: "online-account",
        },
      },
    );

    expect(response).toEqual(
      expect.objectContaining({
        recurringPaymentId: "recurring-1",
        userId: "user-1",
      }),
    );
    expect(response).not.toHaveProperty("paymentMethodEncrypted");
    expect(response).not.toHaveProperty("authorizationCode");
    expect(response).not.toHaveProperty("consentDigest");
    expect(response).not.toHaveProperty("disclosureArtifactHash");
    expect(response).not.toHaveProperty("metadata");
  });
});
