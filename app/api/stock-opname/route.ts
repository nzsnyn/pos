import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/stock-opname - Get all stock opnames
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
        { opnameNumber: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ]
    }

    const stockOpnames = await prisma.stockOpname.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
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

    return NextResponse.json(stockOpnames)
  } catch (error) {
    console.error('Error fetching stock opnames:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data stok opname' },
      { status: 500 }
    )
  }
}

// POST /api/stock-opname - Create new stock opname
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      title,
      notes,
      createdById,
      productIds
    } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Judul stok opname harus diisi' },
        { status: 400 }
      )
    }

    if (!createdById) {
      return NextResponse.json(
        { error: 'ID pengguna harus diisi' },
        { status: 400 }
      )
    }

    // Generate stock opname number
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    
    // Find the last stock opname number for this month
    const lastOpname = await prisma.stockOpname.findFirst({
      where: {
        opnameNumber: {
          startsWith: `SO-${year}${month}`
        }
      },
      orderBy: {
        opnameNumber: 'desc'
      }
    })

    let sequenceNumber = 1
    if (lastOpname) {
      const lastNumber = parseInt(lastOpname.opnameNumber.split('-')[2])
      sequenceNumber = lastNumber + 1
    }

    const opnameNumber = `SO-${year}${month}${String(sequenceNumber).padStart(3, '0')}`

    // Get products to include in the stock opname
    let products
    if (productIds && productIds.length > 0) {
      // Specific products selected
      products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
          isActive: true
        },
        include: {
          category: true
        }
      })
    } else {
      // Include all active products
      products = await prisma.product.findMany({
        where: {
          isActive: true
        },
        include: {
          category: true
        }
      })
    }

    // Create stock opname with items
    const stockOpname = await prisma.stockOpname.create({
      data: {
        opnameNumber,
        title: title.trim(),
        status: 'DRAFT',
        totalItems: products.length,
        checkedItems: 0,
        totalDifference: 0,
        startDate: new Date(),
        notes: notes ? notes.trim() : null,
        createdById,
        items: {
          create: products.map(product => ({
            productId: product.id,
            systemStock: product.stock,
            physicalStock: null,
            difference: 0
          }))
        }
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
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

    return NextResponse.json(stockOpname, { status: 201 })
  } catch (error) {
    console.error('Error creating stock opname:', error)
    return NextResponse.json(
      { error: 'Gagal membuat stok opname' },
      { status: 500 }
    )
  }
}
