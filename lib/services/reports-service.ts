import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface DailySalesReport {
  date: string
  transactions: number
  revenue: number
  profit: number
  topProduct: string
  topProductQuantity: number
  averageOrderValue: number
  cashSales: number
  cardSales: number
  mobilePaymentSales: number
}

export interface SalesReportSummary {
  totalRevenue: number
  totalTransactions: number
  totalProfit: number
  totalCustomers: number
  averageOrderValue: number
  profitMargin: number
  periodComparison: {
    revenueChange: number
    transactionChange: number
    profitChange: number
  }
}

export interface ProductSalesReport {
  id: string
  name: string
  quantitySold: number
  revenue: number
  profit: number
  category: string
}

export interface PaymentMethodReport {
  method: string
  count: number
  amount: number
  percentage: number
}

export class ReportsService {
  // Get daily sales report for a date range
  static async getDailySalesReport(startDate: Date, endDate: Date): Promise<DailySalesReport[]> {
    const reports: DailySalesReport[] = []
    
    // Loop through each day in the range
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
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
          },
          customer: true
        }
      })

      const transactions = orders.length
      const revenue = orders.reduce((sum, order) => sum + order.total, 0)
      
      // Calculate profit
      const profit = orders.reduce((sum, order) => {
        const orderProfit = order.items.reduce((itemSum, item) => {
          const itemProfit = item.product.wholesalePrice 
            ? (item.price - item.product.wholesalePrice) * item.quantity 
            : item.price * 0.3 * item.quantity // Default 30% margin
          return itemSum + itemProfit
        }, 0)
        return sum + orderProfit
      }, 0)

      // Find top selling product for the day
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

      let topProduct = "Tidak ada"
      let topProductQuantity = 0
      
      for (const [_, data] of productSales) {
        if (data.quantity > topProductQuantity) {
          topProduct = data.product.name
          topProductQuantity = data.quantity
        }
      }

      const averageOrderValue = transactions > 0 ? revenue / transactions : 0

      // Payment method breakdown
      const cashSales = orders.filter(o => o.paymentMethod === 'CASH').reduce((sum, order) => sum + order.total, 0)
      const cardSales = orders.filter(o => o.paymentMethod === 'CARD').reduce((sum, order) => sum + order.total, 0)
      const mobilePaymentSales = orders.filter(o => o.paymentMethod === 'MOBILE_PAYMENT').reduce((sum, order) => sum + order.total, 0)

      reports.push({
        date: currentDate.toLocaleDateString('id-ID'),
        transactions,
        revenue,
        profit,
        topProduct,
        topProductQuantity,
        averageOrderValue,
        cashSales,
        cardSales,
        mobilePaymentSales
      })
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return reports.reverse() // Most recent first
  }

  // Get sales summary for a period
  static async getSalesSummary(startDate: Date, endDate: Date): Promise<SalesReportSummary> {
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

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const totalTransactions = orders.length
    const totalCustomers = new Set(orders.filter(o => o.customerId).map(o => o.customerId)).size

    const totalProfit = orders.reduce((sum, order) => {
      const orderProfit = order.items.reduce((itemSum, item) => {
        const itemProfit = item.product.wholesalePrice 
          ? (item.price - item.product.wholesalePrice) * item.quantity 
          : item.price * 0.3 * item.quantity
        return itemSum + itemProfit
      }, 0)
      return sum + orderProfit
    }, 0)

    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

    // Get comparison period (same duration, previous period)
    const periodLength = endDate.getTime() - startDate.getTime()
    const previousEndDate = new Date(startDate.getTime() - 1)
    const previousStartDate = new Date(previousEndDate.getTime() - periodLength)

    const previousOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: previousStartDate,
          lte: previousEndDate
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

    const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total, 0)
    const previousTransactions = previousOrders.length
    const previousProfit = previousOrders.reduce((sum, order) => {
      const orderProfit = order.items.reduce((itemSum, item) => {
        const itemProfit = item.product.wholesalePrice 
          ? (item.price - item.product.wholesalePrice) * item.quantity 
          : item.price * 0.3 * item.quantity
        return itemSum + itemProfit
      }, 0)
      return sum + orderProfit
    }, 0)

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    return {
      totalRevenue,
      totalTransactions,
      totalProfit,
      totalCustomers,
      averageOrderValue,
      profitMargin,
      periodComparison: {
        revenueChange: calculateChange(totalRevenue, previousRevenue),
        transactionChange: calculateChange(totalTransactions, previousTransactions),
        profitChange: calculateChange(totalProfit, previousProfit)
      }
    }
  }

  // Get product sales report
  static async getProductSalesReport(startDate: Date, endDate: Date, limit: number = 10): Promise<ProductSalesReport[]> {
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
            product: {
              include: {
                category: true
              }
            }
          }
        }
      }
    })

    const productStats = new Map<string, {
      id: string
      name: string
      category: string
      quantitySold: number
      revenue: number
      profit: number
    }>()

    orders.forEach(order => {
      order.items.forEach(item => {
        const existing = productStats.get(item.productId)
        const itemRevenue = item.price * item.quantity
        const itemProfit = item.product.wholesalePrice 
          ? (item.price - item.product.wholesalePrice) * item.quantity 
          : item.price * 0.3 * item.quantity

        if (existing) {
          existing.quantitySold += item.quantity
          existing.revenue += itemRevenue
          existing.profit += itemProfit
        } else {
          productStats.set(item.productId, {
            id: item.product.id,
            name: item.product.name,
            category: item.product.category.name,
            quantitySold: item.quantity,
            revenue: itemRevenue,
            profit: itemProfit
          })
        }
      })
    })

    return Array.from(productStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)
  }

  // Get payment method report
  static async getPaymentMethodReport(startDate: Date, endDate: Date): Promise<PaymentMethodReport[]> {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      }
    })

    const paymentStats = new Map<string, { count: number, amount: number }>()
    let totalAmount = 0

    orders.forEach(order => {
      const existing = paymentStats.get(order.paymentMethod)
      if (existing) {
        existing.count += 1
        existing.amount += order.total
      } else {
        paymentStats.set(order.paymentMethod, {
          count: 1,
          amount: order.total
        })
      }
      totalAmount += order.total
    })

    return Array.from(paymentStats.entries()).map(([method, stats]) => ({
      method: method === 'CASH' ? 'Tunai' : 
              method === 'CARD' ? 'Kartu' : 
              method === 'MOBILE_PAYMENT' ? 'Pembayaran Mobile' : method,
      count: stats.count,
      amount: stats.amount,
      percentage: totalAmount > 0 ? (stats.amount / totalAmount) * 100 : 0
    }))
  }

  // Export report data
  static async exportDailyReport(startDate: Date, endDate: Date) {
    const dailyReports = await this.getDailySalesReport(startDate, endDate)
    const summary = await this.getSalesSummary(startDate, endDate)
    
    return {
      summary,
      dailyReports,
      exportDate: new Date().toISOString(),
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    }
  }
}
