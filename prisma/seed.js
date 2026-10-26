const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SIM-ATK BPS Sukoharjo database...');

  // 1. Seed Setting
  await prisma.setting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      namaSatker: 'BADAN PUSAT STATISTIK KABUPATEN SUKOHARJO',
      kodeUakpb: '054.01.0300.019098',
      kepalaBpsNama: 'Anang Sarwoto, S.Si, MM',
      kepalaBpsNip: '197505271997121001',
      pengelolaPersediaanNama: 'Novia Dwima Santi, S.Tr.Stat',
      pengelolaPersediaanNip: '199811062021042001',
      alamat: 'Jl. Jenderal Sudirman No. 199, Sukoharjo'
    }
  });
  console.log('✓ Setting instansi BPS Sukoharjo seeded.');

  // 2. Seed Admin User ONLY
  const adminUser = {
    name: 'Novia Dwima Santi, S.Tr.Stat',
    email: 'admin@bps.go.id',
    nip: '199811062021042001',
    password: 'admin123',
    role: 'ADMIN',
    team: 'Subbagian Umum',
    phone: '081234567890'
  };

  await prisma.user.upsert({
    where: { email: adminUser.email },
    update: {},
    create: adminUser
  });
  console.log('✓ Admin TU user seeded (Novia Dwima Santi - admin@bps.go.id).');

  // Delete any non-admin users
  await prisma.user.deleteMany({
    where: { email: { not: 'admin@bps.go.id' } }
  });

  // 3. Clear any existing items, requests, stock-ins so catalog and transactions start fresh from 0
  await prisma.requestItem.deleteMany();
  await prisma.request.deleteMany();
  await prisma.stockIn.deleteMany();
  await prisma.item.deleteMany();
  await prisma.category.deleteMany();
  console.log('✓ Semua item dan transaksi dikosongkan (katalog & riwayat mulai bersih dari 0).');

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
