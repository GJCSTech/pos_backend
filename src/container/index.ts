import { prisma } from '../database/prisma';
import { DeviceRepository } from '../repositories/DeviceRepository';
import { HealthRepository } from '../repositories/HealthRepository';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';
import { UserRepository } from '../repositories/UserRepository';
import { AuthService } from '../services/AuthService';
import { DeviceService } from '../services/DeviceService';
import { HealthService } from '../services/HealthService';
import { AuthController } from '../controllers/AuthController';
import { DeviceController } from '../controllers/DeviceController';
import { HealthController } from '../controllers/HealthController';

export interface AppContainer {
  authService: AuthService;
  deviceService: DeviceService;
  healthService: HealthService;
  authController: AuthController;
  deviceController: DeviceController;
  healthController: HealthController;
}

export function createContainer(): AppContainer {
  const userRepository = new UserRepository(prisma);
  const refreshTokenRepository = new RefreshTokenRepository(prisma);
  const deviceRepository = new DeviceRepository(prisma);
  const healthRepository = new HealthRepository(prisma);

  const authService = new AuthService(userRepository, refreshTokenRepository);
  const deviceService = new DeviceService(deviceRepository);
  const healthService = new HealthService(healthRepository);

  return {
    authService,
    deviceService,
    healthService,
    authController: new AuthController(authService),
    deviceController: new DeviceController(deviceService),
    healthController: new HealthController(healthService),
  };
}
