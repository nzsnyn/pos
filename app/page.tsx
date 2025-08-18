"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/pos/header"
import { Sidebar } from "@/components/pos/sidebar"
import { CategoryFilter } from "@/components/pos/category-filter"
import { ProductGrid } from "@/components/pos/product-grid"
import { CartSummary } from "@/components/pos/cart-summary"
import { CheckoutDialog } from "@/components/pos/checkout-dialog"
import { ReceiptDialog } from "@/components/pos/receipt-dialog"
import { EndShiftDialog } from "@/components/pos/end-shift-dialog"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  price: number
  wholesalePrice?: number | null
  category: {
    id: string
    name: string
  }
  stock: number
  image?: string | null
}

interface CartItem {
  id: string
  name: string
  price: number
  wholesalePrice?: number | null
  quantity: number
  subtotal: number
  isWholesale: boolean
}

export default function POSApp() {
  const { user, logout } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentTime, setCurrentTime] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [receiptData, setReceiptData] = useState<{
    orderNumber: string
    items: CartItem[]
    total: number
    tax: number
    grandTotal: number
    paymentMethod: 'cash' | 'card'
    cashReceived?: number
    changeAmount?: number
    cashierName: string
    timestamp: string
  } | null>(null)
  const [lastOrder, setLastOrder] = useState<{
    orderNumber: string
    items: CartItem[]
    total: number
    tax: number
    grandTotal: number
    paymentMethod: 'cash' | 'card'
    cashReceived?: number
    changeAmount?: number
    timestamp: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEndShiftOpen, setIsEndShiftOpen] = useState(false)
  const [currentShift, setCurrentShift] = useState<{
    id: string
    startTime: string
    startBalance: number
    finalBalance?: number
    totalSales: number
  } | null>(null)

  // Function to create a new shift
  const createNewShift = async () => {
    try {
      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startBalance: 1000000 // Default start balance of Rp 1,000,000
        }),
      })

      if (response.ok) {
        const newShift = await response.json()
        setCurrentShift(newShift)
      }
    } catch (error) {
      console.error('Error creating new shift:', error)
      toast.error("Gagal membuat shift baru")
    }
  }

  // Fetch products, categories, and shift data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, shiftRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
          fetch('/api/shifts')
        ])

        if (productsRes.ok && categoriesRes.ok) {
          const productsData = await productsRes.json()
          const categoriesData = await categoriesRes.json()
          
          setProducts(productsData)
          setCategories(categoriesData.map((cat: any) => cat.name))
          setFilteredProducts(productsData)
        }

        // Handle shift data
        if (shiftRes.ok) {
          const shiftData = await shiftRes.json()
          if (shiftData) {
            setCurrentShift(shiftData)
          } else {
            // No active shift, create one with default start balance
            await createNewShift()
          }
        } else {
          // Create new shift if no active shift found
          await createNewShift()
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error("Gagal memuat data")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

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

  // Filter products based on category and search
  useEffect(() => {
    let filtered = products

    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category.name === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
  }, [products, selectedCategory, searchTerm])

  const addToCart = (product: Product) => {
    if (product.stock === 0) {
      toast.error("Produk tidak tersedia")
      return
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1
        if (newQuantity > product.stock) {
          toast.error("Stok tidak mencukupi")
          return prevCart
        }
        return prevCart.map(item =>
          item.id === product.id
            ? { 
                ...item, 
                quantity: newQuantity, 
                subtotal: newQuantity * (item.isWholesale ? (item.wholesalePrice || item.price) : item.price)
              }
            : item
        )
      } else {
        return [...prevCart, {
          id: product.id,
          name: product.name,
          price: product.price,
          wholesalePrice: product.wholesalePrice,
          quantity: 1,
          subtotal: product.price,
          isWholesale: false
        }]
      }
    })
    
    toast.success(`${product.name} ditambahkan ke keranjang`)
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(id)
      return
    }

    const product = products.find(p => p.id === id)
    if (product && quantity > product.stock) {
      toast.error("Stok tidak mencukupi")
      return
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id
          ? { 
              ...item, 
              quantity, 
              subtotal: quantity * (item.isWholesale ? (item.wholesalePrice || item.price) : item.price)
            }
          : item
      )
    )
  }

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id))
    toast.success("Item dihapus dari keranjang")
  }

  const toggleWholesale = (id: string) => {
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.id === id && item.wholesalePrice) {
          const newIsWholesale = !item.isWholesale
          const newPrice = newIsWholesale ? item.wholesalePrice : item.price
          return {
            ...item,
            isWholesale: newIsWholesale,
            subtotal: item.quantity * newPrice
          }
        }
        return item
      })
    )
  }

  const calculateTotals = () => {
    const total = cart.reduce((sum, item) => sum + item.subtotal, 0)
    const tax = total * 0.1
    const grandTotal = total + tax
    return { total, tax, grandTotal }
  }

  const { total, tax, grandTotal } = calculateTotals()

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Keranjang kosong")
      return
    }
    setIsCheckoutOpen(true)
  }

  const handlePayment = async (method: 'cash' | 'card', cashReceived?: number) => {
    try {
      if (!user) {
        toast.error("Informasi pengguna tidak tersedia")
        return
      }

      // Create order in database
      const orderData = {
        items: cart,
        cashierId: user.id,
        paymentMethod: method.toUpperCase(),
        notes: `Pembayaran via ${method === 'cash' ? 'tunai' : 'kartu'}`
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const order = await response.json()
        
        // Prepare receipt data
        const receiptData = {
          orderNumber: order.orderNumber,
          items: cart,
          total,
          tax,
          grandTotal,
          paymentMethod: method,
          cashReceived: cashReceived || grandTotal,
          changeAmount: cashReceived ? Math.max(0, cashReceived - grandTotal) : 0,
          cashierName: `${user.firstName} ${user.lastName}`,
          timestamp: new Date().toISOString()
        }
        
        setIsCheckoutOpen(false)
        setCart([])
        
        // Update local product stock
        setProducts(prevProducts =>
          prevProducts.map(product => {
            const cartItem = cart.find(item => item.id === product.id)
            if (cartItem) {
              return {
                ...product,
                stock: product.stock - cartItem.quantity
              }
            }
            return product
          })
        )
        
        // Update sales tracking for all payments (cash and card)
        updateShiftSales(grandTotal)
        
        // Show receipt dialog
        setReceiptData(receiptData)
        setIsReceiptOpen(true)
        
        toast.success(`Pembayaran berhasil via ${method === 'cash' ? 'tunai' : 'kartu'}! Pesanan #${order.orderNumber} dibuat.`)
      } else {
        toast.error("Gagal memproses pembayaran")
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      toast.error("Gagal memproses pembayaran")
    }
  }

  const handleSettings = () => {
    toast.info("Panel pengaturan akan terbuka di sini")
  }

  const handleReports = () => {
    toast.info("Laporan penjualan akan terbuka di sini")
  }

  const handleLogout = async () => {
    setIsEndShiftOpen(true)
  }

  const handleConfirmEndShift = async () => {
    try {
      if (!currentShift) return

      const finalBalance = currentShift.startBalance + currentShift.totalSales
      
      // End the shift in the database
      const response = await fetch('/api/shifts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalSales: currentShift.totalSales,
          finalBalance: finalBalance,
          notes: "Shift ended by cashier"
        }),
      })

      if (response.ok) {
        setIsEndShiftOpen(false)
        await logout()
        toast.success("Shift berakhir - Berhasil keluar")
      } else {
        toast.error("Gagal mengakhiri shift")
      }
    } catch (error) {
      toast.error("Gagal mengakhiri shift")
    }
  }

  const handleCancelEndShift = () => {
    setIsEndShiftOpen(false)
  }

  // Update shift sales when a payment is made
  const updateShiftSales = (amount: number) => {
    if (currentShift) {
      setCurrentShift(prev => prev ? {
        ...prev,
        totalSales: prev.totalSales + amount
      } : null)
    }
  }

  return (
    <ProtectedRoute>
      {loading ? (
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Memuat Sistem POS...</p>
          </div>
        </div>
      ) : (
        <div className="h-screen flex flex-col bg-gray-50">
          <Header
            storeName="Toko Saya POS"
            cashierName={user ? `${user.firstName} ${user.lastName}` : "Memuat..."}
            userRole={user?.role}
            currentTime={currentTime}
            onOpenSettings={handleSettings}
            onOpenReports={handleReports}
            onLogout={handleLogout}
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />

          <div className="flex-1 flex overflow-hidden">
            {/* Products Section */}
            <div className="flex-1 flex flex-col">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              <div className="flex-1 overflow-y-auto">
                <ProductGrid
                  products={filteredProducts}
                  onAddToCart={addToCart}
                />
              </div>
            </div>

            {/* Cart Section */}
            <div className="w-80 border-l bg-white flex flex-col h-full">
              <CartSummary
                items={cart}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                onToggleWholesale={toggleWholesale}
                onCheckout={handleCheckout}
              />
            </div>
          </div>

          <CheckoutDialog
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            items={cart}
            total={total}
            tax={tax}
            grandTotal={grandTotal}
            onPaymentMethod={handlePayment}
          />

          {receiptData && (
            <ReceiptDialog
              isOpen={isReceiptOpen}
              onClose={() => setIsReceiptOpen(false)}
              orderNumber={receiptData.orderNumber}
              items={receiptData.items}
              total={receiptData.total}
              tax={receiptData.tax}
              grandTotal={receiptData.grandTotal}
              paymentMethod={receiptData.paymentMethod}
              cashReceived={receiptData.cashReceived}
              changeAmount={receiptData.changeAmount}
              cashierName={receiptData.cashierName}
              timestamp={receiptData.timestamp}
            />
          )}

          <EndShiftDialog
            isOpen={isEndShiftOpen}
            onClose={handleCancelEndShift}
            onConfirm={handleConfirmEndShift}
            userName={user ? `${user.firstName} ${user.lastName}` : ""}
            startBalance={currentShift?.startBalance || 0}
            finalBalance={(currentShift?.startBalance || 0) + (currentShift?.totalSales || 0)}
            startTime={currentShift?.startTime || new Date().toISOString()}
            totalSales={currentShift?.totalSales || 0}
          />

          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            mode="overlay"
          />
        </div>
      )}
      <Toaster />
    </ProtectedRoute>
  )
}
