"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/pos/header"
import { Sidebar } from "@/components/pos/sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

interface Product {
  id: string
  name: string
  description?: string
  price: number
  wholesalePrice?: number
  stock: number
  barcode?: string
  image?: string
  isActive: boolean
  category: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
  description?: string
  _count?: {
    products: number
  }
}

interface ProductFormData {
  name: string
  description: string
  price: string
  wholesalePrice: string
  stock: string
  categoryId: string
  barcode: string
  image: string
}

const initialFormData: ProductFormData = {
  name: "",
  description: "",
  price: "",
  wholesalePrice: "",
  stock: "0",
  categoryId: "",
  barcode: "",
  image: ""
}

export default function ProductsPage() {
  const { user, logout } = useAuth()
  const [currentTime, setCurrentTime] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Partial<ProductFormData>>({})
  
  // File upload states
  const [uploadedImage, setUploadedImage] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)

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

  // Fetch products and categories
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ])

      if (!productsRes.ok) throw new Error('Gagal memuat data produk')
      if (!categoriesRes.ok) throw new Error('Gagal memuat data kategori')

      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()

      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat memuat data")
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (data: ProductFormData): boolean => {
    const errors: Partial<ProductFormData> = {}
    
    if (!data.name.trim()) errors.name = "Nama produk harus diisi"
    if (!data.price || parseFloat(data.price) <= 0) errors.price = "Harga produk harus lebih dari 0"
    if (!data.categoryId) errors.categoryId = "Kategori produk harus dipilih"
    if (data.stock && parseInt(data.stock) < 0) errors.stock = "Stok tidak boleh negatif"
    if (data.wholesalePrice && parseFloat(data.wholesalePrice) <= 0) errors.wholesalePrice = "Harga grosir harus lebih dari 0"
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm(formData)) return
    
    setSubmitting(true)
    try {
      const url = selectedProduct ? `/api/products/${selectedProduct.id}` : '/api/products'
      const method = selectedProduct ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          price: parseFloat(formData.price),
          wholesalePrice: formData.wholesalePrice ? parseFloat(formData.wholesalePrice) : null,
          stock: parseInt(formData.stock) || 0,
          categoryId: formData.categoryId,
          barcode: formData.barcode.trim() || null,
          image: formData.image.trim() || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Terjadi kesalahan')
      }

      toast.success(selectedProduct ? "Produk berhasil diperbarui" : "Produk berhasil ditambahkan")

      // Reset form and close dialog
      setFormData(initialFormData)
      setFormErrors({})
      setUploadedImage("")
      setShowAddDialog(false)
      setShowEditDialog(false)
      setSelectedProduct(null)
      
      // Refresh data
      await fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedProduct) return
    
    setSubmitting(true)
    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal menghapus produk')
      }

      toast.success("Produk berhasil dihapus")

      setShowDeleteDialog(false)
      setSelectedProduct(null)
      await fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus")
    } finally {
      setSubmitting(false)
    }
  }

  const openAddDialog = () => {
    setFormData(initialFormData)
    setFormErrors({})
    setUploadedImage("")
    setSelectedProduct(null)
    setShowAddDialog(true)
  }

  const openEditDialog = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      wholesalePrice: product.wholesalePrice?.toString() || "",
      stock: product.stock.toString(),
      categoryId: product.category.id,
      barcode: product.barcode || "",
      image: product.image || ""
    })
    setUploadedImage(product.image || "")
    setFormErrors({})
    setSelectedProduct(product)
    setShowEditDialog(true)
  }

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product)
    setShowDeleteDialog(true)
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: "Habis", variant: "destructive" as const }
    if (stock <= 10) return { text: "Stok Rendah", variant: "secondary" as const }
    return { text: "Tersedia", variant: "default" as const }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleImageUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal mengunggah gambar')
      }

      const result = await response.json()
      setUploadedImage(result.url)
      setFormData(prev => ({ ...prev, image: result.url }))
      toast.success("Gambar berhasil diunggah")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengunggah gambar")
    } finally {
      setIsUploading(false)
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
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Kelola Produk</h1>
                  <p className="text-gray-600">Kelola produk dan stok toko Anda</p>
                </div>
                <Button onClick={openAddDialog} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Tambah Produk
                </Button>
              </div>

              {/* Search and Filters */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Cari produk..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Products Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Daftar Produk ({filteredProducts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="ml-2">Memuat data produk...</span>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm ? "Tidak ada produk yang ditemukan" : "Belum ada produk"}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-4">Gambar</th>
                            <th className="text-left p-4">Nama Produk</th>
                            <th className="text-left p-4">Kategori</th>
                            <th className="text-left p-4">Barcode</th>
                            <th className="text-left p-4">Harga Eceran</th>
                            <th className="text-left p-4">Harga Grosir</th>
                            <th className="text-left p-4">Stok</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-left p-4">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map((product) => {
                            const stockStatus = getStockStatus(product.stock)
                            return (
                              <tr key={product.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                  <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                                    {product.image ? (
                                      <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-gray-400 text-xs">No Image</span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div>
                                    <div className="font-medium">{product.name}</div>
                                    {product.description && (
                                      <div className="text-sm text-gray-500">{product.description}</div>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4 text-gray-600">{product.category.name}</td>
                                <td className="p-4 text-gray-600">{product.barcode || '-'}</td>
                                <td className="p-4">Rp {product.price.toLocaleString('id-ID')}</td>
                                <td className="p-4">
                                  {product.wholesalePrice 
                                    ? `Rp ${product.wholesalePrice.toLocaleString('id-ID')}` 
                                    : '-'
                                  }
                                </td>
                                <td className="p-4">{product.stock}</td>
                                <td className="p-4">
                                  <Badge variant={stockStatus.variant}>
                                    {stockStatus.text}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => openEditDialog(product)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => openDeleteDialog(product)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Add/Edit Product Dialog */}
        <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false)
            setShowEditDialog(false)
            setSelectedProduct(null)
            setFormData(initialFormData)
            setFormErrors({})
            setUploadedImage("")
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Produk *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Masukkan nama produk"
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">Kategori *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger className={formErrors.categoryId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.categoryId && (
                    <p className="text-sm text-red-500">{formErrors.categoryId}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Deskripsi produk (opsional)"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Harga Eceran *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0"
                    className={formErrors.price ? "border-red-500" : ""}
                  />
                  {formErrors.price && (
                    <p className="text-sm text-red-500">{formErrors.price}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wholesalePrice">Harga Grosir</Label>
                  <Input
                    id="wholesalePrice"
                    type="number"
                    step="0.01"
                    value={formData.wholesalePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, wholesalePrice: e.target.value }))}
                    placeholder="0"
                    className={formErrors.wholesalePrice ? "border-red-500" : ""}
                  />
                  {formErrors.wholesalePrice && (
                    <p className="text-sm text-red-500">{formErrors.wholesalePrice}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stok</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    placeholder="0"
                    className={formErrors.stock ? "border-red-500" : ""}
                  />
                  {formErrors.stock && (
                    <p className="text-sm text-red-500">{formErrors.stock}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                    placeholder="Barcode produk (opsional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Gambar Produk</Label>
                  <div className="space-y-3">
                    {/* File Upload */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        id="imageFile"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file)
                        }}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('imageFile')?.click()}
                        disabled={isUploading}
                        className="flex items-center space-x-2"
                      >
                        {isUploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Mengunggah...</span>
                          </>
                        ) : (
                          <>
                            <span>📁</span>
                            <span>Pilih Gambar</span>
                          </>
                        )}
                      </Button>
                      {uploadedImage && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUploadedImage("")
                            setFormData(prev => ({ ...prev, image: "" }))
                          }}
                        >
                          Hapus Gambar
                        </Button>
                      )}
                    </div>
                    
                    {/* Image Preview */}
                    {uploadedImage && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Preview:</p>
                        <div className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                          <img
                            src={uploadedImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddDialog(false)
                    setShowEditDialog(false)
                    setSelectedProduct(null)
                    setFormData(initialFormData)
                    setFormErrors({})
                    setUploadedImage("")
                  }}
                  disabled={submitting}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {selectedProduct ? 'Perbarui' : 'Simpan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
              </div>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus produk <strong>{selectedProduct?.name}</strong>?
                Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={submitting}>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={submitting}
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