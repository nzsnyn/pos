"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, Banknote, Receipt } from "lucide-react"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  subtotal: number
}

interface CheckoutDialogProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  total: number
  tax: number
  grandTotal: number
  onPaymentMethod: (method: 'cash' | 'card') => void
}

export function CheckoutDialog({ 
  isOpen, 
  onClose, 
  items, 
  total, 
  tax, 
  grandTotal, 
  onPaymentMethod 
}: CheckoutDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
          <DialogDescription>
            Review your order and select payment method
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Order Summary</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total:</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h3 className="font-medium">Payment Method</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => onPaymentMethod('cash')}
              >
                <Banknote className="w-6 h-6" />
                Cash
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => onPaymentMethod('card')}
              >
                <CreditCard className="w-6 h-6" />
                Card
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
