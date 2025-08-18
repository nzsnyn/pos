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
  Users,
  Phone,
  Mail
} from "lucide-react"

export default function CustomersPage() {
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

  // Dummy customer data
  const customers = [
    { 
      id: 1, 
      name: "Budi Santoso", 
      email: "budi@email.com", 
      phone: "081234567890", 
      type: "Grosir",
      totalPurchases: 2500000,
      lastVisit: "2025-08-14"
    },
    { 
      id: 2, 
      name: "Siti Nurhaliza", 
      email: "siti@email.com", 
      phone: "081234567891", 
      type: "Eceran",
      totalPurchases: 450000,
      lastVisit: "2025-08-15"
    },
    { 
      id: 3, 
      name: "Ahmad Rahman", 
      email: "ahmad@email.com", 
      phone: "081234567892", 
      type: "Grosir",
      totalPurchases: 3200000,
      lastVisit: "2025-08-13"
    },
    { 
      id: 4, 
      name: "Dewi Kartika", 
      email: "dewi@email.com", 
      phone: "081234567893", 
      type: "Eceran",
      totalPurchases: 180000,
      lastVisit: "2025-08-15"
    }
  ]

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Kelola Pelanggan</h1>
                  <p className="text-gray-600">Kelola data pelanggan dan riwayat pembelian</p>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Tambah Pelanggan
                </Button>
              </div>

              {/* Search and Filters */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Cari pelanggan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline">Filter</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Customers Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Daftar Pelanggan ({filteredCustomers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4">Nama</th>
                          <th className="text-left p-4">Kontak</th>
                          <th className="text-left p-4">Tipe</th>
                          <th className="text-left p-4">Total Pembelian</th>
                          <th className="text-left p-4">Kunjungan Terakhir</th>
                          <th className="text-left p-4">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCustomers.map((customer) => (
                          <tr key={customer.id} className="border-b hover:bg-gray-50">
                            <td className="p-4 font-medium">{customer.name}</td>
                            <td className="p-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Mail className="h-3 w-3" />
                                  {customer.email}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Phone className="h-3 w-3" />
                                  {customer.phone}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant={customer.type === "Grosir" ? "default" : "secondary"}>
                                {customer.type}
                              </Badge>
                            </td>
                            <td className="p-4">Rp {customer.totalPurchases.toLocaleString('id-ID')}</td>
                            <td className="p-4 text-gray-600">{customer.lastVisit}</td>
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
