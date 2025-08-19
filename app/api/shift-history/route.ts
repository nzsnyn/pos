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

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const date = searchParams.get('date')
    
    let whereClause: any = {}
    
    // If user is CASHIER, only show their shifts
    if (user.role === 'CASHIER') {
      whereClause.cashierId = user.id
    } else if (userId) {
      whereClause.cashierId = userId
    }
    
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 1)
      
      whereClause.startTime = {
        gte: startDate,
        lt: endDate
      }
    }

    const shifts = await prisma.shift.findMany({
      where: whereClause,
      include: {
        cashier: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    })

    // Calculate additional stats for each shift by finding transactions during shift time
    const shiftsWithStats = await Promise.all(
      shifts.map(async (shift) => {
        let totalTransactions = 0
        let transactionTotal = 0

        if (shift.endTime) {
          // Get transactions that happened during this shift
          const transactions = await prisma.order.findMany({
            where: {
              cashierId: shift.cashierId,
              createdAt: {
                gte: shift.startTime,
                lte: shift.endTime
              },
              status: 'COMPLETED',
              paymentStatus: 'COMPLETED'
            },
            select: {
              total: true
            }
          })

          totalTransactions = transactions.length
          transactionTotal = transactions.reduce((sum, t) => sum + t.total, 0)
        } else if (shift.isActive) {
          // For active shifts, get transactions from start time to now
          const transactions = await prisma.order.findMany({
            where: {
              cashierId: shift.cashierId,
              createdAt: {
                gte: shift.startTime,
                lte: new Date()
              },
              status: 'COMPLETED',
              paymentStatus: 'COMPLETED'
            },
            select: {
              total: true
            }
          })

          totalTransactions = transactions.length
          transactionTotal = transactions.reduce((sum, t) => sum + t.total, 0)
        }

        const duration = shift.endTime ? 
          Math.round((new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60)) : 
          null // in hours

        return {
          ...shift,
          totalTransactions,
          totalSales: transactionTotal,
          duration,
          status: shift.isActive ? 'ACTIVE' : 'COMPLETED',
          initialCash: shift.startBalance,
          finalCash: shift.finalBalance
        }
      })
    )

    return NextResponse.json({ shifts: shiftsWithStats })
  } catch (error) {
    console.error('Error fetching shift history:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil riwayat shift' },
      { status: 500 }
    )
  }
}
