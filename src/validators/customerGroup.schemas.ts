import { z } from 'zod';
import { listQuerySchema } from '../utils/pagination';

export const customerGroupListQuerySchema = listQuerySchema;

export const createCustomerGroupSchema = z.object({
  name: z.string().trim().min(1).max(150),
  code: z.string().trim().min(1).max(50),
  description: z.string().trim().max(500).optional().nullable(),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  priceListType: z.string().trim().min(1).max(30).default('RETAIL'),
  isActive: z.boolean().default(true),
  branchId: z.string().uuid().optional(),
});

export const updateCustomerGroupSchema = createCustomerGroupSchema.partial();

export type CreateCustomerGroupInput = z.infer<typeof createCustomerGroupSchema>;
export type UpdateCustomerGroupInput = z.infer<typeof updateCustomerGroupSchema>;
export type CustomerGroupListQuery = z.infer<typeof customerGroupListQuerySchema>;
