import { InternalServerErrorException } from "@nestjs/common";

/**
 * Resolve the data-encryption key injected by Vault/KMS.
 *
 * A predictable development fallback would make encrypted credentials
 * recoverable, so every environment fails closed when the key is unavailable.
 */
export function requireEncryptionKey(): Buffer {
  const configuredKey = process.env.ENCRYPTION_KEY;
  if (!configuredKey || !/^[a-f0-9]{64}$/i.test(configuredKey)) {
    throw new InternalServerErrorException(
      "Vault/KMS encryption key is unavailable",
    );
  }
  return Buffer.from(configuredKey, "hex");
}
