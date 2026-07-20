import { fail, ok } from '../../src/types/api';

describe('API response envelope', () => {
  it('builds success responses with message, data, and optional meta', () => {
    const withMeta = ok({ products: [] }, { page: 1, pageSize: 20, total: 0, totalPages: 0 });
    expect(withMeta).toEqual({
      success: true,
      message: 'Success',
      data: { products: [] },
      meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    });

    const withMessage = ok({ loggedOut: true }, 'Logged out');
    expect(withMessage).toEqual({
      success: true,
      message: 'Logged out',
      data: { loggedOut: true },
    });
  });

  it('builds failure responses with top-level message and errors', () => {
    const body = fail('Request validation failed', {
      code: 'VALIDATION_ERROR',
      requestId: 'req-1',
      details: { fieldErrors: { name: ['Required'] } },
    });

    expect(body).toEqual({
      success: false,
      message: 'Request validation failed',
      errors: {
        code: 'VALIDATION_ERROR',
        requestId: 'req-1',
        details: { fieldErrors: { name: ['Required'] } },
      },
    });
  });
});
