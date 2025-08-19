"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { 
  Home, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  Receipt,
  CreditCard,
  Warehouse,
  ShoppingCart,
  User,
  Truck,
  ChevronDown,
  ChevronRight,
  Box,
  Scale,
  Package2,
  ShoppingBag,
  ClipboardList,
  Clock
} from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'overlay' | 'persistent'
}

interface MenuItem {
  icon: any
  label: string
  href?: string
  roles?: string[] // Add roles field to restrict access
  subItems?: {
    icon: any
    label: string
    href: string
    roles?: string[] // Add roles field to restrict access for subitems too
  }[]
}

export function Sidebar({ isOpen, onClose, mode = 'overlay' }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Produk', 'Stok Produk'])

  const menuItems: MenuItem[] = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/dashboard",
      roles: ['ADMIN', 'CASHIER'] // Available for both roles
    },
    {
      icon: ShoppingCart,
      label: "Point of Sale",
      href: "/",
      roles: ['ADMIN', 'CASHIER'] // Available for both roles
    },
    {
      icon: Package,
      label: "Produk",
      roles: ['ADMIN'], // Only for ADMIN
      subItems: [
        {
          icon: Box,
          label: "Data Produk",
          href: "/products",
          roles: ['ADMIN']
        },
        {
          icon: Package,
          label: "Kategori",
          href: "/categories",
          roles: ['ADMIN']
        },
        {
          icon: Scale,
          label: "Unit Satuan",
          href: "/units",
          roles: ['ADMIN']
        }
      ]
    },
    {
      icon: Package2,
      label: "Stok Produk",
      roles: ['ADMIN', 'CASHIER'], // Available for both roles but limited subitems for CASHIER
      subItems: [
        {
          icon: ShoppingBag,
          label: "Pengadaan Produk",
          href: "/procurement",
          roles: ['ADMIN'] // Only ADMIN can access procurement
        },
        {
          icon: ClipboardList,
          label: "Stok Opname",
          href: "/stock-opname",
          roles: ['ADMIN', 'CASHIER'] // Both can access stock opname
        }
      ]
    },
    {
      icon: Receipt,
      label: "Riwayat Transaksi",
      href: "/transactions",
      roles: ['ADMIN', 'CASHIER'] // Available for both roles
    },
    {
      icon: Clock,
      label: "Riwayat Shift",
      href: "/shift-history",
      roles: ['ADMIN', 'CASHIER'] // Available for both roles
    },
    // Admin-only menu items
    {
      icon: User,
      label: "Kelola Karyawan",
      href: "/employees",
      roles: ['ADMIN'] // Only ADMIN
    },
    {
      icon: Truck,
      label: "Data Supplier",
      href: "/suppliers",
      roles: ['ADMIN'] // Only ADMIN
    },
    {
      icon: Receipt,
      label: "Laporan Penjualan",
      href: "/reports",
      roles: ['ADMIN'] // Only ADMIN
    },
    {
      icon: CreditCard,
      label: "Riwayat Pembayaran",
      href: "/riwayat-pembayaran",
      roles: ['ADMIN'] // Only ADMIN
    },
    {
      icon: Settings,
      label: "Pengaturan",
      href: "/settings",
      roles: ['ADMIN'] // Only ADMIN
    }
  ]

  // Filter menu items based on user role
  const getFilteredMenuItems = () => {
    if (!user) return []
    
    return menuItems.filter(item => {
      // If no roles specified, show to everyone
      if (!item.roles) return true
      
      // Check if user role is in allowed roles
      return item.roles.includes(user.role)
    }).map(item => {
      // If item has subitems, filter them too
      if (item.subItems) {
        const filteredSubItems = item.subItems.filter(subItem => {
          if (!subItem.roles) return true
          return subItem.roles.includes(user.role)
        })
        
        return {
          ...item,
          subItems: filteredSubItems
        }
      }
      
      return item
    })
  }

  const filteredMenuItems = getFilteredMenuItems()

  const handleNavigation = (href: string) => {
    router.push(href)
    if (mode === 'overlay') {
      onClose()
    }
  }

  const toggleExpandedItem = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon
    const isActive = item.href ? pathname === item.href : false
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isExpanded = expandedItems.includes(item.label)

    if (hasSubItems) {
      return (
        <div key={item.label}>
          <Button
            variant="ghost"
            className="w-full justify-between gap-3 h-12 text-left"
            onClick={() => toggleExpandedItem(item.label)}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
          {isExpanded && (
            <div className="ml-6 mt-1 space-y-1">
              {item.subItems?.map((subItem) => {
                const SubIcon = subItem.icon
                const isSubActive = pathname === subItem.href
                return (
                  <Button
                    key={subItem.label}
                    variant={isSubActive ? "default" : "ghost"}
                    className="w-full justify-start gap-3 h-10 text-left text-sm"
                    onClick={() => handleNavigation(subItem.href)}
                  >
                    <SubIcon className="w-4 h-4" />
                    <span>{subItem.label}</span>
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    return (
      <Button
        key={item.label}
        variant={isActive ? "default" : "ghost"}
        className="w-full justify-start gap-3 h-12 text-left"
        onClick={() => item.href && handleNavigation(item.href)}
      >
        <Icon className="w-5 h-5" />
        <span>{item.label}</span>
      </Button>
    )
  }

  return (
    <>
      {mode === 'overlay' ? (
        <Sheet open={isOpen} onOpenChange={onClose}>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="px-6 py-4 border-b">
              <SheetTitle className="text-left">Menu Navigasi</SheetTitle>
            </SheetHeader>
            
            <div className="flex flex-col h-full">
              <nav className="flex-1 px-4 py-6 overflow-y-auto">
                <div className="space-y-2">
                  {filteredMenuItems.map((item) => renderMenuItem(item))}
                </div>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <div className={`w-80 bg-white border-r transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Menu Navigasi</h2>
          </div>
          
          <div className="flex flex-col h-full">
            <nav className="flex-1 px-4 py-6 overflow-y-auto">
              <div className="space-y-2">
                {filteredMenuItems.map((item) => renderMenuItem(item))}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
