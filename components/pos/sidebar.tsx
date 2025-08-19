"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useRouter, usePathname } from "next/navigation"
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
  ClipboardList
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
  subItems?: {
    icon: any
    label: string
    href: string
  }[]
}

export function Sidebar({ isOpen, onClose, mode = 'overlay' }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Produk', 'Stok Produk'])

  const menuItems: MenuItem[] = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/dashboard"
    },
    {
      icon: ShoppingCart,
      label: "Point of Sale",
      href: "/"
    },
    {
      icon: Package,
      label: "Produk",
      subItems: [
        {
          icon: Box,
          label: "Data Produk",
          href: "/products"
        },
        {
          icon: Package,
          label: "Kategori",
          href: "/categories"
        },
        {
          icon: Scale,
          label: "Unit Satuan",
          href: "/units"
        }
      ]
    },
    {
      icon: Package2,
      label: "Stok Produk",
      subItems: [
        {
          icon: ShoppingBag,
          label: "Pengadaan Produk",
          href: "/procurement"
        },
        {
          icon: ClipboardList,
          label: "Stok Opname",
          href: "/stock-opname"
        }
      ]
    },
    {
      icon: Warehouse,
      label: "Manajemen Stok",
      href: "/inventory"
    },
    {
      icon: Users,
      label: "Kelola Pelanggan",
      href: "/customers"
    },
    {
      icon: User,
      label: "Kelola Karyawan",
      href: "/employees"
    },
    {
      icon: Truck,
      label: "Data Supplier",
      href: "/suppliers"
    },
    {
      icon: Receipt,
      label: "Laporan Penjualan",
      href: "/reports"
    },
    {
      icon: CreditCard,
      label: "Riwayat Pembayaran",
      href: "/riwayat-pembayaran"
    },
    {
      icon: BarChart3,
      label: "Analitik",
      href: "/analytics"
    },
    {
      icon: Settings,
      label: "Pengaturan",
      href: "/settings"
    }
  ]

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
              <nav className="flex-1 px-4 py-6">
                <div className="space-y-2">
                  {menuItems.map((item) => renderMenuItem(item))}
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
            <nav className="flex-1 px-4 py-6">
              <div className="space-y-2">
                {menuItems.map((item) => renderMenuItem(item))}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
