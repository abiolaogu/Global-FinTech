import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { InvestmentOpportunityEntity } from './investment-opportunity.entity';

export enum CompanyStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export enum CompanyType {
  ASSET_MANAGER = 'asset_manager',
  VENTURE_CAPITAL = 'venture_capital',
  PRIVATE_EQUITY = 'private_equity',
  HEDGE_FUND = 'hedge_fund',
  REAL_ESTATE = 'real_estate',
  CROWDFUNDING = 'crowdfunding',
  BROKER_DEALER = 'broker_dealer',
}

@Entity('investment_companies')
export class InvestmentCompanyEntity {
  @PrimaryGeneratedColumn('uuid')
  companyId: string;

  @Column({ type: 'varchar', length: 200 })
  companyName: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  legalName: string;

  @Column({ type: 'varchar', length: 50 })
  registrationNumber: string;

  @Column({ type: 'varchar', length: 50 })
  companyType: CompanyType;

  @Column({ type: 'varchar', length: 50, default: CompanyStatus.PENDING })
  status: CompanyStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 200 })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string;

  // Regulatory information
  @Column({ type: 'varchar', length: 100, nullable: true })
  secRegistration: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  finraRegistration: string;

  @Column({ type: 'simple-array', nullable: true })
  licenses: string[];

  @Column({ type: 'simple-array', nullable: true })
  regulatoryApprovals: string[];

  // Financial information
  @Column({ type: 'decimal', precision: 24, scale: 2, nullable: true })
  assetsUnderManagement: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  aumCurrency: string;

  @Column({ type: 'int', nullable: true })
  yearEstablished: number;

  @Column({ type: 'int', default: 0 })
  totalInvestors: number;

  // Documents
  @Column({ type: 'simple-array', nullable: true })
  complianceDocuments: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl: string;

  // Contact person
  @Column({ type: 'varchar', length: 100 })
  contactPersonName: string;

  @Column({ type: 'varchar', length: 100 })
  contactPersonEmail: string;

  @Column({ type: 'varchar', length: 50 })
  contactPersonPhone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  contactPersonTitle: string;

  // Platform metrics
  @Column({ type: 'int', default: 0 })
  totalOpportunities: number;

  @Column({ type: 'int', default: 0 })
  activeOpportunities: number;

  @Column({ type: 'decimal', precision: 24, scale: 2, default: '0' })
  totalRaised: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: '0' })
  averageRating: string;

  @Column({ type: 'int', default: 0 })
  totalReviews: number;

  // Approval tracking
  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'text', nullable: true })
  internalNotes: string;

  @OneToMany(
    () => InvestmentOpportunityEntity,
    (opportunity) => opportunity.company,
  )
  opportunities: InvestmentOpportunityEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
