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
  product: {
    id: string
    name: string
    price: number
    category?: {
      id: string
      name: string
    }
  }
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Procurement {
  id: string
  procurementNumber: string
  supplier?: {
    id: string
    name: string
    phone?: string
    address?: string
  }
  supplierId?: string
  totalItems: number
  totalAmount: number
  status: 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED'
  orderDate: string
  receivedDate?: string
  notes?: string
  items: ProcurementItem[]
  createdBy: {
    id: string
    firstName: string
    lastName: string
  }
  createdAt: string
  updatedAt: string
}

interface Product {
  id: string
  name: string
  price: number
  category: {
    id: string
    name: string
  }
}

interface Supplier {
  id: string
  name: string
  phone?: string
  address?: string
}

interface FormItem {
  productId: string
  productName: string
  quantity: string
  unitPrice: string
  totalPrice: number
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
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedProcurement, setSelectedProcurement] = useState<Procurement | null>(null)
  
  // Form states
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState("")
  const [notes, setNotes] = useState("")
  const [formItems, setFormItems] = useState<FormItem[]>([
    { productId: "", productName: "", quantity: "1", unitPrice: "", totalPrice: 0 }
  ])

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

  // Fetch data
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [procurementsRes, productsRes, suppliersRes] = await Promise.all([
        fetch('/api/procurement'),
        fetch('/api/products'),
        fetch('/api/suppliers')
      ])

      if (!procurementsRes.ok) throw new Error('Gagal memuat data pengadaan')
      if (!productsRes.ok) throw new Error('Gagal memuat data produk')
      if (!suppliersRes.ok) throw new Error('Gagal memuat data supplier')

      const [procurementsData, productsData, suppliersData] = await Promise.all([
        procurementsRes.json(),
        productsRes.json(),
        suppliersRes.json()
      ])

      setProcurements(procurementsData)
      setProducts(productsData)
      setSuppliers(suppliersData)
      setFilteredProcurements(procurementsData)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat memuat data")
    } finally {
      setLoading(false)
    }
  }

  // Filter procurements
  useEffect(() => {
    let filtered = procurements.filter(procurement =>
      procurement.procurementNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      procurement.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      procurement.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (statusFilter !== "all") {
      filtered = filtered.filter(procurement => procurement.status === statusFilter)
    }

    setFilteredProcurements(filtered)
  }, [procurements, searchTerm, statusFilter])

  const addFormItem = () => {
    setFormItems([...formItems, { productId: "", productName: "", quantity: "1", unitPrice: "", totalPrice: 0 }])
  }

  const removeFormItem = (index: number) => {
    if (formItems.length > 1) {
      const newItems = formItems.filter((_, i) => i !== index)
      setFormItems(newItems)
    }
  }

  const updateFormItem = (index: number, field: keyof FormItem, value: string) => {
    const newItems = [...formItems]
    newItems[index] = { ...newItems[index], [field]: value }

    // Update product name when productId changes
    if (field === 'productId') {
      const product = products.find(p => p.id === value)
      if (product) {
        newItems[index].productName = product.name
        newItems[index].unitPrice = product.price.toString()
      }
    }

    // Calculate total price
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = parseFloat(newItems[index].quantity) || 0
      const unitPrice = parseFloat(newItems[index].unitPrice) || 0
      newItems[index].totalPrice = quantity * unitPrice
    }

    setFormItems(newItems)
  }

  const resetForm = () => {
    setSelectedSupplier("")
    setNotes("")
    setFormItems([{ productId: "", productName: "", quantity: "1", unitPrice: "", totalPrice: 0 }])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedSupplier) {
      toast.error("Pilih supplier terlebih dahulu")
      return
    }

    if (formItems.every(item => !item.productId)) {
      toast.error("Pilih minimal satu produk")
      return
    }

    const validItems = formItems.filter(item => item.productId && item.quantity && item.unitPrice)
    if (validItems.length === 0) {
      toast.error("Lengkapi data item pengadaan")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/procurement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplierId: selectedSupplier || null,
          items: validItems.map(item => ({
            productId: item.productId,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice)
          })),
          notes: notes || null,
          createdById: user?.id
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Terjadi kesalahan')
      }

      toast.success("Pengadaan berhasil dibuat")
      setIsAddDialogOpen(false)
      resetForm()
      await fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan")
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (procurementId: string, newStatus: string) => {
    setSubmitting(true)
    try {
      // Find the current procurement to preserve its supplier
      const currentProcurement = procurements?.find(p => p.id === procurementId)
      
      const updateData: any = { 
        status: newStatus,
        supplierId: currentProcurement?.supplierId // Preserve the current supplier
      }
      if (newStatus === 'RECEIVED') {
        updateData.receivedDate = new Date().toISOString()
      }

      const response = await fetch(`/api/procurement/${procurementId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal mengubah status')
      }

      toast.success("Status pengadaan berhasil diperbarui")
      await fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan")
    } finally {
      setSubmitting(false)
    }
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
                                  {procurement.supplier ? (
                                    <div className="flex items-center gap-1">
                                      <User className="h-4 w-4 text-blue-500" />
                                      <span>{procurement.supplier.name}</span>
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
                                    {procurement.status === 'DRAFT' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleStatusUpdate(procurement.id, 'ORDERED')}
                                        disabled={submitting}
                                      >
                                        Order
                                      </Button>
                                    )}
                                    {procurement.status === 'ORDERED' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleStatusUpdate(procurement.id, 'RECEIVED')}
                                        disabled={submitting}
                                      >
                                        Terima
                                      </Button>
                                    )}
                                    {procurement.status !== 'RECEIVED' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={true}
                                      >
                                        <Edit className="h-3 w-3" />
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

        {/* Add Procurement Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="min-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Buat Pengadaan Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Supplier Selection */}
              <div>
                <Label className="font-medium">Supplier *</Label>
                <select
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  required
                >
                  <option value="">Pilih Supplier</option>
                  {suppliers && suppliers.length > 0 ? suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  )) : (
                    <option disabled>Memuat suppliers...</option>
                  )}
                </select>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-medium">Item Pengadaan</Label>
                  <Button type="button" size="sm" onClick={addFormItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Tambah Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {formItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 p-4 border rounded-lg">
                      <div className="col-span-4">
                        <Label>Produk</Label>
                        <select
                          className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={item.productId}
                          onChange={(e) => updateFormItem(index, 'productId', e.target.value)}
                          required
                        >
                          <option value="">Pilih Produk</option>
                          {products && products.length > 0 ? products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} - {formatCurrency(product.price)}
                            </option>
                          )) : (
                            <option disabled>Memuat produk...</option>
                          )}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <Label>Qty</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateFormItem(index, 'quantity', e.target.value)}
                          className="mt-1"
                          required
                        />
                      </div>

                      <div className="col-span-3">
                        <Label>Harga Satuan</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateFormItem(index, 'unitPrice', e.target.value)}
                          className="mt-1"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <Label>Total</Label>
                        <div className="mt-1 px-3 py-2 bg-gray-50 border rounded-md text-sm font-medium">
                          {formatCurrency(item.totalPrice)}
                        </div>
                      </div>

                      <div className="col-span-1 flex items-end">
                        {formItems.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => removeFormItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center text-lg font-medium">
                    <span>Total Keseluruhan:</span>
                    <span className="text-green-600">
                      {formatCurrency(formItems.reduce((sum, item) => sum + item.totalPrice, 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label className="font-medium">Catatan</Label>
                <Textarea
                  placeholder="Catatan tambahan untuk pengadaan ini..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    resetForm()
                  }}
                  disabled={submitting}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

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
                    <p className="text-sm text-gray-700">{selectedProcurement.supplier?.name || "Belum dipilih"}</p>
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
                            <td className="p-3">{item.product.name}</td>
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
