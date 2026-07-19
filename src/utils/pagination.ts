import type { Prisma } from '@prisma/client';
import { z } from 'zod';

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().trim().min(1).max(64).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().max(200).optional(),
  branchId: z.string().uuid().optional(),
  isActive: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((value) => {
      if (value === undefined) {
        return undefined;
      }
      if (typeof value === 'boolean') {
        return value;
      }
      return value === 'true';
    }),
});

export type ListQuery = z.infer<typeof listQuerySchema>;

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PageMeta;
}

export function buildPageMeta(total: number, page: number, pageSize: number): PageMeta {
  return {
    page,
    pageSize,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
  };
}

export function toSkipTake(query: Pick<ListQuery, 'page' | 'pageSize'>): {
  skip: number;
  take: number;
} {
  return {
    skip: (query.page - 1) * query.pageSize,
    take: query.pageSize,
  };
}

export function resolveOrderBy(
  sortBy: string | undefined,
  sortOrder: 'asc' | 'desc',
  allowed: string[],
  fallback: string = 'createdAt',
): Record<string, Prisma.SortOrder> {
  const field = sortBy && allowed.includes(sortBy) ? sortBy : fallback;
  return { [field]: sortOrder };
}
