import { InternalServerErrorException } from "@nestjs/common";
import { requireEncryptionKey } from "./encryption-key";

describe("requireEncryptionKey", () => {
  const originalKey = process.env.ENCRYPTION_KEY;

  afterEach(() => {
    if (originalKey === undefined) delete process.env.ENCRYPTION_KEY;
    else process.env.ENCRYPTION_KEY = originalKey;
  });

  it.each([undefined, "", "0".repeat(63), "not-hex".repeat(10)])(
    "fails closed for an unavailable or invalid key (%s)",
    (value) => {
      if (value === undefined) delete process.env.ENCRYPTION_KEY;
      else process.env.ENCRYPTION_KEY = value;

      expect(() => requireEncryptionKey()).toThrow(
        InternalServerErrorException,
      );
    },
  );

  it("returns an exact 32-byte key supplied by Vault/KMS", () => {
    process.env.ENCRYPTION_KEY = "ab".repeat(32);

    expect(requireEncryptionKey()).toEqual(Buffer.from("ab".repeat(32), "hex"));
  });
});
