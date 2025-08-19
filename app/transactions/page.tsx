"use client"

import { useState, useEffect } from 'react'
import { Header } from "@/components/pos/header"
import { Sidebar } from "@/components/pos/sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Search, Receipt, DollarSign, TrendingUp, User, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Transaction {
  id: string
  orderNumber: string
  total: number
  paymentMethod: string
  status: string
  paymentStatus: string
  createdAt: string
  cashierId: string
  cashier: {
    firstName: string
    lastName: string
    username: string
  }
  items: {
    id: string
    quantity: number
    price: number
    subtotal: number
    product: {
      name: string
    }
  }[]
}

export default function TransactionsPage() {
  const { user, logout } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [currentTime, setCurrentTime] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

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

  useEffect(() => {
    fetchTransactions()
  }, [selectedDate])

  // Handler functions for header
  const handleSettings = () => {
    window.location.href = '/settings'
  }

  const handleReports = () => {
    window.location.href = '/reports'
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      let url = '/api/transactions'
      const params = new URLSearchParams()
      
      // If user is CASHIER, only show their transactions
      if (user?.role === 'CASHIER') {
        params.append('cashierId', user.id)
      }
      
      if (selectedDate) {
        params.append('date', selectedDate)
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(transaction =>
    transaction.cashier.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.cashier.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.cashier.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Selesai</Badge>
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Dibatalkan</Badge>
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Menunggu</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'CASH':
        return <Badge variant="secondary">Tunai</Badge>
      case 'CARD':
        return <Badge variant="secondary">Kartu</Badge>
      case 'TRANSFER':
        return <Badge variant="secondary">Transfer</Badge>
      default:
        return <Badge variant="secondary">{method}</Badge>
    }
  }

  // Calculate summary stats
  const totalTransactions = filteredTransactions.length
  const totalSales = filteredTransactions
    .filter(t => t.status === 'COMPLETED')
    .reduce((sum, transaction) => sum + transaction.total, 0)
  const completedTransactions = filteredTransactions.filter(t => t.status === 'COMPLETED').length
  const averageTransactionValue = completedTransactions > 0 ? totalSales / completedTransactions : 0

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
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-col space-y-2">
                <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
                <p className="text-muted-foreground">
                  Kelola dan pantau riwayat transaksi penjualan
                </p>
              </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Penjualan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transaksi Selesai</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTransactions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Transaksi</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageTransactionValue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari berdasarkan kasir atau ID transaksi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
          <Button
            variant="outline"
            onClick={() => {
              setSelectedDate('')
              setSearchTerm('')
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
          <CardDescription>
            {filteredTransactions.length} transaksi ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-muted-foreground">Memuat data...</div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Tidak ada transaksi</p>
              <p className="text-sm">Belum ada transaksi yang tercatat</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Transaksi</TableHead>
                    <TableHead>Kasir</TableHead>
                    <TableHead>Tanggal & Waktu</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Metode Bayar</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">
                        {transaction.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {transaction.cashier.firstName} {transaction.cashier.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              @{transaction.cashier.username}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {formatDate(transaction.createdAt)}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            {formatTime(transaction.createdAt)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatCurrency(transaction.total)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getPaymentMethodBadge(transaction.paymentMethod)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedTransaction(transaction)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Detail
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detail Transaksi {selectedTransaction?.orderNumber}</DialogTitle>
                              <DialogDescription>
                                Informasi lengkap transaksi penjualan
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedTransaction && (
                              <div className="space-y-4">
                                {/* Transaction Info */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Kasir</label>
                                    <p className="font-medium">
                                      {selectedTransaction.cashier.firstName} {selectedTransaction.cashier.lastName}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Waktu</label>
                                    <p className="font-medium">
                                      {formatDate(selectedTransaction.createdAt)} {formatTime(selectedTransaction.createdAt)}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Total</label>
                                    <p className="font-medium text-lg">
                                      {formatCurrency(selectedTransaction.total)}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                                    <div className="mt-1">
                                      {getStatusBadge(selectedTransaction.status)}
                                    </div>
                                  </div>
                                </div>

                                {/* Transaction Items */}
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Item Transaksi</label>
                                  <div className="mt-2">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Produk</TableHead>
                                          <TableHead>Qty</TableHead>
                                          <TableHead>Harga</TableHead>
                                          <TableHead>Subtotal</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {selectedTransaction.items.map((item) => (
                                          <TableRow key={item.id}>
                                            <TableCell>{item.product.name}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>{formatCurrency(item.price)}</TableCell>
                                            <TableCell>{formatCurrency(item.subtotal)}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
