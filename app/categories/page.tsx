"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/pos/header"
import { Sidebar } from "@/components/pos/sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Package,
  Loader2,
  AlertTriangle
} from "lucide-react"

interface Category {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  _count?: {
    products: number
  }
}

interface CategoryFormData {
  name: string
  description: string
}

const initialFormData: CategoryFormData = {
  name: '',
  description: ''
}

export default function CategoriesPage() {
  const { user, logout } = useAuth()
  const [currentTime, setCurrentTime] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Partial<CategoryFormData>>({})

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

  // Fetch categories
  useEffect(() => {
    fetchCategories()
  }, [])

  // Filter categories
  useEffect(() => {
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredCategories(filtered)
  }, [categories, searchTerm])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        toast.error('Gagal memuat data kategori')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Terjadi kesalahan saat memuat data')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (data: CategoryFormData): boolean => {
    const errors: Partial<CategoryFormData> = {}

    if (!data.name.trim()) {
      errors.name = 'Nama kategori harus diisi'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setFormErrors({})
  }

  const openAddDialog = () => {
    resetForm()
    setShowAddDialog(true)
  }

  const openEditDialog = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description || ''
    })
    setFormErrors({})
    setSelectedCategory(category)
    setShowEditDialog(true)
  }

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category)
    setShowDeleteDialog(true)
  }

  const handleAdd = async () => {
    if (!validateForm(formData)) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newCategory = await response.json()
        setCategories(prev => [newCategory, ...prev])
        setShowAddDialog(false)
        resetForm()
        toast.success('Kategori berhasil ditambahkan')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menambahkan kategori')
      }
    } catch (error) {
      console.error('Error adding category:', error)
      toast.error('Terjadi kesalahan saat menambahkan kategori')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedCategory || !validateForm(formData)) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/categories/${selectedCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedCategory = await response.json()
        setCategories(prev => prev.map(cat => cat.id === selectedCategory.id ? updatedCategory : cat))
        setShowEditDialog(false)
        setSelectedCategory(null)
        resetForm()
        toast.success('Kategori berhasil diperbarui')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal memperbarui kategori')
      }
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error('Terjadi kesalahan saat memperbarui kategori')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedCategory) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/categories/${selectedCategory.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCategories(prev => prev.filter(cat => cat.id !== selectedCategory.id))
        setShowDeleteDialog(false)
        setSelectedCategory(null)
        toast.success('Kategori berhasil dihapus')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menghapus kategori')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Terjadi kesalahan saat menghapus kategori')
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
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Kelola Kategori</h1>
                  <p className="text-gray-600">Kelola kategori produk toko Anda</p>
                </div>
                <Button onClick={openAddDialog} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Tambah Kategori
                </Button>
              </div>

              {/* Search */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Cari kategori..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Categories List */}
              <Card>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Memuat data...
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-4 font-medium text-gray-700">Nama Kategori</th>
                            <th className="text-left p-4 font-medium text-gray-700">Deskripsi</th>
                            <th className="text-left p-4 font-medium text-gray-700">Jumlah Produk</th>
                            <th className="text-left p-4 font-medium text-gray-700">Tanggal Dibuat</th>
                            <th className="text-left p-4 font-medium text-gray-700">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCategories.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center p-8 text-gray-500">
                                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>
                                  {searchTerm 
                                    ? "Tidak ada kategori yang sesuai dengan pencarian" 
                                    : "Belum ada kategori yang ditambahkan"
                                  }
                                </p>
                              </td>
                            </tr>
                          ) : (
                            filteredCategories.map((category) => (
                              <tr key={category.id} className="border-t hover:bg-gray-50">
                                <td className="p-4">
                                  <div className="font-medium text-gray-900">{category.name}</div>
                                </td>
                                <td className="p-4">
                                  <div className="text-gray-600">
                                    {category.description || "-"}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="text-gray-600">
                                    {category._count?.products || 0} produk
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="text-gray-600">
                                    {new Date(category.createdAt).toLocaleDateString('id-ID')}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openEditDialog(category)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openDeleteDialog(category)}
                                      disabled={(category._count?.products || 0) > 0}
                                      className={(category._count?.products || 0) > 0 ? "opacity-50" : ""}
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
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Add Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Kategori Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Kategori *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  placeholder="Masukkan nama kategori"
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Deskripsi kategori (opsional)"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Batal
              </Button>
              <Button onClick={handleAdd} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tambah
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Kategori</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nama Kategori *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  placeholder="Masukkan nama kategori"
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="edit-description">Deskripsi</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Deskripsi kategori (opsional)"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Batal
              </Button>
              <Button onClick={handleEdit} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus kategori "{selectedCategory?.name}"?
                    {selectedCategory && (selectedCategory._count?.products || 0) > 0 && (
                      <span className="block mt-2 text-red-600 font-medium">
                        Kategori ini tidak dapat dihapus karena masih memiliki {selectedCategory._count?.products || 0} produk.
                      </span>
                    )}
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={submitting || (selectedCategory ? (selectedCategory._count?.products || 0) > 0 : false)}
                className="bg-red-500 hover:bg-red-600"
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Toaster richColors />
      </div>
    </ProtectedRoute>
  )
}
