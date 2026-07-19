import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '../config/env';

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'VJ Garden POS Backend API',
    version: '0.1.0',
    description:
      'Centralized API for authenticating staff, registering POS devices, and future SQLite ↔ PostgreSQL synchronization.',
    contact: {
      name: 'GJCSTech',
    },
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
      description: 'Local development',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['usernameOrEmail', 'password'],
        properties: {
          usernameOrEmail: { type: 'string', example: 'admin' },
          password: { type: 'string', format: 'password' },
          companyCode: { type: 'string', example: 'VJGARDEN' },
        },
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
      RegisterDeviceRequest: {
        type: 'object',
        required: ['deviceUuid', 'deviceName', 'appVersion'],
        properties: {
          deviceUuid: { type: 'string', format: 'uuid' },
          platform: {
            type: 'string',
            enum: ['ANDROID', 'IOS', 'WEB', 'UNKNOWN'],
            default: 'ANDROID',
          },
          deviceName: { type: 'string', example: 'Counter Tablet 1' },
          appVersion: { type: 'string', example: '0.22.0' },
          branchId: { type: 'string', format: 'uuid' },
          metadata: { type: 'object', additionalProperties: true },
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: {},
              requestId: { type: 'string', format: 'uuid' },
            },
          },
        },
      },
    },
  },
  tags: [
    { name: 'Health', description: 'Liveness and readiness' },
    { name: 'Auth', description: 'JWT authentication' },
    { name: 'Devices', description: 'POS device registry' },
  ],
};

export const openApiSpec = swaggerJsdoc({
  definition,
  apis: ['./src/routes/**/*.ts', './dist/routes/**/*.js'],
});
