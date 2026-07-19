export interface AuthUser {
  id: string;
  companyId: string;
  branchId: string;
  email: string;
  username: string;
  displayName: string;
  roles: string[];
  permissions: string[];
}

export interface AccessTokenPayload {
  sub: string;
  companyId: string;
  branchId: string;
  email: string;
  username: string;
  displayName: string;
  roles: string[];
  permissions: string[];
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  companyId: string;
  branchId: string;
  tokenId: string;
  type: 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  tokenType: 'Bearer';
}
