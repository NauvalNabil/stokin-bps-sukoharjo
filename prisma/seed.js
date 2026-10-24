const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

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

  // 2. Seed Users
  const users = [
    {
      name: 'Novia Dwima Santi, S.Tr.Stat',
      email: 'admin@bps.go.id',
      nip: '199811062021042001',
      password: 'admin123',
      role: 'ADMIN',
      team: 'Subbagian Umum',
      phone: '081234567890'
    },
    {
      name: 'Anang Sarwoto, S.Si, MM',
      email: 'kepala@bps.go.id',
      nip: '197505271997121001',
      password: 'admin123',
      role: 'KASUBAG',
      team: 'Subbagian Umum',
      phone: '081298765432'
    },
    {
      name: 'Nabil',
      email: 'nabil@gmail.com',
      nip: '199901012024011001',
      password: 'staf123',
      role: 'STAFF',
      team: 'Tim Statistik Sosial',
      phone: '085712345678'
    },
    {
      name: 'Budi Hartono',
      email: 'budi@gmail.com',
      nip: '199203152019021002',
      password: 'staf123',
      role: 'STAFF',
      team: 'Tim Statistik Produksi',
      phone: '081399887766'
    }
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u
    });
  }
  console.log(`✓ ${users.length} Users seeded.`);

  // 3. Clear any existing items, requests, stock-ins so catalog starts clean
  await prisma.requestItem.deleteMany();
  await prisma.request.deleteMany();
  await prisma.stockIn.deleteMany();
  await prisma.item.deleteMany();
  await prisma.category.deleteMany();
  console.log('✓ Semua item dan transaksi dikosongkan (katalog mulai dari 0).');

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
