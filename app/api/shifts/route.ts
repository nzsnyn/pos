import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

async function verifyToken(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return null
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Get current user data
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

    // Get current active shift for the user
    const activeShift = await prisma.shift.findFirst({
      where: {
        cashierId: user.id,
        isActive: true
      },
      include: {
        cashier: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    return NextResponse.json(activeShift)
  } catch (error) {
    console.error('Error fetching shift:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shift' },
      { status: 500 }
    )
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
    const { startBalance } = body

    // Check if user already has an active shift
    const existingShift = await prisma.shift.findFirst({
      where: {
        cashierId: user.id,
        isActive: true
      }
    })

    if (existingShift) {
      return NextResponse.json(
        { error: 'User already has an active shift' },
        { status: 400 }
      )
    }

    // Create new shift
    const shift = await prisma.shift.create({
      data: {
        cashierId: user.id,
        startBalance: parseFloat(startBalance)
      },
      include: {
        cashier: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    return NextResponse.json(shift)
  } catch (error) {
    console.error('Error creating shift:', error)
    return NextResponse.json(
      { error: 'Failed to create shift' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { totalSales, finalBalance, notes } = body

    // Find active shift
    const activeShift = await prisma.shift.findFirst({
      where: {
        cashierId: user.id,
        isActive: true
      }
    })

    if (!activeShift) {
      return NextResponse.json(
        { error: 'No active shift found' },
        { status: 404 }
      )
    }

    // Update shift with final data
    const updatedShift = await prisma.shift.update({
      where: {
        id: activeShift.id
      },
      data: {
        endTime: new Date(),
        totalSales: parseFloat(totalSales),
        finalBalance: parseFloat(finalBalance),
        isActive: false,
        notes
      },
      include: {
        cashier: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    return NextResponse.json(updatedShift)
  } catch (error) {
    console.error('Error ending shift:', error)
    return NextResponse.json(
      { error: 'Failed to end shift' },
      { status: 500 }
    )
  }
}
