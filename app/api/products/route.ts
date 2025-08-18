import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || 'all'
    const status = searchParams.get('status') || 'all'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category !== 'all') {
      where.categoryId = category
    }

    if (status !== 'all') {
      if (status === 'active') {
        where.isActive = true
      } else if (status === 'inactive') {
        where.isActive = false
      } else if (status === 'low_stock') {
        // Products where stock is less than or equal to minStock
        where.AND = [
          { isActive: true }
        ]
      } else if (status === 'out_of_stock') {
        where.AND = [
          { isActive: true },
          { stock: { equals: 0 } }
        ]
      }
    }

    // Get products with related data
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    // Add computed status for each product
    const productsWithStatus = products.map(product => ({
      ...product,
      status: product.isActive 
        ? (product.stock === 0 ? 'out_of_stock' : (product.stock <= product.minStock ? 'low_stock' : 'in_stock'))
        : 'inactive'
    }))

    return NextResponse.json({
      products: productsWithStatus,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data produk' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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
      isActive = true 
    } = body

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

    // Check if barcode already exists (if provided)
    if (barcode) {
      const existingBarcode = await prisma.product.findUnique({
        where: { barcode }
      })

      if (existingBarcode) {
        return NextResponse.json(
          { error: 'Barcode sudah digunakan produk lain' },
          { status: 400 }
        )
      }
    }

    // Check if SKU already exists (if provided)
    if (sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku }
      })

      if (existingSku) {
        return NextResponse.json(
          { error: 'SKU sudah digunakan produk lain' },
          { status: 400 }
        )
      }
    }

    // Create new product
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: parseFloat(price),
        wholesalePrice: wholesalePrice ? parseFloat(wholesalePrice) : null,
        stock: parseInt(stock || 0),
        minStock: parseInt(minStock || 5),
        image: image?.trim() || null,
        barcode: barcode?.trim() || null,
        sku: sku?.trim() || null,
        categoryId,
        unitId: unitId || null,
        isActive
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

    return NextResponse.json({ product: productWithStatus }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Gagal membuat produk baru' },
      { status: 500 }
    )
  }
}
