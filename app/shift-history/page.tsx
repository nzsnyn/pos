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
import { Calendar, Clock, DollarSign, Receipt, Search, User, TrendingUp } from "lucide-react"

interface Shift {
  id: string
  cashierId: string
  startTime: string
  endTime: string | null
  startBalance: number
  finalBalance: number | null
  totalSales: number
  isActive: boolean
  notes: string | null
  // Computed fields from API
  totalTransactions: number
  duration: number | null
  status: 'ACTIVE' | 'COMPLETED'
  initialCash: number
  finalCash: number | null
  cashier: {
    id: string
    firstName: string
    lastName: string
    username: string
  }
}

export default function ShiftHistoryPage() {
  const { user, logout } = useAuth()
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
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
    fetchShifts()
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

  const fetchShifts = async () => {
    try {
      setLoading(true)
      let url = '/api/shift-history'
      const params = new URLSearchParams()
      
      // If user is CASHIER, only show their shifts
      if (user?.role === 'CASHIER') {
        params.append('userId', user.id)
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
        setShifts(data.shifts || [])
      }
    } catch (error) {
      console.error('Error fetching shifts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredShifts = shifts.filter(shift =>
    shift.cashier.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shift.cashier.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shift.cashier.username.toLowerCase().includes(searchTerm.toLowerCase())
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

  const formatDuration = (hours: number | null) => {
    if (!hours) return '-'
    const h = Math.floor(hours)
    const m = Math.floor((hours - h) * 60)
    return `${h}j ${m}m`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Aktif</Badge>
      case 'COMPLETED':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Selesai</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Calculate summary stats
  const totalShifts = filteredShifts.length
  const totalSales = filteredShifts.reduce((sum, shift) => sum + shift.totalSales, 0)
  const totalTransactions = filteredShifts.reduce((sum, shift) => sum + shift.totalTransactions, 0)
  const averageSalesPerShift = totalShifts > 0 ? totalSales / totalShifts : 0

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
                <h1 className="text-2xl font-bold">Riwayat Shift</h1>
                <p className="text-muted-foreground">
                  Kelola dan pantau riwayat shift kasir
                </p>
              </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shift</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShifts}</div>
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
            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata per Shift</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageSalesPerShift)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari berdasarkan nama kasir..."
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

      {/* Shifts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Shift</CardTitle>
          <CardDescription>
            {filteredShifts.length} shift ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-muted-foreground">Memuat data...</div>
            </div>
          ) : filteredShifts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Tidak ada data shift</p>
              <p className="text-sm">Belum ada shift yang tercatat</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kasir</TableHead>
                    <TableHead>Tanggal & Waktu</TableHead>
                    <TableHead>Durasi</TableHead>
                    <TableHead>Modal Awal</TableHead>
                    <TableHead>Modal Akhir</TableHead>
                    <TableHead>Transaksi</TableHead>
                    <TableHead>Total Penjualan</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShifts.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {shift.cashier.firstName} {shift.cashier.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              @{shift.cashier.username}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {formatDate(shift.startTime)}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTime(shift.startTime)} - 
                            {shift.endTime ? formatTime(shift.endTime) : 'Aktif'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDuration(shift.duration)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(shift.initialCash)}
                      </TableCell>
                      <TableCell>
                        {shift.finalCash ? formatCurrency(shift.finalCash) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {shift.totalTransactions} transaksi
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatCurrency(shift.totalSales)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(shift.status)}
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
