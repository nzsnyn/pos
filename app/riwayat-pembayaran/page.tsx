"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/pos/header"
import { Sidebar } from "@/components/pos/sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { 
  usePaymentHistory,
  formatCurrency,
  getPaymentMethodColor,
  getPaymentStatusColor,
  PaymentHistoryItem
} from "../../hooks/use-payment-history"
import {
  PaymentHistoryDetailDialog
} from "@/components/payments/payment-history-detail-dialog"
import { 
  Receipt, 
  Download, 
  Calendar,
  TrendingUp,
  DollarSign,
  CreditCard,
  Filter,
  RefreshCw,
  Search,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react"

export default function PaymentHistoryPage() {
  const { user, logout } = useAuth()
  const [currentTime, setCurrentTime] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30) // Last 30 days
    return date
  })
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // Use the payment history hook
  const {
    payments,
    summary,
    loading,
    error,
    refreshData,
    exportPayments
  } = usePaymentHistory({
    startDate,
    endDate,
    searchTerm,
    statusFilter: statusFilter !== "all" ? statusFilter : undefined,
    methodFilter: methodFilter !== "all" ? methodFilter : undefined
  })

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleString('id-ID', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSettings = () => {
    console.log("Settings clicked")
  }

  const handleReports = () => {
    console.log("Reports clicked")
  }

  const handleLogout = async () => {
    await logout()
  }

  const handleDateRangeApply = () => {
    refreshData()
    toast.info(`Menampilkan data dari ${startDate.toLocaleDateString('id-ID')} sampai ${endDate.toLocaleDateString('id-ID')}`)
  }

  const handleExport = async () => {
    try {
      await exportPayments()
      toast.success("Riwayat pembayaran berhasil diexport")
    } catch (error) {
      toast.error("Gagal export riwayat pembayaran")
    }
  }

  const handleShowPaymentDetail = (payment: any) => {
    setSelectedPayment(payment)
    setDetailDialogOpen(true)
  }

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false)
    setSelectedPayment(null)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'FAILED':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col bg-gray-50">
        <Header
          storeName="Toko Saya POS"
          cashierName={user ? `${user.firstName} ${user.lastName}` : "Memuat..."}
          userRole={user?.role}
          currentTime={currentTime}
          onOpenSettings={handleSettings}
          onOpenReports={handleReports}
          onLogout={handleLogout}
          onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            mode="persistent"
          />
          
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Riwayat Pembayaran</h1>
                  <p className="text-gray-600">Kelola dan pantau semua transaksi pembayaran</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={refreshData}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button 
                    className="gap-2"
                    onClick={handleExport}
                    disabled={loading}
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <Card className="mb-6 border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Peringatan:</span>
                      <span>{error}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    {loading ? (
                      <div className="space-y-2 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-8 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-28"></div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Pembayaran</p>
                          <p className="text-2xl font-bold">{formatCurrency(summary?.totalAmount || 0)}</p>
                          <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3" />
                            {summary?.totalTransactions || 0} transaksi
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    {loading ? (
                      <div className="space-y-2 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                        <div className="h-3 bg-gray-200 rounded w-28"></div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Berhasil</p>
                          <p className="text-2xl font-bold text-green-600">{summary?.completedCount || 0}</p>
                          <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                            <CheckCircle className="h-3 w-3" />
                            {summary?.completedPercentage || 0}%
                          </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-400" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    {loading ? (
                      <div className="space-y-2 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                        <div className="h-3 bg-gray-200 rounded w-28"></div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Pending</p>
                          <p className="text-2xl font-bold text-yellow-600">{summary?.pendingCount || 0}</p>
                          <p className="text-xs text-yellow-600 flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            Menunggu proses
                          </p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-400" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    {loading ? (
                      <div className="space-y-2 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                        <div className="h-3 bg-gray-200 rounded w-28"></div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Gagal</p>
                          <p className="text-2xl font-bold text-red-600">{summary?.failedCount || 0}</p>
                          <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                            <XCircle className="h-3 w-3" />
                            Perlu ditinjau
                          </p>
                        </div>
                        <XCircle className="h-8 w-8 text-red-400" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Cari Transaksi</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="text"
                          placeholder="Nomor order, kasir..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">Semua Status</option>
                        <option value="COMPLETED">Berhasil</option>
                        <option value="PENDING">Pending</option>
                        <option value="FAILED">Gagal</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Metode</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={methodFilter}
                        onChange={(e) => setMethodFilter(e.target.value)}
                      >
                        <option value="all">Semua Metode</option>
                        <option value="CASH">Tunai</option>
                        <option value="CARD">Kartu</option>
                        <option value="MOBILE_PAYMENT">Mobile Payment</option>
                        <option value="CHECK">Cek</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Dari Tanggal</label>
                      <Input 
                        type="date" 
                        value={startDate.toISOString().split('T')[0]}
                        onChange={(e) => setStartDate(new Date(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Sampai Tanggal</label>
                      <Input 
                        type="date" 
                        value={endDate.toISOString().split('T')[0]}
                        onChange={(e) => setEndDate(new Date(e.target.value))}
                      />
                    </div>

                    <Button 
                      onClick={handleDateRangeApply}
                      disabled={loading}
                      className="h-10"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Payments Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Riwayat Pembayaran ({payments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    {loading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="flex items-center space-x-4 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-4">Nomor Order</th>
                            <th className="text-left p-4">Tanggal & Waktu</th>
                            <th className="text-left p-4">Jumlah</th>
                            <th className="text-left p-4">Metode</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-left p-4">Kasir</th>
                            <th className="text-left p-4">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center p-8 text-gray-500">
                                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Tidak ada riwayat pembayaran ditemukan</p>
                              </td>
                            </tr>
                          ) : (
                            payments.map((payment: PaymentHistoryItem) => (
                              <tr key={payment.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                  <div className="font-mono font-medium">{payment.orderNumber}</div>
                                  <div className="text-sm text-gray-500">{payment.items.length} item(s)</div>
                                </td>
                                <td className="p-4">
                                  <div className="font-medium">{payment.date}</div>
                                  <div className="text-sm text-gray-500">{payment.time}</div>
                                </td>
                                <td className="p-4">
                                  <div className="font-bold text-lg">{formatCurrency(payment.amount)}</div>
                                </td>
                                <td className="p-4">
                                  <Badge className={getPaymentMethodColor(payment.method)}>
                                    {payment.method}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <Badge className={getPaymentStatusColor(payment.status)}>
                                    {getStatusIcon(payment.status)}
                                    <span className="ml-1">{payment.statusText}</span>
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="font-medium">{payment.cashierName}</div>
                                </td>
                                <td className="p-4">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleShowPaymentDetail(payment)}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    Detail
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Payment Detail Dialog */}
        {selectedPayment && (
          <PaymentHistoryDetailDialog
            isOpen={detailDialogOpen}
            onClose={handleCloseDetailDialog}
            payment={selectedPayment}
          />
        )}
        
        <Toaster richColors />
      </div>
    </ProtectedRoute>
  )
}
