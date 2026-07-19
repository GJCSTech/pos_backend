import { Prisma, type Inventory, type PrismaClient } from '@prisma/client';
import {
  buildPageMeta,
  resolveOrderBy,
  toSkipTake,
  type PaginatedResult,
} from '../utils/pagination';
import type { InventoryListQuery } from '../validators/inventory.schemas';

export function buildStockKey(
  productId: string,
  variantId?: string | null,
  batchNumber?: string | null,
  serialNumber?: string | null,
): string {
  return [productId, variantId ?? '', batchNumber ?? '', serialNumber ?? ''].join('|');
}

export interface IInventoryRepository {
  findById(companyId: string, id: string): Promise<(Inventory & { product: { name: string; sku: string; reorderLevel: Prisma.Decimal; minimumStock: Prisma.Decimal; trackInventory: boolean } | null; variant: { name: string; sku: string } | null }) | null>;
  list(companyId: string, query: InventoryListQuery): Promise<PaginatedResult<Inventory>>;
  listLowStock(companyId: string, branchId: string): Promise<Inventory[]>;
  sumInventoryValue(companyId: string, branchId: string): Promise<Prisma.Decimal>;
  getClient(): PrismaClient;
}

export class InventoryRepository implements IInventoryRepository {
  constructor(private readonly db: PrismaClient) {}

  getClient(): PrismaClient {
    return this.db;
  }

  async findById(companyId: string, id: string) {
    return this.db.inventory.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        product: {
          select: {
            name: true,
            sku: true,
            reorderLevel: true,
            minimumStock: true,
            trackInventory: true,
          },
        },
        variant: { select: { name: true, sku: true } },
      },
    });
  }

  async list(companyId: string, query: InventoryListQuery): Promise<PaginatedResult<Inventory>> {
    const { skip, take } = toSkipTake(query);
    const where: Prisma.InventoryWhereInput = {
      companyId,
      deletedAt: null,
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.productId ? { productId: query.productId } : {}),
      ...(query.variantId ? { variantId: query.variantId } : {}),
      ...(query.search
        ? {
            OR: [
              { batchNumber: { contains: query.search, mode: 'insensitive' } },
              { serialNumber: { contains: query.search, mode: 'insensitive' } },
              { product: { name: { contains: query.search, mode: 'insensitive' } } },
              { product: { sku: { contains: query.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [total, items] = await this.db.$transaction([
      this.db.inventory.count({ where }),
      this.db.inventory.findMany({
        where,
        skip,
        take,
        include: { product: true, variant: true },
        orderBy: resolveOrderBy(query.sortBy, query.sortOrder, [
          'createdAt',
          'quantity',
          'updatedAt',
        ]),
      }),
    ]);

    return { items, meta: buildPageMeta(total, query.page, query.pageSize) };
  }

  async listLowStock(companyId: string, branchId: string): Promise<Inventory[]> {
    const rows = await this.db.inventory.findMany({
      where: {
        companyId,
        branchId,
        deletedAt: null,
        product: { deletedAt: null, trackInventory: true },
      },
      include: { product: true, variant: true },
      orderBy: { quantity: 'asc' },
    });

    return rows.filter((row) => {
      const threshold =
        row.product.reorderLevel.gt(0) ? row.product.reorderLevel : row.product.minimumStock;
      return row.quantity.lte(threshold);
    });
  }

  async sumInventoryValue(companyId: string, branchId: string): Promise<Prisma.Decimal> {
    const rows = await this.db.inventory.findMany({
      where: { companyId, branchId, deletedAt: null },
      select: { quantity: true, averageCost: true },
    });
    return rows.reduce(
      (sum, row) => sum.add(row.quantity.mul(row.averageCost)),
      new Prisma.Decimal(0),
    );
  }
}
