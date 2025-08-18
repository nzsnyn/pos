import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/suppliers/[id] - Get single supplier
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supplier = await prisma.supplier.findUnique({
      where: { id }
    })

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ supplier })
  } catch (error) {
    console.error('Error fetching supplier:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data supplier' },
      { status: 500 }
    )
  }
}

// PUT /api/suppliers/[id] - Update supplier
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, phone, address, storeName, isActive } = body

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nama supplier harus diisi' },
        { status: 400 }
      )
    }

    // Check if supplier exists
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id }
    })

    if (!existingSupplier) {
      return NextResponse.json(
        { error: 'Supplier tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if another supplier with same name exists (excluding current supplier)
    const duplicateSupplier = await prisma.supplier.findFirst({
      where: {
        name: name.trim(),
        NOT: { id }
      }
    })

    if (duplicateSupplier) {
      return NextResponse.json(
        { error: 'Supplier dengan nama ini sudah ada' },
        { status: 400 }
      )
    }

    // Update supplier
    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        storeName: storeName?.trim() || null,
        isActive: isActive !== undefined ? isActive : existingSupplier.isActive
      }
    })

    return NextResponse.json({ supplier })
  } catch (error) {
    console.error('Error updating supplier:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui supplier' },
      { status: 500 }
    )
  }
}

// DELETE /api/suppliers/[id] - Delete supplier
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Check if supplier exists
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id }
    })

    if (!existingSupplier) {
      return NextResponse.json(
        { error: 'Supplier tidak ditemukan' },
        { status: 404 }
      )
    }

    // TODO: Add check for related records (products, purchase orders, etc.)
    // For now, we'll allow deletion
    
    await prisma.supplier.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Supplier berhasil dihapus',
      deletedId: id 
    })
  } catch (error) {
    console.error('Error deleting supplier:', error)
    
    // Check if it's a foreign key constraint error
    if (error instanceof Error && error.message.includes('foreign key')) {
      return NextResponse.json(
        { error: 'Supplier tidak dapat dihapus karena masih terkait dengan data lain' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Gagal menghapus supplier' },
      { status: 500 }
    )
  }
}
