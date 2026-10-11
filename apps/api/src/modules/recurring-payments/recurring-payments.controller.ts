import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import { RecurringPaymentsService } from "./recurring-payments.service";
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { RecurringPaymentEntity } from "./entities/recurring-payment.entity";

@ApiTags("Recurring Payments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("recurring-payments")
export class RecurringPaymentsController {
  constructor(
    private readonly recurringPaymentsService: RecurringPaymentsService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a recurring payment" })
  @ApiResponse({
    status: 201,
    description: "Recurring payment created successfully",
  })
  async createRecurringPayment(
    @Request() req,
    @Body()
    dto: {
      merchantId: string;
      name: string;
      description?: string;
      amount: string;
      currency: string;
      frequency:
        | "daily"
        | "weekly"
        | "biweekly"
        | "monthly"
        | "quarterly"
        | "yearly";
      startDate: Date;
      endDate?: Date;
      maxPayments?: number;
      paymentMethod: string;
      paymentMethodToken: string;
      gatewayId: string;
      provider: string;
      authorizationCode?: string;
      consent: {
        accepted: boolean;
        acceptedAt: Date;
        receiptId: string;
        termsVersion: string;
        disclosureVersion: string;
        disclosureArtifactHash: string;
        jurisdiction: string;
        cancellationMethod: string;
      };
      metadata?: Record<string, any>;
    },
  ) {
    const payment = await this.recurringPaymentsService.createRecurringPayment({
      ...dto,
      userId: req.user.user_id,
    });
    return this.toResponse(payment);
  }

  @Get("me")
  @ApiOperation({
    summary: "Get the authenticated consumer recurring payments",
  })
  @ApiResponse({ status: 200, description: "Recurring payments retrieved" })
  async getMyRecurringPayments(@Request() req) {
    const payments =
      await this.recurringPaymentsService.getUserRecurringPayments(
        req.user.user_id,
      );
    return payments.map((payment) => this.toResponse(payment));
  }

  @Get(":recurringPaymentId")
  @ApiOperation({ summary: "Get recurring payment" })
  @ApiResponse({ status: 200, description: "Recurring payment found" })
  async getRecurringPayment(
    @Request() req,
    @Param("recurringPaymentId") recurringPaymentId: string,
  ) {
    const payment = await this.recurringPaymentsService.getRecurringPayment(
      recurringPaymentId,
      req.user.user_id,
    );
    return this.toResponse(payment);
  }

  @Get("merchant/me")
  @Roles("merchant", "admin")
  @ApiOperation({
    summary: "Get recurring payments for the authenticated merchant",
  })
  @ApiResponse({ status: 200, description: "Recurring payments retrieved" })
  async getMerchantRecurringPayments(@Request() req) {
    const merchantId = req.user.merchant_id;
    if (!merchantId) {
      throw new ForbiddenException("A merchant principal is required");
    }
    const payments =
      await this.recurringPaymentsService.getMerchantRecurringPayments(
        merchantId,
      );
    return payments.map((payment) => this.toResponse(payment));
  }

  @Post(":recurringPaymentId/pause")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Pause recurring payment" })
  @ApiResponse({ status: 200, description: "Recurring payment paused" })
  async pauseRecurringPayment(
    @Request() req,
    @Param("recurringPaymentId") recurringPaymentId: string,
  ) {
    const payment = await this.recurringPaymentsService.pauseRecurringPayment(
      recurringPaymentId,
      req.user.user_id,
    );
    return this.toResponse(payment);
  }

  @Post(":recurringPaymentId/resume")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Resume recurring payment" })
  @ApiResponse({ status: 200, description: "Recurring payment resumed" })
  async resumeRecurringPayment(
    @Request() req,
    @Param("recurringPaymentId") recurringPaymentId: string,
  ) {
    const payment = await this.recurringPaymentsService.resumeRecurringPayment(
      recurringPaymentId,
      req.user.user_id,
    );
    return this.toResponse(payment);
  }

  @Post(":recurringPaymentId/cancel")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cancel recurring payment" })
  @ApiResponse({ status: 200, description: "Recurring payment cancelled" })
  async cancelRecurringPayment(
    @Request() req,
    @Param("recurringPaymentId") recurringPaymentId: string,
    @Body() dto: { reason?: string },
  ) {
    const payment = await this.recurringPaymentsService.cancelRecurringPayment(
      recurringPaymentId,
      req.user.user_id,
      dto.reason,
    );
    return this.toResponse(payment);
  }

  private toResponse(payment: RecurringPaymentEntity) {
    const {
      paymentMethodEncrypted: _paymentMethodEncrypted,
      authorizationCode: _authorizationCode,
      consentDigest: _consentDigest,
      disclosureArtifactHash: _disclosureArtifactHash,
      metadata: _metadata,
      ...response
    } = payment;
    return response;
  }
}
