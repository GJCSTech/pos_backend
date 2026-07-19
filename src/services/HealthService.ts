import { env } from '../config/env';
import type { IHealthRepository } from '../repositories/interfaces';

export interface HealthStatus {
  status: 'ok' | 'degraded';
  service: string;
  version: string;
  environment: string;
  uptimeSeconds: number;
  timestamp: string;
  checks: {
    database: 'up' | 'down';
  };
}

export class HealthService {
  private readonly startedAt = Date.now();

  constructor(private readonly health: IHealthRepository) {}

  async getStatus(): Promise<HealthStatus> {
    let database: 'up' | 'down' = 'down';
    try {
      const ok = await this.health.checkDatabase();
      database = ok ? 'up' : 'down';
    } catch {
      database = 'down';
    }

    return {
      status: database === 'up' ? 'ok' : 'degraded',
      service: 'vj-garden-pos-backend',
      version: '0.1.0',
      environment: env.NODE_ENV,
      uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
      timestamp: new Date().toISOString(),
      checks: { database },
    };
  }
}
