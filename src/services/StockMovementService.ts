import { notFound } from '../errors/AppError';
import type { IStockMovementRepository } from '../repositories/StockMovementRepository';
import type { InventoryService } from './InventoryService';
import type { AuthUser } from '../types/auth';
import { assertPermission } from '../utils/permissions';
import type {
  CreateStockMovementInput,
  StockMovementListQuery,
} from '../validators/stockMovement.schemas';

export class StockMovementService {
  constructor(
    private readonly movements: IStockMovementRepository,
    private readonly inventoryService: InventoryService,
  ) {}

  async list(user: AuthUser, query: StockMovementListQuery) {
    assertPermission(user, 'inventory.view');
    return this.movements.list(user.companyId, {
      ...query,
      branchId: query.branchId ?? user.branchId,
    });
  }

  async getById(user: AuthUser, id: string) {
    assertPermission(user, 'inventory.view');
    const item = await this.movements.findById(user.companyId, id);
    if (!item) {
      throw notFound('Stock movement not found');
    }
    return item;
  }

  async create(user: AuthUser, input: CreateStockMovementInput) {
    assertPermission(user, 'inventory.manage');
    return this.inventoryService.adjustStock(user, {
      productId: input.productId,
      variantId: input.variantId,
      quantity: input.quantity,
      unitCost: input.unitCost,
      batchNumber: input.batchNumber,
      serialNumber: input.serialNumber,
      notes: input.notes,
    });
  }
}
