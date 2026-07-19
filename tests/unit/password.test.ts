import { hashPassword, verifyPassword } from '../../src/utils/password';

describe('password utilities', () => {
  it('hashes and verifies a password', async () => {
    const hash = await hashPassword('SecurePass!123');
    expect(hash).not.toEqual('SecurePass!123');
    await expect(verifyPassword('SecurePass!123', hash)).resolves.toBe(true);
    await expect(verifyPassword('wrong', hash)).resolves.toBe(false);
  });
});
