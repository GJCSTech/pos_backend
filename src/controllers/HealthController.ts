import type { Request, Response } from 'express';
import type { HealthService } from '../services/HealthService';
import { ok } from '../types/api';

export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  check = async (_req: Request, res: Response): Promise<void> => {
    const status = await this.healthService.getStatus();
    const httpStatus = status.status === 'ok' ? 200 : 503;
    res.status(httpStatus).json(ok(status));
  };
}
