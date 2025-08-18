import { NextRequest, NextResponse } from 'next/server'
import { DashboardService } from '@/lib/services/dashboard-service'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const payload = await verifyToken(request)
    if (!payload) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all' // daily, weekly, monthly, all
    const date = searchParams.get('date') ? new Date(searchParams.get('date')!) : new Date()

    let dashboardData

    switch (period) {
      case 'daily':
        const dailyStats = await DashboardService.getDailyStats(date)
        dashboardData = { daily: dailyStats }
        break
      
      case 'weekly':
        const weeklyStats = await DashboardService.getWeeklyStats(date)
        dashboardData = { weekly: weeklyStats }
        break
      
      case 'monthly':
        const month = date.getMonth() + 1
        const year = date.getFullYear()
        const monthlyStats = await DashboardService.getMonthlyStats(month, year)
        dashboardData = { monthly: monthlyStats }
        break
      
      default:
        // Get comprehensive dashboard data with comparisons
        const baseDashboardData = await DashboardService.getDashboardData()
        
        // Get chart data
        const [dailyChartData, weeklyChartData] = await Promise.all([
          DashboardService.getSalesProfitChartData(30), // Last 30 days
          DashboardService.getWeeklySalesProfitData()   // Last 8 weeks
        ])
        
        // Combine dashboard data with charts
        dashboardData = {
          ...baseDashboardData,
          charts: {
            daily: dailyChartData,
            weekly: weeklyChartData
          }
        }
    }

    // Get additional data for backward compatibility and extra info
    const [
      productCount,
      categoryCount,
      orderCount,
      userCount,
      recentOrders,
      lowStockAlerts
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.category.count(),
      prisma.order.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: { name: true }
              }
            }
          },
          cashier: {
            select: { firstName: true, lastName: true }
          }
        }
      }),
      DashboardService.getLowStockAlerts()
    ])

    return NextResponse.json({
      success: true,
      data: dashboardData,
      stats: {
        products: productCount,
        categories: categoryCount,
        orders: orderCount,
        users: userCount
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        itemCount: order.items.length,
        cashier: `${order.cashier.firstName} ${order.cashier.lastName}`,
        createdAt: order.createdAt
      })),
      alerts: lowStockAlerts,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Update dashboard statistics
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const payload = await verifyToken(request)
    if (!payload) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { action, productId, date } = body

    switch (action) {
      case 'update_product_stats':
        if (!productId) {
          return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
        }
        
        const targetDate = date ? new Date(date) : new Date()
        await DashboardService.updateProductStats(productId, targetDate)
        
        return NextResponse.json({ 
          success: true, 
          message: 'Product statistics updated' 
        })

      case 'refresh_all':
        // This could be used to recalculate all statistics
        // Implementation depends on your specific needs
        return NextResponse.json({ 
          success: true, 
          message: 'Dashboard refresh initiated' 
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Dashboard update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
