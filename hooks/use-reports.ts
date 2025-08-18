import { useState, useEffect } from 'react'

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

interface UseReportsResult {
  dailyReports: DailySalesReport[]
  summary: SalesReportSummary | null
  productReports: ProductSalesReport[]
  paymentReports: PaymentMethodReport[]
  loading: boolean
  error: string | null
  refreshData: () => void
  exportReport: (startDate: Date, endDate: Date) => Promise<any>
}

export function useReports(startDate?: Date, endDate?: Date): UseReportsResult {
  const [dailyReports, setDailyReports] = useState<DailySalesReport[]>([])
  const [summary, setSummary] = useState<SalesReportSummary | null>(null)
  const [productReports, setProductReports] = useState<ProductSalesReport[]>([])
  const [paymentReports, setPaymentReports] = useState<PaymentMethodReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReportsData = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate.toISOString())
      if (endDate) params.append('endDate', endDate.toISOString())

      // Fetch all report types in parallel
      const [dailyRes, summaryRes, productsRes, paymentsRes] = await Promise.all([
        fetch(`/api/reports?type=daily&${params.toString()}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch(`/api/reports?type=summary&${params.toString()}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch(`/api/reports?type=products&${params.toString()}&limit=10`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch(`/api/reports?type=payments&${params.toString()}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })
      ])

      if (!dailyRes.ok || !summaryRes.ok || !productsRes.ok || !paymentsRes.ok) {
        throw new Error('Failed to fetch reports data')
      }

      const [dailyData, summaryData, productsData, paymentsData] = await Promise.all([
        dailyRes.json(),
        summaryRes.json(),
        productsRes.json(),
        paymentsRes.json()
      ])

      if (dailyData.success) setDailyReports(dailyData.data)
      if (summaryData.success) setSummary(summaryData.data)
      if (productsData.success) setProductReports(productsData.data)
      if (paymentsData.success) setPaymentReports(paymentsData.data)

    } catch (err) {
      console.error('Error fetching reports data:', err)
      setError('Failed to load reports data')
      
      // Set mock data for development
      setDailyReports([
        {
          date: '16/08/2025',
          transactions: 45,
          revenue: 2450000,
          profit: 735000,
          topProduct: 'Kopi Arabica Premium',
          topProductQuantity: 15,
          averageOrderValue: 54444,
          cashSales: 1470000,
          cardSales: 980000,
          mobilePaymentSales: 0
        },
        {
          date: '15/08/2025',
          transactions: 38,
          revenue: 2100000,
          profit: 630000,
          topProduct: 'Teh Hijau Melati',
          topProductQuantity: 12,
          averageOrderValue: 55263,
          cashSales: 1260000,
          cardSales: 840000,
          mobilePaymentSales: 0
        }
      ])

      setSummary({
        totalRevenue: 4550000,
        totalTransactions: 83,
        totalProfit: 1365000,
        totalCustomers: 45,
        averageOrderValue: 54819,
        profitMargin: 30.0,
        periodComparison: {
          revenueChange: 12.5,
          transactionChange: 8.2,
          profitChange: 15.3
        }
      })

      setProductReports([
        {
          id: '1',
          name: 'Kopi Arabica Premium',
          quantitySold: 27,
          revenue: 675000,
          profit: 189000,
          category: 'Minuman'
        }
      ])

      setPaymentReports([
        {
          method: 'Tunai',
          count: 55,
          amount: 2730000,
          percentage: 60.0
        },
        {
          method: 'Kartu',
          count: 28,
          amount: 1820000,
          percentage: 40.0
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchReportsData()
  }

  const exportReport = async (startDate: Date, endDate: Date) => {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      return await response.json()
    } catch (error) {
      console.error('Export error:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchReportsData()
  }, [startDate, endDate])

  return {
    dailyReports,
    summary,
    productReports,
    paymentReports,
    loading,
    error,
    refreshData,
    exportReport
  }
}

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

export const getChangeType = (value: number): 'increase' | 'decrease' => {
  return value >= 0 ? 'increase' : 'decrease'
}
