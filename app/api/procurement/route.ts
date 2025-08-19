import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/procurement - Get all procurements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const whereClause: any = {}

    if (status && status !== 'all') {
      whereClause.status = status
    }

    if (search) {
      whereClause.OR = [
        { procurementNumber: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { supplier: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    const procurements = await prisma.procurement.findMany({
      where: whereClause,
      include: {
        supplier: true,
        items: {
          include: {
            product: true
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(procurements)
  } catch (error) {
    console.error('Error fetching procurements:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data pengadaan' },
      { status: 500 }
    )
  }
}

// POST /api/procurement - Create new procurement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      supplierId, 
      items, 
      notes,
      createdById 
    } = body

    // Validate required fields
    if (!supplierId) {
      return NextResponse.json(
        { error: 'Supplier harus dipilih' },
        { status: 400 }
      )
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Item pengadaan harus diisi' },
        { status: 400 }
      )
    }

    if (!createdById) {
      return NextResponse.json(
        { error: 'ID pengguna harus diisi' },
        { status: 400 }
      )
    }

    // Generate procurement number
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    
    const lastProcurement = await prisma.procurement.findFirst({
      where: {
        procurementNumber: {
          startsWith: `PO-${year}${month}`
        }
      },
      orderBy: {
        procurementNumber: 'desc'
      }
    })

    let nextNumber = 1
    if (lastProcurement) {
      const lastNumber = parseInt(lastProcurement.procurementNumber.split('-')[2])
      nextNumber = lastNumber + 1
    }

    const procurementNumber = `PO-${year}${month}-${String(nextNumber).padStart(3, '0')}`

    // Calculate totals
    let totalItems = 0
    let totalAmount = 0

    for (const item of items) {
      totalItems += parseInt(item.quantity)
      totalAmount += parseFloat(item.unitPrice) * parseInt(item.quantity)
    }

    // Create procurement with items
    const procurement = await prisma.procurement.create({
      data: {
        procurementNumber,
        supplierId: supplierId || null,
        totalItems,
        totalAmount,
        notes: notes || null,
        createdById,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            totalPrice: parseFloat(item.unitPrice) * parseInt(item.quantity)
          }))
        }
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    return NextResponse.json(procurement, { status: 201 })
  } catch (error) {
    console.error('Error creating procurement:', error)
    return NextResponse.json(
      { error: 'Gagal membuat pengadaan baru' },
      { status: 500 }
    )
  }
}
