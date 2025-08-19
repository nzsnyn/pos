"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/pos/header"
import { Sidebar } from "@/components/pos/sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { 
  Plus, 
  Search, 
  Eye,
  Edit,
  Settings,
  FileText,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Loader2,
  Save,
  X,
  CheckCircle,
  Calendar
} from "lucide-react"

interface StockOpnameItem {
  id: string
  productId: string
  product: {
    name: string
    stock: number
  }
  systemStock: number
  physicalStock: number | null
  difference: number
  notes?: string
  isChecked: boolean
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
  createdBy: {
    name: string
  }
  createdAt: string
  updatedAt: string
}

interface Product {
  id: string
  name: string
  stock: number
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
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    notes: ''
  })
  const [saving, setSaving] = useState(false)

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

  // Load stock opnames
  useEffect(() => {
    loadStockOpnames()
  }, [])

  // Load products for selection
  useEffect(() => {
    if (isAddDialogOpen) {
      loadProducts()
    }
  }, [isAddDialogOpen])

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

  const loadStockOpnames = async () => {
    try {
      const response = await fetch('/api/stock-opname')
      if (response.ok) {
        const data = await response.json()
        setStockOpnames(data)
        setFilteredStockOpnames(data)
      } else {
        toast.error('Gagal memuat data stock opname')
      }
    } catch (error) {
      console.error('Error loading stock opnames:', error)
      toast.error('Terjadi kesalahan saat memuat data')
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.filter((p: Product) => p.stock > 0)) // Only show products with stock
      } else {
        toast.error('Gagal memuat data produk')
      }
    } catch (error) {
      console.error('Error loading products:', error)
      toast.error('Terjadi kesalahan saat memuat produk')
    }
  }

  const handleCreateStockOpname = async () => {
    if (!formData.title.trim()) {
      toast.error('Judul harus diisi')
      return
    }

    if (selectedProducts.length === 0) {
      toast.error('Pilih minimal satu produk')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/stock-opname', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          notes: formData.notes || null,
          productIds: selectedProducts
        }),
      })

      if (response.ok) {
        const newOpname = await response.json()
        setStockOpnames(prev => [newOpname, ...prev])
        setIsAddDialogOpen(false)
        setFormData({ title: '', notes: '' })
        setSelectedProducts([])
        toast.success('Stock opname berhasil dibuat')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal membuat stock opname')
      }
    } catch (error) {
      console.error('Error creating stock opname:', error)
      toast.error('Terjadi kesalahan saat membuat stock opname')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateItem = async (opnameId: string, itemId: string, physicalStock: number, notes?: string) => {
    try {
      const response = await fetch(`/api/stock-opname/${opnameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-item',
          itemId,
          physicalStock,
          notes
        }),
      })

      if (response.ok) {
        const updatedOpname = await response.json()
        setStockOpnames(prev => prev.map(op => op.id === opnameId ? updatedOpname : op))
        if (selectedOpname?.id === opnameId) {
          setSelectedOpname(updatedOpname)
        }
        toast.success('Item berhasil diperbarui')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal memperbarui item')
      }
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error('Terjadi kesalahan saat memperbarui item')
    }
  }

  const handleStartOpname = async (opnameId: string) => {
    try {
      const response = await fetch(`/api/stock-opname/${opnameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start'
        }),
      })

      if (response.ok) {
        const updatedOpname = await response.json()
        setStockOpnames(prev => prev.map(op => op.id === opnameId ? updatedOpname : op))
        toast.success('Stock opname berhasil dimulai')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal memulai stock opname')
      }
    } catch (error) {
      console.error('Error starting opname:', error)
      toast.error('Terjadi kesalahan saat memulai stock opname')
    }
  }

  const openDetailDialog = (opname: StockOpname) => {
    setSelectedOpname(opname)
    setIsDetailDialogOpen(true)
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

  const getProgressPercentage = (opname: StockOpname) => {
    if (opname.totalItems === 0) return 0
    return Math.round((opname.checkedItems / opname.totalItems) * 100)
  }

  const stats = {
    totalOpnames: stockOpnames.length,
    inProgress: stockOpnames.filter(op => op.status === 'IN_PROGRESS').length,
    completed: stockOpnames.filter(op => op.status === 'COMPLETED').length,
    totalDifferences: stockOpnames.reduce((sum, op) => sum + Math.abs(op.totalDifference), 0)
  }

  const handleSettings = () => {
    console.log("Settings clicked")
  }

  const handleReports = () => {
    console.log("Reports clicked")
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
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

          <div className="flex-1 overflow-auto p-6">
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="flex items-center p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Stock Opname</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalOpnames}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Sedang Berjalan</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Selesai</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center p-4">
                    <div className="flex items-center space-x-3">
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

              {/* Controls */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Daftar Stock Opname</h2>
                    <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="h-4 w-4" />
                      Buat Stock Opname Baru
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-1 block">Cari Stock Opname</Label>
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
                        Reset Filter
                      </Button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="border rounded-lg overflow-hidden">
                    {loading ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        Memuat data...
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-4 font-medium text-gray-700">No. SO</th>
                            <th className="text-left p-4 font-medium text-gray-700">Judul</th>
                            <th className="text-left p-4 font-medium text-gray-700">Status</th>
                            <th className="text-left p-4 font-medium text-gray-700">Progress</th>
                            <th className="text-left p-4 font-medium text-gray-700">Selisih</th>
                            <th className="text-left p-4 font-medium text-gray-700">Tanggal</th>
                            <th className="text-left p-4 font-medium text-gray-700">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStockOpnames.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center p-8 text-gray-500">
                                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>Tidak ada stock opname ditemukan</p>
                              </td>
                            </tr>
                          ) : (
                            filteredStockOpnames.map((opname) => (
                              <tr key={opname.id} className="border-t hover:bg-gray-50">
                                <td className="p-4 font-medium">{opname.opnameNumber}</td>
                                <td className="p-4">
                                  <div className="font-medium">{opname.title}</div>
                                  {opname.notes && (
                                    <div className="text-sm text-gray-500 mt-1">{opname.notes}</div>
                                  )}
                                </td>
                                <td className="p-4">
                                  <Badge variant={statusVariants[opname.status]}>
                                    {statusLabels[opname.status]}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center space-x-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                        style={{ width: `${getProgressPercentage(opname)}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm text-gray-600 w-10">
                                      {getProgressPercentage(opname)}%
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {opname.checkedItems}/{opname.totalItems} item
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className={`font-medium ${opname.totalDifference === 0 ? 'text-green-600' : opname.totalDifference > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    {opname.totalDifference > 0 ? '+' : ''}{opname.totalDifference}
                                  </span>
                                </td>
                                <td className="p-4 text-sm text-gray-600">
                                  <div>{formatDate(opname.startDate)}</div>
                                  {opname.completedDate && (
                                    <div className="text-green-600">
                                      Selesai: {formatDate(opname.completedDate)}
                                    </div>
                                  )}
                                </td>
                                <td className="p-4">
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openDetailDialog(opname)}
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    {opname.status === 'DRAFT' && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleStartOpname(opname.id)}
                                      >
                                        Mulai
                                      </Button>
                                    )}
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

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Buat Stock Opname Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">Judul *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Masukkan judul stock opname"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">Catatan</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Catatan tambahan (opsional)"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Pilih Produk *</Label>
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProducts([...selectedProducts, product.id])
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                          }
                        }}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">Stok: {product.stock}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedProducts.length} produk dipilih
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleCreateStockOpname} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Buat Stock Opname
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-6xl">
            <DialogHeader>
              <DialogTitle>Detail Stock Opname - {selectedOpname?.opnameNumber}</DialogTitle>
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
                          <th className="text-left p-3">Status</th>
                          <th className="text-left p-3">Catatan</th>
                          {selectedOpname.status === 'IN_PROGRESS' && (
                            <th className="text-left p-3">Aksi</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOpname.items.length === 0 ? (
                          <tr>
                            <td colSpan={selectedOpname.status === 'IN_PROGRESS' ? 7 : 6} className="text-center p-6 text-gray-500">
                              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>Belum ada item yang ditambahkan</p>
                            </td>
                          </tr>
                        ) : (
                          selectedOpname.items.map((item) => (
                            <tr key={item.id} className="border-t">
                              <td className="p-3">
                                <div className="font-medium">{item.product.name}</div>
                              </td>
                              <td className="p-3 text-center">{item.systemStock}</td>
                              <td className="p-3 text-center">
                                {item.physicalStock !== null ? item.physicalStock : '-'}
                              </td>
                              <td className="p-3 text-center">
                                {item.physicalStock !== null ? (
                                  <span className={`font-medium ${item.difference === 0 ? 'text-green-600' : item.difference > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    {item.difference > 0 ? '+' : ''}{item.difference}
                                  </span>
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td className="p-3">
                                {item.isChecked ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <div className="h-4 w-4 border-2 border-gray-300 rounded-full"></div>
                                )}
                              </td>
                              <td className="p-3 text-sm text-gray-600">{item.notes || "-"}</td>
                              {selectedOpname.status === 'IN_PROGRESS' && (
                                <td className="p-3">
                                  <StockOpnameItemEditor
                                    item={item}
                                    onUpdate={(physicalStock, notes) => 
                                      handleUpdateItem(selectedOpname.id, item.id, physicalStock, notes)
                                    }
                                  />
                                </td>
                              )}
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

// Component for editing stock opname items
function StockOpnameItemEditor({ 
  item, 
  onUpdate 
}: { 
  item: StockOpnameItem
  onUpdate: (physicalStock: number, notes?: string) => void 
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [physicalStock, setPhysicalStock] = useState(item.physicalStock || item.systemStock)
  const [notes, setNotes] = useState(item.notes || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onUpdate(physicalStock, notes || undefined)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating item:', error)
    } finally {
      setSaving(false)
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        <Input
          type="number"
          value={physicalStock}
          onChange={(e) => setPhysicalStock(parseInt(e.target.value) || 0)}
          placeholder="Stok fisik"
          className="w-20"
        />
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Catatan"
          className="w-full"
        />
        <div className="flex space-x-1">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
      <Edit className="h-3 w-3" />
    </Button>
  )
}
