import { prisma } from '@/lib/prisma'

export interface Product {
  id: string
  name: string
  description?: string | null
  price: number
  stock: number
  image?: string | null
  barcode?: string | null
  category: {
    id: string
    name: string
  }
  isActive: boolean
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  subtotal: number
}

export interface CreateOrderData {
  items: CartItem[]
  customerId?: string
  cashierId: string
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE_PAYMENT'
  notes?: string
}

export class DatabaseService {
  // Products
  static async getProducts(filters?: {
    category?: string
    search?: string
  }): Promise<Product[]> {
    const where: any = {
      isActive: true,
    }

    if (filters?.category && filters.category !== 'all') {
      where.category = {
        name: filters.category
      }
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
        { category: { name: { contains: filters.search } } }
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

    return products
  }

  static async getProductById(id: string): Promise<Product | null> {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    })
  }

  static async updateProductStock(id: string, quantity: number) {
    return await prisma.product.update({
      where: { id },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    })
  }

  // Categories
  static async getCategories() {
    return await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
    })
  }

  // Orders
  static async createOrder(data: CreateOrderData) {
    const { items, customerId, cashierId, paymentMethod, notes } = data

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    const tax = subtotal * 0.1 // 10% tax rate
    const total = subtotal + tax

    // Generate order number
    const orderCount = await prisma.order.count()
    const orderNumber = `ORD-${Date.now()}-${String(orderCount + 1).padStart(4, '0')}`

    // Create order with items in a transaction
    return await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          cashierId,
          subtotal,
          tax,
          total,
          paymentMethod,
          paymentStatus: 'COMPLETED',
          status: 'COMPLETED',
          notes,
          items: {
            create: items.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.subtotal,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
          cashier: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
            },
          },
        },
      })

      // Update product stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }

      return order
    })
  }

  static async getOrders(page = 1, limit = 10) {
    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
          cashier: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
            },
          },
        },
      }),
      prisma.order.count(),
    ])

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  // Users
  static async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
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
  }

  static async getUserByUsername(username: string) {
    return await prisma.user.findUnique({
      where: { username },
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
  }

  // Settings
  static async getSettings() {
    const settings = await prisma.setting.findMany()
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)
  }

  static async getSetting(key: string) {
    const setting = await prisma.setting.findUnique({
      where: { key },
    })
    return setting?.value
  }

  static async updateSetting(key: string, value: string) {
    return await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  }
}
