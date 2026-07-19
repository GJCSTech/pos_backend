import { z } from 'zod';
import { listQuerySchema } from '../utils/pagination';
const money = z.coerce.number().min(0);
export const createProductVariantSchema = z.object({ productId: z.string().uuid(), name: z.string().trim().min(1).max(255), sku: z.string().trim().min(1).max(100), barcode: z.string().max(100).nullable().optional(), qrCode: z.string().max(255).nullable().optional(), purchasePrice: money.optional(), mrp: money.optional(), sellingPrice: money.optional(), wholesalePrice: money.optional(), imageUrl: z.string().trim().max(500).nullable().optional(), thumbnailUrl: z.string().trim().max(500).nullable().optional(), attributeValues: z.unknown().optional(), isActive: z.boolean().optional() });
export const updateProductVariantSchema = createProductVariantSchema.partial().omit({ productId: true });
export const productVariantListQuerySchema = listQuerySchema.extend({ productId: z.string().uuid().optional(), barcode: z.string().max(100).optional() });
export type CreateProductVariantInput = z.infer<typeof createProductVariantSchema>;
export type UpdateProductVariantInput = z.infer<typeof updateProductVariantSchema>;
export type ProductVariantListQuery = z.infer<typeof productVariantListQuerySchema>;
