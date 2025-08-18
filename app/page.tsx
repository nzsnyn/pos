"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/pos/header"
import { CategoryFilter } from "@/components/pos/category-filter"
import { ProductGrid } from "@/components/pos/product-grid"
import { CartSummary } from "@/components/pos/cart-summary"
import { CheckoutDialog } from "@/components/pos/checkout-dialog"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  price: number
  category: string
  stock: number
  image?: string
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  subtotal: number
}

const mockProducts: Product[] = [
  { id: "1", name: "Coffee - Espresso", price: 3.50, category: "Beverages", stock: 50 },
  { id: "2", name: "Coffee - Americano", price: 4.00, category: "Beverages", stock: 45 },
  { id: "3", name: "Sandwich - Club", price: 8.95, category: "Food", stock: 20 },
  { id: "4", name: "Croissant", price: 3.25, category: "Food", stock: 15 },
  { id: "5", name: "Muffin - Blueberry", price: 2.75, category: "Food", stock: 30 },
  { id: "6", name: "Tea - Green", price: 2.50, category: "Beverages", stock: 40 },
  { id: "7", name: "Juice - Orange", price: 4.50, category: "Beverages", stock: 25 },
  { id: "8", name: "Bagel with Cream Cheese", price: 4.25, category: "Food", stock: 18 },
  { id: "9", name: "Smoothie - Berry", price: 6.00, category: "Beverages", stock: 22 },
  { id: "10", name: "Salad - Caesar", price: 9.50, category: "Food", stock: 12 },
  { id: "11", name: "Cookie - Chocolate Chip", price: 2.00, category: "Snacks", stock: 35 },
  { id: "12", name: "Chips - BBQ", price: 1.75, category: "Snacks", stock: 60 }
]

export default function POSApp() {
  const [products] = useState<Product[]>(mockProducts)
  const [cart, setCart] = useState<CartItem[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentTime, setCurrentTime] = useState("")
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const categories = Array.from(new Set(products.map(p => p.category)))

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString())
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Filter products based on category and search
  useEffect(() => {
    let filtered = products

    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
  }, [products, selectedCategory, searchTerm])

  const addToCart = (product: Product) => {
    if (product.stock === 0) {
      toast.error("Product is out of stock")
      return
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
            : item
        )
      } else {
        return [...prevCart, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          subtotal: product.price
        }]
      }
    })
    
    toast.success(`${product.name} added to cart`)
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(id)
      return
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id
          ? { ...item, quantity, subtotal: quantity * item.price }
          : item
      )
    )
  }

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id))
    toast.success("Item removed from cart")
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
      toast.error("Cart is empty")
      return
    }
    setIsCheckoutOpen(true)
  }

  const handlePayment = (method: 'cash' | 'card') => {
    // Here you would integrate with payment processing
    setIsCheckoutOpen(false)
    setCart([])
    toast.success(`Payment successful via ${method}! Receipt printed.`)
  }

  const handleSettings = () => {
    toast.info("Settings panel would open here")
  }

  const handleReports = () => {
    toast.info("Sales reports would open here")
  }

  const handleLogout = () => {
    toast.info("Logout functionality would be implemented here")
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header
        storeName="My Store POS"
        cashierName="John Doe"
        currentTime={currentTime}
        onOpenSettings={handleSettings}
        onOpenReports={handleReports}
        onLogout={handleLogout}
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
        <div className="w-80 border-l bg-white">
          <CartSummary
            items={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
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

      <Toaster />
    </div>
  )
}
