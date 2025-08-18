"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { CreditCard, Banknote, AlertTriangle, DollarSign } from "lucide-react"

interface CartItem {
  id: string
  name: string
  price: number
  wholesalePrice?: number | null
  quantity: number
  subtotal: number
  isWholesale?: boolean
}

interface CheckoutDialogProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  total: number
  tax: number
  grandTotal: number
  onPaymentMethod: (method: 'cash' | 'card', cashReceived?: number) => void
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
  const [paymentReceived, setPaymentReceived] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'card' | null>(null)
  const [cashReceived, setCashReceived] = useState("")
  const [cashReceivedError, setCashReceivedError] = useState("")

  const cashReceivedAmount = parseFloat(cashReceived) || 0
  const changeAmount = cashReceivedAmount - grandTotal

  const handlePaymentMethodSelect = (method: 'cash' | 'card') => {
    setSelectedPaymentMethod(method)
    // Reset cash-related states when switching payment methods
    if (method !== 'cash') {
      setCashReceived("")
      setCashReceivedError("")
    }
    setPaymentReceived(false)
  }

  const handleCashReceivedChange = (value: string) => {
    // Allow only numbers and decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '')
    
    // Prevent multiple decimal points
    const parts = cleanValue.split('.')
    if (parts.length > 2) {
      return
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return
    }
    
    setCashReceived(cleanValue)
    
    // Validate amount
    const amount = parseFloat(cleanValue)
    if (cleanValue && amount < grandTotal) {
      setCashReceivedError(`Jumlah minimal Rp ${grandTotal.toLocaleString('id-ID')}`)
    } else {
      setCashReceivedError("")
    }
  }

  const isValidCashPayment = () => {
    if (selectedPaymentMethod === 'cash') {
      return cashReceivedAmount >= grandTotal && !cashReceivedError
    }
    return true
  }

  const handleConfirmPayment = () => {
    if (!paymentReceived) {
      return // Prevent proceeding without confirmation
    }
    
    if (selectedPaymentMethod === 'cash' && !isValidCashPayment()) {
      return // Prevent proceeding with invalid cash amount
    }
    
    if (selectedPaymentMethod) {
      const cashAmount = selectedPaymentMethod === 'cash' ? cashReceivedAmount : undefined
      onPaymentMethod(selectedPaymentMethod, cashAmount)
      // Reset state for next transaction
      setPaymentReceived(false)
      setSelectedPaymentMethod(null)
      setCashReceived("")
      setCashReceivedError("")
    }
  }

  const handleClose = () => {
    // Reset state when dialog closes
    setPaymentReceived(false)
    setSelectedPaymentMethod(null)
    setCashReceived("")
    setCashReceivedError("")
    onClose()
  }
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pembayaran</DialogTitle>
          <DialogDescription>
            Tinjau pesanan dan pilih metode pembayaran
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Ringkasan Pesanan</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>Rp {item.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Rp {total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pajak (10%):</span>
                  <span>Rp {tax.toLocaleString('id-ID')}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total:</span>
                  <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="font-medium">Metode Pembayaran</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant={selectedPaymentMethod === 'cash' ? "default" : "outline"}
                className="h-16 flex flex-col gap-1"
                onClick={() => handlePaymentMethodSelect('cash')}
              >
                <Banknote className="w-5 h-5" />
                <span className="text-sm">Tunai</span>
              </Button>
              <Button 
                variant={selectedPaymentMethod === 'card' ? "default" : "outline"}
                className="h-16 flex flex-col gap-1"
                onClick={() => handlePaymentMethodSelect('card')}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-sm">Kartu</span>
              </Button>
            </div>
          </div>

          {selectedPaymentMethod === 'cash' && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="cash-received" className="text-sm font-medium">
                      Uang Diterima dari Pelanggan
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-sm font-medium">Rp</span>
                      <Input
                        id="cash-received"
                        type="text"
                        placeholder="0"
                        value={cashReceived}
                        onChange={(e) => handleCashReceivedChange(e.target.value)}
                        className={`pl-10 ${
                          cashReceivedError ? 'border-red-400 focus:border-red-500' : ''
                        }`}
                      />
                    </div>
                    {cashReceivedError && (
                      <p className="text-xs text-red-600">{cashReceivedError}</p>
                    )}
                  </div>

                  {cashReceived && !cashReceivedError && changeAmount >= 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-800">Kembalian:</span>
                        <span className="text-lg font-bold text-green-700">
                          Rp {changeAmount.toLocaleString('id-ID')}
                        </span>
                      </div>
                      {changeAmount > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          Berikan jumlah ini kembali kepada pelanggan
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedPaymentMethod && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="payment-received" 
                    checked={paymentReceived}
                    onCheckedChange={(checked) => setPaymentReceived(checked as boolean)}
                    disabled={selectedPaymentMethod === 'cash' && !isValidCashPayment()}
                  />
                  <Label 
                    htmlFor="payment-received" 
                    className={`text-sm cursor-pointer ${
                      selectedPaymentMethod === 'cash' && !isValidCashPayment() 
                        ? 'text-gray-400' 
                        : 'text-amber-800'
                    }`}
                  >
                    {selectedPaymentMethod === 'cash' 
                      ? 'Pembayaran telah diterima dan kembalian telah diberikan' 
                      : 'Pembayaran telah diterima'
                    }
                  </Label>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Batal
            </Button>
            <Button 
              onClick={handleConfirmPayment} 
              className="flex-1"
              disabled={!selectedPaymentMethod || !paymentReceived || (selectedPaymentMethod === 'cash' && !isValidCashPayment())}
            >
              <span className="mr-2 font-semibold">Rp</span>
              Bayar - Rp {grandTotal.toLocaleString('id-ID')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
