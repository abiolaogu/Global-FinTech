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
var SumsubService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SumsubService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
const crypto = require("crypto");
let SumsubService = SumsubService_1 = class SumsubService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(SumsubService_1.name);
        this.appToken = this.configService.get('SUMSUB_APP_TOKEN');
        this.secretKey = this.configService.get('SUMSUB_SECRET_KEY');
        this.baseUrl = this.configService.get('SUMSUB_BASE_URL') || 'https://api.sumsub.com';
        if (!this.appToken || !this.secretKey) {
            throw new Error('Sumsub credentials not configured');
        }
        this.client = axios_1.default.create({
            baseURL: this.baseUrl,
            timeout: 30000,
        });
        this.client.interceptors.request.use((config) => {
            const ts = Math.floor(Date.now() / 1000);
            const signature = this.generateSignature(ts, config.method.toUpperCase(), config.url, config.data);
            config.headers['X-App-Token'] = this.appToken;
            config.headers['X-App-Access-Sig'] = signature;
            config.headers['X-App-Access-Ts'] = ts.toString();
            return config;
        });
    }
    async createApplicant(data) {
        try {
            const response = await this.client.post('/resources/applicants', {
                externalUserId: data.externalUserId,
                email: data.email,
                phone: data.phone,
                fixedInfo: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    country: data.country,
                },
            }, {
                params: {
                    levelName: data.levelName || 'basic-kyc-level',
                },
            });
            this.logger.log(`Created Sumsub applicant: ${response.data.id}`);
            return {
                id: response.data.id,
                externalUserId: response.data.externalUserId,
                email: response.data.email,
                phone: response.data.phone,
            };
        }
        catch (error) {
            this.logger.error(`Failed to create Sumsub applicant: ${error.message}`, error.stack);
            throw new common_1.HttpException('Failed to create KYC applicant', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async generateAccessToken(externalUserId, levelName = 'basic-kyc-level') {
        try {
            const response = await this.client.post(`/resources/accessTokens`, {
                externalUserId,
                levelName,
                ttlInSecs: 600,
            });
            return response.data.token;
        }
        catch (error) {
            this.logger.error(`Failed to generate access token: ${error.message}`, error.stack);
            throw new common_1.HttpException('Failed to generate KYC token', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getApplicantStatus(applicantId) {
        try {
            const response = await this.client.get(`/resources/applicants/${applicantId}/status`);
            return {
                reviewStatus: response.data.reviewStatus,
                reviewResult: response.data.reviewResult,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get applicant status: ${error.message}`, error.stack);
            throw new common_1.HttpException('Failed to get KYC status', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getApplicant(applicantId) {
        try {
            const response = await this.client.get(`/resources/applicants/${applicantId}/one`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get applicant data: ${error.message}`, error.stack);
            throw new common_1.HttpException('Failed to get KYC data', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async requestCheck(applicantId) {
        try {
            await this.client.post(`/resources/applicants/${applicantId}/status/pending`);
            this.logger.log(`Requested check for applicant: ${applicantId}`);
        }
        catch (error) {
            this.logger.error(`Failed to request check: ${error.message}`, error.stack);
            throw new common_1.HttpException('Failed to request KYC check', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async resetApplicant(applicantId) {
        try {
            await this.client.post(`/resources/applicants/${applicantId}/reset`);
            this.logger.log(`Reset applicant: ${applicantId}`);
        }
        catch (error) {
            this.logger.error(`Failed to reset applicant: ${error.message}`, error.stack);
            throw new common_1.HttpException('Failed to reset KYC', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async handleWebhook(payload, signature) {
        const isValid = this.verifyWebhookSignature(JSON.stringify(payload), signature);
        if (!isValid) {
            this.logger.warn('Invalid webhook signature');
            throw new common_1.HttpException('Invalid signature', common_1.HttpStatus.UNAUTHORIZED);
        }
        this.logger.log(`Received Sumsub webhook: ${payload.type}`);
        switch (payload.type) {
            case 'applicantReviewed':
                await this.handleApplicantReviewed(payload);
                break;
            case 'applicantPending':
                await this.handleApplicantPending(payload);
                break;
            case 'applicantCreated':
                this.logger.log(`Applicant created: ${payload.applicantId}`);
                break;
            default:
                this.logger.warn(`Unhandled webhook type: ${payload.type}`);
        }
    }
    async handleApplicantReviewed(payload) {
        const { applicantId, externalUserId, reviewResult } = payload;
        this.logger.log(`Applicant reviewed: ${applicantId} - Result: ${reviewResult.reviewAnswer}`);
    }
    async handleApplicantPending(payload) {
        this.logger.log(`Applicant pending: ${payload.applicantId}`);
    }
    generateSignature(ts, method, url, body = null) {
        const data = ts + method + url + (body ? JSON.stringify(body) : '');
        return crypto.createHmac('sha256', this.secretKey).update(data).digest('hex');
    }
    verifyWebhookSignature(payload, signature) {
        const hmac = crypto.createHmac('sha256', this.secretKey);
        hmac.update(payload);
        const expectedSignature = hmac.digest('hex');
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    }
};
exports.SumsubService = SumsubService;
exports.SumsubService = SumsubService = SumsubService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], SumsubService);
//# sourceMappingURL=sumsub.service.js.map