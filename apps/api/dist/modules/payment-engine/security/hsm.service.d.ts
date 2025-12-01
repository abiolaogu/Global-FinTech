export declare class HSMService {
    private readonly logger;
    private keys;
    private hsmConnected;
    constructor();
    private initialize;
    encryptPINBlock(pin: string, pan: string, pinKey: string): {
        pinBlock: string;
        ksn?: string;
    };
    decryptPINBlock(encryptedPINBlock: string, pinKey: string): string;
    verifyPIN(encryptedPINBlock: string, pan: string, storedPIN: string, pinKey: string): boolean;
    translatePIN(encryptedPINBlock: string, fromKey: string, toKey: string): string;
    generateCVV(pan: string, expiryDate: string, serviceCode: string): string;
    verifyCVV(pan: string, expiryDate: string, serviceCode: string, cvv: string): boolean;
    generateARPC(arqc: string, transactionData: string, issuerMasterKey: string): string;
    verifyARQC(arqc: string, transactionData: string, issuerMasterKey: string): boolean;
    generateMAC(data: string, macKey: string): string;
    verifyMAC(data: string, mac: string, macKey: string): boolean;
    generateZPK(): {
        key: string;
        checkValue: string;
    };
    deriveKeyDUKPT(bdk: string, ksn: string): string;
    private generateMasterKeys;
    private getKey;
    private createPINBlock;
    private extractPINFromBlock;
    private tripleDesEncrypt;
    private tripleDesDecrypt;
    private xorHex;
    private deriveSessionKey;
    private deriveIPEK;
    private deriveSessionKeyDUKPT;
    rotateKeys(): Promise<void>;
    getStatus(): {
        connected: boolean;
        keysLoaded: number;
        activeKeys: number;
    };
}
