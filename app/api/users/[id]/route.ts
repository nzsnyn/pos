import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET /api/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Karyawan tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Gagal memuat karyawan' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { username, email, firstName, lastName, role, isActive, password } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Karyawan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Validation
    if (!username || !username.trim()) {
      return NextResponse.json(
        { error: 'Username harus diisi' },
        { status: 400 }
      )
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email harus diisi' },
        { status: 400 }
      )
    }

    if (!firstName || !firstName.trim()) {
      return NextResponse.json(
        { error: 'Nama depan harus diisi' },
        { status: 400 }
      )
    }

    if (!lastName || !lastName.trim()) {
      return NextResponse.json(
        { error: 'Nama belakang harus diisi' },
        { status: 400 }
      )
    }

    if (!role || !['ADMIN', 'CASHIER'].includes(role)) {
      return NextResponse.json(
        { error: 'Role tidak valid' },
        { status: 400 }
      )
    }

    if (password && password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      )
    }

    // Check if username is already taken by another user
    const duplicateUsername = await prisma.user.findFirst({
      where: {
        username: username.trim(),
        id: { not: id }
      }
    })

    if (duplicateUsername) {
      return NextResponse.json(
        { error: 'Username sudah digunakan' },
        { status: 400 }
      )
    }

    // Check if email is already taken by another user
    const duplicateEmail = await prisma.user.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        id: { not: id }
      }
    })

    if (duplicateEmail) {
      return NextResponse.json(
        { error: 'Email sudah digunakan' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {
      username: username.trim(),
      email: email.trim().toLowerCase(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: role as 'ADMIN' | 'CASHIER',
      isActive: isActive !== undefined ? Boolean(isActive) : existingUser.isActive,
    }

    // Hash new password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui karyawan' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Delete user permanently
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const permanent = searchParams.get('permanent')

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: true,
        shifts: true,
        procurements: true
      }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Karyawan tidak ditemukan' },
        { status: 404 }
      )
    }

    if (permanent === 'true') {
      // Check if user has any related records
      if (existingUser.orders.length > 0 || 
          existingUser.shifts.length > 0 || 
          existingUser.procurements.length > 0) {
        return NextResponse.json(
          { error: 'Karyawan tidak dapat dihapus karena memiliki riwayat transaksi atau data terkait' },
          { status: 400 }
        )
      }

      // Permanently delete user
      await prisma.user.delete({
        where: { id }
      })

      return NextResponse.json({ 
        message: 'Karyawan berhasil dihapus permanen',
        deletedUser: {
          id: existingUser.id,
          username: existingUser.username,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName
        }
      })
    } else {
      // Soft delete (set isActive to false)
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { isActive: false },
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

      return NextResponse.json({ 
        message: 'Karyawan berhasil dinonaktifkan',
        user: updatedUser 
      })
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus karyawan' },
      { status: 500 }
    )
  }
}
