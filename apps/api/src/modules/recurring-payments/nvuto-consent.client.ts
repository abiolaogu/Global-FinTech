import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";

interface SubscriptionReceiptExpectation {
  receiptId: string;
  subjectId: string;
  noticeVersion: string;
  artifactHash: string;
  collectedAt: Date;
  jurisdiction: string;
}

interface ConsentReceiptResponse {
  id: string;
  subject_id: string;
  purpose: string;
  channel: string;
  notice_version: string;
  jurisdiction: string;
  evidence: {
    method: string;
    artifact_hash: string;
    collected_at: string;
  };
  receipt_hash: string;
  issued_at: string;
}

interface ConsentDecisionResponse {
  allowed: boolean;
  reason: string;
  receipt_id?: string;
}

@Injectable()
export class NvutoConsentClient {
  async verifySubscriptionReceipt(
    expected: SubscriptionReceiptExpectation,
  ): Promise<{ receiptHash: string }> {
    const configuration = this.configuration();
    const response = await this.request(
      `${configuration.baseUrl}/v1/receipts/${encodeURIComponent(expected.receiptId)}`,
      { method: "GET" },
      configuration.token,
    );
    const receipt = (await response.json()) as ConsentReceiptResponse;
    const collectedAt = new Date(receipt.evidence?.collected_at);
    const issuedAt = new Date(receipt.issued_at);
    if (
      receipt.id !== expected.receiptId ||
      receipt.subject_id !== expected.subjectId ||
      receipt.purpose !== configuration.purpose ||
      receipt.channel !== configuration.channel ||
      receipt.notice_version !== expected.noticeVersion ||
      receipt.jurisdiction !== expected.jurisdiction ||
      receipt.evidence?.artifact_hash !== expected.artifactHash ||
      !receipt.evidence?.method ||
      Number.isNaN(collectedAt.getTime()) ||
      collectedAt.getTime() !== expected.collectedAt.getTime() ||
      Number.isNaN(issuedAt.getTime()) ||
      issuedAt.getTime() < collectedAt.getTime() ||
      !/^[a-f0-9]{64}$/i.test(receipt.receipt_hash)
    ) {
      throw new UnauthorizedException(
        "Nvuto Consent receipt does not authorize this subscription",
      );
    }
    return { receiptHash: receipt.receipt_hash };
  }

  async assertRecurringChargeAllowed(input: {
    subjectId: string;
    receiptId: string;
  }): Promise<void> {
    const configuration = this.configuration();
    const response = await this.request(
      `${configuration.baseUrl}/v1/evaluate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject_id: input.subjectId,
          purpose: configuration.purpose,
          channel: configuration.channel,
        }),
      },
      configuration.token,
    );
    const decision = (await response.json()) as ConsentDecisionResponse;
    if (!decision.allowed || decision.receipt_id !== input.receiptId) {
      throw new UnauthorizedException(
        `Recurring charge is not authorized by Nvuto Consent: ${decision.reason || "denied"}`,
      );
    }
  }

  private configuration(): {
    baseUrl: string;
    token: string;
    purpose: string;
    channel: string;
  } {
    const baseUrl = process.env.NVUTO_CONSENT_BASE_URL?.replace(/\/$/, "");
    const token = process.env.NVUTO_CONSENT_BEARER_TOKEN;
    const purpose = process.env.NVUTO_CONSENT_SUBSCRIPTION_PURPOSE;
    const channel = process.env.NVUTO_CONSENT_SUBSCRIPTION_CHANNEL;
    if (!baseUrl || !token || !purpose || !channel) {
      throw new ServiceUnavailableException(
        "Canonical Nvuto Consent integration is unavailable",
      );
    }
    return { baseUrl, token, purpose, channel };
  }

  private async request(
    url: string,
    init: RequestInit,
    token: string,
  ): Promise<Response> {
    let response: Response;
    try {
      response = await fetch(url, {
        ...init,
        headers: {
          ...init.headers,
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(5_000),
      });
    } catch {
      throw new ServiceUnavailableException("Nvuto Consent request failed");
    }
    if (!response.ok) {
      if (response.status === 404) {
        throw new UnauthorizedException(
          "Nvuto Consent receipt or decision was rejected",
        );
      }
      if (response.status === 401 || response.status === 403) {
        throw new ServiceUnavailableException(
          "Nvuto Consent workload authentication was rejected",
        );
      }
      throw new ServiceUnavailableException("Nvuto Consent is unavailable");
    }
    return response;
  }
}
