import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: any = {
      isActive: true,
    }

    if (category && category !== 'all') {
      where.category = {
        name: category
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { category: { name: { contains: search } } }
      ]
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(products)
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
      categoryId, 
      barcode, 
      image 
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

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Kategori produk harus dipilih' },
        { status: 400 }
      )
    }

    // Check if barcode is unique (if provided)
    if (barcode) {
      const existingBarcode = await prisma.product.findFirst({
        where: { barcode }
      })

      if (existingBarcode) {
        return NextResponse.json(
          { error: 'Barcode sudah digunakan' },
          { status: 400 }
        )
      }
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: parseFloat(price),
        wholesalePrice: wholesalePrice ? parseFloat(wholesalePrice) : null,
        stock: parseInt(stock) || 0,
        categoryId,
        barcode: barcode?.trim() || null,
        image: image?.trim() || null,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Gagal membuat produk baru' },
      { status: 500 }
    )
  }
}
