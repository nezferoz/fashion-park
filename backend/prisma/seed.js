const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function seedCategories() {
  const categories = [
    { categoryName: 'Baju', description: 'Kategori baju' },
    { categoryName: 'Celana', description: 'Kategori celana' },
    { categoryName: 'Jaket', description: 'Kategori jaket' },
    { categoryName: 'Kaos', description: 'Kategori kaos' },
    { categoryName: 'Aksesoris', description: 'Kategori aksesoris' },
    { categoryName: 'Sepatu', description: 'Kategori sepatu' },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { categoryName: cat.categoryName },
      update: {},
      create: cat,
    });
  }
  console.log('Seed kategori selesai!');
}

async function main() {
  const users = [
    { name: 'admin', email: 'admin@example.com', role: 'ADMIN' },
    { name: 'owner', email: 'owner@example.com', role: 'PEMILIK' },
    { name: 'pelanggan', email: 'pelanggan@example.com', role: 'PELANGGAN' },
    { name: 'kasir', email: 'kasir@example.com', role: 'KASIR' },
  ];

  for (const user of users) {
    const password = await bcrypt.hash(user.name + '123', 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        password,
        role: user.role,
        isActive: true,
      },
    });
  }

  await seedCategories();

  console.log('Seed user selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 