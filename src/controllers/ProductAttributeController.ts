import type { Request, Response } from 'express';
import { unauthorized } from '../errors/AppError';
import type { ProductAttributeService } from '../services/ProductAttributeService';
import { ok } from '../types/api';
import type {
  CreateProductAttributeInput,
  UpdateProductAttributeInput,
  ProductAttributeListQuery,
} from '../validators/productAttribute.schemas';

export class ProductAttributeController {
  constructor(private readonly service: ProductAttributeService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.create(req.user, req.body as CreateProductAttributeInput);
    res.status(201).json(ok({ productAttribute: item }));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.update(req.user, String(req.params.id), req.body as UpdateProductAttributeInput);
    res.status(200).json(ok({ productAttribute: item }));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.remove(req.user, String(req.params.id));
    res.status(200).json(ok({ productAttribute: item }));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.getById(req.user, String(req.params.id));
    res.status(200).json(ok({ productAttribute: item }));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const result = await this.service.list(req.user, req.query as unknown as ProductAttributeListQuery);
    res.status(200).json(ok({ productAttributes: result.items }, result.meta));
  };
}
