export declare class OAuth2ClientEntity {
    id: string;
    clientId: string;
    clientSecretHash: string;
    name: string;
    partnerId: string;
    redirectUris: string[];
    scopes: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
