import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class AddCreditLineAndSmsUssdSupport1732300000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add credit line and SMS/USSD sync columns to wallets table
    await queryRunner.query(`
      ALTER TABLE "wallets"
      ADD COLUMN "credit_limit" DECIMAL(20,8) DEFAULT 0,
      ADD COLUMN "credit_used" DECIMAL(20,8) DEFAULT 0,
      ADD COLUMN "offline_spend_limit" DECIMAL(20,8) DEFAULT 0,
      ADD COLUMN "credit_interest_rate" DECIMAL(5,2) DEFAULT 0,
      ADD COLUMN "credit_grace_period_days" INTEGER DEFAULT 30,
      ADD COLUMN "credit_allocated_at" TIMESTAMP,
      ADD COLUMN "credit_last_used_at" TIMESTAMP,
      ADD COLUMN "credit_next_payment_due" TIMESTAMP,
      ADD COLUMN "last_sms_sync_at" TIMESTAMP,
      ADD COLUMN "last_ussd_sync_at" TIMESTAMP,
      ADD COLUMN "sms_sync_count" INTEGER DEFAULT 0,
      ADD COLUMN "ussd_sync_count" INTEGER DEFAULT 0,
      ADD COLUMN "sync_settings" JSONB
    `);

    // Create wallet_topups table
    await queryRunner.createTable(
      new Table({
        name: 'wallet_topups',
        columns: [
          {
            name: 'topup_id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'wallet_id',
            type: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 20,
            scale: 8,
          },
          {
            name: 'source_account_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'source_type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
          },
          {
            name: 'channel',
            type: 'varchar',
            length: '50',
            default: "'internet'",
          },
          {
            name: 'reference',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'failure_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'completed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'failed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'reversed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'balance_before',
            type: 'decimal',
            precision: 20,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'balance_after',
            type: 'decimal',
            precision: 20,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create indexes for wallet_topups
    await queryRunner.createIndex(
      'wallet_topups',
      new TableIndex({
        name: 'IDX_topups_wallet',
        columnNames: ['wallet_id'],
      }),
    );

    await queryRunner.createIndex(
      'wallet_topups',
      new TableIndex({
        name: 'IDX_topups_user',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'wallet_topups',
      new TableIndex({
        name: 'IDX_topups_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'wallet_topups',
      new TableIndex({
        name: 'IDX_topups_reference',
        columnNames: ['reference'],
      }),
    );

    // Create credit_lines table
    await queryRunner.createTable(
      new Table({
        name: 'credit_lines',
        columns: [
          {
            name: 'credit_line_id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isUnique: true,
          },
          {
            name: 'wallet_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'credit_limit',
            type: 'decimal',
            precision: 20,
            scale: 8,
            default: 0,
          },
          {
            name: 'credit_used',
            type: 'decimal',
            precision: 20,
            scale: 8,
            default: 0,
          },
          {
            name: 'interest_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'grace_period_days',
            type: 'integer',
            default: 30,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'active'",
          },
          {
            name: 'total_repaid',
            type: 'decimal',
            precision: 20,
            scale: 8,
            default: 0,
          },
          {
            name: 'interest_accrued',
            type: 'decimal',
            precision: 20,
            scale: 8,
            default: 0,
          },
          {
            name: 'minimum_payment_due',
            type: 'decimal',
            precision: 20,
            scale: 8,
            default: 0,
          },
          {
            name: 'next_payment_due',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'last_used_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'last_repayment_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'missed_payments',
            type: 'integer',
            default: 0,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'suspension_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'suspended_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'allocated_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create indexes for credit_lines
    await queryRunner.createIndex(
      'credit_lines',
      new TableIndex({
        name: 'IDX_credit_user',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'credit_lines',
      new TableIndex({
        name: 'IDX_credit_wallet',
        columnNames: ['wallet_id'],
      }),
    );

    await queryRunner.createIndex(
      'credit_lines',
      new TableIndex({
        name: 'IDX_credit_status',
        columnNames: ['status'],
      }),
    );

    // Create sms_sync_log table
    await queryRunner.createTable(
      new Table({
        name: 'sms_sync_log',
        columns: [
          {
            name: 'log_id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'phone_number',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'direction',
            type: 'varchar',
            length: '10',
          },
          {
            name: 'command',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'message_body',
            type: 'text',
          },
          {
            name: 'encrypted_payload',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'response',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
          },
          {
            name: 'sms_gateway',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'cost',
            type: 'decimal',
            precision: 10,
            scale: 4,
            isNullable: true,
          },
          {
            name: 'error_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'processed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'delivered_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes for sms_sync_log
    await queryRunner.createIndex(
      'sms_sync_log',
      new TableIndex({
        name: 'IDX_sms_user',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'sms_sync_log',
      new TableIndex({
        name: 'IDX_sms_phone',
        columnNames: ['phone_number'],
      }),
    );

    await queryRunner.createIndex(
      'sms_sync_log',
      new TableIndex({
        name: 'IDX_sms_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'sms_sync_log',
      new TableIndex({
        name: 'IDX_sms_created',
        columnNames: ['created_at'],
      }),
    );

    // Create ussd_sessions table
    await queryRunner.createTable(
      new Table({
        name: 'ussd_sessions',
        columns: [
          {
            name: 'session_id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'phone_number',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'session_token',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'current_menu',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'menu_state',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'authenticated',
            type: 'boolean',
            default: false,
          },
          {
            name: 'pin_attempts',
            type: 'integer',
            default: 0,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'active'",
          },
          {
            name: 'ussd_gateway',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'last_response',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'last_user_input',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'last_interaction_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'expires_at',
            type: 'timestamp',
          },
          {
            name: 'completed_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes for ussd_sessions
    await queryRunner.createIndex(
      'ussd_sessions',
      new TableIndex({
        name: 'IDX_ussd_token',
        columnNames: ['session_token'],
      }),
    );

    await queryRunner.createIndex(
      'ussd_sessions',
      new TableIndex({
        name: 'IDX_ussd_phone',
        columnNames: ['phone_number'],
      }),
    );

    await queryRunner.createIndex(
      'ussd_sessions',
      new TableIndex({
        name: 'IDX_ussd_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'ussd_sessions',
      new TableIndex({
        name: 'IDX_ussd_expires',
        columnNames: ['expires_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables
    await queryRunner.dropTable('ussd_sessions', true);
    await queryRunner.dropTable('sms_sync_log', true);
    await queryRunner.dropTable('credit_lines', true);
    await queryRunner.dropTable('wallet_topups', true);

    // Remove columns from wallets table
    await queryRunner.query(`
      ALTER TABLE "wallets"
      DROP COLUMN IF EXISTS "credit_limit",
      DROP COLUMN IF EXISTS "credit_used",
      DROP COLUMN IF EXISTS "offline_spend_limit",
      DROP COLUMN IF EXISTS "credit_interest_rate",
      DROP COLUMN IF EXISTS "credit_grace_period_days",
      DROP COLUMN IF EXISTS "credit_allocated_at",
      DROP COLUMN IF EXISTS "credit_last_used_at",
      DROP COLUMN IF EXISTS "credit_next_payment_due",
      DROP COLUMN IF EXISTS "last_sms_sync_at",
      DROP COLUMN IF EXISTS "last_ussd_sync_at",
      DROP COLUMN IF EXISTS "sms_sync_count",
      DROP COLUMN IF EXISTS "ussd_sync_count",
      DROP COLUMN IF EXISTS "sync_settings"
    `);
  }
}
