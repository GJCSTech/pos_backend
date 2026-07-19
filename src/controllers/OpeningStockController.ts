import type { Request, Response } from 'express';
import { unauthorized } from '../errors/AppError';
import type { OpeningStockService } from '../services/OpeningStockService';
import { ok } from '../types/api';
import type {
  CreateOpeningStockInput,
  OpeningStockListQuery,
} from '../validators/openingStock.schemas';

export class OpeningStockController {
  constructor(private readonly service: OpeningStockService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const openingStock = await this.service.create(
      req.user,
      req.body as CreateOpeningStockInput,
    );
    res.status(201).json(ok({ openingStock }));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const result = await this.service.list(
      req.user,
      req.query as unknown as OpeningStockListQuery,
    );
    res.status(200).json(ok({ openingStocks: result.items }, result.meta));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const openingStock = await this.service.getById(req.user, String(req.params.id));
    res.status(200).json(ok({ openingStock }));
  };

  post = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const openingStock = await this.service.post(req.user, String(req.params.id));
    res.status(200).json(ok({ openingStock }));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const openingStock = await this.service.remove(req.user, String(req.params.id));
    res.status(200).json(ok({ openingStock }));
  };
}
