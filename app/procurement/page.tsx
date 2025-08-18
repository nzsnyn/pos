"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/pos/header"
import { Sidebar } from "@/components/pos/sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import {
  ShoppingBag,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Package,
  User,
  Filter,
  RefreshCw,
  FileText,
  TrendingUp
} from "lucide-react"

interface ProcurementItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Procurement {
  id: string
  procurementNumber: string
  supplierId?: string
  supplierName?: string
  totalItems: number
  totalAmount: number
  status: 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED'
  orderDate: string
  receivedDate?: string
  notes?: string
  items: ProcurementItem[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

const statusLabels = {
  DRAFT: 'Draft',
  ORDERED: 'Dipesan',
  RECEIVED: 'Diterima',
  CANCELLED: 'Dibatalkan'
}

const statusVariants = {
  DRAFT: 'secondary' as const,
  ORDERED: 'default' as const,
  RECEIVED: 'default' as const,
  CANCELLED: 'destructive' as const
}

export default function ProcurementPage() {
  const { user, logout } = useAuth()
  const [currentTime, setCurrentTime] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [procurements, setProcurements] = useState<Procurement[]>([])
  const [filteredProcurements, setFilteredProcurements] = useState<Procurement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedProcurement, setSelectedProcurement] = useState<Procurement | null>(null)

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

  // Mock data for procurement
  useEffect(() => {
    const mockProcurements: Procurement[] = [
      {
        id: "1",
        procurementNumber: "PO-2025-001",
        supplierId: "sup1",
        supplierName: "PT. Maju Jaya",
        totalItems: 3,
        totalAmount: 1500000,
        status: 'RECEIVED',
        orderDate: "2025-08-15T08:00:00.000Z",
        receivedDate: "2025-08-17T10:30:00.000Z",
        notes: "Pengadaan rutin mingguan",
        items: [
          {
            id: "1",
            productId: "prod1",
            productName: "Indomie Goreng",
            quantity: 100,
            unitPrice: 3500,
            totalPrice: 350000
          },
          {
            id: "2", 
            productId: "prod2",
            productName: "Teh Botol Sosro",
            quantity: 50,
            unitPrice: 4500,
            totalPrice: 225000
          },
          {
            id: "3",
            productId: "prod3",
            productName: "Beras Premium 5kg",
            quantity: 20,
            unitPrice: 46250,
            totalPrice: 925000
          }
        ],
        createdBy: "Admin",
        createdAt: "2025-08-15T08:00:00.000Z",
        updatedAt: "2025-08-17T10:30:00.000Z"
      },
      {
        id: "2",
        procurementNumber: "PO-2025-002",
        supplierId: "sup2",
        supplierName: "CV. Berkah Selalu",
        totalItems: 2,
        totalAmount: 750000,
        status: 'ORDERED',
        orderDate: "2025-08-16T09:15:00.000Z",
        notes: "Pengadaan produk cleaning",
        items: [
          {
            id: "4",
            productId: "prod4",
            productName: "Deterjen Rinso",
            quantity: 30,
            unitPrice: 12500,
            totalPrice: 375000
          },
          {
            id: "5",
            productId: "prod5",
            productName: "Sabun Cuci Piring",
            quantity: 25,
            unitPrice: 15000,
            totalPrice: 375000
          }
        ],
        createdBy: "Admin",
        createdAt: "2025-08-16T09:15:00.000Z",
        updatedAt: "2025-08-16T09:15:00.000Z"
      },
      {
        id: "3",
        procurementNumber: "PO-2025-003",
        totalItems: 1,
        totalAmount: 500000,
        status: 'DRAFT',
        orderDate: "2025-08-18T14:00:00.000Z",
        notes: "Draft pengadaan snack",
        items: [
          {
            id: "6",
            productId: "prod6", 
            productName: "Chitato Mix",
            quantity: 50,
            unitPrice: 10000,
            totalPrice: 500000
          }
        ],
        createdBy: "Admin",
        createdAt: "2025-08-18T14:00:00.000Z",
        updatedAt: "2025-08-18T14:00:00.000Z"
      }
    ]

    setTimeout(() => {
      setProcurements(mockProcurements)
      setFilteredProcurements(mockProcurements)
      setLoading(false)
    }, 1000)
  }, [])

  // Filter procurements
  useEffect(() => {
    let filtered = procurements.filter(procurement =>
      procurement.procurementNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      procurement.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      procurement.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (statusFilter !== "all") {
      filtered = filtered.filter(procurement => procurement.status === statusFilter)
    }

    setFilteredProcurements(filtered)
  }, [procurements, searchTerm, statusFilter])

  const handleSettings = () => {
    console.log("Settings clicked")
  }

  const handleReports = () => {
    console.log("Reports clicked") 
  }

  const handleLogout = async () => {
    await logout()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const openDetailDialog = (procurement: Procurement) => {
    setSelectedProcurement(procurement)
    setIsDetailDialogOpen(true)
  }

  const getTotalStats = () => {
    const total = filteredProcurements.reduce((acc, curr) => acc + curr.totalAmount, 0)
    const received = filteredProcurements.filter(p => p.status === 'RECEIVED').length
    const pending = filteredProcurements.filter(p => p.status === 'ORDERED').length
    return { total, received, pending }
  }

  const stats = getTotalStats()

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
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Pengadaan Produk</h1>
                  <p className="text-gray-600">Kelola pesanan dan pengadaan produk dari supplier</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => setLoading(true)}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Buat Pengadaan
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <ShoppingBag className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Pengadaan</p>
                        <p className="text-2xl font-bold text-gray-900">{filteredProcurements.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Package className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Sudah Diterima</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.received}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Nilai</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-1 block">Cari Pengadaan</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="text"
                          placeholder="Nomor PO, supplier, atau catatan..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-1 block">Status</Label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">Semua Status</option>
                        <option value="DRAFT">Draft</option>
                        <option value="ORDERED">Dipesan</option>
                        <option value="RECEIVED">Diterima</option>
                        <option value="CANCELLED">Dibatalkan</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setSearchTerm("")
                          setStatusFilter("all")
                        }}
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Reset Filter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Procurement Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Daftar Pengadaan ({filteredProcurements.length})
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
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-4">Nomor PO</th>
                            <th className="text-left p-4">Supplier</th>
                            <th className="text-left p-4">Total Item</th>
                            <th className="text-left p-4">Total Nilai</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-left p-4">Tanggal Pesan</th>
                            <th className="text-left p-4">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProcurements.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center p-8 text-gray-500">
                                <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Tidak ada pengadaan ditemukan</p>
                              </td>
                            </tr>
                          ) : (
                            filteredProcurements.map((procurement) => (
                              <tr key={procurement.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                  <div className="font-medium">{procurement.procurementNumber}</div>
                                  {procurement.notes && (
                                    <div className="text-sm text-gray-500">{procurement.notes}</div>
                                  )}
                                </td>
                                <td className="p-4">
                                  {procurement.supplierName ? (
                                    <div className="flex items-center gap-1">
                                      <User className="h-4 w-4 text-blue-500" />
                                      <span>{procurement.supplierName}</span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">Belum dipilih</span>
                                  )}
                                </td>
                                <td className="p-4">
                                  <div className="text-center">
                                    <span className="font-medium">{procurement.totalItems}</span>
                                    <span className="text-sm text-gray-500"> item</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="font-medium text-green-600">
                                    {formatCurrency(procurement.totalAmount)}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <Badge variant={statusVariants[procurement.status]}>
                                    {statusLabels[procurement.status]}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="text-sm flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(procurement.orderDate)}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openDetailDialog(procurement)}
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={procurement.status === 'RECEIVED'}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </div>
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

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Detail Pengadaan - {selectedProcurement?.procurementNumber}</DialogTitle>
            </DialogHeader>
            {selectedProcurement && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Supplier:</Label>
                    <p className="text-sm text-gray-700">{selectedProcurement.supplierName || "Belum dipilih"}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Status:</Label>
                    <div className="mt-1">
                      <Badge variant={statusVariants[selectedProcurement.status]}>
                        {statusLabels[selectedProcurement.status]}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="font-medium">Tanggal Pesan:</Label>
                    <p className="text-sm text-gray-700">{formatDate(selectedProcurement.orderDate)}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Total Nilai:</Label>
                    <p className="text-sm font-medium text-green-600">{formatCurrency(selectedProcurement.totalAmount)}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="font-medium block mb-2">Detail Item:</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3">Produk</th>
                          <th className="text-left p-3">Qty</th>
                          <th className="text-left p-3">Harga Satuan</th>
                          <th className="text-left p-3">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProcurement.items.map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="p-3">{item.productName}</td>
                            <td className="p-3">{item.quantity}</td>
                            <td className="p-3">{formatCurrency(item.unitPrice)}</td>
                            <td className="p-3 font-medium">{formatCurrency(item.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {selectedProcurement.notes && (
                  <div>
                    <Label className="font-medium">Catatan:</Label>
                    <p className="text-sm text-gray-700 mt-1">{selectedProcurement.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Toaster richColors />
      </div>
    </ProtectedRoute>
  )
}
