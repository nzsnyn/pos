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
        category: {
          select: {
            id: true,
            name: true
          }
        },
        unit: {
          select: {
            id: true,
            name: true,
            symbol: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }

    // Add computed status
    const productWithStatus = {
      ...product,
      status: product.isActive 
        ? (product.stock === 0 ? 'out_of_stock' : (product.stock <= product.minStock ? 'low_stock' : 'in_stock'))
        : 'inactive'
    }

    return NextResponse.json({ product: productWithStatus })
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
      minStock, 
      image, 
      barcode, 
      sku,
      categoryId, 
      unitId,
      isActive 
    } = body

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

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nama produk harus diisi' },
        { status: 400 }
      )
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Kategori harus dipilih' },
        { status: 400 }
      )
    }

    if (price === undefined || price < 0) {
      return NextResponse.json(
        { error: 'Harga harus diisi dan tidak boleh negatif' },
        { status: 400 }
      )
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 400 }
      )
    }

    // Check if unit exists (if provided)
    if (unitId) {
      const unit = await prisma.unit.findUnique({
        where: { id: unitId }
      })

      if (!unit) {
        return NextResponse.json(
          { error: 'Unit tidak ditemukan' },
          { status: 400 }
        )
      }
    }

    // Check if barcode already exists (if provided and different from current)
    if (barcode && barcode !== existingProduct.barcode) {
      const existingBarcode = await prisma.product.findUnique({
        where: { barcode }
      })

      if (existingBarcode && existingBarcode.id !== id) {
        return NextResponse.json(
          { error: 'Barcode sudah digunakan produk lain' },
          { status: 400 }
        )
      }
    }

    // Check if SKU already exists (if provided and different from current)
    if (sku && sku !== existingProduct.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku }
      })

      if (existingSku && existingSku.id !== id) {
        return NextResponse.json(
          { error: 'SKU sudah digunakan produk lain' },
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
        stock: stock !== undefined ? parseInt(stock) : existingProduct.stock,
        minStock: minStock !== undefined ? parseInt(minStock) : existingProduct.minStock,
        image: image?.trim() || null,
        barcode: barcode?.trim() || null,
        sku: sku?.trim() || null,
        categoryId,
        unitId: unitId || null,
        isActive: isActive !== undefined ? isActive : existingProduct.isActive,
        updatedAt: new Date()
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        unit: {
          select: {
            id: true,
            name: true,
            symbol: true
          }
        }
      }
    })

    // Add computed status
    const productWithStatus = {
      ...product,
      status: product.isActive 
        ? (product.stock === 0 ? 'out_of_stock' : (product.stock <= product.minStock ? 'low_stock' : 'in_stock'))
        : 'inactive'
    }

    return NextResponse.json({ product: productWithStatus })
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

    // Delete product
    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Produk berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus produk' },
      { status: 500 }
    )
  }
}
