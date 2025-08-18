import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, customerId, cashierId, paymentMethod, notes } = body

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    const tax = subtotal * 0.1 // 10% tax rate
    const total = subtotal + tax

    // Generate order number
    const orderCount = await prisma.order.count()
    const orderNumber = `ORD-${Date.now()}-${String(orderCount + 1).padStart(4, '0')}`

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        cashierId,
        subtotal,
        tax,
        total,
        paymentMethod,
        paymentStatus: 'COMPLETED',
        status: 'COMPLETED',
        notes,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
        cashier: true,
      },
    })

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.id },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const orders = await prisma.order.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
        cashier: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    })

    const total = await prisma.order.count()

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
