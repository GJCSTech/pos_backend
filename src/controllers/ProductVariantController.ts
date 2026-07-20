import type { Request, Response } from 'express';
import { unauthorized } from '../errors/AppError';
import { ok } from '../types/api';
import type { ProductVariantService } from '../services/ProductVariantService';

export class ProductVariantController {
  constructor(private readonly service: ProductVariantService) {}

  private user(r: Request) {
    if (!r.user) throw unauthorized();
    return r.user;
  }

  list = async (r: Request, s: Response): Promise<void> => {
    const x = await this.service.list(this.user(r), r.query as never);
    s.json(ok({ productVariants: x.items }, x.meta));
  };

  get = async (r: Request, s: Response): Promise<void> => {
    s.json(ok({ productVariant: await this.service.get(this.user(r), String(r.params.id)) }));
  };

  create = async (r: Request, s: Response): Promise<void> => {
    s.status(201).json(
      ok({ productVariant: await this.service.create(this.user(r), r.body) }, 'Product variant created'),
    );
  };

  update = async (r: Request, s: Response): Promise<void> => {
    s.json(
      ok({ productVariant: await this.service.update(this.user(r), String(r.params.id), r.body) }, 'Product variant updated'),
    );
  };

  remove = async (r: Request, s: Response): Promise<void> => {
    const productVariant = await this.service.remove(this.user(r), String(r.params.id));
    s.status(200).json(ok({ productVariant }, 'Product variant deleted'));
  };
}
