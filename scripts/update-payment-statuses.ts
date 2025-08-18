import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updatePaymentStatuses() {
  try {
    console.log('🔄 Updating payment statuses...')

    // Get all orders
    const orders = await prisma.order.findMany()
    
    if (orders.length === 0) {
      console.log('No orders found to update')
      return
    }

    // Update payment statuses with variety
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i]
      
      // Create variety in payment statuses
      let paymentStatus: 'COMPLETED' | 'PENDING' | 'FAILED'
      
      if (i % 10 === 0) {
        paymentStatus = 'FAILED' // 10% failed
      } else if (i % 5 === 0) {
        paymentStatus = 'PENDING' // 20% pending
      } else {
        paymentStatus = 'COMPLETED' // 70% completed
      }
      
      await prisma.order.update({
        where: { id: order.id },
        data: { 
          paymentStatus,
          notes: paymentStatus === 'FAILED' ? 'Pembayaran gagal diproses' :
                 paymentStatus === 'PENDING' ? 'Menunggu konfirmasi pembayaran' :
                 null
        }
      })
      
      console.log(`Updated order ${order.orderNumber} to ${paymentStatus}`)
    }
    
    console.log('✅ Payment statuses updated successfully!')
    
    // Show summary
    const summary = await prisma.order.groupBy({
      by: ['paymentStatus'],
      _count: {
        paymentStatus: true
      }
    })
    
    console.log('\n📊 Payment Status Summary:')
    summary.forEach(item => {
      console.log(`${item.paymentStatus}: ${item._count.paymentStatus} orders`)
    })
    
  } catch (error) {
    console.error('❌ Error updating payment statuses:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  updatePaymentStatuses()
}

export default updatePaymentStatuses
