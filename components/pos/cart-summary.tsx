"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus, Minus, Store, Warehouse } from "lucide-react"

interface CartItem {
  id: string
  name: string
  price: number
  wholesalePrice?: number | null
  quantity: number
  subtotal: number
  isWholesale: boolean
}

interface CartSummaryProps {
  items: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveItem: (id: string) => void
  onToggleWholesale: (id: string) => void
  onCheckout: () => void
}

export function CartSummary({ items, onUpdateQuantity, onRemoveItem, onToggleWholesale, onCheckout }: CartSummaryProps) {
  const total = items.reduce((sum, item) => sum + item.subtotal, 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const tax = total * 0.1 // 10% tax
  const grandTotal = total + tax

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          Keranjang
          <Badge>{totalItems} item</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-6 pb-2" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Keranjang kosong
            </div>
          ) : (
            <div className="space-y-3 pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col gap-2 p-3 border rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gray-600">
                          Rp {(item.isWholesale ? (item.wholesalePrice || item.price) : item.price).toLocaleString('id-ID')} per item
                        </p>
                        {item.isWholesale && (
                          <Badge variant="secondary" className="text-xs">
                            Grosir
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Rp {item.subtotal.toLocaleString('id-ID')}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    {item.wholesalePrice && (
                      <Button
                        size="sm"
                        variant={item.isWholesale ? "default" : "outline"}
                        onClick={() => onToggleWholesale(item.id)}
                        className="text-xs"
                      >
                        {item.isWholesale ? (
                          <>
                            <Warehouse className="w-3 h-3 mr-1" />
                            Grosir
                          </>
                        ) : (
                          <>
                            <Store className="w-3 h-3 mr-1" />
                            Eceran
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Fixed payment section at bottom */}
        {items.length > 0 && (
          <div className="flex-shrink-0 border-t pt-4 px-6 pb-6 bg-white">
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>Rp {total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pajak (10%):</span>
                  <span>Rp {tax.toLocaleString('id-ID')}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>
              <Button onClick={onCheckout} className="w-full" size="lg">
                Bayar - Rp {grandTotal.toLocaleString('id-ID')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
