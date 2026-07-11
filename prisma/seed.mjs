import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // 1. Create Users
  const adminHash = await bcrypt.hash("admin123", 10);
  const managerHash = await bcrypt.hash("manager123", 10);
  const customerHash = await bcrypt.hash("customer123", 10);

  const admin = await prisma.user.upsert({
    where: { Email: "admin@sifra.et" },
    update: {},
    create: {
      FirstName: "Admin",
      LastName: "User",
      Email: "admin@sifra.et",
      PasswordHash: adminHash,
      Role: "Administrator",
    },
  });

  const manager = await prisma.user.upsert({
    where: { Email: "manager@sifra.et" },
    update: {},
    create: {
      FirstName: "Manager",
      LastName: "User",
      Email: "manager@sifra.et",
      PasswordHash: managerHash,
      Role: "Manager",
    },
  });

  const customer = await prisma.user.upsert({
    where: { Email: "customer@sifra.et" },
    update: {},
    create: {
      FirstName: "Customer",
      LastName: "User",
      Email: "customer@sifra.et",
      PasswordHash: customerHash,
      Role: "Customer",
    },
  });

  // 2. Create Book Categories
  let fiction = await prisma.bookCategory.findFirst({
    where: { CategoryName: "Fiction" },
  });
  if (!fiction) {
    fiction = await prisma.bookCategory.create({
      data: { CategoryName: "Fiction" },
    });
  }

  let philosophy = await prisma.bookCategory.findFirst({
    where: { CategoryName: "Philosophy" },
  });
  if (!philosophy) {
    philosophy = await prisma.bookCategory.create({
      data: { CategoryName: "Philosophy" },
    });
  }

  // 3. Create Books and Copies
  let book1 = await prisma.book.findFirst({ where: { Title: "The Stranger" } });
  if (!book1) {
    book1 = await prisma.book.create({
      data: {
        Title: "The Stranger",
        Author: "Albert Camus",
        CategoryID: philosophy.CategoryID,
        ISBN: "978-0679720201",
        CoverImage: "https://picsum.photos/400/600?random=4",
        Copies: {
          create: [
            { Barcode: "B-001", Status: "Available" },
            { Barcode: "B-002", Status: "Borrowed" },
          ],
        },
      },
    });
  }

  let book2 = await prisma.book.findFirst({ where: { Title: "1984" } });
  if (!book2) {
    book2 = await prisma.book.create({
      data: {
        Title: "1984",
        Author: "George Orwell",
        CategoryID: fiction.CategoryID,
        ISBN: "978-0451524935",
        CoverImage: "https://picsum.photos/400/600?random=5",
        Copies: {
          create: [{ Barcode: "B-003", Status: "Available" }],
        },
      },
    });
  }

  // 4. Create Inventory Items
  const existingInventory = await prisma.inventoryItem.count();
  let coffeeBeans, teaGrounds, dubeMedium, dubeLarge, peanutsMedium, peanutsLarge, koloMedium, koloLarge;
  if (existingInventory === 0) {
    coffeeBeans = await prisma.inventoryItem.create({
      data: { Name: "Coffee Beans", CurrentStock: 0, Unit: "units" },
    });
    teaGrounds = await prisma.inventoryItem.create({
      data: { Name: "Tea Grounds", CurrentStock: 0, Unit: "units" },
    });
    dubeMedium = await prisma.inventoryItem.create({
      data: { Name: "Dube (Medium)", CurrentStock: 100, Unit: "units" },
    });
    dubeLarge = await prisma.inventoryItem.create({
      data: { Name: "Dube (Large)", CurrentStock: 100, Unit: "units" },
    });
    peanutsMedium = await prisma.inventoryItem.create({
      data: { Name: "Peanuts (Medium)", CurrentStock: 100, Unit: "units" },
    });
    peanutsLarge = await prisma.inventoryItem.create({
      data: { Name: "Peanuts (Large)", CurrentStock: 100, Unit: "units" },
    });
    koloMedium = await prisma.inventoryItem.create({
      data: { Name: "Kolo (Medium)", CurrentStock: 100, Unit: "units" },
    });
    koloLarge = await prisma.inventoryItem.create({
      data: { Name: "Kolo (Large)", CurrentStock: 100, Unit: "units" },
    });
  } else {
    coffeeBeans = await prisma.inventoryItem.findFirst({ where: { Name: "Coffee Beans" } });
    teaGrounds = await prisma.inventoryItem.findFirst({ where: { Name: "Tea Grounds" } });
    dubeMedium = await prisma.inventoryItem.findFirst({ where: { Name: "Dube (Medium)" } });
    dubeLarge = await prisma.inventoryItem.findFirst({ where: { Name: "Dube (Large)" } });
    peanutsMedium = await prisma.inventoryItem.findFirst({ where: { Name: "Peanuts (Medium)" } });
    peanutsLarge = await prisma.inventoryItem.findFirst({ where: { Name: "Peanuts (Large)" } });
    koloMedium = await prisma.inventoryItem.findFirst({ where: { Name: "Kolo (Medium)" } });
    koloLarge = await prisma.inventoryItem.findFirst({ where: { Name: "Kolo (Large)" } });
  }

  // 5. Create Menu Items and link to Inventory
  const existingMenuItems = await prisma.menuItem.count();
  if (existingMenuItems === 0) {
    const menuItems = [
      { Name: "Dube Medium", Price: 100, inventoryItem: dubeMedium },
      { Name: "Peanuts Medium", Price: 200, inventoryItem: peanutsMedium },
      { Name: "Kolo Medium", Price: 150, inventoryItem: koloMedium },
      { Name: "Dube Large", Price: 150, inventoryItem: dubeLarge },
      { Name: "Peanuts Large", Price: 300, inventoryItem: peanutsLarge },
      { Name: "Kolo Large", Price: 200, inventoryItem: koloLarge },
      { Name: "French Press Coffee", Price: 90, inventoryItem: null },
      { Name: "Moka Pot Coffee", Price: 100, inventoryItem: null },
      { Name: "Tea", Price: 90, inventoryItem: null },
      { Name: "0.5 liter water", Price: 40, inventoryItem: null },
      { Name: "1 liter water", Price: 60, inventoryItem: null },
      { Name: "2 liter water", Price: 80, inventoryItem: null },
    ];

    for (const item of menuItems) {
      const menuItem = await prisma.menuItem.create({
        data: {
          Name: item.Name,
          Price: item.Price,
          Status: "Available",
        },
      });

      // Link to inventory if needed
      if (item.inventoryItem) {
        await prisma.menuItemInventory.create({
          data: {
            MenuItemID: menuItem.MenuItemID,
            InventoryItemID: item.inventoryItem.InventoryItemID,
            QuantityRequired: 1,
          },
        });
      }
    }
  }

  // 6. Create Events
  const existingEvent = await prisma.event.findFirst({
    where: { Title: "Sunday Book Club" },
  });
  if (!existingEvent) {
    await prisma.event.create({
      data: {
        Title: "Sunday Book Club",
        Description: "Discussing the works of Dostoevsky.",
        EventDate: new Date("2026-08-01"),
        StartTime: "15:00",
        EndTime: "17:00",
        MaxParticipants: 20,
        Status: "Upcoming",
        CreatedByID: manager.UserID,
      },
    });
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
