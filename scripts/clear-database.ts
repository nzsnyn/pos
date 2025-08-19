import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearDatabase() {
  try {
    console.log('Starting database cleanup...')

    // Get admin user before clearing data
    const adminUser = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    })

    if (!adminUser) {
      console.error('No admin user found! Please ensure there is at least one admin user before running this script.')
      return
    }

    console.log(`Found admin user: ${adminUser.username} (${adminUser.email})`)

    // Delete data in correct order to handle foreign key constraints
    console.log('Deleting order items...')
    await prisma.orderItem.deleteMany()

    console.log('Deleting orders...')
    await prisma.order.deleteMany()

    console.log('Deleting procurement items...')
    await prisma.procurementItem.deleteMany()

    console.log('Deleting procurements...')
    await prisma.procurement.deleteMany()

    console.log('Deleting stock opname items...')
    await prisma.stockOpnameItem.deleteMany()

    console.log('Deleting stock opnames...')
    await prisma.stockOpname.deleteMany()

    console.log('Deleting products...')
    await prisma.product.deleteMany()

    console.log('Deleting categories...')
    await prisma.category.deleteMany()

    console.log('Deleting suppliers...')
    await prisma.supplier.deleteMany()

    console.log('Deleting customers...')
    await prisma.customer.deleteMany()

    console.log('Deleting shifts...')
    await prisma.shift.deleteMany()

    // Delete analytics data
    console.log('Deleting analytics data...')
    await prisma.dailyStats.deleteMany()
    await prisma.weeklyStats.deleteMany()
    await prisma.monthlyStats.deleteMany()
    await prisma.productStats.deleteMany()
    await prisma.customerStats.deleteMany()
    await prisma.salesTarget.deleteMany()
    await prisma.inventoryAlert.deleteMany()
    await prisma.cashierPerformance.deleteMany()

    // Delete non-admin users
    console.log('Deleting non-admin users...')
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        id: {
          not: adminUser.id
        }
      }
    })

    console.log(`Deleted ${deletedUsers.count} non-admin users`)

    // Reset admin user to default state (optional)
    console.log('Resetting admin user to clean state...')
    await prisma.user.update({
      where: {
        id: adminUser.id
      },
      data: {
        isActive: true,
        updatedAt: new Date()
      }
    })

    console.log('Database cleanup completed successfully!')
    console.log(`Preserved admin user: ${adminUser.username} (${adminUser.firstName} ${adminUser.lastName})`)
    
  } catch (error) {
    console.error('Error during database cleanup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
clearDatabase()
  .then(() => {
    console.log('✅ Database cleanup script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Database cleanup script failed:', error)
    process.exit(1)
  })
