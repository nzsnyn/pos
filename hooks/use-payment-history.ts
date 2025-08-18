import { useState, useEffect } from 'react'

export interface PaymentHistoryItem {
  id: string
  orderNumber: string
  date: string
  time: string
  amount: number
  method: string
  status: string
  statusText: string
  cashierName: string
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    subtotal: number
  }>
  notes?: string
}

export interface PaymentHistorySummary {
  totalAmount: number
  totalTransactions: number
  completedCount: number
  pendingCount: number
  failedCount: number
  completedPercentage: number
}

interface UsePaymentHistoryParams {
  startDate?: Date
  endDate?: Date
  searchTerm?: string
  statusFilter?: string
  methodFilter?: string
}

interface UsePaymentHistoryResult {
  payments: PaymentHistoryItem[]
  summary: PaymentHistorySummary | null
  loading: boolean
  error: string | null
  refreshData: () => void
  exportPayments: () => Promise<void>
}

export function usePaymentHistory({
  startDate,
  endDate,
  searchTerm = "",
  statusFilter,
  methodFilter
}: UsePaymentHistoryParams = {}): UsePaymentHistoryResult {
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([])
  const [summary, setSummary] = useState<PaymentHistorySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate.toISOString())
      if (endDate) params.append('endDate', endDate.toISOString())
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (methodFilter) params.append('method', methodFilter)

      const response = await fetch(`/api/payments/history?${params.toString()}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch payment history')
      }

      const result = await response.json()
      
      if (result.success) {
        setPayments(result.data.payments)
        setSummary(result.data.summary)
      } else {
        throw new Error(result.error || 'Unknown error occurred')
      }

    } catch (err) {
      console.error('Error fetching payment history:', err)
      setError('Gagal memuat riwayat pembayaran')
      
      // Set mock data for development
      const mockPayments: PaymentHistoryItem[] = [
        {
          id: '1',
          orderNumber: 'ORD-20250818-001',
          date: '18/08/2025',
          time: '14:30:25',
          amount: 85000,
          method: 'CASH',
          status: 'COMPLETED',
          statusText: 'Berhasil',
          cashierName: 'Admin User',
          items: [
            { id: '1', name: 'Kopi Arabica Premium', quantity: 2, price: 25000, subtotal: 50000 },
            { id: '2', name: 'Roti Coklat', quantity: 1, price: 15000, subtotal: 15000 },
            { id: '3', name: 'Susu UHT', quantity: 2, price: 10000, subtotal: 20000 }
          ]
        },
        {
          id: '2',
          orderNumber: 'ORD-20250818-002',
          date: '18/08/2025',
          time: '15:15:10',
          amount: 120000,
          method: 'CARD',
          status: 'COMPLETED',
          statusText: 'Berhasil',
          cashierName: 'Admin User',
          items: [
            { id: '4', name: 'Teh Hijau Premium', quantity: 3, price: 20000, subtotal: 60000 },
            { id: '5', name: 'Biskuit Coklat', quantity: 4, price: 15000, subtotal: 60000 }
          ]
        },
        {
          id: '3',
          orderNumber: 'ORD-20250818-003',
          date: '18/08/2025',
          time: '16:45:30',
          amount: 55000,
          method: 'MOBILE_PAYMENT',
          status: 'PENDING',
          statusText: 'Menunggu',
          cashierName: 'Admin User',
          items: [
            { id: '6', name: 'Air Mineral', quantity: 5, price: 5000, subtotal: 25000 },
            { id: '7', name: 'Permen', quantity: 6, price: 5000, subtotal: 30000 }
          ]
        },
        {
          id: '4',
          orderNumber: 'ORD-20250817-001',
          date: '17/08/2025',
          time: '10:20:15',
          amount: 75000,
          method: 'CASH',
          status: 'FAILED',
          statusText: 'Gagal',
          cashierName: 'Admin User',
          items: [
            { id: '8', name: 'Kue Donat', quantity: 3, price: 25000, subtotal: 75000 }
          ],
          notes: 'Pembayaran dibatalkan oleh pelanggan'
        }
      ]

      const mockSummary: PaymentHistorySummary = {
        totalAmount: 335000,
        totalTransactions: 4,
        completedCount: 2,
        pendingCount: 1,
        failedCount: 1,
        completedPercentage: 50
      }

      setPayments(mockPayments)
      setSummary(mockSummary)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchPaymentHistory()
  }

  const exportPayments = async () => {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate.toISOString())
      if (endDate) params.append('endDate', endDate.toISOString())
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (methodFilter) params.append('method', methodFilter)

      const response = await fetch(`/api/payments/export?${params.toString()}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchPaymentHistory()
  }, [startDate, endDate, searchTerm, statusFilter, methodFilter])

  return {
    payments,
    summary,
    loading,
    error,
    refreshData,
    exportPayments
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

export const getPaymentMethodColor = (method: string): string => {
  switch (method) {
    case 'CASH':
      return 'bg-green-100 text-green-700'
    case 'CARD':
      return 'bg-blue-100 text-blue-700'
    case 'MOBILE_PAYMENT':
      return 'bg-purple-100 text-purple-700'
    case 'CHECK':
      return 'bg-orange-100 text-orange-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-700'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700'
    case 'FAILED':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}
