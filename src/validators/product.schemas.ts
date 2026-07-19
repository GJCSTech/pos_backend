import { z } from 'zod';
import { listQuerySchema } from '../utils/pagination';

const money = z.coerce.number().min(0);
const nullableUuid = z.string().uuid().nullable().optional();
export const productUnitInputSchema = z.object({ unitId: z.string().uuid(), conversionFactor: z.coerce.number().positive().default(1), sellingPrice: money.optional(), barcode: z.string().max(100).nullable().optional(), isDefault: z.boolean().optional(), isActive: z.boolean().optional() });
export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(255), code: z.string().trim().min(1).max(50), sku: z.string().trim().min(1).max(100),
  barcode: z.string().max(100).nullable().optional(), qrCode: z.string().max(255).nullable().optional(), description: z.string().max(2000).nullable().optional(),
  categoryId: nullableUuid, taxMasterId: nullableUuid, supplierId: nullableUuid, baseUnitId: nullableUuid, brand: z.string().max(150).nullable().optional(), manufacturer: z.string().max(150).nullable().optional(),
  purchasePrice: money.optional(), mrp: money.optional(), sellingPrice: money.optional(), wholesalePrice: money.optional(), imageUrl: z.string().trim().max(500).nullable().optional(), thumbnailUrl: z.string().trim().max(500).nullable().optional(),
  minimumStock: money.optional(), maximumStock: money.optional(), reorderLevel: money.optional(), expiryEnabled: z.boolean().optional(), batchEnabled: z.boolean().optional(), serialNumberEnabled: z.boolean().optional(), trackInventory: z.boolean().optional(), isActive: z.boolean().optional(),
  searchKeywords: z.string().max(1000).nullable().optional(), attributes: z.unknown().optional(), productUnits: z.array(productUnitInputSchema).optional(),
});
export const updateProductSchema = createProductSchema.partial().omit({ productUnits: true }).extend({ productUnits: z.array(productUnitInputSchema).optional() });
export const productListQuerySchema = listQuerySchema.extend({ categoryId: z.string().uuid().optional(), supplierId: z.string().uuid().optional(), barcode: z.string().max(100).optional() });
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
