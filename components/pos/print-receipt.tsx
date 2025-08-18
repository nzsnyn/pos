"use client"

import { useEffect } from 'react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  subtotal: number
  isWholesale?: boolean
  wholesalePrice?: number | null
}

interface PrintReceiptProps {
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
  onClose: () => void
}

export function PrintReceipt({
  orderNumber,
  items,
  total,
  tax,
  grandTotal,
  paymentMethod,
  cashReceived,
  changeAmount,
  cashierName,
  timestamp,
  onClose
}: PrintReceiptProps) {
  useEffect(() => {
    // Auto-trigger print dialog when component mounts
    const timer = setTimeout(() => {
      window.print()
      // Close after printing
      onClose()
    }, 100)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="print-receipt fixed inset-0 bg-white z-50 flex items-center justify-center min-h-screen">
      <div className="w-full h-full p-8 font-mono text-base max-w-none">
        <div className="text-center mb-8">
          <h2 className="font-bold text-3xl">TOKO SAYA POS</h2>
          <p className="text-lg text-gray-600 mt-2">Struk Pembayaran</p>
        </div>
        
        <div className="space-y-3 text-lg mb-8">
          <div className="flex justify-between">
            <span>No. Pesanan:</span>
            <span className="font-medium">{orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Tanggal:</span>
            <span>{new Date(timestamp).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>Kasir:</span>
            <span>{cashierName}</span>
          </div>
        </div>

        <div className="border-t-2 border-b-2 border-dashed border-gray-400 py-6 my-8">
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-lg">
                  <span className="flex-1">{item.name}</span>
                  <span className="w-20 text-center">{item.quantity}x</span>
                  <span className="w-32 text-right">Rp {item.subtotal.toLocaleString('id-ID')}</span>
                </div>
                {item.isWholesale && (
                  <div className="text-base text-blue-600 ml-4 mt-1">
                    (Harga Grosir: Rp {(item.wholesalePrice || item.price).toLocaleString('id-ID')})
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 text-lg">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>Rp {total.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>Pajak (10%):</span>
            <span>Rp {tax.toLocaleString('id-ID')}</span>
          </div>
          <div className="border-t-2 border-dashed border-gray-400 pt-3 mt-6">
            <div className="flex justify-between font-bold text-xl">
              <span>TOTAL:</span>
              <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-dashed border-gray-400 pt-6 mt-8">
          <div className="space-y-3 text-lg">
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
                <div className="flex justify-between font-medium text-xl">
                  <span>Kembalian:</span>
                  <span>Rp {(changeAmount || 0).toLocaleString('id-ID')}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="text-center mt-12 text-lg text-gray-600 border-t-2 border-dashed border-gray-400 pt-6">
          <p className="mb-2">Terima kasih atas kunjungan Anda!</p>
          <p>Semoga hari Anda menyenangkan!</p>
        </div>
      </div>
    </div>
  )
}
