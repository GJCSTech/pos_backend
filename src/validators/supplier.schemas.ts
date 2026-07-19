import { z } from 'zod';
import { listQuerySchema } from '../utils/pagination';

export const supplierListQuerySchema = listQuerySchema;

export const createSupplierSchema = z.object({
  name: z.string().trim().min(1).max(200),
  code: z.string().trim().min(1).max(50),
  contactPerson: z.string().trim().max(150).optional().nullable(),
  email: z.string().trim().email().max(255).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  gstin: z.string().trim().max(20).optional().nullable(),
  pan: z.string().trim().max(20).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  state: z.string().trim().max(100).optional().nullable(),
  pincode: z.string().trim().max(20).optional().nullable(),
  paymentTerms: z.string().trim().max(200).optional().nullable(),
  outstandingBalance: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
  notes: z.string().trim().max(1000).optional().nullable(),
  branchId: z.string().uuid().optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type SupplierListQuery = z.infer<typeof supplierListQuerySchema>;
