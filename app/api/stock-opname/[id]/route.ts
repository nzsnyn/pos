import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/stock-opname/[id] - Get single stock opname
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const stockOpname = await prisma.stockOpname.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          },
          orderBy: {
            product: {
              name: 'asc'
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

    if (!stockOpname) {
      return NextResponse.json(
        { error: 'Stok opname tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(stockOpname)
  } catch (error) {
    console.error('Error fetching stock opname:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data stok opname' },
      { status: 500 }
    )
  }
}

// PUT /api/stock-opname/[id] - Update stock opname
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { 
      title,
      notes,
      status,
      items
    } = body

    // Check if stock opname exists
    const existingOpname = await prisma.stockOpname.findUnique({
      where: { id },
      include: { items: true }
    })

    if (!existingOpname) {
      return NextResponse.json(
        { error: 'Stok opname tidak ditemukan' },
        { status: 404 }
      )
    }

    // Don't allow editing if completed
    if (existingOpname.status === 'COMPLETED' && status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Stok opname yang sudah selesai tidak dapat diubah' },
        { status: 400 }
      )
    }

    let updateData: any = {
      updatedAt: new Date()
    }

    // Update basic fields
    if (title) updateData.title = title.trim()
    if (notes !== undefined) updateData.notes = notes ? notes.trim() : null
    if (status) {
      updateData.status = status
      if (status === 'COMPLETED') {
        updateData.completedDate = new Date()
      }
    }

    // Update items if provided
    if (items && items.length > 0) {
      let checkedItems = 0
      let totalDifference = 0

      // Update each item
      for (const item of items) {
        if (item.physicalStock !== null) {
          checkedItems++
          const difference = (item.physicalStock || 0) - item.systemStock
          totalDifference += difference

          await prisma.stockOpnameItem.update({
            where: { id: item.id },
            data: {
              physicalStock: item.physicalStock,
              difference: difference,
              notes: item.notes ? item.notes.trim() : null,
              checkedAt: new Date()
            }
          })
        }
      }

      updateData.checkedItems = checkedItems
      updateData.totalDifference = totalDifference

      // If all items checked, mark as completed
      if (checkedItems === existingOpname.totalItems && status !== 'COMPLETED') {
        updateData.status = 'COMPLETED'
        updateData.completedDate = new Date()
      }
    }

    const stockOpname = await prisma.stockOpname.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          },
          orderBy: {
            product: {
              name: 'asc'
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

    // If completed, optionally update actual stock based on differences
    // This is optional - you may want to require manual approval
    if (updateData.status === 'COMPLETED') {
      // Update product stocks based on differences
      for (const item of stockOpname.items) {
        if (item.physicalStock !== null && item.difference !== 0) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: item.physicalStock
            }
          })
        }
      }
    }

    return NextResponse.json(stockOpname)
  } catch (error) {
    console.error('Error updating stock opname:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui stok opname' },
      { status: 500 }
    )
  }
}

// DELETE /api/stock-opname/[id] - Delete stock opname
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if stock opname exists
    const existingOpname = await prisma.stockOpname.findUnique({
      where: { id }
    })

    if (!existingOpname) {
      return NextResponse.json(
        { error: 'Stok opname tidak ditemukan' },
        { status: 404 }
      )
    }

    // Don't allow deleting if completed
    if (existingOpname.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Stok opname yang sudah selesai tidak dapat dihapus' },
        { status: 400 }
      )
    }

    // Delete stock opname (items will be deleted due to cascade)
    await prisma.stockOpname.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Stok opname berhasil dihapus',
      deletedId: id 
    })
  } catch (error) {
    console.error('Error deleting stock opname:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus stok opname' },
      { status: 500 }
    )
  }
}
