import type { Request, Response } from 'express';
import { unauthorized } from '../errors/AppError';
import { ok } from '../types/api';
import type { ProductService } from '../services/ProductService';
export class ProductController { constructor(private readonly service: ProductService) {} private user(req: Request) { if (!req.user) throw unauthorized(); return req.user; }
  list = async (req: Request, res: Response) => { const result = await this.service.list(this.user(req), req.query as never); res.json(ok({ products: result.items }, result.meta)); };
  get = async (req: Request, res: Response) => { const product = await this.service.get(this.user(req), String(req.params.id)); res.json(ok({ product })); };
  create = async (req: Request, res: Response) => { const product = await this.service.create(this.user(req), req.body); res.status(201).json(ok({ product })); };
  update = async (req: Request, res: Response) => { const product = await this.service.update(this.user(req), String(req.params.id), req.body); res.json(ok({ product })); };
  remove = async (req: Request, res: Response) => {
    const product = await this.service.remove(this.user(req), String(req.params.id));
    res.status(200).json(ok({ product }, 'Product deleted'));
  };
}
