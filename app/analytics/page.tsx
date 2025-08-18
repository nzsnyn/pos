"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/pos/header"
import { Sidebar } from "@/components/pos/sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, PieChart } from "lucide-react"

export default function AnalyticsPage() {
  const { user, logout } = useAuth()
  const [currentTime, setCurrentTime] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

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

  const handleSettings = () => console.log("Settings clicked")
  const handleReports = () => console.log("Reports clicked")
  const handleLogout = async () => await logout()

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
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Analitik</h1>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Analisis Penjualan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-gray-500">
                      <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">Grafik Penjualan</h3>
                      <p>Fitur analitik sedang dalam pengembangan</p>
                      <Button className="mt-4">Lihat Detail</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Analisis Produk
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-gray-500">
                      <PieChart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">Performa Produk</h3>
                      <p>Fitur analitik sedang dalam pengembangan</p>
                      <Button className="mt-4">Lihat Detail</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
