import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==================== Dashboard Stats ====================

  @Get('dashboard/stats')
  @Roles('admin', 'operator')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/metrics')
  @Roles('admin', 'operator')
  @ApiOperation({ summary: 'Get business metrics' })
  async getBusinessMetrics(
    @Query('period') period: 'day' | 'week' | 'month' = 'day',
  ) {
    return this.adminService.getBusinessMetrics(period);
  }

  // ==================== User Management ====================

  @Get('users')
  @Roles('admin', 'operator')
  @ApiOperation({ summary: 'List all users with filters' })
  async listUsers(
    @Query('status') status?: string,
    @Query('tier') tier?: string,
    @Query('kycStatus') kycStatus?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.adminService.listUsers({ status, tier, kycStatus, page, limit });
  }

  @Get('users/:userId')
  @Roles('admin', 'operator')
  @ApiOperation({ summary: 'Get user details' })
  async getUserDetails(@Param('userId') userId: string) {
    return this.adminService.getUserDetails(userId);
  }

  @Put('users/:userId/status')
  @Roles('admin')
  @ApiOperation({ summary: 'Update user status' })
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body() body: { status: 'active' | 'suspended' | 'banned'; reason?: string },
  ) {
    return this.adminService.updateUserStatus(userId, body.status, body.reason);
  }

  @Put('users/:userId/tier')
  @Roles('admin')
  @ApiOperation({ summary: 'Update user tier' })
  async updateUserTier(
    @Param('userId') userId: string,
    @Body() body: { tier: 'free' | 'silver' | 'gold' | 'platinum' },
  ) {
    return this.adminService.updateUserTier(userId, body.tier);
  }

  // ==================== KYC Management ====================

  @Get('kyc/pending')
  @Roles('admin', 'compliance')
  @ApiOperation({ summary: 'Get pending KYC verifications' })
  async getPendingKYC(@Query('limit') limit: number = 100) {
    return this.adminService.getPendingKYCVerifications(limit);
  }

  @Get('kyc/:kycId')
  @Roles('admin', 'compliance')
  @ApiOperation({ summary: 'Get KYC details' })
  async getKYCDetails(@Param('kycId') kycId: string) {
    return this.adminService.getKYCDetails(kycId);
  }

  @Post('kyc/:kycId/approve')
  @Roles('admin', 'compliance')
  @ApiOperation({ summary: 'Approve KYC verification' })
  async approveKYC(
    @Param('kycId') kycId: string,
    @Body() body: { notes?: string },
  ) {
    return this.adminService.approveKYC(kycId, body.notes);
  }

  @Post('kyc/:kycId/reject')
  @Roles('admin', 'compliance')
  @ApiOperation({ summary: 'Reject KYC verification' })
  async rejectKYC(
    @Param('kycId') kycId: string,
    @Body() body: { reason: string; notes?: string },
  ) {
    return this.adminService.rejectKYC(kycId, body.reason, body.notes);
  }

  // ==================== Transaction Monitoring ====================

  @Get('transactions')
  @Roles('admin', 'compliance')
  @ApiOperation({ summary: 'List transactions with filters' })
  async listTransactions(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('userId') userId?: string,
    @Query('minAmount') minAmount?: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 100,
  ) {
    return this.adminService.listTransactions({
      status,
      type,
      userId,
      minAmount,
      page,
      limit,
    });
  }

  @Get('transactions/flagged')
  @Roles('admin', 'compliance')
  @ApiOperation({ summary: 'Get flagged transactions (fraud/AML)' })
  async getFlaggedTransactions(@Query('limit') limit: number = 100) {
    return this.adminService.getFlaggedTransactions(limit);
  }

  @Post('transactions/:transactionId/review')
  @Roles('admin', 'compliance')
  @ApiOperation({ summary: 'Review flagged transaction' })
  async reviewTransaction(
    @Param('transactionId') transactionId: string,
    @Body() body: { action: 'approve' | 'reject' | 'escalate'; notes: string },
  ) {
    return this.adminService.reviewTransaction(
      transactionId,
      body.action,
      body.notes,
    );
  }

  // ==================== Fraud & AML ====================

  @Get('fraud/alerts')
  @Roles('admin', 'compliance')
  @ApiOperation({ summary: 'Get fraud alerts' })
  async getFraudAlerts(@Query('limit') limit: number = 100) {
    return this.adminService.getFraudAlerts(limit);
  }

  @Get('aml/alerts')
  @Roles('admin', 'compliance')
  @ApiOperation({ summary: 'Get AML alerts' })
  async getAMLAlerts(@Query('limit') limit: number = 100) {
    return this.adminService.getAMLAlerts(limit);
  }

  // ==================== System Health ====================

  @Get('system/health')
  @Roles('admin')
  @ApiOperation({ summary: 'Get system health status' })
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  @Get('system/logs')
  @Roles('admin')
  @ApiOperation({ summary: 'Get system logs' })
  async getSystemLogs(
    @Query('level') level?: string,
    @Query('limit') limit: number = 1000,
  ) {
    return this.adminService.getSystemLogs(level, limit);
  }

  // ==================== Reports ====================

  @Get('reports/revenue')
  @Roles('admin', 'finance')
  @ApiOperation({ summary: 'Get revenue report' })
  async getRevenueReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.adminService.getRevenueReport(new Date(startDate), new Date(endDate));
  }

  @Get('reports/transactions')
  @Roles('admin', 'finance')
  @ApiOperation({ summary: 'Get transaction report' })
  async getTransactionReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.adminService.getTransactionReport(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('reports/compliance')
  @Roles('admin', 'compliance')
  @ApiOperation({ summary: 'Get compliance report' })
  async getComplianceReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.adminService.getComplianceReport(
      new Date(startDate),
      new Date(endDate),
    );
  }
}
