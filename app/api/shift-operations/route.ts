import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

async function verifyToken(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    })

    if (!user || !user.isActive) {
      return null
    }

    return user
  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, startBalance, finalBalance } = body

    if (action === 'start') {
      // Start a new shift
      if (startBalance === undefined || startBalance === null) {
        return NextResponse.json(
          { error: 'Modal awal harus diisi' },
          { status: 400 }
        )
      }

      // Check if user already has an active shift
      const activeShift = await prisma.shift.findFirst({
        where: {
          cashierId: user.id,
          isActive: true,
          endTime: null
        }
      })

      if (activeShift) {
        return NextResponse.json(
          { error: 'Anda sudah memiliki shift aktif' },
          { status: 400 }
        )
      }

      // Create new shift
      const shift = await prisma.shift.create({
        data: {
          cashierId: user.id,
          startTime: new Date(),
          startBalance: parseFloat(startBalance),
          isActive: true,
          totalSales: 0
        },
        include: {
          cashier: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true
            }
          }
        }
      })

      return NextResponse.json({ 
        shift,
        message: 'Shift berhasil dimulai'
      }, { status: 201 })

    } else if (action === 'end') {
      // End the current shift
      const activeShift = await prisma.shift.findFirst({
        where: {
          cashierId: user.id,
          isActive: true,
          endTime: null
        }
      })

      if (!activeShift) {
        return NextResponse.json(
          { error: 'Tidak ada shift aktif untuk diakhiri' },
          { status: 400 }
        )
      }

      // Calculate total sales during shift
      const transactions = await prisma.order.findMany({
        where: {
          cashierId: user.id,
          createdAt: {
            gte: activeShift.startTime,
            lte: new Date()
          },
          status: 'COMPLETED',
          paymentStatus: 'COMPLETED'
        },
        select: {
          total: true
        }
      })

      const totalSales = transactions.reduce((sum, t) => sum + t.total, 0)

      // Update shift
      const updatedShift = await prisma.shift.update({
        where: {
          id: activeShift.id
        },
        data: {
          endTime: new Date(),
          isActive: false,
          totalSales,
          finalBalance: finalBalance ? parseFloat(finalBalance) : null
        },
        include: {
          cashier: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true
            }
          }
        }
      })

      return NextResponse.json({ 
        shift: updatedShift,
        message: 'Shift berhasil diakhiri'
      })

    } else {
      return NextResponse.json(
        { error: 'Aksi tidak valid' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error managing shift:', error)
    return NextResponse.json(
      { error: 'Gagal mengelola shift' },
      { status: 500 }
    )
  }
}
