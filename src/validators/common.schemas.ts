import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().uuid('Path parameter id must be a valid UUID'),
});

export const branchIdQuerySchema = z.object({
  branchId: z.string().uuid().optional(),
});

export const optionalBranchIdQuerySchema = branchIdQuerySchema;

export type IdParam = z.infer<typeof idParamSchema>;
export type BranchIdQuery = z.infer<typeof branchIdQuerySchema>;
