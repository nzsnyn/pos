import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const payload = await verifyToken(request)
    if (!payload) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    
    if (!dateParam) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 })
    }

    // Parse the date - handle different formats
    let targetDate: Date
    
    // Check if it's in DD/MM/YYYY format
    if (dateParam.includes('/')) {
      const [day, month, year] = dateParam.split('/')
      targetDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    } else {
      // Assume ISO format or other standard format
      targetDate = new Date(dateParam)
    }
    
    // Validate the parsed date
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Fetch all orders for the specified day
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true
              }
            }
          }
        },
        cashier: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match our interface
    const transactions = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      timestamp: order.createdAt.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      total: order.total,
      items: order.items.map(item => ({
        id: item.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price
      })),
      paymentMethod: order.paymentMethod === 'CASH' ? 'Tunai' : 
                   order.paymentMethod === 'CARD' ? 'Kartu' : 
                   order.paymentMethod === 'MOBILE_PAYMENT' ? 'Mobile Payment' : 
                   order.paymentMethod === 'CHECK' ? 'Cek' :
                   order.paymentMethod,
      cashierName: `${order.cashier.firstName} ${order.cashier.lastName}`
    }))

    // Calculate summary statistics
    const totalTransactions = transactions.length
    const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0)
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    // Payment method breakdown
    const paymentMethodStats = transactions.reduce((acc, t) => {
      const method = t.paymentMethod
      if (!acc[method]) {
        acc[method] = { count: 0, amount: 0 }
      }
      acc[method].count += 1
      acc[method].amount += t.total
      return acc
    }, {} as Record<string, { count: number; amount: number }>)

    // Top selling items for the day
    const itemStats = transactions.flatMap(t => t.items).reduce((acc, item) => {
      if (!acc[item.name]) {
        acc[item.name] = { quantity: 0, revenue: 0 }
      }
      acc[item.name].quantity += item.quantity
      acc[item.name].revenue += item.subtotal
      return acc
    }, {} as Record<string, { quantity: number; revenue: number }>)

    const topSellingItems = Object.entries(itemStats)
      .sort(([, a], [, b]) => b.quantity - a.quantity)
      .slice(0, 5)
      .map(([name, stats]) => ({ name, ...stats }))

    return NextResponse.json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        transactions,
        summary: {
          totalTransactions,
          totalRevenue,
          averageOrderValue,
          paymentMethods: paymentMethodStats,
          topSellingItems
        }
      }
    })

  } catch (error) {
    console.error('Day transactions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
