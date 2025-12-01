export declare class OAuth2TokenEntity {
    id: string;
    accessToken: string;
    refreshToken: string;
    clientId: string;
    userId: string;
    scope: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
    revoked: boolean;
    createdAt: Date;
}
