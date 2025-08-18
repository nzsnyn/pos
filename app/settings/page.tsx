"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/pos/header"
import { Sidebar } from "@/components/pos/sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, 
  Store, 
  User,
  Bell,
  Palette,
  Shield,
  Printer,
  Save
} from "lucide-react"

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [currentTime, setCurrentTime] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Settings state
  const [settings, setSettings] = useState({
    storeName: "Toko Saya POS",
    storeAddress: "Jl. Contoh No. 123, Jakarta",
    storePhone: "021-12345678",
    currency: "IDR",
    taxRate: 10,
    autoBackup: true,
    printReceipt: true,
    notifications: true,
    darkMode: false
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

  const handleSettings = () => {
    console.log("Settings clicked")
  }

  const handleReports = () => {
    console.log("Reports clicked")
  }

  const handleLogout = async () => {
    await logout()
  }

  const handleSave = () => {
    console.log("Settings saved:", settings)
    // Here you would typically save to backend
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
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Pengaturan</h1>
                  <p className="text-gray-600">Kelola pengaturan toko dan sistem</p>
                </div>
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Simpan Perubahan
                </Button>
              </div>

              <div className="space-y-6">
                {/* Store Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      Pengaturan Toko
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="storeName">Nama Toko</Label>
                        <Input
                          id="storeName"
                          value={settings.storeName}
                          onChange={(e) => setSettings({...settings, storeName: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="storePhone">Nomor Telepon</Label>
                        <Input
                          id="storePhone"
                          value={settings.storePhone}
                          onChange={(e) => setSettings({...settings, storePhone: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="storeAddress">Alamat Toko</Label>
                      <Input
                        id="storeAddress"
                        value={settings.storeAddress}
                        onChange={(e) => setSettings({...settings, storeAddress: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="currency">Mata Uang</Label>
                        <Input
                          id="currency"
                          value={settings.currency}
                          onChange={(e) => setSettings({...settings, currency: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="taxRate">Tarif Pajak (%)</Label>
                        <Input
                          id="taxRate"
                          type="number"
                          value={settings.taxRate}
                          onChange={(e) => setSettings({...settings, taxRate: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Pengaturan Pengguna
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nama Lengkap</Label>
                        <Input value={user ? `${user.firstName} ${user.lastName}` : ""} disabled />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input value={user?.email || ""} disabled />
                      </div>
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input value={user?.role || ""} disabled />
                    </div>
                  </CardContent>
                </Card>

                {/* System Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Pengaturan Sistem
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <Label>Backup Otomatis</Label>
                        </div>
                        <p className="text-sm text-gray-500">
                          Backup data secara otomatis setiap hari
                        </p>
                      </div>
                      <Checkbox
                        checked={settings.autoBackup}
                        onCheckedChange={(checked: boolean) => setSettings({...settings, autoBackup: checked})}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Printer className="h-4 w-4" />
                          <Label>Cetak Struk Otomatis</Label>
                        </div>
                        <p className="text-sm text-gray-500">
                          Cetak struk secara otomatis setelah transaksi
                        </p>
                      </div>
                      <Checkbox
                        checked={settings.printReceipt}
                        onCheckedChange={(checked: boolean) => setSettings({...settings, printReceipt: checked})}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          <Label>Notifikasi</Label>
                        </div>
                        <p className="text-sm text-gray-500">
                          Terima notifikasi sistem dan stok rendah
                        </p>
                      </div>
                      <Checkbox
                        checked={settings.notifications}
                        onCheckedChange={(checked: boolean) => setSettings({...settings, notifications: checked})}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          <Label>Mode Gelap</Label>
                        </div>
                        <p className="text-sm text-gray-500">
                          Aktifkan tampilan mode gelap
                        </p>
                      </div>
                      <Checkbox
                        checked={settings.darkMode}
                        onCheckedChange={(checked: boolean) => setSettings({...settings, darkMode: checked})}
                      />
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
