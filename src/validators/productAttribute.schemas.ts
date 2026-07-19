import { z } from 'zod';
import { listQuerySchema } from '../utils/pagination';

export const productAttributeListQuerySchema = listQuerySchema;

export const createProductAttributeSchema = z.object({
  name: z.string().trim().min(1).max(150),
  code: z.string().trim().min(1).max(50),
  dataType: z.enum(['TEXT', 'NUMBER', 'BOOLEAN', 'SELECT']).default('TEXT'),
  options: z.unknown().optional().nullable(),
  isActive: z.boolean().default(true),
  branchId: z.string().uuid().optional(),
});

export const updateProductAttributeSchema = createProductAttributeSchema.partial();

export type CreateProductAttributeInput = z.infer<typeof createProductAttributeSchema>;
export type UpdateProductAttributeInput = z.infer<typeof updateProductAttributeSchema>;
export type ProductAttributeListQuery = z.infer<typeof productAttributeListQuerySchema>;
