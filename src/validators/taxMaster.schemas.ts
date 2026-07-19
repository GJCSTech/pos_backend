import { z } from 'zod';
import { listQuerySchema } from '../utils/pagination';

export const taxMasterListQuerySchema = listQuerySchema;

export const createTaxMasterSchema = z.object({
  name: z.string().trim().min(1).max(150),
  code: z.string().trim().min(1).max(50),
  hsnSac: z.string().trim().max(20).optional().nullable(),
  rate: z.coerce.number().min(0).max(100),
  cgstRate: z.coerce.number().min(0).max(100).default(0),
  sgstRate: z.coerce.number().min(0).max(100).default(0),
  igstRate: z.coerce.number().min(0).max(100).default(0),
  isActive: z.boolean().default(true),
  branchId: z.string().uuid().optional(),
});

export const updateTaxMasterSchema = createTaxMasterSchema.partial();

export type CreateTaxMasterInput = z.infer<typeof createTaxMasterSchema>;
export type UpdateTaxMasterInput = z.infer<typeof updateTaxMasterSchema>;
export type TaxMasterListQuery = z.infer<typeof taxMasterListQuerySchema>;
