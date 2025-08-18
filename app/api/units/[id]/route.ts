import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/units/[id] - Get single unit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const unit = await prisma.unit.findUnique({
      where: { id }
    })

    if (!unit) {
      return NextResponse.json(
        { error: 'Unit tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ unit })
  } catch (error) {
    console.error('Error fetching unit:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data unit' },
      { status: 500 }
    )
  }
}

// PUT /api/units/[id] - Update unit
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, symbol, description, isActive } = body

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

    // Check if unit exists
    const existingUnit = await prisma.unit.findUnique({
      where: { id }
    })

    if (!existingUnit) {
      return NextResponse.json(
        { error: 'Unit tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if another unit with same name or symbol exists (excluding current unit)
    const duplicateUnit = await prisma.unit.findFirst({
      where: {
        AND: [
          { NOT: { id } },
          {
            OR: [
              { name: name.trim() },
              { symbol: symbol.trim() }
            ]
          }
        ]
      }
    })

    if (duplicateUnit) {
      if (duplicateUnit.name === name.trim()) {
        return NextResponse.json(
          { error: 'Unit dengan nama ini sudah ada' },
          { status: 400 }
        )
      }
      if (duplicateUnit.symbol === symbol.trim()) {
        return NextResponse.json(
          { error: 'Simbol unit sudah digunakan' },
          { status: 400 }
        )
      }
    }

    // Update unit
    const unit = await prisma.unit.update({
      where: { id },
      data: {
        name: name.trim(),
        symbol: symbol.trim(),
        description: description?.trim() || null,
        isActive: isActive !== undefined ? isActive : existingUnit.isActive
      }
    })

    return NextResponse.json({ unit })
  } catch (error) {
    console.error('Error updating unit:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui unit' },
      { status: 500 }
    )
  }
}

// DELETE /api/units/[id] - Delete unit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if unit exists
    const existingUnit = await prisma.unit.findUnique({
      where: { id }
    })

    if (!existingUnit) {
      return NextResponse.json(
        { error: 'Unit tidak ditemukan' },
        { status: 404 }
      )
    }

    // TODO: Add check for related records (products using this unit, etc.)
    // For now, we'll allow deletion
    
    await prisma.unit.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Unit berhasil dihapus',
      deletedId: id 
    })
  } catch (error) {
    console.error('Error deleting unit:', error)
    
    // Check if it's a foreign key constraint error
    if (error instanceof Error && error.message.includes('foreign key')) {
      return NextResponse.json(
        { error: 'Unit tidak dapat dihapus karena masih terkait dengan produk' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Gagal menghapus unit' },
      { status: 500 }
    )
  }
}
