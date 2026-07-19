import { z } from 'zod';
import { listQuerySchema } from '../utils/pagination';

export const businessSettingListQuerySchema = listQuerySchema;

export const createBusinessSettingSchema = z.object({
  key: z.string().trim().min(1).max(100),
  value: z.unknown(),
  description: z.string().trim().max(500).optional().nullable(),
  isActive: z.boolean().default(true),
  branchId: z.string().uuid().optional(),
});

export const updateBusinessSettingSchema = createBusinessSettingSchema.partial();

export type CreateBusinessSettingInput = z.infer<typeof createBusinessSettingSchema>;
export type UpdateBusinessSettingInput = z.infer<typeof updateBusinessSettingSchema>;
export type BusinessSettingListQuery = z.infer<typeof businessSettingListQuerySchema>;
