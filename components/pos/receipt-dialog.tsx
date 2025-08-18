"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Printer, Download, X } from "lucide-react"
import { useState } from "react"
import { PrintReceipt } from "./print-receipt"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  subtotal: number
  isWholesale?: boolean
  wholesalePrice?: number | null
}

interface ReceiptDialogProps {
  isOpen: boolean
  onClose: () => void
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
}

export function ReceiptDialog({
  isOpen,
  onClose,
  orderNumber,
  items,
  total,
  tax,
  grandTotal,
  paymentMethod,
  cashReceived,
  changeAmount,
  cashierName,
  timestamp
}: ReceiptDialogProps) {
  const [showPrint, setShowPrint] = useState(false)

  const handlePrint = () => {
    setShowPrint(true)
  }

  const handleClosePrint = () => {
    setShowPrint(false)
  }

  const handleDownload = () => {
    // Create receipt content as text
    const receiptContent = generateReceiptText()
    const blob = new Blob([receiptContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${orderNumber}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateReceiptText = () => {
    let content = `
TOKO SAYA POS
========================================
Struk Pembayaran

No. Pesanan: ${orderNumber}
Tanggal: ${timestamp}
Kasir: ${cashierName}
========================================

ITEM                    QTY  HARGA   TOTAL
----------------------------------------
`
    
    items.forEach(item => {
      const itemName = item.name.length > 20 ? item.name.substring(0, 17) + '...' : item.name
      const qty = item.quantity.toString().padStart(3)
      const price = `Rp ${item.isWholesale ? (item.wholesalePrice || item.price) : item.price}`.padStart(8)
      const itemTotal = `Rp ${item.subtotal.toLocaleString('id-ID')}`.padStart(10)
      content += `${itemName.padEnd(20)} ${qty} ${price} ${itemTotal}\n`
      if (item.isWholesale) {
        content += `  (Harga Grosir)\n`
      }
    })

    content += `----------------------------------------
Subtotal:                   Rp ${total.toLocaleString('id-ID')}
Pajak (10%):               Rp ${tax.toLocaleString('id-ID')}
========================================
TOTAL:                     Rp ${grandTotal.toLocaleString('id-ID')}

Metode Pembayaran: ${paymentMethod === 'cash' ? 'Tunai' : 'Kartu'}
`

    if (paymentMethod === 'cash' && cashReceived) {
      content += `Uang Diterima:             Rp ${cashReceived.toLocaleString('id-ID')}
Kembalian:                 Rp ${(changeAmount || 0).toLocaleString('id-ID')}
`
    }

    content += `
========================================
Terima kasih atas kunjungan Anda!
Semoga hari Anda menyenangkan!
========================================
`
    return content
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-auto border-0 shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Struk Pembayaran
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Receipt Preview - This will be the only thing printed */}
          <div id="receipt-content" className="print-content bg-white p-4 font-mono text-sm">
            <div className="text-center mb-4">
              <h2 className="font-bold text-lg">TOKO SAYA POS</h2>
              <p className="text-xs text-gray-600">Struk Pembayaran</p>
            </div>
            
            <div className="space-y-1 text-xs mb-4">
              <div className="flex justify-between">
                <span>No. Pesanan:</span>
                <span className="font-medium">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span>{timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{cashierName}</span>
              </div>
            </div>

            <div className="border-t border-b border-dashed border-gray-400 py-2 my-3">
              <div className="space-y-1">
                {items.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between">
                      <span className="flex-1">{item.name}</span>
                      <span className="w-12 text-center">{item.quantity}x</span>
                      <span className="w-20 text-right">Rp {item.subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    {item.isWholesale && (
                      <div className="text-xs text-blue-600 ml-2">
                        (Harga Grosir: Rp {(item.wholesalePrice || item.price).toLocaleString('id-ID')})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Pajak (10%):</span>
                <span>Rp {tax.toLocaleString('id-ID')}</span>
              </div>
              <div className="border-t border-dashed border-gray-400 pt-1 mt-2">
                <div className="flex justify-between font-bold">
                  <span>TOTAL:</span>
                  <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-400 pt-2 mt-3">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Metode Pembayaran:</span>
                  <span>{paymentMethod === 'cash' ? 'Tunai' : 'Kartu'}</span>
                </div>
                {paymentMethod === 'cash' && cashReceived && (
                  <>
                    <div className="flex justify-between">
                      <span>Uang Diterima:</span>
                      <span>Rp {cashReceived.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Kembalian:</span>
                      <span>Rp {(changeAmount || 0).toLocaleString('id-ID')}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="text-center mt-4 text-xs text-gray-600 border-t border-dashed border-gray-400 pt-2">
              <p>Terima kasih atas kunjungan Anda!</p>
              <p>Semoga hari Anda menyenangkan!</p>
            </div>
          </div>

          {/* Action Buttons - These won't be printed */}
          <div className="flex gap-2 no-print">
            <Button onClick={handlePrint} className="flex-1" variant="default">
              <Printer className="w-4 h-4 mr-2" />
              Cetak Struk
            </Button>
            <Button onClick={handleDownload} className="flex-1" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Unduh
            </Button>
          </div>

          <Button onClick={onClose} variant="outline" className="w-full no-print">
            Tutup
          </Button>
        </div>
      </DialogContent>
      
      {showPrint && (
        <PrintReceipt
          orderNumber={orderNumber}
          items={items}
          total={total}
          tax={tax}
          grandTotal={grandTotal}
          paymentMethod={paymentMethod}
          cashReceived={cashReceived}
          changeAmount={changeAmount}
          cashierName={cashierName}
          timestamp={timestamp}
          onClose={handleClosePrint}
        />
      )}
    </Dialog>
  )
}
