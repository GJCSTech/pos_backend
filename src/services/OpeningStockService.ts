import { conflict, notFound } from '../errors/AppError';
import type { IOpeningStockRepository } from '../repositories/OpeningStockRepository';
import type { InventoryService } from './InventoryService';
import type { AuthUser } from '../types/auth';
import { assertPermission } from '../utils/permissions';
import type {
  CreateOpeningStockInput,
  OpeningStockListQuery,
} from '../validators/openingStock.schemas';

export class OpeningStockService {
  constructor(
    private readonly openingStocks: IOpeningStockRepository,
    private readonly inventoryService: InventoryService,
  ) {}

  async create(user: AuthUser, input: CreateOpeningStockInput) {
    assertPermission(user, 'inventory.manage');
    return this.openingStocks.create({
      company: { connect: { id: user.companyId } },
      branch: { connect: { id: user.branchId } },
      product: { connect: { id: input.productId } },
      ...(input.variantId ? { variant: { connect: { id: input.variantId } } } : {}),
      quantity: input.quantity,
      unitCost: input.unitCost,
      batchNumber: input.batchNumber ?? null,
      serialNumber: input.serialNumber ?? null,
      expiryDate: input.expiryDate,
      notes: input.notes,
      stockedAt: input.stockedAt ?? new Date(),
      isPosted: false,
      createdBy: user.id,
      updatedBy: user.id,
    });
  }

  async list(user: AuthUser, query: OpeningStockListQuery) {
    assertPermission(user, 'inventory.view');
    return this.openingStocks.list(user.companyId, {
      ...query,
      branchId: query.branchId ?? user.branchId,
    });
  }

  async getById(user: AuthUser, id: string) {
    assertPermission(user, 'inventory.view');
    const item = await this.openingStocks.findById(user.companyId, id);
    if (!item) {
      throw notFound('Opening stock not found');
    }
    return item;
  }

  async post(user: AuthUser, id: string) {
    assertPermission(user, 'inventory.manage');
    const existing = await this.openingStocks.findById(user.companyId, id);
    if (!existing) {
      throw notFound('Opening stock not found');
    }
    if (existing.isPosted) {
      throw conflict('Opening stock already posted');
    }

    const db = this.openingStocks.getClient();
    return db.$transaction(async (tx) => {
      await this.inventoryService.applyMovement(tx, user, {
        productId: existing.productId,
        variantId: existing.variantId,
        quantity: Number(existing.quantity),
        unitCost: Number(existing.unitCost),
        batchNumber: existing.batchNumber,
        serialNumber: existing.serialNumber,
        expiryDate: existing.expiryDate ?? undefined,
        notes: existing.notes ?? undefined,
        movementType: 'OPENING',
        referenceType: 'OPENING_STOCK',
        referenceId: existing.id,
        branchId: existing.branchId,
      });

      return tx.openingStock.update({
        where: { id: existing.id },
        data: { isPosted: true, updatedBy: user.id, version: { increment: 1 } },
      });
    });
  }

  async remove(user: AuthUser, id: string) {
    assertPermission(user, 'inventory.manage');
    const existing = await this.openingStocks.findById(user.companyId, id);
    if (!existing) {
      throw notFound('Opening stock not found');
    }
    if (existing.isPosted) {
      throw conflict('Posted opening stock cannot be deleted');
    }
    return this.openingStocks.softDelete(id, user.id);
  }
}
