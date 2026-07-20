import {
  buildPageMeta,
  listDateFilters,
  listQuerySchema,
  resolveOrderBy,
} from '../../src/utils/pagination';

describe('pagination helpers', () => {
  it('includes hasNext/hasPrev in page meta', () => {
    expect(buildPageMeta(45, 2, 20)).toEqual({
      page: 2,
      pageSize: 20,
      total: 45,
      totalPages: 3,
      hasNext: true,
      hasPrev: true,
    });
  });

  it('parses sync and date range query params', () => {
    const parsed = listQuerySchema.parse({
      page: '1',
      pageSize: '50',
      updatedSince: '2026-07-01T00:00:00.000Z',
      createdFrom: '2026-06-01T00:00:00.000Z',
      createdTo: '2026-07-18T23:59:59.000Z',
    });

    expect(parsed.pageSize).toBe(50);
    expect(parsed.updatedSince?.toISOString()).toBe('2026-07-01T00:00:00.000Z');
    expect(listDateFilters(parsed)).toEqual({
      updatedAt: { gte: parsed.updatedSince },
      createdAt: { gte: parsed.createdFrom, lte: parsed.createdTo },
    });
  });

  it('falls back to createdAt for unsupported sortBy', () => {
    expect(resolveOrderBy('hacked', 'asc', ['name', 'createdAt'])).toEqual({
      createdAt: 'asc',
    });
  });
});
