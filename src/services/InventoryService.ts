import { Prisma, type PrismaClient, type StockMovementType } from '@prisma/client';
import { conflict, notFound } from '../errors/AppError';
import {
  buildStockKey,
  type IInventoryRepository,
} from '../repositories/InventoryRepository';
import type { AuthUser } from '../types/auth';
import type { PaginatedResult } from '../utils/pagination';
import { assertPermission } from '../utils/permissions';
import type { AdjustStockInput, InventoryListQuery } from '../validators/inventory.schemas';

type DbClient = PrismaClient | Prisma.TransactionClient;

export class InventoryService {
  constructor(private readonly inventory: IInventoryRepository) {}

  async list(user: AuthUser, query: InventoryListQuery): Promise<PaginatedResult<unknown>> {
    assertPermission(user, 'inventory.view');
    return this.inventory.list(user.companyId, {
      ...query,
      branchId: query.branchId ?? user.branchId,
    });
  }

  async getById(user: AuthUser, id: string) {
    assertPermission(user, 'inventory.view');
    const item = await this.inventory.findById(user.companyId, id);
    if (!item) {
      throw notFound('Inventory not found');
    }
    return item;
  }

  async getInventoryValue(user: AuthUser, branchId?: string) {
    assertPermission(user, 'inventory.view');
    const value = await this.inventory.sumInventoryValue(
      user.companyId,
      branchId ?? user.branchId,
    );
    return { branchId: branchId ?? user.branchId, inventoryValue: value };
  }

  async listLowStock(user: AuthUser, branchId?: string) {
    assertPermission(user, 'inventory.view');
    return this.inventory.listLowStock(user.companyId, branchId ?? user.branchId);
  }

  async adjustStock(user: AuthUser, input: AdjustStockInput) {
    assertPermission(user, 'inventory.manage');
    const db = this.inventory.getClient();
    return db.$transaction((tx) =>
      this.applyMovement(tx, user, {
        ...input,
        movementType: 'ADJUSTMENT',
        referenceType: 'ADJUSTMENT',
      }),
    );
  }

  async applyMovement(
    db: DbClient,
    user: AuthUser,
    input: AdjustStockInput & {
      movementType: StockMovementType;
      referenceType?: string;
      referenceId?: string;
      branchId?: string;
    },
  ) {
    const branchId = input.branchId ?? user.branchId;
    const product = await db.product.findFirst({
      where: { id: input.productId, companyId: user.companyId, deletedAt: null },
    });
    if (!product) {
      throw notFound('Product not found');
    }

    const stockKey = buildStockKey(
      input.productId,
      input.variantId,
      input.batchNumber,
      input.serialNumber,
    );

    const existing = await db.inventory.findFirst({
      where: {
        companyId: user.companyId,
        branchId,
        stockKey,
        deletedAt: null,
      },
    });

    const delta = new Prisma.Decimal(input.quantity);
    const currentQty = new Prisma.Decimal(existing?.quantity ?? 0);
    const nextQty = currentQty.add(delta);

    if (delta.lt(0) && product.trackInventory && nextQty.lt(0)) {
      throw conflict('Insufficient stock for this movement');
    }

    const unitCost = new Prisma.Decimal(input.unitCost ?? existing?.averageCost ?? 0);
    let averageCost = new Prisma.Decimal(existing?.averageCost ?? 0);
    if (delta.gt(0) && nextQty.gt(0)) {
      averageCost = currentQty
        .mul(averageCost)
        .add(delta.mul(unitCost))
        .div(nextQty)
        .toDecimalPlaces(4);
    }

    await db.stockMovement.create({
      data: {
        companyId: user.companyId,
        branchId,
        productId: input.productId,
        variantId: input.variantId ?? null,
        movementType: input.movementType,
        quantity: delta,
        unitCost,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        batchNumber: input.batchNumber ?? null,
        serialNumber: input.serialNumber ?? null,
        notes: input.notes,
        createdBy: user.id,
        updatedBy: user.id,
      },
    });

    if (existing) {
      return db.inventory.update({
        where: { id: existing.id },
        data: {
          quantity: nextQty,
          averageCost,
          lastMovementAt: new Date(),
          expiryDate: input.expiryDate ?? existing.expiryDate,
          updatedBy: user.id,
          version: { increment: 1 },
        },
      });
    }

    return db.inventory.create({
      data: {
        companyId: user.companyId,
        branchId,
        productId: input.productId,
        variantId: input.variantId ?? null,
        stockKey,
        quantity: nextQty,
        averageCost: unitCost,
        batchNumber: input.batchNumber ?? null,
        serialNumber: input.serialNumber ?? null,
        expiryDate: input.expiryDate,
        lastMovementAt: new Date(),
        createdBy: user.id,
        updatedBy: user.id,
      },
    });
  }
}
