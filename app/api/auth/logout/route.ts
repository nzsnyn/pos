import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    // Get the current user from token to end their shift
    const token = request.cookies.get('auth-token')?.value
    let userId: string | null = null

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any
        userId = decoded.userId
      } catch (error) {
        console.error('Token verification error during logout:', error)
      }
    }

    // If we have a valid user ID, end any active shifts
    if (userId) {
      try {
        // Find any active shift for this user
        const activeShift = await prisma.shift.findFirst({
          where: {
            cashierId: userId,
            endTime: null,
            isActive: true
          }
        })

        if (activeShift) {
          // End the active shift
          await prisma.shift.update({
            where: {
              id: activeShift.id
            },
            data: {
              endTime: new Date(),
              isActive: false
              // Note: finalBalance would need to be handled separately via a manual process
              // as we don't have that information during automatic logout
            }
          })
          
          console.log(`Automatically ended shift ${activeShift.id} for user ${userId} during logout`)
        }
      } catch (shiftError) {
        console.error('Error ending shift during logout:', shiftError)
        // Continue with logout even if shift ending fails
      }
    }

    const response = NextResponse.json({
      message: 'Logout successful'
    })

    // Clear the auth token cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
