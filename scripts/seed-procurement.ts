import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedProcurement() {
  console.log('🛒 Seeding procurement data...')

  // Get existing users and products
  const users = await prisma.user.findMany()
  const products = await prisma.product.findMany()
  const suppliers = await prisma.supplier.findMany()
  
  if (users.length === 0 || products.length === 0) {
    console.log('❌ No users or products found. Run main seed first.')
    return
  }

  const adminUser = users.find(u => u.role === 'ADMIN') || users[0]
  
  // Clear existing procurement data
  await prisma.procurementItem.deleteMany()
  await prisma.procurement.deleteMany()

  // Create procurement data
  const procurements = [
    {
      procurementNumber: 'PO-202508-001',
      supplierId: suppliers.length > 0 ? suppliers[0].id : null,
      status: 'RECEIVED' as const,
      orderDate: new Date('2025-08-15T08:00:00.000Z'),
      receivedDate: new Date('2025-08-17T10:30:00.000Z'),
      notes: 'Pengadaan rutin mingguan',
      items: [
        {
          productId: products[0].id,
          quantity: 100,
          unitPrice: 3500,
          totalPrice: 350000
        },
        {
          productId: products[1].id,
          quantity: 50,
          unitPrice: 4500,
          totalPrice: 225000
        },
        {
          productId: products[2].id,
          quantity: 20,
          unitPrice: 46250,
          totalPrice: 925000
        }
      ]
    },
    {
      procurementNumber: 'PO-202508-002',
      supplierId: suppliers.length > 1 ? suppliers[1].id : null,
      status: 'ORDERED' as const,
      orderDate: new Date('2025-08-16T09:15:00.000Z'),
      notes: 'Pengadaan produk cleaning',
      items: [
        {
          productId: products[3].id,
          quantity: 30,
          unitPrice: 12500,
          totalPrice: 375000
        },
        {
          productId: products[4].id,
          quantity: 25,
          unitPrice: 15000,
          totalPrice: 375000
        }
      ]
    },
    {
      procurementNumber: 'PO-202508-003',
      status: 'DRAFT' as const,
      orderDate: new Date('2025-08-18T14:00:00.000Z'),
      notes: 'Draft pengadaan snack',
      items: [
        {
          productId: products[5] ? products[5].id : products[0].id,
          quantity: 50,
          unitPrice: 10000,
          totalPrice: 500000
        }
      ]
    }
  ]

  for (const procurementData of procurements) {
    const { items, ...procurementInfo } = procurementData
    
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0)
    
    const procurement = await prisma.procurement.create({
      data: {
        ...procurementInfo,
        totalItems,
        totalAmount,
        createdById: adminUser.id,
        items: {
          create: items
        }
      },
      include: {
        items: true
      }
    })

    console.log(`✅ Created procurement: ${procurement.procurementNumber}`)
  }

  console.log('🛒 Procurement data seeded successfully!')
}

seedProcurement()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
