export declare enum FieldType {
    NUMERIC = "n",
    ALPHA = "a",
    ALPHANUMERIC = "an",
    ALPHANUMERIC_SPECIAL = "ans",
    BINARY = "b",
    TRACK2 = "z"
}
export declare enum LengthType {
    FIXED = "FIXED",
    LLVAR = "LLVAR",
    LLLVAR = "LLLVAR",
    LLLLVAR = "LLLLVAR"
}
export interface FieldDefinition {
    id: number;
    name: string;
    type: FieldType;
    lengthType: LengthType;
    maxLength: number;
    description: string;
    mandatory?: boolean;
}
export declare class ISO8583Parser {
    private readonly logger;
    private readonly fieldDefinitions;
    parse(buffer: Buffer): ISO8583Message;
    build(message: ISO8583Message): Buffer;
    private getPresentFields;
    private isBitSet;
    private setBit;
    private parseField;
    private buildField;
    validate(message: ISO8583Message): {
        valid: boolean;
        errors: string[];
    };
    private validateField;
    private getMandatoryFields;
}
export interface ISO8583Message {
    mti: string;
    fields: Map<number, any>;
    raw?: Buffer;
    parseTime?: number;
}
