"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ISO8583Parser_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISO8583Parser = exports.LengthType = exports.FieldType = void 0;
const common_1 = require("@nestjs/common");
var FieldType;
(function (FieldType) {
    FieldType["NUMERIC"] = "n";
    FieldType["ALPHA"] = "a";
    FieldType["ALPHANUMERIC"] = "an";
    FieldType["ALPHANUMERIC_SPECIAL"] = "ans";
    FieldType["BINARY"] = "b";
    FieldType["TRACK2"] = "z";
})(FieldType || (exports.FieldType = FieldType = {}));
var LengthType;
(function (LengthType) {
    LengthType["FIXED"] = "FIXED";
    LengthType["LLVAR"] = "LLVAR";
    LengthType["LLLVAR"] = "LLLVAR";
    LengthType["LLLLVAR"] = "LLLLVAR";
})(LengthType || (exports.LengthType = LengthType = {}));
let ISO8583Parser = ISO8583Parser_1 = class ISO8583Parser {
    constructor() {
        this.logger = new common_1.Logger(ISO8583Parser_1.name);
        this.fieldDefinitions = new Map([
            [0, { id: 0, name: 'MTI', type: FieldType.NUMERIC, lengthType: LengthType.FIXED, maxLength: 4, description: 'Message Type Indicator' }],
            [1, { id: 1, name: 'BITMAP', type: FieldType.BINARY, lengthType: LengthType.FIXED, maxLength: 16, description: 'Bitmap' }],
            [2, { id: 2, name: 'PAN', type: FieldType.NUMERIC, lengthType: LengthType.LLVAR, maxLength: 19, description: 'Primary Account Number' }],
            [3, { id: 3, name: 'PROCESSING_CODE', type: FieldType.NUMERIC, lengthType: LengthType.FIXED, maxLength: 6, description: 'Processing Code' }],
            [4, { id: 4, name: 'AMOUNT_TRANSACTION', type: FieldType.NUMERIC, lengthType: LengthType.FIXED, maxLength: 12, description: 'Transaction Amount' }],
            [5, { id: 5, name: 'AMOUNT_SETTLEMENT', type: FieldType.NUMERIC, lengthType: LengthType.FIXED, maxLength: 12, description: 'Settlement Amount' }],
            [6, { id: 6, name: 'AMOUNT_CARDHOLDER_BILLING', type: FieldType.NUMERIC, lengthType: LengthType.FIXED, maxLength: 12, description: 'Cardholder Billing Amount' }],
            [7, { id: 7, name: 'TRANSMISSION_DATE_TIME', type: FieldType.NUMERIC, lengthType: LengthType.FIXED, maxLength: 10, description: 'Transmission Date & Time' }],
            [11, { id: 11, name: 'STAN', type: FieldType.NUMERIC, lengthType: LengthType.FIXED, maxLength: 6, description: 'System Trace Audit Number' }],
            [12, { id: 12, name: 'TIME_LOCAL', type: FieldType.NUMERIC, lengthType: LengthType.FIXED, maxLength: 6, description: 'Local Transaction Time' }],
            [13, { id: 13, name: 'DATE_LOCAL', type: FieldType.NUMERIC, lengthType: LengthType.FIXED, maxLength: 4, description: 'Local Transaction Date' }],
            [14, { id: 14, name: 'DATE_EXPIRATION', type: FieldType.NUMERIC, lengthType: LengthType.FIXED, maxLength: 4, description: 'Card Expiration Date' }],
            [15, { id: 15, name: 'DATE_SETTLEMENT', type: FieldType.NUMERIC, lengthType: LengthType.FIXED, maxLength: 4, description: 'Settlement Date' }],
            [18, { id: 18, name: 'MERCHANT_TYPE', type: FieldType.NUMERIC, lengthType: LengthType.FIXED, maxLength: 4, description: 'Merchant Category Code' }],
            [22, { id: 22, name: 'POS_ENTRY_MODE', type: FieldType.NUMERIC, lengthType: LengthType.FIXED, maxLength: 3, description: 'POS Entry Mode' }],
            [23, { id: 23, name: 'CARD_SEQUENCE_NUMBER', type: FieldType.NUMERIC, lengthType: LengthType.FIXED, maxLength: 3, description: 'Card Sequence Number' }],
            [25, { id: 25, name: 'POS_CONDITION_CODE', type: FieldType.NUMERIC, lengthType: LengthType.FIXED, maxLength: 2, description: 'POS Condition Code' }],
            [32, { id: 32, name: 'ACQUIRING_INSTITUTION_ID', type: FieldType.NUMERIC, lengthType: LengthType.LLVAR, maxLength: 11, description: 'Acquiring Institution ID' }],
            [35, { id: 35, name: 'TRACK2_DATA', type: FieldType.TRACK2, lengthType: LengthType.LLVAR, maxLength: 37, description: 'Track 2 Data' }],
            [37, { id: 37, name: 'RRN', type: FieldType.ALPHANUMERIC, lengthType: LengthType.FIXED, maxLength: 12, description: 'Retrieval Reference Number' }],
            [38, { id: 38, name: 'AUTHORIZATION_CODE', type: FieldType.ALPHANUMERIC, lengthType: LengthType.FIXED, maxLength: 6, description: 'Authorization Code' }],
            [39, { id: 39, name: 'RESPONSE_CODE', type: FieldType.ALPHANUMERIC, lengthType: LengthType.FIXED, maxLength: 2, description: 'Response Code' }],
            [41, { id: 41, name: 'TERMINAL_ID', type: FieldType.ALPHANUMERIC_SPECIAL, lengthType: LengthType.FIXED, maxLength: 8, description: 'Terminal ID' }],
            [42, { id: 42, name: 'MERCHANT_ID', type: FieldType.ALPHANUMERIC_SPECIAL, lengthType: LengthType.FIXED, maxLength: 15, description: 'Merchant ID' }],
            [43, { id: 43, name: 'MERCHANT_NAME_LOCATION', type: FieldType.ALPHANUMERIC_SPECIAL, lengthType: LengthType.FIXED, maxLength: 40, description: 'Merchant Name/Location' }],
            [48, { id: 48, name: 'ADDITIONAL_DATA', type: FieldType.ALPHANUMERIC_SPECIAL, lengthType: LengthType.LLLVAR, maxLength: 999, description: 'Additional Data' }],
            [49, { id: 49, name: 'CURRENCY_CODE_TRANSACTION', type: FieldType.ALPHANUMERIC, lengthType: LengthType.FIXED, maxLength: 3, description: 'Transaction Currency Code' }],
            [52, { id: 52, name: 'PIN_DATA', type: FieldType.BINARY, lengthType: LengthType.FIXED, maxLength: 8, description: 'PIN Data' }],
            [53, { id: 53, name: 'SECURITY_RELATED_CONTROL', type: FieldType.NUMERIC, lengthType: LengthType.FIXED, maxLength: 16, description: 'Security Control' }],
            [54, { id: 54, name: 'ADDITIONAL_AMOUNTS', type: FieldType.ALPHANUMERIC, lengthType: LengthType.LLLVAR, maxLength: 120, description: 'Additional Amounts' }],
            [55, { id: 55, name: 'ICC_DATA', type: FieldType.BINARY, lengthType: LengthType.LLLVAR, maxLength: 999, description: 'ICC/Chip Data' }],
            [90, { id: 90, name: 'ORIGINAL_DATA_ELEMENTS', type: FieldType.NUMERIC, lengthType: LengthType.FIXED, maxLength: 42, description: 'Original Data Elements' }],
            [95, { id: 95, name: 'REPLACEMENT_AMOUNTS', type: FieldType.ALPHANUMERIC, lengthType: LengthType.FIXED, maxLength: 42, description: 'Replacement Amounts' }],
            [102, { id: 102, name: 'ACCOUNT_ID_1', type: FieldType.ALPHANUMERIC_SPECIAL, lengthType: LengthType.LLVAR, maxLength: 28, description: 'Account ID 1' }],
            [103, { id: 103, name: 'ACCOUNT_ID_2', type: FieldType.ALPHANUMERIC_SPECIAL, lengthType: LengthType.LLVAR, maxLength: 28, description: 'Account ID 2' }],
            [120, { id: 120, name: 'RECORD_DATA', type: FieldType.ALPHANUMERIC_SPECIAL, lengthType: LengthType.LLLVAR, maxLength: 999, description: 'Record Data' }],
            [123, { id: 123, name: 'POS_DATA_CODE', type: FieldType.ALPHANUMERIC_SPECIAL, lengthType: LengthType.LLLVAR, maxLength: 999, description: 'POS Data Code' }],
        ]);
    }
    parse(buffer) {
        try {
            const startTime = Date.now();
            let offset = 0;
            const mti = buffer.slice(offset, offset + 4).toString('ascii');
            offset += 4;
            if (!/^\d{4}$/.test(mti)) {
                throw new Error(`Invalid MTI: ${mti}`);
            }
            const primaryBitmap = buffer.slice(offset, offset + 8);
            offset += 8;
            const hasSecondaryBitmap = (primaryBitmap[0] & 0x80) !== 0;
            let secondaryBitmap = null;
            if (hasSecondaryBitmap) {
                secondaryBitmap = buffer.slice(offset, offset + 8);
                offset += 8;
            }
            const presentFields = this.getPresentFields(primaryBitmap, secondaryBitmap);
            const fields = new Map();
            for (const fieldId of presentFields) {
                const fieldDef = this.fieldDefinitions.get(fieldId);
                if (!fieldDef) {
                    this.logger.warn(`Unknown field ${fieldId}, skipping`);
                    continue;
                }
                const { value, bytesRead } = this.parseField(buffer.slice(offset), fieldDef);
                fields.set(fieldId, value);
                offset += bytesRead;
            }
            const parseTime = Date.now() - startTime;
            this.logger.debug(`Parsed ISO-8583 message in ${parseTime}ms`);
            return {
                mti,
                fields,
                raw: buffer,
                parseTime,
            };
        }
        catch (error) {
            this.logger.error(`Failed to parse ISO-8583 message: ${error.message}`);
            throw error;
        }
    }
    build(message) {
        try {
            const startTime = Date.now();
            const buffers = [];
            buffers.push(Buffer.from(message.mti, 'ascii'));
            const presentFields = Array.from(message.fields.keys()).sort((a, b) => a - b);
            const hasSecondaryBitmap = presentFields.some((f) => f > 64);
            const primaryBitmap = Buffer.alloc(8);
            const secondaryBitmap = hasSecondaryBitmap ? Buffer.alloc(8) : null;
            if (hasSecondaryBitmap) {
                this.setBit(primaryBitmap, 1);
            }
            for (const fieldId of presentFields) {
                if (fieldId <= 64) {
                    this.setBit(primaryBitmap, fieldId);
                }
                else {
                    this.setBit(secondaryBitmap, fieldId - 64);
                }
            }
            buffers.push(primaryBitmap);
            if (secondaryBitmap) {
                buffers.push(secondaryBitmap);
            }
            for (const fieldId of presentFields) {
                const fieldDef = this.fieldDefinitions.get(fieldId);
                if (!fieldDef) {
                    throw new Error(`Unknown field ${fieldId}`);
                }
                const value = message.fields.get(fieldId);
                const fieldBuffer = this.buildField(value, fieldDef);
                buffers.push(fieldBuffer);
            }
            const result = Buffer.concat(buffers);
            const buildTime = Date.now() - startTime;
            this.logger.debug(`Built ISO-8583 message in ${buildTime}ms, size: ${result.length} bytes`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to build ISO-8583 message: ${error.message}`);
            throw error;
        }
    }
    getPresentFields(primary, secondary) {
        const fields = [];
        for (let i = 1; i <= 64; i++) {
            if (this.isBitSet(primary, i)) {
                if (i !== 1) {
                    fields.push(i);
                }
            }
        }
        if (secondary) {
            for (let i = 1; i <= 64; i++) {
                if (this.isBitSet(secondary, i)) {
                    fields.push(i + 64);
                }
            }
        }
        return fields;
    }
    isBitSet(bitmap, bit) {
        const byteIndex = Math.floor((bit - 1) / 8);
        const bitIndex = 7 - ((bit - 1) % 8);
        return (bitmap[byteIndex] & (1 << bitIndex)) !== 0;
    }
    setBit(bitmap, bit) {
        const byteIndex = Math.floor((bit - 1) / 8);
        const bitIndex = 7 - ((bit - 1) % 8);
        bitmap[byteIndex] |= 1 << bitIndex;
    }
    parseField(buffer, def) {
        let offset = 0;
        let length = def.maxLength;
        if (def.lengthType === LengthType.LLVAR) {
            length = parseInt(buffer.slice(0, 2).toString('ascii'), 10);
            offset += 2;
        }
        else if (def.lengthType === LengthType.LLLVAR) {
            length = parseInt(buffer.slice(0, 3).toString('ascii'), 10);
            offset += 3;
        }
        else if (def.lengthType === LengthType.LLLLVAR) {
            length = parseInt(buffer.slice(0, 4).toString('ascii'), 10);
            offset += 4;
        }
        let value;
        const dataBuffer = buffer.slice(offset, offset + length);
        switch (def.type) {
            case FieldType.NUMERIC:
                value = dataBuffer.toString('ascii');
                break;
            case FieldType.ALPHA:
            case FieldType.ALPHANUMERIC:
            case FieldType.ALPHANUMERIC_SPECIAL:
            case FieldType.TRACK2:
                value = dataBuffer.toString('ascii');
                break;
            case FieldType.BINARY:
                value = dataBuffer.toString('hex').toUpperCase();
                break;
            default:
                value = dataBuffer.toString('ascii');
        }
        return { value, bytesRead: offset + length };
    }
    buildField(value, def) {
        const buffers = [];
        let dataBuffer;
        switch (def.type) {
            case FieldType.NUMERIC:
            case FieldType.ALPHA:
            case FieldType.ALPHANUMERIC:
            case FieldType.ALPHANUMERIC_SPECIAL:
            case FieldType.TRACK2:
                dataBuffer = Buffer.from(value.toString(), 'ascii');
                break;
            case FieldType.BINARY:
                dataBuffer = Buffer.from(value.toString(), 'hex');
                break;
            default:
                dataBuffer = Buffer.from(value.toString(), 'ascii');
        }
        if (def.lengthType === LengthType.LLVAR) {
            const lengthStr = dataBuffer.length.toString().padStart(2, '0');
            buffers.push(Buffer.from(lengthStr, 'ascii'));
        }
        else if (def.lengthType === LengthType.LLLVAR) {
            const lengthStr = dataBuffer.length.toString().padStart(3, '0');
            buffers.push(Buffer.from(lengthStr, 'ascii'));
        }
        else if (def.lengthType === LengthType.LLLLVAR) {
            const lengthStr = dataBuffer.length.toString().padStart(4, '0');
            buffers.push(Buffer.from(lengthStr, 'ascii'));
        }
        buffers.push(dataBuffer);
        return Buffer.concat(buffers);
    }
    validate(message) {
        const errors = [];
        if (!/^\d{4}$/.test(message.mti)) {
            errors.push(`Invalid MTI: ${message.mti}`);
        }
        const mandatoryFields = this.getMandatoryFields(message.mti);
        for (const fieldId of mandatoryFields) {
            if (!message.fields.has(fieldId)) {
                const fieldDef = this.fieldDefinitions.get(fieldId);
                errors.push(`Missing mandatory field ${fieldId}: ${(fieldDef === null || fieldDef === void 0 ? void 0 : fieldDef.name) || 'Unknown'}`);
            }
        }
        for (const [fieldId, value] of message.fields) {
            const fieldDef = this.fieldDefinitions.get(fieldId);
            if (!fieldDef) {
                errors.push(`Unknown field ${fieldId}`);
                continue;
            }
            const fieldErrors = this.validateField(value, fieldDef);
            errors.push(...fieldErrors);
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    validateField(value, def) {
        const errors = [];
        const strValue = value.toString();
        if (def.lengthType === LengthType.FIXED && strValue.length !== def.maxLength) {
            errors.push(`Field ${def.id} (${def.name}) must be exactly ${def.maxLength} characters, got ${strValue.length}`);
        }
        else if (strValue.length > def.maxLength) {
            errors.push(`Field ${def.id} (${def.name}) exceeds max length ${def.maxLength}, got ${strValue.length}`);
        }
        switch (def.type) {
            case FieldType.NUMERIC:
                if (!/^\d+$/.test(strValue)) {
                    errors.push(`Field ${def.id} (${def.name}) must be numeric, got: ${strValue}`);
                }
                break;
            case FieldType.ALPHA:
                if (!/^[A-Za-z]+$/.test(strValue)) {
                    errors.push(`Field ${def.id} (${def.name}) must be alphabetic, got: ${strValue}`);
                }
                break;
            case FieldType.ALPHANUMERIC:
                if (!/^[A-Za-z0-9]+$/.test(strValue)) {
                    errors.push(`Field ${def.id} (${def.name}) must be alphanumeric, got: ${strValue}`);
                }
                break;
        }
        return errors;
    }
    getMandatoryFields(mti) {
        if (mti.startsWith('01')) {
            return [2, 3, 4, 7, 11, 12, 13, 41, 42, 49];
        }
        if (mti.startsWith('02')) {
            return [2, 3, 4, 7, 11, 12, 13, 41, 42, 49];
        }
        if (mti.startsWith('04')) {
            return [2, 3, 4, 7, 11, 37, 90];
        }
        if (mti.startsWith('08')) {
            return [7, 11];
        }
        return [];
    }
};
exports.ISO8583Parser = ISO8583Parser;
exports.ISO8583Parser = ISO8583Parser = ISO8583Parser_1 = __decorate([
    (0, common_1.Injectable)()
], ISO8583Parser);
//# sourceMappingURL=iso8583-parser.service.js.map