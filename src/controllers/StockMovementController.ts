import type { Request, Response } from 'express';
import { unauthorized } from '../errors/AppError';
import type { StockMovementService } from '../services/StockMovementService';
import { ok } from '../types/api';
import type {
  CreateStockMovementInput,
  StockMovementListQuery,
} from '../validators/stockMovement.schemas';

export class StockMovementController {
  constructor(private readonly service: StockMovementService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const result = await this.service.list(
      req.user,
      req.query as unknown as StockMovementListQuery,
    );
    res.status(200).json(ok({ stockMovements: result.items }, result.meta));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const stockMovement = await this.service.getById(req.user, String(req.params.id));
    res.status(200).json(ok({ stockMovement }));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const inventory = await this.service.create(
      req.user,
      req.body as CreateStockMovementInput,
    );
    res.status(201).json(ok({ inventory }));
  };
}
