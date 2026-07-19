import { z } from 'zod';

export const loginSchema = z.object({
  usernameOrEmail: z.string().trim().min(1).max(255),
  password: z.string().min(1).max(200),
  companyCode: z.string().trim().min(1).max(50).optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(20).max(2000),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
