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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const method = searchParams.get('method')

    // Build where clause
    const whereClause: any = {}

    // Date range filter
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Status filter
    if (status) {
      whereClause.paymentStatus = status
    }

    // Payment method filter
    if (method) {
      whereClause.paymentMethod = method
    }

    // Search filter
    if (search) {
      whereClause.OR = [
        { orderNumber: { contains: search } },
        { cashier: { firstName: { contains: search } } },
        { cashier: { lastName: { contains: search } } }
      ]
    }

    // Fetch orders with payment information
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true
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

    // Transform the data
    const payments = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      date: order.createdAt.toLocaleDateString('id-ID'),
      time: order.createdAt.toLocaleTimeString('id-ID'),
      amount: order.total,
      method: order.paymentMethod,
      status: order.paymentStatus,
      statusText: order.paymentStatus === 'COMPLETED' ? 'Berhasil' :
                 order.paymentStatus === 'PENDING' ? 'Menunggu' :
                 order.paymentStatus === 'FAILED' ? 'Gagal' :
                 order.paymentStatus,
      cashierName: `${order.cashier.firstName} ${order.cashier.lastName}`,
      items: order.items.map(item => ({
        id: item.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      })),
      notes: order.notes
    }))

    // Calculate summary
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalTransactions = payments.length
    const completedCount = payments.filter(p => p.status === 'COMPLETED').length
    const pendingCount = payments.filter(p => p.status === 'PENDING').length
    const failedCount = payments.filter(p => p.status === 'FAILED').length
    const completedPercentage = totalTransactions > 0 ? Math.round((completedCount / totalTransactions) * 100) : 0

    const summary = {
      totalAmount,
      totalTransactions,
      completedCount,
      pendingCount,
      failedCount,
      completedPercentage
    }

    return NextResponse.json({
      success: true,
      data: {
        payments,
        summary
      }
    })

  } catch (error) {
    console.error('Payment history API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
