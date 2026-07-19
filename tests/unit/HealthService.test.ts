import { HealthService } from '../../src/services/HealthService';
import type { IHealthRepository } from '../../src/repositories/interfaces';

describe('HealthService', () => {
  it('reports ok when database is up', async () => {
    const health: IHealthRepository = {
      checkDatabase: jest.fn().mockResolvedValue(true),
    };
    const service = new HealthService(health);
    const status = await service.getStatus();
    expect(status.status).toBe('ok');
    expect(status.checks.database).toBe('up');
  });

  it('reports degraded when database is down', async () => {
    const health: IHealthRepository = {
      checkDatabase: jest.fn().mockRejectedValue(new Error('down')),
    };
    const service = new HealthService(health);
    const status = await service.getStatus();
    expect(status.status).toBe('degraded');
    expect(status.checks.database).toBe('down');
  });
});
