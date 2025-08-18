"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/pos/header"
import { Sidebar } from "@/components/pos/sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useDashboard, formatCurrency, formatPercentage, getChangeType } from "@/hooks/use-dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SalesProfitChart } from "@/components/dashboard/sales-profit-chart"
import { 
  BarChart3, 
  ShoppingCart, 
  Users, 
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  RefreshCw
} from "lucide-react"

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { data: dashboardData, alerts, loading, error, refreshData } = useDashboard()
  const [currentTime, setCurrentTime] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Memoize charts to prevent re-rendering when currentTime changes
  const memoizedCharts = useMemo(() => {
    if (!dashboardData?.charts) return null
    
    return (
      <div className="mb-8">
        <div className="grid grid-cols-1 gap-6">
          <SalesProfitChart 
            data={dashboardData.charts.daily}
            title="Perbandingan Penjualan vs Profit (Harian)"
            period="30 Hari Terakhir"
          />
          <SalesProfitChart 
            data={dashboardData.charts.weekly}
            title="Perbandingan Penjualan vs Profit (Mingguan)"
            period="8 Minggu Terakhir"
          />
        </div>
      </div>
    )
  }, [dashboardData?.charts])

  // Memoize statistical data to prevent recalculation on every render
  const memoizedStats = useMemo(() => {
    if (!dashboardData) return { transactionStats: [], salesStats: [], profitStats: [], additionalStats: [] }

    // Generate stats from dashboard data
    const transactionStats = [
      {
        title: "Total Transaksi Hari Ini",
        value: dashboardData.daily.current.totalTransactions.toString(),
        change: dashboardData.daily.changes ? formatPercentage(dashboardData.daily.changes.transactions) : "0%",
        changeType: dashboardData.daily.changes ? getChangeType(dashboardData.daily.changes.transactions) : "increase" as const,
        icon: ShoppingCart,
        description: "transaksi berhasil"
      },
      {
        title: "Transaksi Minggu Ini",
        value: dashboardData.weekly.current.totalTransactions.toLocaleString('id-ID'),
        change: dashboardData.weekly.changes ? formatPercentage(dashboardData.weekly.changes.transactions) : "0%",
        changeType: dashboardData.weekly.changes ? getChangeType(dashboardData.weekly.changes.transactions) : "increase" as const,
        icon: ShoppingCart,
        description: "total transaksi"
      },
      {
        title: "Transaksi Bulan Ini",
        value: dashboardData.monthly.current.totalTransactions.toLocaleString('id-ID'),
        change: dashboardData.monthly.changes ? formatPercentage(dashboardData.monthly.changes.transactions) : "0%",
        changeType: dashboardData.monthly.changes ? getChangeType(dashboardData.monthly.changes.transactions) : "increase" as const,
        icon: ShoppingCart,
        description: "akumulasi bulanan"
      }
    ]

    // Sales Stats
    const salesStats = [
      {
        title: "Penjualan Hari Ini",
        value: formatCurrency(dashboardData.daily.current.totalSales),
        change: dashboardData.daily.changes ? formatPercentage(dashboardData.daily.changes.sales) : "0%",
        changeType: dashboardData.daily.changes ? getChangeType(dashboardData.daily.changes.sales) : "increase" as const,
        icon: DollarSign,
        description: "omzet harian"
      },
      {
        title: "Penjualan Minggu Ini",
        value: formatCurrency(dashboardData.weekly.current.totalSales),
        change: dashboardData.weekly.changes ? formatPercentage(dashboardData.weekly.changes.sales) : "0%",
        changeType: dashboardData.weekly.changes ? getChangeType(dashboardData.weekly.changes.sales) : "increase" as const,
        icon: DollarSign,
        description: "omzet mingguan"
      },
      {
        title: "Penjualan Bulan Ini",
        value: formatCurrency(dashboardData.monthly.current.totalSales),
        change: dashboardData.monthly.changes ? formatPercentage(dashboardData.monthly.changes.sales) : "0%",
        changeType: dashboardData.monthly.changes ? getChangeType(dashboardData.monthly.changes.sales) : "increase" as const,
        icon: DollarSign,
        description: "omzet bulanan"
      }
    ]

    // Profit Stats
    const profitStats = [
      {
        title: "Keuntungan Hari Ini",
        value: formatCurrency(dashboardData.daily.current.totalProfit),
        change: dashboardData.daily.changes ? formatPercentage(dashboardData.daily.changes.profit) : "0%",
        changeType: dashboardData.daily.changes ? getChangeType(dashboardData.daily.changes.profit) : "increase" as const,
        icon: TrendingUp,
        description: "profit harian",
        margin: dashboardData.daily.current.totalSales > 0 ? 
          `${((dashboardData.daily.current.totalProfit / dashboardData.daily.current.totalSales) * 100).toFixed(1)}%` : "0%"
      },
      {
        title: "Keuntungan Minggu Ini",
        value: formatCurrency(dashboardData.weekly.current.totalProfit),
        change: dashboardData.weekly.changes ? formatPercentage(dashboardData.weekly.changes.profit) : "0%",
        changeType: dashboardData.weekly.changes ? getChangeType(dashboardData.weekly.changes.profit) : "increase" as const,
        icon: TrendingUp,
        description: "profit mingguan",
        margin: dashboardData.weekly.current.totalSales > 0 ? 
          `${((dashboardData.weekly.current.totalProfit / dashboardData.weekly.current.totalSales) * 100).toFixed(1)}%` : "0%"
      },
      {
        title: "Keuntungan Bulan Ini",
        value: formatCurrency(dashboardData.monthly.current.totalProfit),
        change: dashboardData.monthly.changes ? formatPercentage(dashboardData.monthly.changes.profit) : "0%",
        changeType: dashboardData.monthly.changes ? getChangeType(dashboardData.monthly.changes.profit) : "increase" as const,
        icon: TrendingUp,
        description: "profit bulanan",
        margin: dashboardData.monthly.current.totalSales > 0 ? 
          `${((dashboardData.monthly.current.totalProfit / dashboardData.monthly.current.totalSales) * 100).toFixed(1)}%` : "0%"
      }
    ]

    // Additional Stats
    const additionalStats = [
      {
        title: "Total Pelanggan",
        value: dashboardData.weekly.current.totalCustomers.toLocaleString('id-ID'),
        change: dashboardData.weekly.changes ? formatPercentage(dashboardData.weekly.changes.customers) : "0%",
        changeType: dashboardData.weekly.changes ? getChangeType(dashboardData.weekly.changes.customers) : "increase" as const,
        icon: Users,
        description: "pelanggan aktif"
      },
      {
        title: "Rata-rata Per Transaksi",
        value: formatCurrency(dashboardData.daily.current.averageOrderValue),
        change: "0%",
        changeType: "increase" as const,
        icon: BarChart3,
        description: "nilai transaksi"
      }
    ]

    return { transactionStats, salesStats, profitStats, additionalStats }
  }, [dashboardData])

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

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600" />
            <p className="text-gray-600">Memuat data dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="h-screen flex items-center justify-center bg-gray-50">
          <Alert className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}. <button onClick={refreshData} className="underline">Coba lagi</button>
            </AlertDescription>
          </Alert>
        </div>
      </ProtectedRoute>
    )
  }

  const { transactionStats, salesStats, profitStats, additionalStats } = memoizedStats

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

        <div className="flex-1 flex">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            mode="persistent"
          />
          
          <div className={`flex-1 overflow-y-auto transition-all duration-300 ${isSidebarOpen ? 'ml-0' : 'ml-0'}`}>
            <div className="p-6">
              <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">Selamat datang di sistem POS Toko Saya</p>
                
                {/* Alerts Section */}
                {alerts && alerts.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {alerts.slice(0, 3).map((alert, index) => (
                      <Alert key={alert.id} className={`${
                        alert.priority === 'CRITICAL' ? 'border-red-500 bg-red-50' :
                        alert.priority === 'HIGH' ? 'border-orange-500 bg-orange-50' :
                        alert.priority === 'MEDIUM' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}>
                        <AlertTriangle className={`h-4 w-4 ${
                          alert.priority === 'CRITICAL' ? 'text-red-500' :
                          alert.priority === 'HIGH' ? 'text-orange-500' :
                          alert.priority === 'MEDIUM' ? 'text-yellow-500' :
                          'text-blue-500'
                        }`} />
                        <AlertDescription>
                          <strong>{alert.product.name}</strong>: {alert.message}
                        </AlertDescription>
                      </Alert>
                    ))}
                    {alerts.length > 3 && (
                      <p className="text-sm text-gray-500">
                        +{alerts.length - 3} peringatan lainnya
                      </p>
                    )}
                  </div>
                )}
              </div>              {/* Transaction Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Total Transaksi
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {transactionStats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                      <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">
                            {stat.title}
                          </CardTitle>
                          <Icon className="h-4 w-4 text-gray-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stat.value}</div>
                          <div className="flex items-center text-xs mt-1">
                            {stat.changeType === 'increase' ? (
                              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                            )}
                            <span className={stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}>
                              {stat.change}
                            </span>
                            <span className="text-gray-500 ml-1">dari kemarin</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* Sales Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Total Penjualan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {salesStats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                      <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">
                            {stat.title}
                          </CardTitle>
                          <Icon className="h-4 w-4 text-gray-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stat.value}</div>
                          <div className="flex items-center text-xs mt-1">
                            {stat.changeType === 'increase' ? (
                              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                            )}
                            <span className={stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}>
                              {stat.change}
                            </span>
                            <span className="text-gray-500 ml-1">dari kemarin</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* Profit Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Total Keuntungan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {profitStats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                      <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">
                            {stat.title}
                          </CardTitle>
                          <Icon className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">{stat.value}</div>
                          <div className="flex items-center text-xs mt-1">
                            {stat.changeType === 'increase' ? (
                              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                            )}
                            <span className={stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}>
                              {stat.change}
                            </span>
                            <span className="text-gray-500 ml-1">dari kemarin</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-gray-500">{stat.description}</p>
                            <Badge variant="outline" className="text-xs">
                              {stat.margin}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* Additional Stats */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistik Tambahan</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {additionalStats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                      <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">
                            {stat.title}
                          </CardTitle>
                          <Icon className="h-4 w-4 text-gray-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stat.value}</div>
                          <div className="flex items-center text-xs mt-1">
                            {stat.changeType === 'increase' ? (
                              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                            )}
                            <span className={stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}>
                              {stat.change}
                            </span>
                            <span className="text-gray-500 ml-1">dari kemarin</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* Sales vs Profit Chart */}
              {memoizedCharts}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
