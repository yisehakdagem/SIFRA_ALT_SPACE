import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old products...');
  await prisma.product.deleteMany({});

  console.log('Adding new products...');
  await prisma.product.createMany({
    data: [
      { ProductName: 'French Press Coffee', Description: 'Rich and full-bodied coffee.', SellingPrice: 60, CurrentStock: 100 },
      { ProductName: 'Moka Pot Coffee', Description: 'Strong, espresso-like traditional coffee.', SellingPrice: 50, CurrentStock: 100 },
      { ProductName: 'Tea', Description: 'Hot spiced tea.', SellingPrice: 30, CurrentStock: 150 },
      { ProductName: 'Water', Description: 'Bottled mineral water.', SellingPrice: 20, CurrentStock: 200 },
      { ProductName: 'Softdrink', Description: 'Assorted sodas.', SellingPrice: 40, CurrentStock: 150 },
      { ProductName: 'Peanuts', Description: 'Roasted peanuts snack.', SellingPrice: 35, CurrentStock: 80 },
      { ProductName: 'Kolo', Description: 'Roasted barley mix.', SellingPrice: 40, CurrentStock: 100 },
      { ProductName: 'Dube', Description: 'Traditional spiced bread.', SellingPrice: 50, CurrentStock: 50 },
    ]
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
