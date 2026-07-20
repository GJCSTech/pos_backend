import type { Prisma } from '@prisma/client';
import { notFound } from '../errors/AppError';
import type { IProductRepository } from '../repositories/ProductRepository';
import type { AuthUser } from '../types/auth';
import {
  buildPageMeta,
  listDateFilters,
  resolveOrderBy,
  toSkipTake,
  type PaginatedResult,
} from '../utils/pagination';
import { assertPermission } from '../utils/permissions';
import type {
  CreateProductInput,
  ProductListQuery,
  UpdateProductInput,
} from '../validators/product.schemas';

export class ProductService {
  constructor(private readonly products: IProductRepository) {}

  async list(user: AuthUser, query: ProductListQuery): Promise<PaginatedResult<unknown>> {
    assertPermission(user, 'catalog.view');
    const { skip, take } = toSkipTake(query);
    const where: Prisma.ProductWhereInput = {
      companyId: user.companyId,
      branchId: query.branchId ?? user.branchId,
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.supplierId ? { supplierId: query.supplierId } : {}),
      ...(query.barcode ? { barcode: query.barcode } : {}),
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...listDateFilters(query),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { code: { contains: query.search, mode: 'insensitive' } },
              { sku: { contains: query.search, mode: 'insensitive' } },
              { barcode: { contains: query.search, mode: 'insensitive' } },
              { searchKeywords: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.products.list(
      where,
      skip,
      take,
      resolveOrderBy(query.sortBy, query.sortOrder, [
        'name',
        'code',
        'sku',
        'createdAt',
        'sellingPrice',
      ]) as Prisma.ProductOrderByWithRelationInput,
    );

    return { items, meta: buildPageMeta(total, query.page, query.pageSize) };
  }

  async get(user: AuthUser, id: string) {
    assertPermission(user, 'catalog.view');
    const product = await this.products.findById(user.companyId, id);
    if (!product) {
      throw notFound('Product not found');
    }
    return product;
  }

  async create(user: AuthUser, input: CreateProductInput) {
    assertPermission(user, 'catalog.manage');
    const { productUnits, attributes, categoryId, taxMasterId, supplierId, baseUnitId, ...data } =
      input;

    return this.products.create({
      ...data,
      attributes: attributes as Prisma.InputJsonValue | undefined,
      company: { connect: { id: user.companyId } },
      branch: { connect: { id: user.branchId } },
      ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
      ...(taxMasterId ? { taxMaster: { connect: { id: taxMasterId } } } : {}),
      ...(supplierId ? { supplier: { connect: { id: supplierId } } } : {}),
      ...(baseUnitId ? { baseUnit: { connect: { id: baseUnitId } } } : {}),
      createdBy: user.id,
      updatedBy: user.id,
      ...(productUnits
        ? {
            productUnits: {
              create: productUnits.map((unit) => ({
                unit: { connect: { id: unit.unitId } },
                conversionFactor: unit.conversionFactor,
                sellingPrice: unit.sellingPrice,
                barcode: unit.barcode,
                isDefault: unit.isDefault ?? false,
                isActive: unit.isActive ?? true,
                company: { connect: { id: user.companyId } },
                branch: { connect: { id: user.branchId } },
                createdBy: user.id,
                updatedBy: user.id,
              })),
            },
          }
        : {}),
    });
  }

  async update(user: AuthUser, id: string, input: UpdateProductInput) {
    assertPermission(user, 'catalog.manage');
    await this.get(user, id);
    const { productUnits, attributes, categoryId, taxMasterId, supplierId, baseUnitId, ...data } =
      input;

    return this.products.update(id, {
      ...data,
      ...(attributes === undefined
        ? {}
        : { attributes: attributes as Prisma.InputJsonValue }),
      ...(categoryId === undefined
        ? {}
        : categoryId
          ? { category: { connect: { id: categoryId } } }
          : { category: { disconnect: true } }),
      ...(taxMasterId === undefined
        ? {}
        : taxMasterId
          ? { taxMaster: { connect: { id: taxMasterId } } }
          : { taxMaster: { disconnect: true } }),
      ...(supplierId === undefined
        ? {}
        : supplierId
          ? { supplier: { connect: { id: supplierId } } }
          : { supplier: { disconnect: true } }),
      ...(baseUnitId === undefined
        ? {}
        : baseUnitId
          ? { baseUnit: { connect: { id: baseUnitId } } }
          : { baseUnit: { disconnect: true } }),
      updatedBy: user.id,
      ...(productUnits
        ? {
            productUnits: {
              deleteMany: {},
              create: productUnits.map((unit) => ({
                unit: { connect: { id: unit.unitId } },
                conversionFactor: unit.conversionFactor,
                sellingPrice: unit.sellingPrice,
                barcode: unit.barcode,
                isDefault: unit.isDefault ?? false,
                isActive: unit.isActive ?? true,
                company: { connect: { id: user.companyId } },
                branch: { connect: { id: user.branchId } },
                createdBy: user.id,
                updatedBy: user.id,
              })),
            },
          }
        : {}),
    });
  }

  async remove(user: AuthUser, id: string) {
    assertPermission(user, 'catalog.manage');
    await this.get(user, id);
    return this.products.softDelete(id, user.id);
  }
}
