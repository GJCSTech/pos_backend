import type { Request, Response } from 'express';
import type { AuthService } from '../services/AuthService';
import { ok } from '../types/api';
import type { LoginInput, RefreshTokenInput } from '../validators/auth.schemas';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as LoginInput;
    const result = await this.authService.login(body, {
      userAgent: req.get('user-agent') ?? undefined,
      ipAddress: req.ip,
    });
    res.status(200).json(ok(result, 'Login successful'));
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as RefreshTokenInput;
    const tokens = await this.authService.refresh(body.refreshToken, {
      userAgent: req.get('user-agent') ?? undefined,
      ipAddress: req.ip,
    });
    res.status(200).json(ok({ tokens }, 'Tokens refreshed'));
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as RefreshTokenInput;
    await this.authService.logout(body.refreshToken);
    res.status(200).json(ok({ loggedOut: true }, 'Logged out'));
  };

  me = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json(ok({ user: req.user }, 'Current user'));
  };
}
