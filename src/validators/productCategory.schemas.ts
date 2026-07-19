import { z } from 'zod';
import { listQuerySchema } from '../utils/pagination';

export const productCategoryListQuerySchema = listQuerySchema;

export const createProductCategorySchema = z.object({
  name: z.string().trim().min(1).max(200),
  code: z.string().trim().min(1).max(50),
  description: z.string().trim().max(500).optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  sortOrder: z.number().int().default(0),
  imageUrl: z.string().trim().max(500).optional().nullable(),
  isActive: z.boolean().default(true),
  branchId: z.string().uuid().optional(),
});

export const updateProductCategorySchema = createProductCategorySchema.partial();

export type CreateProductCategoryInput = z.infer<typeof createProductCategorySchema>;
export type UpdateProductCategoryInput = z.infer<typeof updateProductCategorySchema>;
export type ProductCategoryListQuery = z.infer<typeof productCategoryListQuerySchema>;
