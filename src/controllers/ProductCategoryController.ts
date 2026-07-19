import type { Request, Response } from 'express';
import { unauthorized } from '../errors/AppError';
import type { ProductCategoryService } from '../services/ProductCategoryService';
import { ok } from '../types/api';
import type {
  CreateProductCategoryInput,
  UpdateProductCategoryInput,
  ProductCategoryListQuery,
} from '../validators/productCategory.schemas';

export class ProductCategoryController {
  constructor(private readonly service: ProductCategoryService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.create(req.user, req.body as CreateProductCategoryInput);
    res.status(201).json(ok({ productCategory: item }));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.update(req.user, String(req.params.id), req.body as UpdateProductCategoryInput);
    res.status(200).json(ok({ productCategory: item }));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.remove(req.user, String(req.params.id));
    res.status(200).json(ok({ productCategory: item }));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.getById(req.user, String(req.params.id));
    res.status(200).json(ok({ productCategory: item }));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const result = await this.service.list(req.user, req.query as unknown as ProductCategoryListQuery);
    res.status(200).json(ok({ productCategories: result.items }, result.meta));
  };
}
