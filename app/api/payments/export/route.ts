import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const payload = await verifyToken(request)
    if (!payload) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get query parameters (same as history endpoint)
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const method = searchParams.get('method')

    // Build where clause (same logic as history endpoint)
    const whereClause: any = {}

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    if (status) {
      whereClause.paymentStatus = status
    }

    if (method) {
      whereClause.paymentMethod = method
    }

    if (search) {
      whereClause.OR = [
        { orderNumber: { contains: search } },
        { cashier: { firstName: { contains: search } } },
        { cashier: { lastName: { contains: search } } }
      ]
    }

    // Fetch orders for export
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

    // Generate CSV content
    const csvHeaders = [
      'Nomor Order',
      'Tanggal',
      'Waktu', 
      'Kasir',
      'Metode Pembayaran',
      'Status',
      'Jumlah Item',
      'Total Pembayaran',
      'Catatan'
    ]

    const csvRows = orders.map(order => [
      order.orderNumber,
      order.createdAt.toLocaleDateString('id-ID'),
      order.createdAt.toLocaleTimeString('id-ID'),
      `${order.cashier.firstName} ${order.cashier.lastName}`,
      order.paymentMethod,
      order.paymentStatus,
      order.items.length.toString(),
      order.total.toString(),
      order.notes || ''
    ])

    // Create CSV content
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => 
        row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n')

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="payment-history-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Payment export API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
