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
import { Switch } from "@/components/ui/switch"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import {
  Truck,
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  MapPin,
  Store,
  Calendar,
  Filter,
  RefreshCw
} from "lucide-react"

interface Supplier {
  id: string
  name: string
  phone?: string
  address?: string
  storeName?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function SuppliersPage() {
  const { user, logout } = useAuth()
  const [currentTime, setCurrentTime] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    storeName: "",
    isActive: true
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

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/suppliers')
      if (response.ok) {
        const data = await response.json()
        setSuppliers(data.suppliers)
        setFilteredSuppliers(data.suppliers)
      } else {
        toast.error('Gagal memuat data supplier')
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      toast.error('Terjadi kesalahan saat memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  // Filter suppliers
  useEffect(() => {
    let filtered = suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (statusFilter !== "all") {
      filtered = filtered.filter(supplier => 
        statusFilter === "active" ? supplier.isActive : !supplier.isActive
      )
    }

    setFilteredSuppliers(filtered)
  }, [suppliers, searchTerm, statusFilter])

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      address: "",
      storeName: "",
      isActive: true
    })
    setSelectedSupplier(null)
  }

  const handleAddSupplier = async () => {
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Supplier berhasil ditambahkan')
        setIsAddDialogOpen(false)
        resetForm()
        fetchSuppliers()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menambahkan supplier')
      }
    } catch (error) {
      console.error('Error adding supplier:', error)
      toast.error('Terjadi kesalahan saat menambahkan supplier')
    }
  }

  const handleEditSupplier = async () => {
    if (!selectedSupplier) return

    try {
      const response = await fetch(`/api/suppliers/${selectedSupplier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Supplier berhasil diperbarui')
        setIsEditDialogOpen(false)
        resetForm()
        fetchSuppliers()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal memperbarui supplier')
      }
    } catch (error) {
      console.error('Error updating supplier:', error)
      toast.error('Terjadi kesalahan saat memperbarui supplier')
    }
  }

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus supplier ini?')) return

    try {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Supplier berhasil dihapus')
        fetchSuppliers()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menghapus supplier')
      }
    } catch (error) {
      console.error('Error deleting supplier:', error)
      toast.error('Terjadi kesalahan saat menghapus supplier')
    }
  }

  const openEditDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setFormData({
      name: supplier.name,
      phone: supplier.phone || "",
      address: supplier.address || "",
      storeName: supplier.storeName || "",
      isActive: supplier.isActive
    })
    setIsEditDialogOpen(true)
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
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Data Supplier</h1>
                  <p className="text-gray-600">Kelola informasi supplier dan vendor</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={fetchSuppliers}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2" onClick={() => resetForm()}>
                        <Plus className="h-4 w-4" />
                        Tambah Supplier
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Tambah Supplier Baru</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Nama Supplier *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Masukkan nama supplier"
                          />
                        </div>
                        <div>
                          <Label htmlFor="storeName">Nama Toko/Agen</Label>
                          <Input
                            id="storeName"
                            value={formData.storeName}
                            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                            placeholder="Masukkan nama toko atau agen"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Nomor HP</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Masukkan nomor HP"
                          />
                        </div>
                        <div>
                          <Label htmlFor="address">Alamat</Label>
                          <Textarea
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Masukkan alamat lengkap"
                            rows={3}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                          />
                          <Label htmlFor="isActive">Status Aktif</Label>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button onClick={handleAddSupplier} disabled={!formData.name.trim()}>
                            Simpan
                          </Button>
                          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            Batal
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Filters */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-1 block">Cari Supplier</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="text"
                          placeholder="Nama, toko, atau nomor HP..."
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
                        onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                      >
                        <option value="all">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Tidak Aktif</option>
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

              {/* Suppliers Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Daftar Supplier ({filteredSuppliers.length})
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
                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-4">Nama Supplier</th>
                            <th className="text-left p-4">Toko/Agen</th>
                            <th className="text-left p-4">Kontak</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-left p-4">Ditambahkan</th>
                            <th className="text-left p-4">Terakhir Update</th>
                            <th className="text-left p-4">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSuppliers.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center p-8 text-gray-500">
                                <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Tidak ada supplier ditemukan</p>
                              </td>
                            </tr>
                          ) : (
                            filteredSuppliers.map((supplier) => (
                              <tr key={supplier.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                  <div className="font-medium">{supplier.name}</div>
                                  {supplier.address && (
                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {supplier.address.length > 50 
                                        ? `${supplier.address.substring(0, 50)}...`
                                        : supplier.address
                                      }
                                    </div>
                                  )}
                                </td>
                                <td className="p-4">
                                  {supplier.storeName ? (
                                    <div className="flex items-center gap-1">
                                      <Store className="h-4 w-4 text-blue-500" />
                                      <span>{supplier.storeName}</span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="p-4">
                                  {supplier.phone ? (
                                    <div className="flex items-center gap-1">
                                      <Phone className="h-4 w-4 text-green-500" />
                                      <span>{supplier.phone}</span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="p-4">
                                  <Badge variant={supplier.isActive ? "default" : "secondary"}>
                                    {supplier.isActive ? "Aktif" : "Tidak Aktif"}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="text-sm flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(supplier.createdAt)}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="text-sm text-gray-500">
                                    {formatDate(supplier.updatedAt)}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openEditDialog(supplier)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteSupplier(supplier.id)}
                                      className="text-red-600 border-red-300 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-3 w-3" />
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Supplier</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nama Supplier *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama supplier"
                />
              </div>
              <div>
                <Label htmlFor="edit-storeName">Nama Toko/Agen</Label>
                <Input
                  id="edit-storeName"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  placeholder="Masukkan nama toko atau agen"
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Nomor HP</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Masukkan nomor HP"
                />
              </div>
              <div>
                <Label htmlFor="edit-address">Alamat</Label>
                <Textarea
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Masukkan alamat lengkap"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="edit-isActive">Status Aktif</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleEditSupplier} disabled={!formData.name.trim()}>
                  Simpan Perubahan
                </Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Batal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Toaster richColors />
      </div>
    </ProtectedRoute>
  )
}
