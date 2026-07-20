import type { Request, Response } from 'express';
import { unauthorized } from '../errors/AppError';
import type { InventoryService } from '../services/InventoryService';
import { ok } from '../types/api';
import type { AdjustStockInput, InventoryListQuery } from '../validators/inventory.schemas';

export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const result = await this.service.list(req.user, req.query as unknown as InventoryListQuery);
    res.status(200).json(ok({ inventories: result.items }, result.meta));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const inventory = await this.service.getById(req.user, String(req.params.id));
    res.status(200).json(ok({ inventory }));
  };

  adjust = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const inventory = await this.service.adjustStock(req.user, req.body as AdjustStockInput);
    res.status(200).json(ok({ inventory }));
  };

  value = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const branchId =
      typeof req.query.branchId === 'string' ? req.query.branchId : undefined;
    const result = await this.service.getInventoryValue(req.user, branchId);
    res.status(200).json(ok({ valuation: result }, 'Inventory valuation calculated'));
  };

  lowStock = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const result = await this.service.listLowStock(
      req.user,
      req.query as unknown as InventoryListQuery,
    );
    res.status(200).json(ok({ inventories: result.items }, result.meta));
  };
}
