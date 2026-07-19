import { Router } from 'express';
import type { AppContainer } from '../container';
import { authenticate } from '../middleware/authenticate';
import { requirePermissions } from '../middleware/authorize';
import { authRateLimiter } from '../middleware/security';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { loginSchema, refreshTokenSchema } from '../validators/auth.schemas';
import { registerDeviceSchema } from '../validators/device.schemas';
import { registerBusinessRoutes } from './business';

export function createRoutes(container: AppContainer): Router {
  const router = Router();
  const { authController, deviceController, healthController } = container;

  /**
   * @openapi
   * /health:
   *   get:
   *     tags: [Health]
   *     summary: Service health check
   *     responses:
   *       200:
   *         description: Service healthy
   *       503:
   *         description: Service degraded
   */
  router.get('/health', asyncHandler(healthController.check));

  /**
   * @openapi
   * /auth/login:
   *   post:
   *     tags: [Auth]
   *     summary: Authenticate user and issue JWT pair
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       200:
   *         description: Login successful
   *       401:
   *         description: Invalid credentials
   */
  router.post(
    '/auth/login',
    authRateLimiter,
    validate(loginSchema),
    asyncHandler(authController.login),
  );

  /**
   * @openapi
   * /auth/refresh:
   *   post:
   *     tags: [Auth]
   *     summary: Rotate refresh token and issue new access token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RefreshTokenRequest'
   *     responses:
   *       200:
   *         description: Tokens rotated
   *       401:
   *         description: Invalid refresh token
   */
  router.post(
    '/auth/refresh',
    authRateLimiter,
    validate(refreshTokenSchema),
    asyncHandler(authController.refresh),
  );

  /**
   * @openapi
   * /auth/logout:
   *   post:
   *     tags: [Auth]
   *     summary: Revoke refresh token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RefreshTokenRequest'
   *     responses:
   *       200:
   *         description: Logged out
   */
  router.post(
    '/auth/logout',
    validate(refreshTokenSchema),
    asyncHandler(authController.logout),
  );

  /**
   * @openapi
   * /auth/me:
   *   get:
   *     tags: [Auth]
   *     summary: Current authenticated user
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Current user
   *       401:
   *         description: Unauthorized
   */
  router.get('/auth/me', authenticate, asyncHandler(authController.me));

  /**
   * @openapi
   * /devices/register:
   *   post:
   *     tags: [Devices]
   *     summary: Register or update a POS device
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterDeviceRequest'
   *     responses:
   *       201:
   *         description: Device registered
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  router.post(
    '/devices/register',
    authenticate,
    requirePermissions('device.register'),
    validate(registerDeviceSchema),
    asyncHandler(deviceController.register),
  );

  /**
   * @openapi
   * /devices:
   *   get:
   *     tags: [Devices]
   *     summary: List company devices
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: branchId
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Device list
   */
  router.get(
    '/devices',
    authenticate,
    requirePermissions('device.view'),
    asyncHandler(deviceController.list),
  );

  /**
   * @openapi
   * /devices/{id}:
   *   get:
   *     tags: [Devices]
   *     summary: Get device by id
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Device found
   *       404:
   *         description: Device not found
   */
  router.get(
    '/devices/:id',
    authenticate,
    requirePermissions('device.view'),
    asyncHandler(deviceController.getById),
  );

  registerBusinessRoutes(router, container);

  return router;
}
