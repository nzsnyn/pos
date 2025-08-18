import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, getPaymentMethodColor, getPaymentStatusColor } from "../../hooks/use-payment-history"
import {
  Receipt,
  Clock,
  User,
  CreditCard,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Share,
  Calendar,
  Mail
} from "lucide-react"

interface PaymentHistoryDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  payment: any
}

export function PaymentHistoryDetailDialog({
  isOpen,
  onClose,
  payment
}: PaymentHistoryDetailDialogProps) {
  if (!payment) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-8 w-8 text-green-600" />
      case 'PENDING':
        return <Clock className="h-8 w-8 text-yellow-600" />
      case 'FAILED':
        return <XCircle className="h-8 w-8 text-red-600" />
      default:
        return <AlertCircle className="h-8 w-8 text-gray-600" />
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH':
        return <CreditCard className="h-8 w-8 text-green-600" />
      case 'CARD':
        return <CreditCard className="h-8 w-8 text-blue-600" />
      case 'MOBILE_PAYMENT':
        return <CreditCard className="h-8 w-8 text-purple-600" />
      case 'CHECK':
        return <Receipt className="h-8 w-8 text-orange-600" />
      default:
        return <CreditCard className="h-8 w-8 text-gray-600" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[90rem] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Detail Pembayaran - {payment.orderNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="mb-2 flex justify-center">{getMethodIcon(payment.method)}</div>
                  <p className="text-sm text-gray-500">Metode Pembayaran</p>
                  <Badge className={`mt-1 ${getPaymentMethodColor(payment.method)}`}>
                    {payment.method === 'CASH' ? 'Tunai' :
                     payment.method === 'CARD' ? 'Kartu' :
                     payment.method === 'MOBILE_PAYMENT' ? 'Mobile Payment' :
                     payment.method === 'CHECK' ? 'Cek' : payment.method}
                  </Badge>
                </div>

                <div className="text-center">
                  <div className="mb-2 flex justify-center">{getStatusIcon(payment.status)}</div>
                  <p className="text-sm text-gray-500">Status Pembayaran</p>
                  <Badge className={`mt-1 ${getPaymentStatusColor(payment.status)}`}>
                    {payment.statusText}
                  </Badge>
                </div>

                <div className="text-center">
                  <div className="mb-2">
                    <CreditCard className="h-8 w-8 text-green-600 mx-auto" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(payment.amount)}
                  </div>
                  <p className="text-sm text-gray-500">Total Pembayaran</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {payment.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} item(s)
                  </p>
                </div>

                <div className="text-center">
                  <div className="mb-2">
                    <Receipt className="h-8 w-8 text-blue-600 mx-auto" />
                  </div>
                  <div className="text-lg font-mono font-bold">
                    {payment.orderNumber}
                  </div>
                  <p className="text-sm text-gray-500">Nomor Order</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Informasi Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Tanggal & Waktu:
                  </span>
                  <div className="text-right">
                    <p className="font-medium">{payment.date}</p>
                    <p className="text-sm text-gray-500">{payment.time}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Kasir:
                  </span>
                  <span className="font-medium">{payment.cashierName}</span>
                </div>

                {payment.notes && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 mb-1">Catatan:</p>
                    <p className="text-sm text-yellow-700">{payment.notes}</p>
                  </div>
                )}

                {payment.status === 'FAILED' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800 mb-2">Status: Pembayaran Gagal</p>
                    <p className="text-sm text-red-600 mb-3">
                      Transaksi ini gagal diproses. Silakan hubungi customer atau coba proses ulang.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-red-600 border-red-300">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Proses Ulang
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-300">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Laporkan Issue
                      </Button>
                    </div>
                  </div>
                )}

                {payment.status === 'PENDING' && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 mb-2">Status: Menunggu Konfirmasi</p>
                    <p className="text-sm text-yellow-600 mb-3">
                      Pembayaran sedang diproses. Tunggu hingga konfirmasi diterima.
                    </p>
                    <Button size="sm" variant="outline" className="text-yellow-600 border-yellow-300">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Cek Status
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Items Purchased */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Item Dibeli ({payment.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {payment.items.map((item: any, index: number) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center font-bold text-lg bg-green-50 p-3 rounded-lg">
                    <span className="text-green-700">Total Pembayaran:</span>
                    <span className="text-green-700">{formatCurrency(payment.amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-12">
              <Download className="h-4 w-4 mr-2" />
              Cetak Struk
            </Button>
            <Button variant="outline" className="h-12">
              <Mail className="h-4 w-4 mr-2" />
              Kirim Email
            </Button>
            <Button variant="outline" className="h-12">
              <Share className="h-4 w-4 mr-2" />
              Bagikan
            </Button>
            <Button variant="outline" className="h-12">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
