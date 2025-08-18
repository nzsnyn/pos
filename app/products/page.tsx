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
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Package
} from "lucide-react"

export default function ProductsPage() {
  const { user, logout } = useAuth()
  const [currentTime, setCurrentTime] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

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

  const handleSettings = () => {
    console.log("Settings clicked")
  }

  const handleReports = () => {
    console.log("Reports clicked")
  }

  const handleLogout = async () => {
    await logout()
  }

  // Dummy product data
  const products = [
    { id: 1, name: "Kopi Arabica", category: "Minuman", price: 25000, stock: 50, status: "Tersedia" },
    { id: 2, name: "Roti Tawar", category: "Makanan", price: 15000, stock: 25, status: "Tersedia" },
    { id: 3, name: "Susu UHT", category: "Minuman", price: 8000, stock: 100, status: "Tersedia" },
    { id: 4, name: "Biskuit Coklat", category: "Makanan", price: 12000, stock: 5, status: "Stok Rendah" },
    { id: 5, name: "Air Mineral", category: "Minuman", price: 3000, stock: 0, status: "Habis" }
  ]

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                <Button className="gap-2">
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
                    <Button variant="outline">Filter</Button>
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
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4">Nama Produk</th>
                          <th className="text-left p-4">Kategori</th>
                          <th className="text-left p-4">Harga</th>
                          <th className="text-left p-4">Stok</th>
                          <th className="text-left p-4">Status</th>
                          <th className="text-left p-4">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => (
                          <tr key={product.id} className="border-b hover:bg-gray-50">
                            <td className="p-4 font-medium">{product.name}</td>
                            <td className="p-4 text-gray-600">{product.category}</td>
                            <td className="p-4">Rp {product.price.toLocaleString('id-ID')}</td>
                            <td className="p-4">{product.stock}</td>
                            <td className="p-4">
                              <Badge
                                variant={
                                  product.status === "Tersedia" ? "default" :
                                  product.status === "Stok Rendah" ? "secondary" : "destructive"
                                }
                              >
                                {product.status}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
