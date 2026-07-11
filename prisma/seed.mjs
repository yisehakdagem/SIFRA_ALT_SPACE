import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create Users
  const adminHash = await bcrypt.hash('admin123', 10);
  const managerHash = await bcrypt.hash('manager123', 10);
  const customerHash = await bcrypt.hash('customer123', 10);

  const admin = await prisma.user.upsert({
    where: { Email: 'admin@sifra.et' },
    update: {},
    create: { FirstName: 'Admin', LastName: 'User', Email: 'admin@sifra.et', PasswordHash: adminHash, Role: 'Administrator' },
  });

  const manager = await prisma.user.upsert({
    where: { Email: 'manager@sifra.et' },
    update: {},
    create: { FirstName: 'Manager', LastName: 'User', Email: 'manager@sifra.et', PasswordHash: managerHash, Role: 'Manager' },
  });

  const customer = await prisma.user.upsert({
    where: { Email: 'customer@sifra.et' },
    update: {},
    create: { FirstName: 'Customer', LastName: 'User', Email: 'customer@sifra.et', PasswordHash: customerHash, Role: 'Customer' },
  });

  // 2. Create Book Categories
  let fiction = await prisma.bookCategory.findFirst({ where: { CategoryName: 'Fiction' } });
  if (!fiction) {
    fiction = await prisma.bookCategory.create({ data: { CategoryName: 'Fiction' } });
  }

  let philosophy = await prisma.bookCategory.findFirst({ where: { CategoryName: 'Philosophy' } });
  if (!philosophy) {
    philosophy = await prisma.bookCategory.create({ data: { CategoryName: 'Philosophy' } });
  }

  // 3. Create Books and Copies
  let book1 = await prisma.book.findFirst({ where: { Title: 'The Stranger' } });
  if (!book1) {
    book1 = await prisma.book.create({
      data: {
        Title: 'The Stranger',
        Author: 'Albert Camus',
        CategoryID: philosophy.CategoryID,
        ISBN: '978-0679720201',
        CoverImage: 'https://picsum.photos/400/600?random=4',
        Copies: {
          create: [
            { Barcode: 'B-001', Status: 'Available' },
            { Barcode: 'B-002', Status: 'Borrowed' }
          ]
        }
      }
    });
  }

  let book2 = await prisma.book.findFirst({ where: { Title: '1984' } });
  if (!book2) {
    book2 = await prisma.book.create({
      data: {
        Title: '1984',
        Author: 'George Orwell',
        CategoryID: fiction.CategoryID,
        ISBN: '978-0451524935',
        CoverImage: 'https://picsum.photos/400/600?random=5',
        Copies: {
          create: [
            { Barcode: 'B-003', Status: 'Available' }
          ]
        }
      }
    });
  }

  // 4. Create Cafe Products
  const existingProducts = await prisma.product.count();
  if (existingProducts === 0) {
    await prisma.product.createMany({
      data: [
        { ProductName: 'Espresso', Description: 'Rich and bold double shot.', SellingPrice: 45, CurrentStock: 100 },
        { ProductName: 'Macchiato', Description: 'Espresso with a dash of milk.', SellingPrice: 50, CurrentStock: 50 },
        { ProductName: 'Croissant', Description: 'Freshly baked butter pastry.', SellingPrice: 80, CurrentStock: 20 },
      ]
    });
  }

  // 5. Create Events
  const existingEvent = await prisma.event.findFirst({ where: { Title: 'Sunday Book Club' } });
  if (!existingEvent) {
    await prisma.event.create({
      data: {
        Title: 'Sunday Book Club',
        Description: 'Discussing the works of Dostoevsky.',
        EventDate: new Date('2026-08-01'),
        StartTime: '15:00',
        EndTime: '17:00',
        MaxParticipants: 20,
        Status: 'Upcoming',
        CreatedByID: manager.UserID
      }
    });
  }

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
