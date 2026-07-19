import { z } from 'zod';
import { listQuerySchema } from '../utils/pagination';

export const unitListQuerySchema = listQuerySchema;

export const createUnitSchema = z.object({
  name: z.string().trim().min(1).max(100),
  code: z.string().trim().min(1).max(30),
  symbol: z.string().trim().min(1).max(20),
  isBase: z.boolean().default(false),
  conversionFactor: z.coerce.number().positive().default(1),
  isActive: z.boolean().default(true),
  branchId: z.string().uuid().optional(),
});

export const updateUnitSchema = createUnitSchema.partial();

export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;
export type UnitListQuery = z.infer<typeof unitListQuerySchema>;
