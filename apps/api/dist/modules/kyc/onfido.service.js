"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OnfidoService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnfidoService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let OnfidoService = OnfidoService_1 = class OnfidoService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(OnfidoService_1.name);
        this.apiToken = this.configService.get('ONFIDO_API_TOKEN');
        this.baseUrl = this.configService.get('ONFIDO_BASE_URL') || 'https://api.onfido.com/v3.6';
        if (!this.apiToken) {
            throw new Error('ONFIDO_API_TOKEN not configured');
        }
        this.client = axios_1.default.create({
            baseURL: this.baseUrl,
            headers: {
                'Authorization': `Token token=${this.apiToken}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });
    }
    async createApplicant(data) {
        try {
            const response = await this.client.post('/applicants', {
                first_name: data.firstName,
                last_name: data.lastName,
                email: data.email,
                dob: data.dob,
                address: data.address,
            });
            this.logger.log(`Created Onfido applicant: ${response.data.id}`);
            return {
                id: response.data.id,
                firstName: response.data.first_name,
                lastName: response.data.last_name,
                email: response.data.email,
            };
        }
        catch (error) {
            this.logger.error(`Failed to create Onfido applicant: ${error.message}`, error.stack);
            throw new common_1.HttpException('Failed to create KYC applicant', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async generateSdkToken(applicantId) {
        try {
            const response = await this.client.post('/sdk_token', {
                applicant_id: applicantId,
                referrer: '*://*/*',
            });
            return response.data.token;
        }
        catch (error) {
            this.logger.error(`Failed to generate SDK token: ${error.message}`, error.stack);
            throw new common_1.HttpException('Failed to generate KYC token', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createCheck(applicantId, checkType = 'standard') {
        try {
            const reportNames = this.getReportNames(checkType);
            const response = await this.client.post('/checks', {
                applicant_id: applicantId,
                report_names: reportNames,
            });
            this.logger.log(`Created Onfido check: ${response.data.id}`);
            return {
                id: response.data.id,
                status: response.data.status,
                result: response.data.result,
                reports: response.data.reports || [],
            };
        }
        catch (error) {
            this.logger.error(`Failed to create check: ${error.message}`, error.stack);
            throw new common_1.HttpException('Failed to create KYC check', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCheck(checkId) {
        try {
            const response = await this.client.get(`/checks/${checkId}`);
            return {
                id: response.data.id,
                status: response.data.status,
                result: response.data.result,
                reports: response.data.reports || [],
            };
        }
        catch (error) {
            this.logger.error(`Failed to get check status: ${error.message}`, error.stack);
            throw new common_1.HttpException('Failed to get KYC check status', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCheckResults(checkId) {
        try {
            const response = await this.client.get(`/checks/${checkId}`);
            const check = response.data;
            const reports = await Promise.all(check.report_ids.map((reportId) => this.getReport(reportId)));
            return {
                status: check.status,
                result: check.result,
                breakdown: {
                    documentCheck: reports.find((r) => r.name === 'document'),
                    facialSimilarityCheck: reports.find((r) => r.name === 'facial_similarity_photo'),
                    proofOfAddress: reports.find((r) => r.name === 'proof_of_address'),
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to get check results: ${error.message}`, error.stack);
            throw new common_1.HttpException('Failed to get KYC check results', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getReport(reportId) {
        try {
            const response = await this.client.get(`/reports/${reportId}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get report: ${error.message}`, error.stack);
            return null;
        }
    }
    verifyWebhookSignature(payload, signature, webhookToken) {
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', webhookToken);
        hmac.update(payload);
        const expectedSignature = hmac.digest('hex');
        return signature === expectedSignature;
    }
    async handleWebhook(payload) {
        this.logger.log(`Received Onfido webhook: ${payload.resource_type} - ${payload.action}`);
        switch (payload.resource_type) {
            case 'check':
                if (payload.action === 'check.completed') {
                    await this.handleCheckCompleted(payload.object);
                }
                break;
            case 'report':
                if (payload.action === 'report.completed') {
                    await this.handleReportCompleted(payload.object);
                }
                break;
            default:
                this.logger.warn(`Unhandled webhook type: ${payload.resource_type}`);
        }
    }
    async handleCheckCompleted(check) {
        this.logger.log(`Check completed: ${check.id} - Result: ${check.result}`);
    }
    async handleReportCompleted(report) {
        this.logger.log(`Report completed: ${report.id} - Result: ${report.result}`);
    }
    getReportNames(checkType) {
        switch (checkType) {
            case 'express':
                return ['document', 'facial_similarity_photo'];
            case 'basic':
                return ['document'];
            case 'standard':
            default:
                return ['document', 'facial_similarity_photo', 'proof_of_address'];
        }
    }
};
exports.OnfidoService = OnfidoService;
exports.OnfidoService = OnfidoService = OnfidoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], OnfidoService);
//# sourceMappingURL=onfido.service.js.map