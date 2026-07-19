import { z } from 'zod';
import { listQuerySchema } from '../utils/pagination';

export const customerListQuerySchema = listQuerySchema;

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1).max(200),
  code: z.string().trim().min(1).max(50),
  customerType: z.enum(['WALK_IN', 'RETAIL', 'WHOLESALE']).default('RETAIL'),
  customerGroupId: z.string().uuid().optional().nullable(),
  email: z.string().trim().email().max(255).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  gstin: z.string().trim().max(20).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  state: z.string().trim().max(100).optional().nullable(),
  pincode: z.string().trim().max(20).optional().nullable(),
  creditLimit: z.coerce.number().min(0).default(0),
  outstandingBalance: z.coerce.number().default(0),
  loyaltyPoints: z.coerce.number().min(0).default(0),
  loyaltyReady: z.boolean().default(true),
  isWalkIn: z.boolean().default(false),
  isActive: z.boolean().default(true),
  notes: z.string().trim().max(1000).optional().nullable(),
  branchId: z.string().uuid().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerListQuery = z.infer<typeof customerListQuerySchema>;
