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
  Scale,
  Plus,
  Search,
  Edit,
  Trash2,
  Info,
  Filter,
  RefreshCw
} from "lucide-react"

interface Unit {
  id: string
  name: string
  symbol: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function UnitsPage() {
  const { user, logout } = useAuth()
  const [currentTime, setCurrentTime] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [units, setUnits] = useState<Unit[]>([])
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
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

  // Fetch units from API
  const fetchUnits = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/units')
      if (response.ok) {
        const data = await response.json()
        setUnits(data.units)
        setFilteredUnits(data.units)
      } else {
        toast.error('Gagal memuat data unit')
      }
    } catch (error) {
      console.error('Error fetching units:', error)
      toast.error('Terjadi kesalahan saat memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUnits()
  }, [])

  // Filter units
  useEffect(() => {
    let filtered = units.filter(unit =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (statusFilter !== "all") {
      filtered = filtered.filter(unit => 
        statusFilter === "active" ? unit.isActive : !unit.isActive
      )
    }

    setFilteredUnits(filtered)
  }, [units, searchTerm, statusFilter])

  const resetForm = () => {
    setFormData({
      name: "",
      symbol: "",
      description: "",
      isActive: true
    })
    setSelectedUnit(null)
  }

  const handleAddUnit = async () => {
    if (!formData.name.trim() || !formData.symbol.trim()) {
      toast.error('Nama dan simbol unit harus diisi')
      return
    }

    try {
      const response = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Unit berhasil ditambahkan')
        setIsAddDialogOpen(false)
        resetForm()
        fetchUnits()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menambahkan unit')
      }
    } catch (error) {
      console.error('Error adding unit:', error)
      toast.error('Terjadi kesalahan saat menambahkan unit')
    }
  }

  const handleEditUnit = async () => {
    if (!selectedUnit) return
    if (!formData.name.trim() || !formData.symbol.trim()) {
      toast.error('Nama dan simbol unit harus diisi')
      return
    }

    try {
      const response = await fetch(`/api/units/${selectedUnit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Unit berhasil diperbarui')
        setIsEditDialogOpen(false)
        resetForm()
        fetchUnits()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal memperbarui unit')
      }
    } catch (error) {
      console.error('Error updating unit:', error)
      toast.error('Terjadi kesalahan saat memperbarui unit')
    }
  }

  const handleDeleteUnit = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus unit ini?')) return

    try {
      const response = await fetch(`/api/units/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Unit berhasil dihapus')
        fetchUnits()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menghapus unit')
      }
    } catch (error) {
      console.error('Error deleting unit:', error)
      toast.error('Terjadi kesalahan saat menghapus unit')
    }
  }

  const openEditDialog = (unit: Unit) => {
    setSelectedUnit(unit)
    setFormData({
      name: unit.name,
      symbol: unit.symbol,
      description: unit.description || "",
      isActive: unit.isActive
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
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Unit Satuan</h1>
                  <p className="text-gray-600">Kelola unit satuan untuk produk</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={fetchUnits}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2" onClick={() => resetForm()}>
                        <Plus className="h-4 w-4" />
                        Tambah Unit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Tambah Unit Satuan Baru</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Nama Unit *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Contoh: Kilogram, Liter, Pieces"
                          />
                        </div>
                        <div>
                          <Label htmlFor="symbol">Simbol *</Label>
                          <Input
                            id="symbol"
                            value={formData.symbol}
                            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                            placeholder="Contoh: kg, L, pcs"
                            maxLength={10}
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Deskripsi</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Deskripsi unit (opsional)"
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
                          <Button onClick={handleAddUnit} disabled={!formData.name.trim() || !formData.symbol.trim()}>
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
                      <Label className="text-sm font-medium text-gray-700 mb-1 block">Cari Unit</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="text"
                          placeholder="Nama unit, simbol, atau deskripsi..."
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

              {/* Units Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5" />
                    Daftar Unit Satuan ({filteredUnits.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    {loading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="flex items-center space-x-4 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                            <div className="h-4 bg-gray-200 rounded w-48"></div>
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-4">Nama Unit</th>
                            <th className="text-left p-4">Simbol</th>
                            <th className="text-left p-4">Deskripsi</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-left p-4">Dibuat</th>
                            <th className="text-left p-4">Diperbarui</th>
                            <th className="text-left p-4">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUnits.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center p-8 text-gray-500">
                                <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Tidak ada unit ditemukan</p>
                              </td>
                            </tr>
                          ) : (
                            filteredUnits.map((unit) => (
                              <tr key={unit.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                  <div className="font-medium">{unit.name}</div>
                                </td>
                                <td className="p-4">
                                  <div className="font-mono bg-gray-100 px-2 py-1 rounded text-sm inline-block">
                                    {unit.symbol}
                                  </div>
                                </td>
                                <td className="p-4">
                                  {unit.description ? (
                                    <div className="flex items-center gap-1">
                                      <Info className="h-4 w-4 text-blue-500" />
                                      <span className="text-sm text-gray-600">
                                        {unit.description.length > 50 
                                          ? `${unit.description.substring(0, 50)}...`
                                          : unit.description
                                        }
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="p-4">
                                  <Badge variant={unit.isActive ? "default" : "secondary"}>
                                    {unit.isActive ? "Aktif" : "Tidak Aktif"}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="text-sm text-gray-500">
                                    {formatDate(unit.createdAt)}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="text-sm text-gray-500">
                                    {formatDate(unit.updatedAt)}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openEditDialog(unit)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteUnit(unit.id)}
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
              <DialogTitle>Edit Unit Satuan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nama Unit *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Kilogram, Liter, Pieces"
                />
              </div>
              <div>
                <Label htmlFor="edit-symbol">Simbol *</Label>
                <Input
                  id="edit-symbol"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  placeholder="Contoh: kg, L, pcs"
                  maxLength={10}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Deskripsi</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi unit (opsional)"
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
                <Button onClick={handleEditUnit} disabled={!formData.name.trim() || !formData.symbol.trim()}>
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
