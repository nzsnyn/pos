import { useState, useEffect } from 'react'

interface DashboardStats {
  totalTransactions: number
  totalSales: number
  totalProfit: number
  totalCustomers: number
  totalItemsSold: number
  averageOrderValue: number
}

interface ChartDataPoint {
  date: string
  sales: number
  profit: number
  profitMargin: number
}

interface DashboardCharts {
  daily: ChartDataPoint[]
  weekly: ChartDataPoint[]
}

interface DashboardPeriodData {
  current: DashboardStats & {
    topSellingProduct?: any
    topSellingProductQty: number
  }
  previous?: DashboardStats
  changes?: {
    transactions: number
    sales: number
    profit: number
    customers: number
    itemsSold: number
  }
}

interface DashboardData {
  daily: DashboardPeriodData
  weekly: DashboardPeriodData
  monthly: DashboardPeriodData
  charts?: DashboardCharts
}

interface Alert {
  id: string
  message: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  alertType: string
  product: {
    name: string
    stock: number
  }
}

interface UseDashboardResult {
  data: DashboardData | null
  alerts: Alert[]
  loading: boolean
  error: string | null
  refreshData: () => void
}

export function useDashboard(): UseDashboardResult {
  const [data, setData] = useState<DashboardData | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/dashboard?period=all', {
        method: 'GET',
        credentials: 'include', // This will include cookies
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
        setAlerts(result.alerts || [])
      } else {
        setError('Gagal mengambil data dashboard')
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Gagal memuat data dashboard')
      
      // Set some mock data for development
      setData({
        daily: {
          current: {
            totalTransactions: 142,
            totalSales: 2450000,
            totalProfit: 735000,
            totalCustomers: 89,
            totalItemsSold: 324,
            averageOrderValue: 17254,
            topSellingProductQty: 45
          },
          changes: {
            transactions: 8.2,
            sales: 12.5,
            profit: 14.2,
            customers: 5.1,
            itemsSold: -2.4
          }
        },
        weekly: {
          current: {
            totalTransactions: 1048,
            totalSales: 16780000,
            totalProfit: 5034000,
            totalCustomers: 567,
            totalItemsSold: 2145,
            averageOrderValue: 16012,
            topSellingProductQty: 289
          },
          changes: {
            transactions: 15.3,
            sales: 18.7,
            profit: 19.8,
            customers: 12.4,
            itemsSold: 8.9
          }
        },
        monthly: {
          current: {
            totalTransactions: 4567,
            totalSales: 78450000,
            totalProfit: 23535000,
            totalCustomers: 2341,
            totalItemsSold: 9876,
            averageOrderValue: 17179,
            topSellingProductQty: 1234
          },
          changes: {
            transactions: 22.1,
            sales: 25.4,
            profit: 27.6,
            customers: 18.3,
            itemsSold: 15.7
          }
        }
      })
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchDashboardData()
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return {
    data,
    alerts,
    loading,
    error,
    refreshData
  }
}

// Utility function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Utility function to format percentage
export const formatPercentage = (value: number): string => {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

// Utility function to determine change type
export const getChangeType = (value: number): 'increase' | 'decrease' => {
  return value >= 0 ? 'increase' : 'decrease'
}
