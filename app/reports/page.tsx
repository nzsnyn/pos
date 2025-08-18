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
  useReports, 
  formatCurrency, 
  formatPercentage, 
  getChangeType 
} from "@/hooks/use-reports"
import { 
  DayTransactionDialog,
  TransactionDetail
} from "@/components/reports/day-transaction-dialog"
import { 
  Receipt, 
  Download, 
  Calendar,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Filter,
  RefreshCw,
  TrendingDown,
  AlertCircle
} from "lucide-react"

export default function ReportsPage() {
  const { user, logout } = useAuth()
  const [currentTime, setCurrentTime] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date()
    date.setDate(date.getDate() - 7) // Last 7 days
    return date
  })
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [selectedDayTransactions, setSelectedDayTransactions] = useState<TransactionDetail[]>([])
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [loadingTransactions, setLoadingTransactions] = useState(false)

  // Use the reports hook
  const {
    dailyReports,
    summary,
    productReports,
    paymentReports,
    loading,
    error,
    refreshData,
    exportReport
  } = useReports(startDate, endDate)

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
      const result = await exportReport(startDate, endDate)
      toast.success("Laporan telah berhasil diexport")
    } catch (error) {
      toast.error("Terjadi kesalahan saat export laporan")
    }
  }

  const handleShowDayDetails = async (dateString: string) => {
    try {
      setLoadingTransactions(true)
      setSelectedDate(dateString)
      setTransactionDialogOpen(true)

      // Convert DD/MM/YYYY to YYYY-MM-DD format for the API
      let formattedDate = dateString
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/')
        formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }

      const response = await fetch(`/api/reports/day-transactions?date=${encodeURIComponent(formattedDate)}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch day transactions')
      }

      const result = await response.json()
      if (result.success) {
        setSelectedDayTransactions(result.data.transactions)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      console.error('Error fetching day transactions:', error)
      toast.error("Gagal memuat detail transaksi")
      setSelectedDayTransactions([])
    } finally {
      setLoadingTransactions(false)
    }
  }

  const handleCloseTransactionDialog = () => {
    setTransactionDialogOpen(false)
    setSelectedDayTransactions([])
    setSelectedDate("")
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
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Laporan Penjualan</h1>
                  <p className="text-gray-600">Analisis penjualan dan performa toko</p>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                          <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                          <p className="text-2xl font-bold">{formatCurrency(summary?.totalRevenue || 0)}</p>
                          <p className={`text-xs flex items-center gap-1 mt-1 ${
                            getChangeType(summary?.periodComparison.revenueChange || 0) === 'increase' 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {getChangeType(summary?.periodComparison.revenueChange || 0) === 'increase' 
                              ? <TrendingUp className="h-3 w-3" />
                              : <TrendingDown className="h-3 w-3" />
                            }
                            {formatPercentage(summary?.periodComparison.revenueChange || 0)} dari minggu lalu
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
                          <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
                          <p className="text-2xl font-bold">{summary?.totalTransactions || 0}</p>
                          <p className={`text-xs flex items-center gap-1 mt-1 ${
                            getChangeType(summary?.periodComparison.transactionChange || 0) === 'increase' 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {getChangeType(summary?.periodComparison.transactionChange || 0) === 'increase' 
                              ? <TrendingUp className="h-3 w-3" />
                              : <TrendingDown className="h-3 w-3" />
                            }
                            {formatPercentage(summary?.periodComparison.transactionChange || 0)} dari minggu lalu
                          </p>
                        </div>
                        <ShoppingCart className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </CardContent>
                </Card>

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
                          <p className="text-sm font-medium text-gray-600">Total Keuntungan</p>
                          <p className="text-2xl font-bold">{formatCurrency(summary?.totalProfit || 0)}</p>
                          <p className={`text-xs flex items-center gap-1 mt-1 ${
                            getChangeType(summary?.periodComparison.profitChange || 0) === 'increase' 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {getChangeType(summary?.periodComparison.profitChange || 0) === 'increase' 
                              ? <TrendingUp className="h-3 w-3" />
                              : <TrendingDown className="h-3 w-3" />
                            }
                            {formatPercentage(summary?.periodComparison.profitChange || 0)} dari minggu lalu
                          </p>
                        </div>
                        <Receipt className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Date Range Filter */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex gap-4 items-center">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <Input 
                      type="date" 
                      className="w-40" 
                      value={startDate.toISOString().split('T')[0]}
                      onChange={(e) => setStartDate(new Date(e.target.value))}
                    />
                    <span className="text-gray-500">sampai</span>
                    <Input 
                      type="date" 
                      className="w-40" 
                      value={endDate.toISOString().split('T')[0]}
                      onChange={(e) => setEndDate(new Date(e.target.value))}
                    />
                    <Button 
                      onClick={handleDateRangeApply}
                      disabled={loading}
                    >
                      Terapkan
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Sales Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Laporan Harian
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    {loading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="flex items-center space-x-4 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-4 bg-gray-200 rounded w-12"></div>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                            <div className="h-8 bg-gray-200 rounded w-16"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-4">Tanggal</th>
                            <th className="text-left p-4">Transaksi</th>
                            <th className="text-left p-4">Pendapatan</th>
                            <th className="text-left p-4">Keuntungan</th>
                            <th className="text-left p-4">Produk Terlaris</th>
                            <th className="text-left p-4">Rata-rata Order</th>
                            <th className="text-left p-4">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailyReports.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center p-8 text-gray-500">
                                Tidak ada data untuk periode yang dipilih
                              </td>
                            </tr>
                          ) : (
                            dailyReports.map((day, index) => (
                              <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium">{day.date}</td>
                                <td className="p-4">{day.transactions}</td>
                                <td className="p-4">{formatCurrency(day.revenue)}</td>
                                <td className="p-4 text-green-600">{formatCurrency(day.profit)}</td>
                                <td className="p-4">
                                  <Badge variant="secondary">
                                    {day.topProduct} ({day.topProductQuantity})
                                  </Badge>
                                </td>
                                <td className="p-4">{formatCurrency(day.averageOrderValue)}</td>
                                <td className="p-4">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleShowDayDetails(day.date)}
                                    disabled={loading}
                                  >
                                    <Download className="h-3 w-3 mr-1" />
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

              {/* Additional Reports Section */}
              {!loading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  {/* Product Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Produk Terlaris</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {productReports.slice(0, 5).map((product, index) => (
                          <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </span>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-gray-500">{product.category}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{product.quantitySold} terjual</p>
                              <p className="text-sm text-green-600">{formatCurrency(product.revenue)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Methods */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Metode Pembayaran</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {paymentReports.map((payment) => (
                          <div key={payment.method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{payment.method}</p>
                              <p className="text-sm text-gray-500">{payment.count} transaksi</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(payment.amount)}</p>
                              <p className="text-sm text-blue-600">{payment.percentage.toFixed(1)}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Day Transaction Details Dialog */}
        <DayTransactionDialog
          isOpen={transactionDialogOpen}
          onClose={handleCloseTransactionDialog}
          date={selectedDate}
          transactions={selectedDayTransactions}
          loading={loadingTransactions}
        />
        
        <Toaster richColors />
      </div>
    </ProtectedRoute>
  )
}
