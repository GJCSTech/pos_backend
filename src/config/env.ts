import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  API_PREFIX: z.string().default('/api/v1'),
  DATABASE_URL: z
    .string()
    .min(1)
    .default('postgresql://vjgarden:vjgarden_secret@localhost:5432/vj_garden_pos?schema=public'),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32)
    .default('test-access-secret-change-me-32chars!!'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32)
    .default('test-refresh-secret-change-me-32chars!'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(200),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  LOG_DIR: z.string().default('logs'),
  SEED_ADMIN_EMAIL: z.string().email().default('admin@vjgarden.local'),
  SEED_ADMIN_PASSWORD: z.string().min(8).default('ChangeMeAdmin!2026'),
  SEED_COMPANY_NAME: z.string().default('VJ Garden Boutique'),
  SEED_BRANCH_NAME: z.string().default('Main Store'),
  SEED_BRANCH_CODE: z.string().default('MAIN'),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  if (result.data.NODE_ENV === 'production') {
    if (
      result.data.JWT_ACCESS_SECRET.includes('change-me') ||
      result.data.JWT_REFRESH_SECRET.includes('change-me') ||
      result.data.JWT_ACCESS_SECRET.includes('test-access') ||
      result.data.JWT_REFRESH_SECRET.includes('test-refresh')
    ) {
      throw new Error('Production JWT secrets must be explicitly configured');
    }
  }

  return result.data;
}

export const env = parseEnv();

export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
