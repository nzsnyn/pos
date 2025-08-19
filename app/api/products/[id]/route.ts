import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data produk' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { 
      name, 
      description, 
      price, 
      wholesalePrice, 
      stock, 
      categoryId, 
      barcode, 
      image, 
      isActive 
    } = body

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nama produk harus diisi' },
        { status: 400 }
      )
    }

    if (!price || price <= 0) {
      return NextResponse.json(
        { error: 'Harga produk harus lebih dari 0' },
        { status: 400 }
      )
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if barcode is unique (if provided and different from current)
    if (barcode && barcode !== existingProduct.barcode) {
      const duplicateBarcode = await prisma.product.findFirst({
        where: {
          barcode,
          NOT: { id }
        }
      })

      if (duplicateBarcode) {
        return NextResponse.json(
          { error: 'Barcode sudah digunakan produk lain' },
          { status: 400 }
        )
      }
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: parseFloat(price),
        wholesalePrice: wholesalePrice ? parseFloat(wholesalePrice) : null,
        stock: parseInt(stock) || 0,
        categoryId,
        barcode: barcode?.trim() || null,
        image: image?.trim() || null,
        isActive: isActive !== undefined ? isActive : existingProduct.isActive
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui produk' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }

    // Instead of hard delete, we'll set isActive to false (soft delete)
    const product = await prisma.product.update({
      where: { id },
      data: {
        isActive: false
      }
    })

    return NextResponse.json({ 
      message: 'Produk berhasil dihapus',
      deletedId: id 
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    
    // Check if it's a foreign key constraint error
    if (error instanceof Error && error.message.includes('foreign key')) {
      return NextResponse.json(
        { error: 'Produk tidak dapat dihapus karena masih terkait dengan transaksi' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Gagal menghapus produk' },
      { status: 500 }
    )
  }
}