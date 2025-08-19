import { PrismaClient } from '@prisma/client'
import * as readline from 'readline'

const prisma = new PrismaClient()

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function askConfirmation(question: string): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y')
    })
  })
}

async function clearDatabaseSafe() {
  try {
    console.log('🚨 WARNING: This will delete ALL data from the database except admin accounts!')
    console.log('This action cannot be undone.\n')

    // Show current admin users
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

    // Get confirmation
    const confirmed = await askConfirmation('Are you sure you want to proceed? Type "yes" to confirm: ')
    
    if (!confirmed) {
      console.log('Operation cancelled.')
      return
    }

    console.log('\n🧹 Starting database cleanup...')

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

    console.log('\n📊 Records to be deleted:')
    console.log(`- Orders: ${beforeCounts.orders}`)
    console.log(`- Products: ${beforeCounts.products}`)
    console.log(`- Categories: ${beforeCounts.categories}`)
    console.log(`- Suppliers: ${beforeCounts.suppliers}`)
    console.log(`- Customers: ${beforeCounts.customers}`)
    console.log(`- Shifts: ${beforeCounts.shifts}`)
    console.log(`- Non-admin users: ${beforeCounts.nonAdminUsers}`)

    // Final confirmation
    const finalConfirm = await askConfirmation('\nProceed with deletion? Type "yes" to continue: ')
    
    if (!finalConfirm) {
      console.log('Operation cancelled.')
      return
    }

    // Start cleanup process
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

    // Delete analytics data
    await prisma.dailyStats.deleteMany()
    await prisma.weeklyStats.deleteMany()
    await prisma.monthlyStats.deleteMany()
    await prisma.productStats.deleteMany()
    await prisma.customerStats.deleteMany()
    await prisma.salesTarget.deleteMany()
    await prisma.inventoryAlert.deleteMany()
    await prisma.cashierPerformance.deleteMany()
    console.log('✅ Deleted analytics data')

    // Delete non-admin users
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        id: { notIn: adminIds }
      }
    })
    console.log(`✅ Deleted ${deletedUsers.count} non-admin users`)

    console.log('\n🎉 Database cleanup completed successfully!')
    console.log(`✅ Preserved ${adminUsers.length} admin account(s)`)
    
  } catch (error) {
    console.error('\n❌ Error during database cleanup:', error)
    throw error
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

// Run the cleanup
clearDatabaseSafe()
  .then(() => {
    console.log('\n✅ Database cleanup script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Database cleanup script failed:', error)
    process.exit(1)
  })
