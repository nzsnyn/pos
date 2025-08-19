import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/suppliers - List all suppliers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')
    const limit = searchParams.get('limit')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { storeName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status !== 'all') {
      where.isActive = status === 'active'
    }

    // If no pagination params, return simple array (for forms)
    if (!page && !limit) {
      const suppliers = await prisma.supplier.findMany({
        where,
        orderBy: { name: 'asc' }
      })
      return NextResponse.json(suppliers)
    }

    // Otherwise return paginated response (for tables)
    const pageNum = parseInt(page || '1')
    const limitNum = parseInt(limit || '50')
    const skip = (pageNum - 1) * limitNum

    const [suppliers, totalCount] = await Promise.all([
      prisma.supplier.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.supplier.count({ where })
    ])

    return NextResponse.json({
      suppliers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    })
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data supplier' },
      { status: 500 }
    )
  }
}

// POST /api/suppliers - Create new supplier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, address, storeName, isActive = true } = body

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nama supplier harus diisi' },
        { status: 400 }
      )
    }

    // Check if supplier with same name already exists
    const existingSupplier = await prisma.supplier.findFirst({
      where: { name: name.trim() }
    })

    if (existingSupplier) {
      return NextResponse.json(
        { error: 'Supplier dengan nama ini sudah ada' },
        { status: 400 }
      )
    }

    // Create new supplier
    const supplier = await prisma.supplier.create({
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        storeName: storeName?.trim() || null,
        isActive
      }
    })

    return NextResponse.json({ supplier }, { status: 201 })
  } catch (error) {
    console.error('Error creating supplier:', error)
    return NextResponse.json(
      { error: 'Gagal membuat supplier baru' },
      { status: 500 }
    )
  }
}
