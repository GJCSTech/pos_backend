import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config as loadDotenv } from 'dotenv';

loadDotenv();

const prisma = new PrismaClient();

const PERMISSIONS = [
  { code: 'device.register', name: 'Register Device', module: 'device', description: 'Register POS devices' },
  { code: 'device.view', name: 'View Devices', module: 'device', description: 'List and view devices' },
  { code: 'device.manage', name: 'Manage Devices', module: 'device', description: 'Suspend or revoke devices' },
  { code: 'users.view', name: 'View Users', module: 'users', description: 'View user accounts' },
  { code: 'users.manage', name: 'Manage Users', module: 'users', description: 'Create and manage users' },
  { code: 'sync.execute', name: 'Execute Sync', module: 'sync', description: 'Run device synchronization' },
  { code: 'sync.view', name: 'View Sync Status', module: 'sync', description: 'View sync history and status' },
] as const;

const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: PERMISSIONS.map((p) => p.code),
  STORE_ADMIN: [
    'device.register',
    'device.view',
    'device.manage',
    'users.view',
    'sync.execute',
    'sync.view',
  ],
  SALES_USER: ['device.register', 'sync.execute', 'sync.view'],
};

async function main(): Promise<void> {
  const companyName = process.env.SEED_COMPANY_NAME ?? 'VJ Garden Boutique';
  const companyCode = 'VJGARDEN';
  const branchName = process.env.SEED_BRANCH_NAME ?? 'Main Store';
  const branchCode = process.env.SEED_BRANCH_CODE ?? 'MAIN';
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? 'admin@vjgarden.local').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMeAdmin!2026';
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);

  const company = await prisma.company.upsert({
    where: { code: companyCode },
    update: {
      name: companyName,
      isActive: true,
      deletedAt: null,
      version: { increment: 1 },
    },
    create: {
      name: companyName,
      code: companyCode,
      legalName: 'VJ Garden Boutique & Organic Store',
      isActive: true,
    },
  });

  await prisma.company.update({
    where: { id: company.id },
    data: { companyId: company.id },
  });

  const branch = await prisma.branch.upsert({
    where: {
      companyId_code: { companyId: company.id, code: branchCode },
    },
    update: {
      name: branchName,
      isActive: true,
      isMain: true,
      deletedAt: null,
      version: { increment: 1 },
    },
    create: {
      companyId: company.id,
      name: branchName,
      code: branchCode,
      city: 'Chennai',
      state: 'Tamil Nadu',
      timezone: 'Asia/Kolkata',
      isActive: true,
      isMain: true,
    },
  });

  await prisma.branch.update({
    where: { id: branch.id },
    data: { branchId: branch.id },
  });

  const permissionRecords = [];
  for (const permission of PERMISSIONS) {
    const record = await prisma.permission.upsert({
      where: { code: permission.code },
      update: {
        name: permission.name,
        module: permission.module,
        description: permission.description,
        companyId: company.id,
        deletedAt: null,
        version: { increment: 1 },
      },
      create: {
        ...permission,
        companyId: company.id,
      },
    });
    permissionRecords.push(record);
  }

  const permissionByCode = new Map(permissionRecords.map((p) => [p.code, p]));

  const roles = [
    {
      code: 'SUPER_ADMIN',
      name: 'Super Admin',
      description: 'Full platform access',
      isSystem: true,
    },
    {
      code: 'STORE_ADMIN',
      name: 'Store Admin',
      description: 'Branch operations administration',
      isSystem: true,
    },
    {
      code: 'SALES_USER',
      name: 'Sales User',
      description: 'Checkout and sales operations',
      isSystem: true,
    },
  ] as const;

  const roleRecords = [];
  for (const role of roles) {
    const record = await prisma.role.upsert({
      where: {
        companyId_code: { companyId: company.id, code: role.code },
      },
      update: {
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        branchId: branch.id,
        deletedAt: null,
        version: { increment: 1 },
      },
      create: {
        companyId: company.id,
        branchId: branch.id,
        code: role.code,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
      },
    });
    roleRecords.push(record);
  }

  for (const role of roleRecords) {
    const codes = ROLE_PERMISSIONS[role.code] ?? [];
    for (const code of codes) {
      const permission = permissionByCode.get(code);
      if (!permission) {
        continue;
      }
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {
          companyId: company.id,
          branchId: branch.id,
          deletedAt: null,
          version: { increment: 1 },
        },
        create: {
          companyId: company.id,
          branchId: branch.id,
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  const passwordHash = await bcrypt.hash(adminPassword, saltRounds);
  const superAdminRole = roleRecords.find((r) => r.code === 'SUPER_ADMIN');
  if (!superAdminRole) {
    throw new Error('SUPER_ADMIN role missing after seed');
  }

  const admin = await prisma.user.upsert({
    where: {
      companyId_email: { companyId: company.id, email: adminEmail },
    },
    update: {
      username: 'admin',
      passwordHash,
      displayName: 'System Administrator',
      status: 'ACTIVE',
      branchId: branch.id,
      failedLogins: 0,
      lockedUntil: null,
      deletedAt: null,
      passwordChangedAt: new Date(),
      version: { increment: 1 },
    },
    create: {
      companyId: company.id,
      branchId: branch.id,
      email: adminEmail,
      username: 'admin',
      passwordHash,
      displayName: 'System Administrator',
      status: 'ACTIVE',
      passwordChangedAt: new Date(),
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: superAdminRole.id,
      },
    },
    update: {
      companyId: company.id,
      branchId: branch.id,
      deletedAt: null,
      version: { increment: 1 },
    },
    create: {
      companyId: company.id,
      branchId: branch.id,
      userId: admin.id,
      roleId: superAdminRole.id,
      createdBy: admin.id,
      updatedBy: admin.id,
    },
  });

  // eslint-disable-next-line no-console
  console.log('Seed completed', {
    companyId: company.id,
    branchId: branch.id,
    adminEmail,
    adminUsername: 'admin',
  });
}

main()
  .catch((error: unknown) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
