import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearDatabaseAuto() {
  try {
    console.log('🚨 WARNING: This will delete ALL data from the database except admin accounts!')

    // Get admin users
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true
      }
    })

    if (adminUsers.length === 0) {
      console.error('❌ No admin users found! Cannot proceed with cleanup.')
      console.error('Please create at least one admin user before running this script.')
      return
    }

    console.log('The following admin accounts will be PRESERVED:')
    adminUsers.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.username} (${admin.firstName} ${admin.lastName}) - ${admin.email}`)
    })
    console.log('')

    console.log('🧹 Starting database cleanup...')

    // Get admin IDs to preserve
    const adminIds = adminUsers.map(admin => admin.id)

    // Count records before deletion
    const beforeCounts = {
      orders: await prisma.order.count(),
      products: await prisma.product.count(),
      categories: await prisma.category.count(),
      suppliers: await prisma.supplier.count(),
      customers: await prisma.customer.count(),
      shifts: await prisma.shift.count(),
      nonAdminUsers: await prisma.user.count({
        where: {
          id: { notIn: adminIds }
        }
      })
    }

    console.log('📊 Records to be deleted:')
    console.log(`- Orders: ${beforeCounts.orders}`)
    console.log(`- Products: ${beforeCounts.products}`)
    console.log(`- Categories: ${beforeCounts.categories}`)
    console.log(`- Suppliers: ${beforeCounts.suppliers}`)
    console.log(`- Customers: ${beforeCounts.customers}`)
    console.log(`- Shifts: ${beforeCounts.shifts}`)
    console.log(`- Non-admin users: ${beforeCounts.nonAdminUsers}`)

    console.log('\n🗑️  Deleting data...')

    // Delete in correct order to handle foreign key constraints
    await prisma.orderItem.deleteMany()
    console.log('✅ Deleted order items')

    await prisma.order.deleteMany()
    console.log('✅ Deleted orders')

    await prisma.procurementItem.deleteMany()
    console.log('✅ Deleted procurement items')

    await prisma.procurement.deleteMany()
    console.log('✅ Deleted procurements')

    await prisma.stockOpnameItem.deleteMany()
    console.log('✅ Deleted stock opname items')

    await prisma.stockOpname.deleteMany()
    console.log('✅ Deleted stock opnames')

    // Delete analytics data that references products first
    await prisma.dailyStats.deleteMany()
    await prisma.weeklyStats.deleteMany()
    await prisma.monthlyStats.deleteMany()
    await prisma.productStats.deleteMany()
    await prisma.customerStats.deleteMany()
    await prisma.salesTarget.deleteMany()
    await prisma.inventoryAlert.deleteMany()
    await prisma.cashierPerformance.deleteMany()
    console.log('✅ Deleted analytics data')

    await prisma.product.deleteMany()
    console.log('✅ Deleted products')

    await prisma.category.deleteMany()
    console.log('✅ Deleted categories')

    await prisma.supplier.deleteMany()
    console.log('✅ Deleted suppliers')

    await prisma.customer.deleteMany()
    console.log('✅ Deleted customers')

    await prisma.shift.deleteMany()
    console.log('✅ Deleted shifts')

    // Delete non-admin users
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        id: { notIn: adminIds }
      }
    })
    console.log(`✅ Deleted ${deletedUsers.count} non-admin users`)

    // Show final counts
    const afterCounts = {
      orders: await prisma.order.count(),
      products: await prisma.product.count(),
      categories: await prisma.category.count(),
      suppliers: await prisma.supplier.count(),
      customers: await prisma.customer.count(),
      shifts: await prisma.shift.count(),
      users: await prisma.user.count()
    }

    console.log('\n📊 Database state after cleanup:')
    console.log(`- Orders: ${afterCounts.orders}`)
    console.log(`- Products: ${afterCounts.products}`)
    console.log(`- Categories: ${afterCounts.categories}`)
    console.log(`- Suppliers: ${afterCounts.suppliers}`)
    console.log(`- Customers: ${afterCounts.customers}`)
    console.log(`- Shifts: ${afterCounts.shifts}`)
    console.log(`- Users (admin only): ${afterCounts.users}`)

    console.log('\n🎉 Database cleanup completed successfully!')
    console.log(`✅ Preserved ${adminUsers.length} admin account(s)`)
    
  } catch (error) {
    console.error('\n❌ Error during database cleanup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
clearDatabaseAuto()
  .then(() => {
    console.log('\n✅ Database cleanup script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Database cleanup script failed:', error)
    process.exit(1)
  })
