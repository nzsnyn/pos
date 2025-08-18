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
  onOpenSettings: () => void
  onOpenReports: () => void
  onLogout: () => void
}

export function Header({ 
  storeName, 
  cashierName, 
  currentTime, 
  onOpenSettings, 
  onOpenReports, 
  onLogout 
}: HeaderProps) {
  return (
    <header className="bg-white border-b px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold">{storeName}</h1>
          </div>
          <Badge variant="secondary" className="hidden sm:flex">
            POS System
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{cashierName}</span>
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
                  {cashierName}
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Clock className="w-4 h-4 mr-2" />
                  {currentTime}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </div>
              <DropdownMenuItem onClick={onOpenReports}>
                <Receipt className="w-4 h-4 mr-2" />
                Sales Reports
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="w-4 h-4 mr-2" />
                Payment History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenSettings}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
