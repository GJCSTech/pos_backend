import { signAccessToken, verifyAccessToken, parseDurationToMs } from '../../src/utils/jwt';

describe('jwt utilities', () => {
  it('signs and verifies access tokens', () => {
    const token = signAccessToken({
      sub: 'user-1',
      companyId: 'company-1',
      branchId: 'branch-1',
      email: 'admin@vjgarden.local',
      username: 'admin',
      displayName: 'Admin',
      roles: ['SUPER_ADMIN'],
      permissions: ['device.view'],
    });

    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe('user-1');
    expect(payload.type).toBe('access');
    expect(payload.roles).toContain('SUPER_ADMIN');
  });

  it('parses duration strings', () => {
    expect(parseDurationToMs('15m')).toBe(15 * 60_000);
    expect(parseDurationToMs('7d')).toBe(7 * 86_400_000);
  });
});
