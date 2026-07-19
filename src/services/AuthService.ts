import { randomUUID } from 'crypto';
import { AppError, authInvalid, unauthorized } from '../errors/AppError';
import type {
  IRefreshTokenRepository,
  IUserRepository,
  UserWithAuth,
} from '../repositories/interfaces';
import type { AuthUser, TokenPair } from '../types/auth';
import { sha256 } from '../utils/crypto';
import {
  parseDurationToMs,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { verifyPassword } from '../utils/password';
import { env } from '../config/env';
import { toAuthUser } from './authMapper';
import type { LoginInput } from '../validators/auth.schemas';

const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MINUTES = 15;

export interface LoginResult {
  user: AuthUser;
  tokens: TokenPair;
}

export class AuthService {
  constructor(
    private readonly users: IUserRepository,
    private readonly refreshTokens: IRefreshTokenRepository,
  ) {}

  async login(
    input: LoginInput,
    context: { userAgent?: string; ipAddress?: string },
  ): Promise<LoginResult> {
    const user = await this.users.findForAuth(input.usernameOrEmail, input.companyCode);
    if (!user) {
      throw authInvalid();
    }

    this.assertUserCanAuthenticate(user);

    const passwordOk = await verifyPassword(input.password, user.passwordHash);
    if (!passwordOk) {
      await this.handleFailedLogin(user);
      throw authInvalid();
    }

    await this.users.recordSuccessfulLogin(user.id);
    const authUser = toAuthUser(user);
    const tokens = await this.issueTokenPair(authUser, context);
    return { user: authUser, tokens };
  }

  async refresh(
    refreshToken: string,
    context: { userAgent?: string; ipAddress?: string },
  ): Promise<TokenPair> {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = sha256(refreshToken);
    const stored = await this.refreshTokens.findValidByHash(tokenHash);

    if (!stored || stored.id !== payload.tokenId || stored.userId !== payload.sub) {
      throw unauthorized('Refresh token is invalid or revoked');
    }

    const user = await this.users.findByIdWithAuth(payload.sub);
    if (!user) {
      throw unauthorized('User no longer exists');
    }

    this.assertUserCanAuthenticate(user);

    const authUser = toAuthUser(user);
    const next = await this.issueTokenPair(authUser, context);
    await this.refreshTokens.revoke(stored.id);
    return next;
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const stored = await this.refreshTokens.findValidByHash(sha256(refreshToken));
      if (stored && stored.id === payload.tokenId) {
        await this.refreshTokens.revoke(stored.id);
      }
    } catch {
      // Idempotent logout — ignore invalid tokens
    }
  }

  private assertUserCanAuthenticate(user: UserWithAuth): void {
    if (!user.company.isActive) {
      throw new AppError('AUTH_FORBIDDEN', 'Company is inactive', 403);
    }
    if (!user.branch.isActive) {
      throw new AppError('AUTH_FORBIDDEN', 'Branch is inactive', 403);
    }
    if (user.status === 'INACTIVE') {
      throw new AppError('AUTH_FORBIDDEN', 'User account is inactive', 403);
    }
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AppError('AUTH_ACCOUNT_LOCKED', 'Account temporarily locked', 423);
    }
  }

  private async handleFailedLogin(user: UserWithAuth): Promise<void> {
    const nextFailures = user.failedLogins + 1;
    const lockedUntil =
      nextFailures >= MAX_FAILED_LOGINS
        ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000)
        : null;
    await this.users.recordFailedLogin(user.id, lockedUntil);
  }

  private async issueTokenPair(
    user: AuthUser,
    context: { userAgent?: string; ipAddress?: string },
  ): Promise<TokenPair> {
    const tokenId = randomUUID();
    const refreshToken = signRefreshToken({
      sub: user.id,
      companyId: user.companyId,
      branchId: user.branchId,
      tokenId,
    });

    await this.refreshTokens.create({
      id: tokenId,
      companyId: user.companyId,
      branchId: user.branchId,
      userId: user.id,
      tokenHash: sha256(refreshToken),
      expiresAt: new Date(Date.now() + parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN)),
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      createdBy: user.id,
    });

    const accessToken = signAccessToken({
      sub: user.id,
      companyId: user.companyId,
      branchId: user.branchId,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      roles: user.roles,
      permissions: user.permissions,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      tokenType: 'Bearer',
    };
  }
}
