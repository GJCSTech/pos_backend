import type { TaxMaster, Prisma } from '@prisma/client';
import { notFound } from '../errors/AppError';
import type { ITaxMasterRepository } from '../repositories/TaxMasterRepository';
import type { AuthUser } from '../types/auth';
import type { PaginatedResult } from '../utils/pagination';
import { assertPermission } from '../utils/permissions';
import type {
  CreateTaxMasterInput,
  UpdateTaxMasterInput,
  TaxMasterListQuery,
} from '../validators/taxMaster.schemas';

export class TaxMasterService {
  constructor(private readonly repo: ITaxMasterRepository) {}

  async create(user: AuthUser, input: CreateTaxMasterInput): Promise<TaxMaster> {
    assertPermission(user, 'catalog.manage');
    const { branchId, ...rest } = input;
    return this.repo.create({
      ...rest,
      company: { connect: { id: user.companyId } },
      branch: { connect: { id: branchId ?? user.branchId } },
      createdBy: user.id,
      updatedBy: user.id,
    } as Prisma.TaxMasterCreateInput);
  }

  async update(user: AuthUser, id: string, input: UpdateTaxMasterInput): Promise<TaxMaster> {
    assertPermission(user, 'catalog.manage');
    const existing = await this.repo.findById(user.companyId, id);
    if (!existing) {
      throw notFound('TaxMaster not found');
    }
    const { branchId, ...rest } = input;
    return this.repo.update(id, {
      ...rest,
      ...(branchId ? { branch: { connect: { id: branchId } } } : {}),
      updatedBy: user.id,
    } as Prisma.TaxMasterUpdateInput);
  }

  async remove(user: AuthUser, id: string): Promise<TaxMaster> {
    assertPermission(user, 'catalog.manage');
    const existing = await this.repo.findById(user.companyId, id);
    if (!existing) {
      throw notFound('TaxMaster not found');
    }
    return this.repo.softDelete(id, user.id);
  }

  async getById(user: AuthUser, id: string): Promise<TaxMaster> {
    assertPermission(user, 'catalog.view');
    const item = await this.repo.findById(user.companyId, id);
    if (!item) {
      throw notFound('TaxMaster not found');
    }
    return item;
  }

  async list(user: AuthUser, query: TaxMasterListQuery): Promise<PaginatedResult<TaxMaster>> {
    assertPermission(user, 'catalog.view');
    return this.repo.list(user.companyId, query);
  }
}
