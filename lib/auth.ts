import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface AuthUser {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
}

export async function verifyToken(request: NextRequest): Promise<AuthUser | null> {
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

export function createToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyTokenSync(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}
