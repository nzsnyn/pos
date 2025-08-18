"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { 
  Store, 
  User, 
  Settings, 
  Clock, 
  CreditCard,
  Receipt,
  LogOut,
  Menu
} from "lucide-react"

interface HeaderProps {
  storeName: string
  cashierName: string
  currentTime: string
  userRole?: string
  onOpenSettings: () => void
  onOpenReports: () => void
  onLogout: () => void
  onOpenSidebar: () => void
}

export function Header({ 
  storeName, 
  cashierName, 
  currentTime, 
  userRole,
  onOpenSettings, 
  onOpenReports, 
  onLogout,
  onOpenSidebar
}: HeaderProps) {
  return (
    <header className="bg-white border-b px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSidebar}
            className="p-2"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold">{storeName}</h1>
          </div>
          <Badge variant="secondary" className="hidden sm:flex">
            Sistem POS
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{cashierName}</span>
              {userRole && (
                <Badge variant="outline" className="ml-1 text-xs">
                  {userRole}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{currentTime}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="md:hidden">
                <DropdownMenuItem disabled>
                  <User className="w-4 h-4 mr-2" />
                  {cashierName} {userRole && `(${userRole})`}
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Clock className="w-4 h-4 mr-2" />
                  {currentTime}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </div>
              <DropdownMenuItem onClick={onOpenReports}>
                <Receipt className="w-4 h-4 mr-2" />
                Laporan Penjualan
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="w-4 h-4 mr-2" />
                Riwayat Pembayaran
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenSettings}>
                <Settings className="w-4 h-4 mr-2" />
                Pengaturan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
