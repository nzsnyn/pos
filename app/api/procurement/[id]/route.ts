import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/procurement/[id] - Get single procurement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const procurement = await prisma.procurement.findUnique({
      where: { id },
      include: {
        supplier: true,
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

    if (!procurement) {
      return NextResponse.json(
        { error: 'Pengadaan tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(procurement)
  } catch (error) {
    console.error('Error fetching procurement:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data pengadaan' },
      { status: 500 }
    )
  }
}

// PUT /api/procurement/[id] - Update procurement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { 
      supplierId, 
      items, 
      status,
      notes,
      receivedDate 
    } = body

    // Check if procurement exists
    const existingProcurement = await prisma.procurement.findUnique({
      where: { id },
      include: { items: true }
    })

    if (!existingProcurement) {
      return NextResponse.json(
        { error: 'Pengadaan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Don't allow editing if already received
    if (existingProcurement.status === 'RECEIVED' && status !== 'RECEIVED') {
      return NextResponse.json(
        { error: 'Pengadaan yang sudah diterima tidak dapat diubah' },
        { status: 400 }
      )
    }

    let updateData: any = {
      supplierId: supplierId || null,
      notes: notes || null,
      updatedAt: new Date()
    }

    if (status) {
      updateData.status = status
      if (status === 'RECEIVED') {
        updateData.receivedDate = receivedDate || new Date()
      }
    }

    // If items are provided, update them
    if (items && items.length > 0) {
      // Calculate new totals
      let totalItems = 0
      let totalAmount = 0

      for (const item of items) {
        totalItems += parseInt(item.quantity)
        totalAmount += parseFloat(item.unitPrice) * parseInt(item.quantity)
      }

      updateData.totalItems = totalItems
      updateData.totalAmount = totalAmount

      // Delete existing items and create new ones
      await prisma.procurementItem.deleteMany({
        where: { procurementId: id }
      })

      updateData.items = {
        create: items.map((item: any) => ({
          productId: item.productId,
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          totalPrice: parseFloat(item.unitPrice) * parseInt(item.quantity)
        }))
      }
    }

    const procurement = await prisma.procurement.update({
      where: { id },
      data: updateData,
      include: {
        supplier: true,
        items: {
          include: {
            product: true
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

    // If status changed to RECEIVED, update product stock
    if (status === 'RECEIVED' && existingProcurement.status !== 'RECEIVED') {
      for (const item of procurement.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        })
      }
    }

    return NextResponse.json(procurement)
  } catch (error) {
    console.error('Error updating procurement:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui pengadaan' },
      { status: 500 }
    )
  }
}

// DELETE /api/procurement/[id] - Delete procurement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if procurement exists
    const existingProcurement = await prisma.procurement.findUnique({
      where: { id }
    })

    if (!existingProcurement) {
      return NextResponse.json(
        { error: 'Pengadaan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Don't allow deleting if already received
    if (existingProcurement.status === 'RECEIVED') {
      return NextResponse.json(
        { error: 'Pengadaan yang sudah diterima tidak dapat dihapus' },
        { status: 400 }
      )
    }

    // Delete procurement (items will be deleted due to cascade)
    await prisma.procurement.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Pengadaan berhasil dihapus',
      deletedId: id 
    })
  } catch (error) {
    console.error('Error deleting procurement:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus pengadaan' },
      { status: 500 }
    )
  }
}
