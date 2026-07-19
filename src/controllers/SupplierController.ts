import type { Request, Response } from 'express';
import { unauthorized } from '../errors/AppError';
import type { SupplierService } from '../services/SupplierService';
import { ok } from '../types/api';
import type {
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierListQuery,
} from '../validators/supplier.schemas';

export class SupplierController {
  constructor(private readonly service: SupplierService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.create(req.user, req.body as CreateSupplierInput);
    res.status(201).json(ok({ supplier: item }));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.update(req.user, String(req.params.id), req.body as UpdateSupplierInput);
    res.status(200).json(ok({ supplier: item }));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.remove(req.user, String(req.params.id));
    res.status(200).json(ok({ supplier: item }));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.getById(req.user, String(req.params.id));
    res.status(200).json(ok({ supplier: item }));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const result = await this.service.list(req.user, req.query as unknown as SupplierListQuery);
    res.status(200).json(ok({ suppliers: result.items }, result.meta));
  };
}
