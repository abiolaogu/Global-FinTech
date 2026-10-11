import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRecurringPaymentConsentEvidence1732400000000 implements MigrationInterface {
  name = "AddRecurringPaymentConsentEvidence1732400000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "recurring_payments"
        ADD COLUMN IF NOT EXISTS "consentReceiptId" character varying(64),
        ADD COLUMN IF NOT EXISTS "consentCapturedAt" timestamp,
        ADD COLUMN IF NOT EXISTS "termsVersion" character varying(100),
        ADD COLUMN IF NOT EXISTS "disclosureVersion" character varying(100),
        ADD COLUMN IF NOT EXISTS "disclosureArtifactHash" character(64),
        ADD COLUMN IF NOT EXISTS "jurisdiction" character varying(32),
        ADD COLUMN IF NOT EXISTS "renewalDisclosure" jsonb,
        ADD COLUMN IF NOT EXISTS "consentDigest" character(64)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_recurring_payments_consentReceiptId"
      ON "recurring_payments" ("consentReceiptId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_recurring_payments_consentReceiptId"`,
    );
    await queryRunner.query(`
      ALTER TABLE "recurring_payments"
        DROP COLUMN IF EXISTS "consentDigest",
        DROP COLUMN IF EXISTS "renewalDisclosure",
        DROP COLUMN IF EXISTS "jurisdiction",
        DROP COLUMN IF EXISTS "disclosureVersion",
        DROP COLUMN IF EXISTS "disclosureArtifactHash",
        DROP COLUMN IF EXISTS "termsVersion",
        DROP COLUMN IF EXISTS "consentCapturedAt",
        DROP COLUMN IF EXISTS "consentReceiptId"
    `);
  }
}
