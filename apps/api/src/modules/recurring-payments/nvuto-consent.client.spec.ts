import {
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { NvutoConsentClient } from "./nvuto-consent.client";

describe("NvutoConsentClient", () => {
  const originalEnvironment = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = {
      ...originalEnvironment,
      NVUTO_CONSENT_BASE_URL: "https://consent.internal",
      NVUTO_CONSENT_BEARER_TOKEN: "workload-token",
      NVUTO_CONSENT_SUBSCRIPTION_PURPOSE: "subscription_billing",
      NVUTO_CONSENT_SUBSCRIPTION_CHANNEL: "billing",
    };
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  afterAll(() => {
    process.env = originalEnvironment;
  });

  it("validates the canonical receipt subject, purpose, notice, and jurisdiction", async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        id: "rcp_444444444444444444444444",
        subject_id: "user-1",
        purpose: "subscription_billing",
        channel: "billing",
        notice_version: "renewal-disclosure-v1",
        jurisdiction: "US-CA",
        evidence: {
          method: "affirmative-checkbox",
          artifact_hash: "ab".repeat(32),
          collected_at: "2026-10-11T00:00:00.000Z",
        },
        receipt_hash: "cd".repeat(32),
        issued_at: "2026-10-11T00:00:01.000Z",
      }),
    })) as any;

    await expect(
      new NvutoConsentClient().verifySubscriptionReceipt({
        receiptId: "rcp_444444444444444444444444",
        subjectId: "user-1",
        noticeVersion: "renewal-disclosure-v1",
        artifactHash: "ab".repeat(32),
        collectedAt: new Date("2026-10-11T00:00:00.000Z"),
        jurisdiction: "US-CA",
      }),
    ).resolves.toEqual({ receiptHash: "cd".repeat(32) });
  });

  it("fails closed when the canonical receipt belongs to another subject", async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        id: "rcp_444444444444444444444444",
        subject_id: "attacker",
        purpose: "subscription_billing",
        channel: "billing",
        notice_version: "renewal-disclosure-v1",
        jurisdiction: "US-CA",
        evidence: {
          method: "affirmative-checkbox",
          artifact_hash: "ab".repeat(32),
          collected_at: "2026-10-11T00:00:00.000Z",
        },
        receipt_hash: "cd".repeat(32),
        issued_at: "2026-10-11T00:00:01.000Z",
      }),
    })) as any;

    await expect(
      new NvutoConsentClient().verifySubscriptionReceipt({
        receiptId: "rcp_444444444444444444444444",
        subjectId: "user-1",
        noticeVersion: "renewal-disclosure-v1",
        artifactHash: "ab".repeat(32),
        collectedAt: new Date("2026-10-11T00:00:00.000Z"),
        jurisdiction: "US-CA",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("fails closed when workload configuration is unavailable", async () => {
    delete process.env.NVUTO_CONSENT_BEARER_TOKEN;

    await expect(
      new NvutoConsentClient().verifySubscriptionReceipt({
        receiptId: "rcp_444444444444444444444444",
        subjectId: "user-1",
        noticeVersion: "renewal-disclosure-v1",
        artifactHash: "ab".repeat(32),
        collectedAt: new Date("2026-10-11T00:00:00.000Z"),
        jurisdiction: "US-CA",
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it("treats canonical-service authentication failure as unavailable, not consumer withdrawal", async () => {
    global.fetch = jest.fn(async () => ({ ok: false, status: 401 })) as any;

    await expect(
      new NvutoConsentClient().assertRecurringChargeAllowed({
        receiptId: "rcp_444444444444444444444444",
        subjectId: "user-1",
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it("rejects a receipt for a different disclosure artifact", async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        id: "rcp_444444444444444444444444",
        subject_id: "user-1",
        purpose: "subscription_billing",
        channel: "billing",
        notice_version: "renewal-disclosure-v1",
        jurisdiction: "US-CA",
        evidence: {
          method: "affirmative-checkbox",
          artifact_hash: "ff".repeat(32),
          collected_at: "2026-10-11T00:00:00.000Z",
        },
        receipt_hash: "cd".repeat(32),
        issued_at: "2026-10-11T00:00:01.000Z",
      }),
    })) as any;

    await expect(
      new NvutoConsentClient().verifySubscriptionReceipt({
        receiptId: "rcp_444444444444444444444444",
        subjectId: "user-1",
        noticeVersion: "renewal-disclosure-v1",
        artifactHash: "ab".repeat(32),
        collectedAt: new Date("2026-10-11T00:00:00.000Z"),
        jurisdiction: "US-CA",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
