export declare class OAuth2AuthorizationCodeEntity {
    id: string;
    code: string;
    clientId: string;
    userId: string;
    redirectUri: string;
    scope: string;
    expiresAt: Date;
    used: boolean;
    createdAt: Date;
}
