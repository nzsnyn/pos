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
  ClipboardList,
  Plus,
  Search,
  Edit,
  Eye,
  Calendar,
  Package,
  AlertTriangle,
  CheckCircle,
  Filter,
  RefreshCw,
  FileText,
  BarChart3
} from "lucide-react"

interface StockOpnameItem {
  id: string
  productId: string
  productName: string
  systemStock: number
  physicalStock: number
  difference: number
  unit: string
  notes?: string
}

interface StockOpname {
  id: string
  opnameNumber: string
  title: string
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  totalItems: number
  checkedItems: number
  totalDifference: number
  startDate: string
  completedDate?: string
  notes?: string
  items: StockOpnameItem[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

const statusLabels = {
  DRAFT: 'Draft',
  IN_PROGRESS: 'Sedang Berjalan',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan'
}

const statusVariants = {
  DRAFT: 'secondary' as const,
  IN_PROGRESS: 'default' as const,
  COMPLETED: 'default' as const,
  CANCELLED: 'destructive' as const
}

export default function StockOpnamePage() {
  const { user, logout } = useAuth()
  const [currentTime, setCurrentTime] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [stockOpnames, setStockOpnames] = useState<StockOpname[]>([])
  const [filteredStockOpnames, setFilteredStockOpnames] = useState<StockOpname[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedOpname, setSelectedOpname] = useState<StockOpname | null>(null)

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

  // Mock data for stock opname
  useEffect(() => {
    const mockStockOpnames: StockOpname[] = [
      {
        id: "1",
        opnameNumber: "SO-2025-001",
        title: "Stok Opname Bulanan Agustus 2025",
        status: 'COMPLETED',
        totalItems: 15,
        checkedItems: 15,
        totalDifference: -5,
        startDate: "2025-08-01T09:00:00.000Z",
        completedDate: "2025-08-02T16:30:00.000Z",
        notes: "Stok opname rutin bulanan untuk semua kategori produk",
        items: [
          {
            id: "1",
            productId: "prod1",
            productName: "Indomie Goreng",
            systemStock: 150,
            physicalStock: 148,
            difference: -2,
            unit: "pcs",
            notes: "Ada 2 kemasan rusak"
          },
          {
            id: "2",
            productId: "prod2",
            productName: "Teh Botol Sosro",
            systemStock: 80,
            physicalStock: 77,
            difference: -3,
            unit: "pcs",
            notes: "3 botol expired dibuang"
          },
          {
            id: "3",
            productId: "prod3",
            productName: "Beras Premium 5kg",
            systemStock: 25,
            physicalStock: 25,
            difference: 0,
            unit: "pack"
          }
        ],
        createdBy: "Admin",
        createdAt: "2025-08-01T08:00:00.000Z",
        updatedAt: "2025-08-02T16:30:00.000Z"
      },
      {
        id: "2",
        opnameNumber: "SO-2025-002",
        title: "Stok Opname Kategori Makanan",
        status: 'IN_PROGRESS',
        totalItems: 12,
        checkedItems: 8,
        totalDifference: 0,
        startDate: "2025-08-15T10:00:00.000Z",
        notes: "Fokus pada kategori makanan dan minuman",
        items: [
          {
            id: "4",
            productId: "prod4",
            productName: "Chitato Original",
            systemStock: 60,
            physicalStock: 58,
            difference: -2,
            unit: "pcs",
            notes: "Kemasan penyok"
          },
          {
            id: "5",
            productId: "prod5",
            productName: "Pocari Sweat",
            systemStock: 40,
            physicalStock: 42,
            difference: 2,
            unit: "pcs",
            notes: "Ada tambahan dari supplier"
          }
        ],
        createdBy: "Staff",
        createdAt: "2025-08-15T10:00:00.000Z",
        updatedAt: "2025-08-16T14:20:00.000Z"
      },
      {
        id: "3",
        opnameNumber: "SO-2025-003",
        title: "Stok Opname Mingguan",
        status: 'DRAFT',
        totalItems: 0,
        checkedItems: 0,
        totalDifference: 0,
        startDate: "2025-08-18T08:00:00.000Z",
        notes: "Persiapan stok opname mingguan",
        items: [],
        createdBy: "Admin",
        createdAt: "2025-08-18T08:00:00.000Z",
        updatedAt: "2025-08-18T08:00:00.000Z"
      }
    ]

    setTimeout(() => {
      setStockOpnames(mockStockOpnames)
      setFilteredStockOpnames(mockStockOpnames)
      setLoading(false)
    }, 1000)
  }, [])

  // Filter stock opnames
  useEffect(() => {
    let filtered = stockOpnames.filter(opname =>
      opname.opnameNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opname.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opname.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (statusFilter !== "all") {
      filtered = filtered.filter(opname => opname.status === statusFilter)
    }

    setFilteredStockOpnames(filtered)
  }, [stockOpnames, searchTerm, statusFilter])

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

  const openDetailDialog = (opname: StockOpname) => {
    setSelectedOpname(opname)
    setIsDetailDialogOpen(true)
  }

  const getTotalStats = () => {
    const completed = filteredStockOpnames.filter(o => o.status === 'COMPLETED').length
    const inProgress = filteredStockOpnames.filter(o => o.status === 'IN_PROGRESS').length
    const totalDifferences = filteredStockOpnames.reduce((acc, curr) => acc + Math.abs(curr.totalDifference), 0)
    return { completed, inProgress, totalDifferences }
  }

  const stats = getTotalStats()

  const getProgressPercentage = (opname: StockOpname) => {
    if (opname.totalItems === 0) return 0
    return Math.round((opname.checkedItems / opname.totalItems) * 100)
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
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Stok Opname</h1>
                  <p className="text-gray-600">Kelola penghitungan dan pemeriksaan stok fisik</p>
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
                    Buat Stok Opname
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <ClipboardList className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Stok Opname</p>
                        <p className="text-2xl font-bold text-gray-900">{filteredStockOpnames.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Sudah Selesai</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <AlertTriangle className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Selisih</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalDifferences}</p>
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
                      <Label className="text-sm font-medium text-gray-700 mb-1 block">Cari Stok Opname</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="text"
                          placeholder="Nomor SO, judul, atau catatan..."
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
                        <option value="IN_PROGRESS">Sedang Berjalan</option>
                        <option value="COMPLETED">Selesai</option>
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

              {/* Stock Opname Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Daftar Stok Opname ({filteredStockOpnames.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    {loading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="flex items-center space-x-4 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-4 bg-gray-200 rounded w-48"></div>
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
                            <th className="text-left p-4">Nomor SO</th>
                            <th className="text-left p-4">Judul</th>
                            <th className="text-left p-4">Progress</th>
                            <th className="text-left p-4">Selisih</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-left p-4">Tanggal Mulai</th>
                            <th className="text-left p-4">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStockOpnames.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center p-8 text-gray-500">
                                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Tidak ada stok opname ditemukan</p>
                              </td>
                            </tr>
                          ) : (
                            filteredStockOpnames.map((opname) => (
                              <tr key={opname.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                  <div className="font-medium">{opname.opnameNumber}</div>
                                  <div className="text-sm text-gray-500">oleh {opname.createdBy}</div>
                                </td>
                                <td className="p-4">
                                  <div className="font-medium">{opname.title}</div>
                                  {opname.notes && (
                                    <div className="text-sm text-gray-500">{opname.notes}</div>
                                  )}
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${getProgressPercentage(opname)}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm text-gray-600">
                                      {opname.checkedItems}/{opname.totalItems}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className={`font-medium ${opname.totalDifference === 0 ? 'text-green-600' : opname.totalDifference > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    {opname.totalDifference > 0 ? '+' : ''}{opname.totalDifference}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <Badge variant={statusVariants[opname.status]}>
                                    {statusLabels[opname.status]}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="text-sm flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(opname.startDate)}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openDetailDialog(opname)}
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={opname.status === 'COMPLETED'}
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
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>Detail Stok Opname - {selectedOpname?.opnameNumber}</DialogTitle>
            </DialogHeader>
            {selectedOpname && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="font-medium">Judul:</Label>
                    <p className="text-sm text-gray-700">{selectedOpname.title}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Status:</Label>
                    <div className="mt-1">
                      <Badge variant={statusVariants[selectedOpname.status]}>
                        {statusLabels[selectedOpname.status]}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="font-medium">Progress:</Label>
                    <p className="text-sm text-gray-700">
                      {selectedOpname.checkedItems}/{selectedOpname.totalItems} item 
                      ({getProgressPercentage(selectedOpname)}%)
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Tanggal Mulai:</Label>
                    <p className="text-sm text-gray-700">{formatDate(selectedOpname.startDate)}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Tanggal Selesai:</Label>
                    <p className="text-sm text-gray-700">
                      {selectedOpname.completedDate ? formatDate(selectedOpname.completedDate) : "Belum selesai"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Total Selisih:</Label>
                    <p className={`text-sm font-medium ${selectedOpname.totalDifference === 0 ? 'text-green-600' : selectedOpname.totalDifference > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {selectedOpname.totalDifference > 0 ? '+' : ''}{selectedOpname.totalDifference}
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label className="font-medium block mb-2">Detail Item:</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3">Produk</th>
                          <th className="text-left p-3">Stok Sistem</th>
                          <th className="text-left p-3">Stok Fisik</th>
                          <th className="text-left p-3">Selisih</th>
                          <th className="text-left p-3">Catatan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOpname.items.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center p-6 text-gray-500">
                              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>Belum ada item yang ditambahkan</p>
                            </td>
                          </tr>
                        ) : (
                          selectedOpname.items.map((item) => (
                            <tr key={item.id} className="border-t">
                              <td className="p-3">
                                <div className="font-medium">{item.productName}</div>
                                <div className="text-sm text-gray-500">Unit: {item.unit}</div>
                              </td>
                              <td className="p-3 text-center">{item.systemStock}</td>
                              <td className="p-3 text-center">{item.physicalStock}</td>
                              <td className="p-3 text-center">
                                <span className={`font-medium ${item.difference === 0 ? 'text-green-600' : item.difference > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                  {item.difference > 0 ? '+' : ''}{item.difference}
                                </span>
                              </td>
                              <td className="p-3 text-sm text-gray-600">{item.notes || "-"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {selectedOpname.notes && (
                  <div>
                    <Label className="font-medium">Catatan:</Label>
                    <p className="text-sm text-gray-700 mt-1">{selectedOpname.notes}</p>
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
