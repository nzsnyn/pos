import { NextRequest, NextResponse } from 'next/server'
import { ReportsService } from '@/lib/services/reports-service'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const payload = await verifyToken(request)
    if (!payload) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')
    const reportType = searchParams.get('type') || 'daily' // daily, summary, products, payments

    // Default to last 7 days if no dates provided
    let endDate = endDateParam ? new Date(endDateParam) : new Date()
    let startDate = startDateParam ? new Date(startDateParam) : new Date()
    
    if (!startDateParam) {
      startDate.setDate(endDate.getDate() - 6) // Last 7 days
    }

    // Set time boundaries
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)

    let reportData

    switch (reportType) {
      case 'summary':
        reportData = await ReportsService.getSalesSummary(startDate, endDate)
        break
      
      case 'products':
        const limit = parseInt(searchParams.get('limit') || '10')
        reportData = await ReportsService.getProductSalesReport(startDate, endDate, limit)
        break
      
      case 'payments':
        reportData = await ReportsService.getPaymentMethodReport(startDate, endDate)
        break
      
      case 'export':
        reportData = await ReportsService.exportDailyReport(startDate, endDate)
        break
      
      case 'daily':
      default:
        reportData = await ReportsService.getDailySalesReport(startDate, endDate)
    }

    return NextResponse.json({
      success: true,
      data: reportData,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const payload = await verifyToken(request)
    if (!payload) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { action, startDate, endDate } = body

    switch (action) {
      case 'export':
        if (!startDate || !endDate) {
          return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 })
        }
        
        const exportData = await ReportsService.exportDailyReport(
          new Date(startDate), 
          new Date(endDate)
        )
        
        return NextResponse.json({
          success: true,
          data: exportData,
          message: 'Report exported successfully'
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Reports API POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
