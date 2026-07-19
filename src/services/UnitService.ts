import type { Unit, Prisma } from '@prisma/client';
import { notFound } from '../errors/AppError';
import type { IUnitRepository } from '../repositories/UnitRepository';
import type { AuthUser } from '../types/auth';
import type { PaginatedResult } from '../utils/pagination';
import { assertPermission } from '../utils/permissions';
import type {
  CreateUnitInput,
  UpdateUnitInput,
  UnitListQuery,
} from '../validators/unit.schemas';

export class UnitService {
  constructor(private readonly repo: IUnitRepository) {}

  async create(user: AuthUser, input: CreateUnitInput): Promise<Unit> {
    assertPermission(user, 'catalog.manage');
    const { branchId, ...rest } = input;
    return this.repo.create({
      ...rest,
      company: { connect: { id: user.companyId } },
      branch: { connect: { id: branchId ?? user.branchId } },
      createdBy: user.id,
      updatedBy: user.id,
    } as Prisma.UnitCreateInput);
  }

  async update(user: AuthUser, id: string, input: UpdateUnitInput): Promise<Unit> {
    assertPermission(user, 'catalog.manage');
    const existing = await this.repo.findById(user.companyId, id);
    if (!existing) {
      throw notFound('Unit not found');
    }
    const { branchId, ...rest } = input;
    return this.repo.update(id, {
      ...rest,
      ...(branchId ? { branch: { connect: { id: branchId } } } : {}),
      updatedBy: user.id,
    } as Prisma.UnitUpdateInput);
  }

  async remove(user: AuthUser, id: string): Promise<Unit> {
    assertPermission(user, 'catalog.manage');
    const existing = await this.repo.findById(user.companyId, id);
    if (!existing) {
      throw notFound('Unit not found');
    }
    return this.repo.softDelete(id, user.id);
  }

  async getById(user: AuthUser, id: string): Promise<Unit> {
    assertPermission(user, 'catalog.view');
    const item = await this.repo.findById(user.companyId, id);
    if (!item) {
      throw notFound('Unit not found');
    }
    return item;
  }

  async list(user: AuthUser, query: UnitListQuery): Promise<PaginatedResult<Unit>> {
    assertPermission(user, 'catalog.view');
    return this.repo.list(user.companyId, query);
  }
}
