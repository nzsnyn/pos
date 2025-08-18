import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class DashboardService {
  // Get daily statistics
  static async getDailyStats(date: Date = new Date()) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Always recalculate if it's today's date, otherwise use cached data
    const isToday = startOfDay.getTime() === today.getTime()

    // Get existing daily stats record
    let dailyStats = await prisma.dailyStats.findUnique({
      where: { date: startOfDay },
      include: {
        topSellingProduct: true
      }
    })

    if (!dailyStats || isToday) {
      // Calculate stats for the day
      const stats = await this.calculateDailyStats(startOfDay, endOfDay)
      
      if (dailyStats && isToday) {
        // Update existing record for today
        dailyStats = await prisma.dailyStats.update({
          where: { date: startOfDay },
          data: stats,
          include: {
            topSellingProduct: true
          }
        })
      } else {
        // Create new daily stats record
        dailyStats = await prisma.dailyStats.create({
          data: {
            date: startOfDay,
            ...stats
          },
          include: {
            topSellingProduct: true
          }
        })
      }
    }

    return dailyStats
  }

  // Calculate daily statistics from orders
  private static async calculateDailyStats(startDate: Date, endDate: Date) {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true
      }
    })

    const totalTransactions = orders.length
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
    const totalCustomers = new Set(orders.filter(o => o.customerId).map(o => o.customerId)).size
    const totalItemsSold = orders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    )
    const averageOrderValue = totalTransactions > 0 ? totalSales / totalTransactions : 0

    // Calculate payment method breakdown
    const cashSales = orders.filter(o => o.paymentMethod === 'CASH').reduce((sum, order) => sum + order.total, 0)
    const cardSales = orders.filter(o => o.paymentMethod === 'CARD').reduce((sum, order) => sum + order.total, 0)
    const mobilePaymentSales = orders.filter(o => o.paymentMethod === 'MOBILE_PAYMENT').reduce((sum, order) => sum + order.total, 0)

    // Calculate profit (assuming profit is price - wholesale price)
    const totalProfit = orders.reduce((sum, order) => {
      const orderProfit = order.items.reduce((itemSum, item) => {
        const profit = item.product.wholesalePrice 
          ? (item.price - item.product.wholesalePrice) * item.quantity 
          : item.price * 0.3 * item.quantity // Default 30% margin
        return itemSum + profit
      }, 0)
      return sum + orderProfit
    }, 0)

    // Find top selling product
    const productSales = new Map<string, { product: any, quantity: number }>()
    orders.forEach(order => {
      order.items.forEach(item => {
        const existing = productSales.get(item.productId)
        if (existing) {
          existing.quantity += item.quantity
        } else {
          productSales.set(item.productId, {
            product: item.product,
            quantity: item.quantity
          })
        }
      })
    })

    let topSellingProductId = null
    let topSellingProductQty = 0
    
    for (const [productId, data] of productSales) {
      if (data.quantity > topSellingProductQty) {
        topSellingProductId = productId
        topSellingProductQty = data.quantity
      }
    }

    return {
      totalTransactions,
      totalSales,
      totalProfit,
      totalCustomers,
      totalItemsSold,
      averageOrderValue,
      cashSales,
      cardSales,
      mobilePaymentSales,
      topSellingProductId,
      topSellingProductQty
    }
  }

  // Get weekly statistics
  static async getWeeklyStats(date: Date = new Date()) {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // End of week (Saturday)
    endOfWeek.setHours(23, 59, 59, 999)

    const today = new Date()
    const currentWeekStart = new Date(today)
    currentWeekStart.setDate(today.getDate() - today.getDay())
    currentWeekStart.setHours(0, 0, 0, 0)
    
    // Always recalculate if it's the current week, otherwise use cached data
    const isCurrentWeek = startOfWeek.getTime() === currentWeekStart.getTime()

    let weeklyStats = await prisma.weeklyStats.findUnique({
      where: { weekStart: startOfWeek },
      include: {
        topSellingProduct: true
      }
    })

    if (!weeklyStats || isCurrentWeek) {
      const stats = await this.calculateWeeklyStats(startOfWeek, endOfWeek)
      
      if (weeklyStats && isCurrentWeek) {
        // Update existing record for current week
        weeklyStats = await prisma.weeklyStats.update({
          where: { weekStart: startOfWeek },
          data: stats,
          include: {
            topSellingProduct: true
          }
        })
      } else {
        // Create new weekly stats record
        weeklyStats = await prisma.weeklyStats.create({
          data: {
            weekStart: startOfWeek,
            weekEnd: endOfWeek,
            ...stats
          },
          include: {
            topSellingProduct: true
          }
        })
      }
    }

    return weeklyStats
  }

  // Calculate weekly statistics
  private static async calculateWeeklyStats(startDate: Date, endDate: Date) {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Group orders by day to find best sales day
    const dailySales = new Map<string, number>()
    orders.forEach(order => {
      const dayKey = order.createdAt.toISOString().split('T')[0]
      const existing = dailySales.get(dayKey) || 0
      dailySales.set(dayKey, existing + order.total)
    })

    let bestSalesDay = null
    let bestSalesDayAmount = 0
    
    for (const [day, amount] of dailySales) {
      if (amount > bestSalesDayAmount) {
        bestSalesDay = new Date(day)
        bestSalesDayAmount = amount
      }
    }

    // Calculate basic stats (similar to daily but for the week)
    const totalTransactions = orders.length
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
    const totalCustomers = new Set(orders.filter(o => o.customerId).map(o => o.customerId)).size
    const totalItemsSold = orders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    )
    const averageOrderValue = totalTransactions > 0 ? totalSales / totalTransactions : 0

    const totalProfit = orders.reduce((sum, order) => {
      const orderProfit = order.items.reduce((itemSum, item) => {
        const profit = item.product.wholesalePrice 
          ? (item.price - item.product.wholesalePrice) * item.quantity 
          : item.price * 0.3 * item.quantity
        return itemSum + profit
      }, 0)
      return sum + orderProfit
    }, 0)

    // Find top selling product for the week
    const productSales = new Map<string, number>()
    orders.forEach(order => {
      order.items.forEach(item => {
        const existing = productSales.get(item.productId) || 0
        productSales.set(item.productId, existing + item.quantity)
      })
    })

    let topSellingProductId = null
    let topSellingProductQty = 0
    
    for (const [productId, quantity] of productSales) {
      if (quantity > topSellingProductQty) {
        topSellingProductId = productId
        topSellingProductQty = quantity
      }
    }

    return {
      totalTransactions,
      totalSales,
      totalProfit,
      totalCustomers,
      totalItemsSold,
      averageOrderValue,
      bestSalesDay,
      bestSalesDayAmount,
      topSellingProductId,
      topSellingProductQty
    }
  }

  // Get monthly statistics
  static async getMonthlyStats(month: number = new Date().getMonth() + 1, year: number = new Date().getFullYear()) {
    const today = new Date()
    const currentMonth = today.getMonth() + 1
    const currentYear = today.getFullYear()
    
    // Always recalculate if it's the current month, otherwise use cached data
    const isCurrentMonth = month === currentMonth && year === currentYear

    let monthlyStats = await prisma.monthlyStats.findUnique({
      where: { 
        month_year: {
          month,
          year
        }
      },
      include: {
        topSellingProduct: true
      }
    })

    if (!monthlyStats || isCurrentMonth) {
      const startOfMonth = new Date(year, month - 1, 1)
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999)
      
      const stats = await this.calculateMonthlyStats(startOfMonth, endOfMonth)
      
      if (monthlyStats && isCurrentMonth) {
        // Update existing record for current month
        monthlyStats = await prisma.monthlyStats.update({
          where: { 
            month_year: {
              month,
              year
            }
          },
          data: stats,
          include: {
            topSellingProduct: true
          }
        })
      } else {
        // Create new monthly stats record
        monthlyStats = await prisma.monthlyStats.create({
          data: {
            month,
            year,
            ...stats
          },
          include: {
            topSellingProduct: true
          }
        })
      }
    }

    return monthlyStats
  }

  // Calculate monthly statistics
  private static async calculateMonthlyStats(startDate: Date, endDate: Date) {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Similar calculations as weekly stats
    const dailySales = new Map<string, number>()
    orders.forEach(order => {
      const dayKey = order.createdAt.toISOString().split('T')[0]
      const existing = dailySales.get(dayKey) || 0
      dailySales.set(dayKey, existing + order.total)
    })

    let bestSalesDay = null
    let bestSalesDayAmount = 0
    
    for (const [day, amount] of dailySales) {
      if (amount > bestSalesDayAmount) {
        bestSalesDay = new Date(day)
        bestSalesDayAmount = amount
      }
    }

    const totalTransactions = orders.length
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
    const totalCustomers = new Set(orders.filter(o => o.customerId).map(o => o.customerId)).size
    const totalItemsSold = orders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    )
    const averageOrderValue = totalTransactions > 0 ? totalSales / totalTransactions : 0

    const totalProfit = orders.reduce((sum, order) => {
      const orderProfit = order.items.reduce((itemSum, item) => {
        const profit = item.product.wholesalePrice 
          ? (item.price - item.product.wholesalePrice) * item.quantity 
          : item.price * 0.3 * item.quantity
        return itemSum + profit
      }, 0)
      return sum + orderProfit
    }, 0)

    const productSales = new Map<string, number>()
    orders.forEach(order => {
      order.items.forEach(item => {
        const existing = productSales.get(item.productId) || 0
        productSales.set(item.productId, existing + item.quantity)
      })
    })

    let topSellingProductId = null
    let topSellingProductQty = 0
    
    for (const [productId, quantity] of productSales) {
      if (quantity > topSellingProductQty) {
        topSellingProductId = productId
        topSellingProductQty = quantity
      }
    }

    return {
      totalTransactions,
      totalSales,
      totalProfit,
      totalCustomers,
      totalItemsSold,
      averageOrderValue,
      bestSalesDay,
      bestSalesDayAmount,
      topSellingProductId,
      topSellingProductQty
    }
  }

  // Get comprehensive dashboard data
  static async getDashboardData() {
    const today = new Date()
    const dailyStats = await this.getDailyStats(today)
    const weeklyStats = await this.getWeeklyStats(today)
    const monthlyStats = await this.getMonthlyStats(today.getMonth() + 1, today.getFullYear())

    // Get previous period data for comparison
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const previousDailyStats = await this.getDailyStats(yesterday)

    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)
    const previousWeeklyStats = await this.getWeeklyStats(lastWeek)

    const lastMonth = today.getMonth() === 0 ? 12 : today.getMonth()
    const lastMonthYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear()
    const previousMonthlyStats = await this.getMonthlyStats(lastMonth, lastMonthYear)

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    return {
      daily: {
        current: dailyStats,
        previous: previousDailyStats,
        changes: {
          transactions: calculateChange(dailyStats.totalTransactions, previousDailyStats.totalTransactions),
          sales: calculateChange(dailyStats.totalSales, previousDailyStats.totalSales),
          profit: calculateChange(dailyStats.totalProfit, previousDailyStats.totalProfit),
          customers: calculateChange(dailyStats.totalCustomers, previousDailyStats.totalCustomers),
          itemsSold: calculateChange(dailyStats.totalItemsSold, previousDailyStats.totalItemsSold)
        }
      },
      weekly: {
        current: weeklyStats,
        previous: previousWeeklyStats,
        changes: {
          transactions: calculateChange(weeklyStats.totalTransactions, previousWeeklyStats.totalTransactions),
          sales: calculateChange(weeklyStats.totalSales, previousWeeklyStats.totalSales),
          profit: calculateChange(weeklyStats.totalProfit, previousWeeklyStats.totalProfit),
          customers: calculateChange(weeklyStats.totalCustomers, previousWeeklyStats.totalCustomers),
          itemsSold: calculateChange(weeklyStats.totalItemsSold, previousWeeklyStats.totalItemsSold)
        }
      },
      monthly: {
        current: monthlyStats,
        previous: previousMonthlyStats,
        changes: {
          transactions: calculateChange(monthlyStats.totalTransactions, previousMonthlyStats.totalTransactions),
          sales: calculateChange(monthlyStats.totalSales, previousMonthlyStats.totalSales),
          profit: calculateChange(monthlyStats.totalProfit, previousMonthlyStats.totalProfit),
          customers: calculateChange(monthlyStats.totalCustomers, previousMonthlyStats.totalCustomers),
          itemsSold: calculateChange(monthlyStats.totalItemsSold, previousMonthlyStats.totalItemsSold)
        }
      }
    }
  }

  // Update product statistics
  static async updateProductStats(productId: string, date: Date = new Date()) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: 'COMPLETED',
        items: {
          some: {
            productId: productId
          }
        }
      },
      include: {
        items: {
          where: {
            productId: productId
          },
          include: {
            product: true
          }
        }
      }
    })

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) return null

    const quantitySold = orders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    )
    
    const revenue = orders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.subtotal, 0), 0
    )

    const profit = orders.reduce((sum, order) => {
      const orderProfit = order.items.reduce((itemSum, item) => {
        const profitPerItem = item.product.wholesalePrice 
          ? (item.price - item.product.wholesalePrice) 
          : item.price * 0.3
        return itemSum + (profitPerItem * item.quantity)
      }, 0)
      return sum + orderProfit
    }, 0)

    const averagePrice = quantitySold > 0 ? revenue / quantitySold : 0

    await prisma.productStats.upsert({
      where: {
        productId_date: {
          productId: productId,
          date: startOfDay
        }
      },
      update: {
        quantitySold,
        revenue,
        profit,
        averagePrice,
        stockAtEnd: product.stock
      },
      create: {
        productId: productId,
        date: startOfDay,
        quantitySold,
        revenue,
        profit,
        averagePrice,
        stockAtStart: product.stock,
        stockAtEnd: product.stock
      }
    })
  }

  // Get low stock alerts
  static async getLowStockAlerts() {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: 10 // Low stock threshold
        },
        isActive: true
      }
    })

    const alerts = []
    
    for (const product of lowStockProducts) {
      let alertType = 'LOW_STOCK'
      let priority = 'MEDIUM'
      
      if (product.stock === 0) {
        alertType = 'OUT_OF_STOCK'
        priority = 'CRITICAL'
      } else if (product.stock <= 5) {
        priority = 'HIGH'
      }

      // Check if alert already exists
      const existingAlert = await prisma.inventoryAlert.findFirst({
        where: {
          productId: product.id,
          isResolved: false
        }
      })

      if (!existingAlert) {
        const alert = await prisma.inventoryAlert.create({
          data: {
            productId: product.id,
            alertType: alertType as any,
            threshold: 10,
            currentStock: product.stock,
            priority: priority as any,
            message: `${product.name} tersisa ${product.stock} barang`
          },
          include: {
            product: true
          }
        })
        alerts.push(alert)
      } else {
        alerts.push({
          ...existingAlert,
          product: product
        })
      }
    }

    return alerts
  }

  // Get sales vs profit chart data for a specific period
  static async getSalesProfitChartData(days: number = 30) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)
    
    const chartData = []
    
    // Generate data for each day
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)
      
      const dayStart = new Date(currentDate)
      dayStart.setHours(0, 0, 0, 0)
      
      const dayEnd = new Date(currentDate)
      dayEnd.setHours(23, 59, 59, 999)
      
      // Get orders for this day
      const orders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd
          },
          status: 'COMPLETED'
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })
      
      const dailySales = orders.reduce((sum, order) => sum + order.total, 0)
      
      // Calculate daily profit
      const dailyProfit = orders.reduce((sum, order) => {
        const orderProfit = order.items.reduce((itemSum, item) => {
          const profit = item.product.wholesalePrice 
            ? (item.price - item.product.wholesalePrice) * item.quantity 
            : item.price * 0.3 * item.quantity // Default 30% margin if no wholesale price
          return itemSum + profit
        }, 0)
        return sum + orderProfit
      }, 0)
      
      const profitMargin = dailySales > 0 ? (dailyProfit / dailySales) * 100 : 0
      
      chartData.push({
        date: currentDate.toLocaleDateString('id-ID', { 
          day: '2-digit', 
          month: '2-digit' 
        }),
        sales: dailySales,
        profit: dailyProfit,
        profitMargin: profitMargin
      })
    }
    
    return chartData
  }

  // Get weekly comparison chart data
  static async getWeeklySalesProfitData() {
    const weeks = 8 // Last 8 weeks
    const chartData = []
    
    for (let i = weeks - 1; i >= 0; i--) {
      const weekEnd = new Date()
      weekEnd.setDate(weekEnd.getDate() - (i * 7))
      
      const weekStart = new Date(weekEnd)
      weekStart.setDate(weekEnd.getDate() - 6)
      weekStart.setHours(0, 0, 0, 0)
      
      weekEnd.setHours(23, 59, 59, 999)
      
      const orders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: weekStart,
            lte: weekEnd
          },
          status: 'COMPLETED'
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })
      
      const weeklySales = orders.reduce((sum, order) => sum + order.total, 0)
      
      const weeklyProfit = orders.reduce((sum, order) => {
        const orderProfit = order.items.reduce((itemSum, item) => {
          const profit = item.product.wholesalePrice 
            ? (item.price - item.product.wholesalePrice) * item.quantity 
            : item.price * 0.3 * item.quantity
          return itemSum + profit
        }, 0)
        return sum + orderProfit
      }, 0)
      
      const profitMargin = weeklySales > 0 ? (weeklyProfit / weeklySales) * 100 : 0
      
      chartData.push({
        date: `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`,
        sales: weeklySales,
        profit: weeklyProfit,
        profitMargin: profitMargin
      })
    }
    
    return chartData
  }
}
