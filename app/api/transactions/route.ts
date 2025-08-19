import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cashierId = searchParams.get('cashierId')
    const date = searchParams.get('date')
    const status = searchParams.get('status')
    
    let whereClause: any = {}
    
    if (cashierId) {
      whereClause.cashierId = cashierId
    }
    
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 1)
      
      whereClause.createdAt = {
        gte: startDate,
        lt: endDate
      }
    }

    if (status) {
      whereClause.status = status
    }

    const transactions = await prisma.order.findMany({
      where: whereClause,
      include: {
        cashier: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data transaksi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      cashierId, 
      items, 
      total, 
      paymentMethod = 'CASH',
      customerPaid,
      change 
    } = body

    if (!cashierId || !items || !Array.isArray(items) || items.length === 0 || !total) {
      return NextResponse.json(
        { error: 'Data transaksi tidak lengkap' },
        { status: 400 }
      )
    }

    // Validate payment method
    const validPaymentMethods = ['CASH', 'CARD', 'TRANSFER']
    if (!validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Metode pembayaran tidak valid' },
        { status: 400 }
      )
    }

    // Validate items structure
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.price) {
        return NextResponse.json(
          { error: 'Data item transaksi tidak lengkap' },
          { status: 400 }
        )
      }
    }

    // Generate order number
    const orderCount = await prisma.order.count()
    const orderNumber = `ORD-${Date.now()}-${String(orderCount + 1).padStart(4, '0')}`

    // Create order with items
    const transaction = await prisma.order.create({
      data: {
        orderNumber,
        cashierId,
        subtotal: parseFloat(total),
        tax: 0,
        total: parseFloat(total),
        paymentMethod: paymentMethod as any,
        paymentStatus: 'COMPLETED',
        status: 'COMPLETED',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price),
            subtotal: parseInt(item.quantity) * parseFloat(item.price)
          }))
        }
      },
      include: {
        cashier: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: parseInt(item.quantity)
          }
        }
      })
    }

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Gagal membuat transaksi' },
      { status: 500 }
    )
  }
}
