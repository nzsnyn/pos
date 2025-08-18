import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedDayTransactions() {
  try {
    console.log('🌱 Seeding day transactions...')

    // Get the first active user as cashier
    const cashier = await prisma.user.findFirst({
      where: { isActive: true }
    })

    if (!cashier) {
      throw new Error('No active user found for cashier')
    }

    // Get some products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      take: 10
    })

    if (products.length === 0) {
      throw new Error('No active products found')
    }

    // Create transactions for the last 7 days
    const today = new Date()
    
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const targetDate = new Date(today)
      targetDate.setDate(today.getDate() - dayOffset)
      
      // Generate 3-8 transactions per day
      const transactionCount = Math.floor(Math.random() * 6) + 3
      
      for (let i = 0; i < transactionCount; i++) {
        // Random time during the day (9 AM to 9 PM)
        const hour = Math.floor(Math.random() * 12) + 9
        const minute = Math.floor(Math.random() * 60)
        const transactionTime = new Date(targetDate)
        transactionTime.setHours(hour, minute, 0, 0)
        
        // Random payment method
        const paymentMethods = ['CASH', 'CARD', 'MOBILE_PAYMENT']
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
        
        // Random number of items (1-4)
        const itemCount = Math.floor(Math.random() * 4) + 1
        const selectedProducts = []
        
        for (let j = 0; j < itemCount; j++) {
          const randomProduct = products[Math.floor(Math.random() * products.length)]
          const quantity = Math.floor(Math.random() * 3) + 1
          
          selectedProducts.push({
            product: randomProduct,
            quantity,
            price: randomProduct.price,
            subtotal: randomProduct.price * quantity
          })
        }
        
        const total = selectedProducts.reduce((sum, item) => sum + item.subtotal, 0)
        const subtotal = total
        const tax = total * 0.1 // 10% tax
        const finalTotal = subtotal + tax
        
        // Create the order
        const order = await prisma.order.create({
          data: {
            orderNumber: `ORD-${Date.now()}-${i}`,
            subtotal,
            tax,
            total: finalTotal,
            paymentMethod: paymentMethod as any,
            cashierId: cashier.id,
            createdAt: transactionTime,
            updatedAt: transactionTime,
            items: {
              create: selectedProducts.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.subtotal
              }))
            }
          }
        })
        
        console.log(`Created order ${order.orderNumber} for ${targetDate.toDateString()}`)
      }
    }
    
    console.log('✅ Day transactions seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding day transactions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  seedDayTransactions()
}

export default seedDayTransactions
