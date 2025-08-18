import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/units - List all units
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { symbol: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status !== 'all') {
      where.isActive = status === 'active'
    }

    // Get units with pagination
    const [units, totalCount] = await Promise.all([
      prisma.unit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.unit.count({ where })
    ])

    return NextResponse.json({
      units,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching units:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data unit' },
      { status: 500 }
    )
  }
}

// POST /api/units - Create new unit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, symbol, description, isActive = true } = body

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nama unit harus diisi' },
        { status: 400 }
      )
    }

    if (!symbol || !symbol.trim()) {
      return NextResponse.json(
        { error: 'Simbol unit harus diisi' },
        { status: 400 }
      )
    }

    // Check if unit with same name or symbol already exists
    const existingUnit = await prisma.unit.findFirst({
      where: {
        OR: [
          { name: name.trim() },
          { symbol: symbol.trim() }
        ]
      }
    })

    if (existingUnit) {
      if (existingUnit.name === name.trim()) {
        return NextResponse.json(
          { error: 'Unit dengan nama ini sudah ada' },
          { status: 400 }
        )
      }
      if (existingUnit.symbol === symbol.trim()) {
        return NextResponse.json(
          { error: 'Simbol unit sudah digunakan' },
          { status: 400 }
        )
      }
    }

    // Create new unit
    const unit = await prisma.unit.create({
      data: {
        name: name.trim(),
        symbol: symbol.trim(),
        description: description?.trim() || null,
        isActive
      }
    })

    return NextResponse.json({ unit }, { status: 201 })
  } catch (error) {
    console.error('Error creating unit:', error)
    return NextResponse.json(
      { error: 'Gagal membuat unit baru' },
      { status: 500 }
    )
  }
}
