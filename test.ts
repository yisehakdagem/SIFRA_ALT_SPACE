
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
  // Test menuItem exists
  console.log('Testing prisma.menuItem:', typeof prisma.menuItem)
  
  // Test inventoryItem exists
  console.log('Testing prisma.inventoryItem:', typeof prisma.inventoryItem)
  
  // Test menuItemInventory exists
  console.log('Testing prisma.menuItemInventory:', typeof prisma.menuItemInventory)
  
  // Test InventoryLog type
  // @ts-ignore
  console.log('Testing InventoryLog:', typeof prisma.inventoryLog)
}

test().catch(console.error).finally(async () => await prisma.$disconnect())
