import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/hooks/use-reports"
import {
  Receipt,
  Clock,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  X,
  Download,
  Eye
} from "lucide-react"

export interface TransactionDetail {
  id: string
  orderNumber: string
  timestamp: string
  total: number
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    subtotal: number
  }>
  paymentMethod: string
  cashierName: string
  customerInfo?: string
}

interface DayTransactionDialogProps {
  isOpen: boolean
  onClose: () => void
  date: string
  transactions: TransactionDetail[]
  loading?: boolean
}

export function DayTransactionDialog({
  isOpen,
  onClose,
  date,
  transactions,
  loading = false
}: DayTransactionDialogProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetail | null>(null)

  // Reset selected transaction when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedTransaction(null)
    }
  }, [isOpen])

  const getPaymentIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'tunai':
      case 'cash':
        return <Banknote className="h-4 w-4" />
      case 'kartu':
      case 'card':
        return <CreditCard className="h-4 w-4" />
      case 'mobile payment':
      case 'qris':
        return <Smartphone className="h-4 w-4" />
      default:
        return <Receipt className="h-4 w-4" />
    }
  }

  const getPaymentColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'tunai':
      case 'cash':
        return 'bg-green-100 text-green-700'
      case 'kartu':
      case 'card':
        return 'bg-blue-100 text-blue-700'
      case 'mobile payment':
      case 'qris':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const totalDayRevenue = transactions.reduce((sum, t) => sum + t.total, 0)
  const totalTransactions = transactions.length

  if (selectedTransaction) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Detail Transaksi #{selectedTransaction.orderNumber}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTransaction(null)}
              >
                ← Kembali
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Transaction Header */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Nomor Pesanan</p>
                    <p className="font-mono font-medium text-lg">#{selectedTransaction.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-bold text-xl text-green-600">{formatCurrency(selectedTransaction.total)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Waktu
                    </p>
                    <p className="font-medium">{selectedTransaction.timestamp}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Kasir
                    </p>
                    <p className="font-medium">{selectedTransaction.cashierName}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Metode Pembayaran</p>
                      <Badge className={`mt-1 ${getPaymentColor(selectedTransaction.paymentMethod)}`}>
                        {getPaymentIcon(selectedTransaction.paymentMethod)}
                        <span className="ml-1">{selectedTransaction.paymentMethod}</span>
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Jumlah Item</p>
                      <p className="font-bold text-lg">{selectedTransaction.items.length}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Item Pembelian ({selectedTransaction.items.length} item)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {selectedTransaction.items.map((item, index) => (
                    <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-lg">{item.name}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span>Qty: {item.quantity}</span>
                            <span>@{formatCurrency(item.price)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(item.subtotal)}</p>
                        <p className="text-sm text-gray-500">Subtotal</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center bg-green-50 p-4 rounded-lg">
                      <div>
                        <p className="font-bold text-xl text-green-700">TOTAL PEMBAYARAN</p>
                        <p className="text-sm text-gray-600">{selectedTransaction.items.length} item(s)</p>
                      </div>
                      <p className="font-bold text-2xl text-green-700">{formatCurrency(selectedTransaction.total)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-4">
              <Button variant="outline" className="h-12">
                <Download className="h-4 w-4 mr-2" />
                Cetak Struk
              </Button>
              <Button variant="outline" className="h-12">
                <Receipt className="h-4 w-4 mr-2" />
                Kirim Email
              </Button>
              <Button variant="outline" className="h-12">
                <Eye className="h-4 w-4 mr-2" />
                Lihat Riwayat
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Detail Transaksi - {new Date(date).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{totalTransactions}</p>
                  <p className="text-sm text-gray-500">Total Transaksi</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalDayRevenue)}</p>
                  <p className="text-sm text-gray-500">Total Pendapatan</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {totalTransactions > 0 ? formatCurrency(totalDayRevenue / totalTransactions) : formatCurrency(0)}
                  </p>
                  <p className="text-sm text-gray-500">Rata-rata per Transaksi</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {transactions.reduce((sum, t) => sum + t.items.length, 0)}
                  </p>
                  <p className="text-sm text-gray-500">Total Item Terjual</p>
                </CardContent>
              </Card>
            </div>

            {/* Transactions List */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Daftar Transaksi ({totalTransactions})</h3>
              
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada transaksi pada tanggal ini</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {transactions.map((transaction) => (
                    <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                                #{transaction.orderNumber.slice(-3)}
                              </div>
                              <div>
                                <p className="font-mono font-medium text-lg">#{transaction.orderNumber}</p>
                                <Badge className={`${getPaymentColor(transaction.paymentMethod)} mt-1`}>
                                  {getPaymentIcon(transaction.paymentMethod)}
                                  <span className="ml-1">{transaction.paymentMethod}</span>
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{transaction.timestamp}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{transaction.cashierName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Receipt className="h-4 w-4" />
                                <span>{transaction.items.length} item(s)</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right space-y-3">
                            <div>
                              <p className="text-sm text-gray-500">Total</p>
                              <p className="font-bold text-2xl text-green-600">{formatCurrency(transaction.total)}</p>
                            </div>
                            <Button
                              size="lg"
                              variant="outline"
                              onClick={() => setSelectedTransaction(transaction)}
                              className="w-full"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat Detail
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Export Button */}
            <div className="border-t pt-4">
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Transaksi Hari Ini
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
